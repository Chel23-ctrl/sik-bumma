import axios from 'axios';
import { hashPasswordLocal, verifyPasswordLocal } from './passwordAuth';
import { normalizeRole, isDeprecatedUnitRoleAccount } from './roles';

/**
 * Layanan Cloud Database Supabase untuk Autentikasi & Pengelolaan Pengguna (tabel `public.users`).
 *
 * Membaca Environment Variables `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`
 * (yang otomatis diteruskan oleh `scripts/run-cra.js` ke `REACT_APP_SUPABASE_*` saat build di Vercel).
 * Semua perubahan password, akun baru, edit profil, dan status aktif/nonaktif
 * langsung tersimpan permanen di Supabase dan berlaku real-time lintas perangkat.
 */

const SUPABASE_URL = (
  process.env.REACT_APP_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  ''
)
  .trim()
  .replace(/\/+$/, '');

const SUPABASE_ANON_KEY = (
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  ''
).trim();

const USERS_TABLE = 'users';

export const isSupabaseConfigured = () =>
  Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const supabaseRest = axios.create({
  baseURL: SUPABASE_URL ? `${SUPABASE_URL}/rest/v1` : '',
  timeout: 12000,
  headers: {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
});

const deriveInitials = (fullName = '') => {
  const parts = String(fullName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'US';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export const normalizeSupabaseUserRow = (row) => {
  if (!row || typeof row !== 'object') return null;
  const fullName = (row.full_name || row.name || row.username || 'Pengurus BUMKam').trim();
  const normalizedRole = normalizeRole(row.role);
  return {
    id: row.id,
    full_name: fullName,
    name: fullName,
    username: String(row.username || '').trim().toLowerCase(),
    email: String(row.email || '').trim().toLowerCase(),
    role: normalizedRole,
    unit_kerja: row.unit_kerja || 'BUMKam Mekar Sari',
    initials: row.initials || deriveInitials(fullName),
    password_hash: row.password_hash || '',
    password: row.password || undefined,
    is_active: row.is_active !== false,
    must_change_password: Boolean(row.must_change_password),
    password_changed_at: row.password_changed_at || null,
    is_default_account: Boolean(row.is_default_account),
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
    deactivated_at: row.deactivated_at || null
  };
};

export const toPublicSessionUser = (row) => {
  const u = normalizeSupabaseUserRow(row);
  if (!u) return null;
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    name: u.full_name,
    full_name: u.full_name,
    role: u.role,
    unit_kerja: u.unit_kerja,
    initials: u.initials,
    is_active: u.is_active !== false,
    must_change_password: Boolean(u.must_change_password),
    password_changed_at: u.password_changed_at || null,
    auth_source: 'supabase'
  };
};

export const formatSupabaseError = (err, fallbackMessage = 'Gagal terhubung ke database Supabase.') => {
  if (!err) {
    return { code: 'SUPABASE_ERROR', title: 'Kendala Database Cloud', message: fallbackMessage };
  }
  if (!err.response) {
    const isTimeout = err.code === 'ECONNABORTED';
    return {
      code: isTimeout ? 'SUPABASE_TIMEOUT' : 'SUPABASE_NETWORK',
      title: isTimeout ? 'Koneksi Supabase Timeout' : 'Koneksi ke Supabase Terputus',
      message: isTimeout
        ? 'Server database Supabase tidak merespons tepat waktu. Coba beberapa saat lagi.'
        : 'Tidak dapat menghubungi database cloud Supabase. Periksa koneksi internet Anda.'
    };
  }

  const status = err.response.status;
  const data = err.response.data || {};
  const pgCode = String(data.code || '');
  const rawMsg = String(data.message || data.hint || data.details || '');

  if (pgCode === '23505') {
    return {
      code: 'DUPLICATE_RECORD',
      title: 'Data Sudah Terdaftar',
      message: 'Username atau email tersebut sudah digunakan oleh akun lain di database.'
    };
  }
  if (pgCode === '42P01' || pgCode === 'PGRST205' || status === 404) {
    return {
      code: 'TABLE_NOT_FOUND',
      title: 'Tabel `users` Belum Tersedia di Supabase',
      message: 'Tabel `public.users` belum dibuat di proyek Supabase Anda.',
      hint: 'Jalankan file SQL `backend/migrations/003_supabase_users.sql` di Supabase SQL Editor lalu muat ulang halaman.'
    };
  }
  if (pgCode === '42501' || status === 401 || status === 403) {
    return {
      code: 'RLS_DENIED',
      title: 'Izin Akses Tabel Supabase Ditolak',
      message: 'Kebijakan Row Level Security (RLS) atau kunci `VITE_SUPABASE_ANON_KEY` menolak akses ke tabel `users`.',
      hint: 'Pastikan policy akses tabel `public.users` di `003_supabase_users.sql` sudah dijalankan dan `VITE_SUPABASE_ANON_KEY` di Vercel benar.'
    };
  }

  return {
    code: pgCode || `SUPABASE_${status}`,
    title: `Kendala Database Supabase (${status})`,
    message: rawMsg || fallbackMessage
  };
};

const toDbInsertPayload = (u) => {
  const nowIso = new Date().toISOString();
  const pwdHash =
    u.password_hash ||
    (typeof u.password === 'string' && u.password.trim()
      ? hashPasswordLocal(u.password.trim())
      : hashPasswordLocal('BummaMekarSari2026!'));

  return {
    id: u.id || `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    full_name: (u.full_name || u.name || u.username || 'Pengurus BUMKam').trim(),
    username: String(u.username || '').trim().toLowerCase(),
    email: String(u.email || '').trim().toLowerCase(),
    password_hash: pwdHash,
    role: normalizeRole(u.role),
    unit_kerja: (u.unit_kerja || 'BUMKam Mekar Sari').trim(),
    is_active: u.is_active !== false,
    must_change_password: Boolean(u.must_change_password),
    password_changed_at: u.password_changed_at || null,
    is_default_account: Boolean(u.is_default_account),
    created_at: u.created_at || nowIso,
    updated_at: nowIso,
    deactivated_at: u.deactivated_at || null
  };
};

/**
 * Ambil seluruh akun pengguna dari Supabase.
 * Bila tabel `public.users` masih kosong (0 baris), otomatis mengisi 6 akun awal resmi.
 */
export async function fetchSupabaseUsers(seedFallbackUsers = []) {
  if (!isSupabaseConfigured()) {
    throw new Error('SUPABASE_NOT_CONFIGURED');
  }

  const res = await supabaseRest.get(`/${USERS_TABLE}`, {
    params: {
      select: '*',
      order: 'created_at.asc'
    }
  });

  let rows = Array.isArray(res.data) ? res.data : [];

  // Auto-seed 6 akun resmi jika tabel baru dibuat dan masih kosong
  if (rows.length === 0 && Array.isArray(seedFallbackUsers) && seedFallbackUsers.length > 0) {
    const seedPayloads = seedFallbackUsers
      .filter(u => !isDeprecatedUnitRoleAccount(u))
      .map(toDbInsertPayload);
    if (seedPayloads.length > 0) {
      const insertRes = await supabaseRest.post(`/${USERS_TABLE}`, seedPayloads, {
        headers: { Prefer: 'return=representation,resolution=ignore-duplicates' }
      });
      rows = Array.isArray(insertRes.data) ? insertRes.data : [];
    }
  }

  return rows
    .filter(r => !isDeprecatedUnitRoleAccount(r))
    .map(normalizeSupabaseUserRow)
    .filter(Boolean);
}

/**
 * Ambil 1 akun terbaru berdasarkan ID langsung dari Supabase (untuk validasi sesi lintas perangkat).
 */
export async function fetchSupabaseUserById(userId) {
  if (!isSupabaseConfigured() || !userId) return null;
  const res = await supabaseRest.get(`/${USERS_TABLE}`, {
    params: {
      select: '*',
      id: `eq.${userId}`,
      limit: 1
    }
  });
  const rows = Array.isArray(res.data) ? res.data : [];
  return rows.length > 0 ? normalizeSupabaseUserRow(rows[0]) : null;
}

/**
 * Autentikasi Login real-time langsung terhadap tabel `public.users` di Supabase.
 */
export async function authenticateWithSupabase(identifier, password, seedFallbackUsers = []) {
  if (!isSupabaseConfigured()) {
    return { ok: false, notConfigured: true };
  }

  const cleanIdent = String(identifier || '').trim().toLowerCase();
  const cleanPwd = String(password || '').trim();

  // Ambil daftar pengguna terbaru dari Supabase (sekaligus auto-seed bila tabel masih 0 baris)
  const allUsers = await fetchSupabaseUsers(seedFallbackUsers);

  const matched =
    allUsers.find(
      u =>
        u.username === cleanIdent ||
        u.email === cleanIdent ||
        (u.full_name || '').toLowerCase() === cleanIdent ||
        (cleanIdent === 'admin_bumma' && u.id === 'usr_admin')
    ) || null;

  if (!matched) {
    return {
      ok: false,
      error: {
        code: 'USER_NOT_FOUND',
        title: 'Akun Tidak Ditemukan',
        message: `Username atau email "${cleanIdent}" tidak terdaftar di database ARVÉA.`,
        hint: 'Periksa kembali ejaan username/email tanpa spasi, atau hubungi Administrator untuk pendaftaran akun.'
      }
    };
  }

  if (matched.is_active === false) {
    return {
      ok: false,
      error: {
        code: 'ACCOUNT_DEACTIVATED',
        title: 'Akun Dinonaktifkan',
        message: 'Akun Anda telah dinonaktifkan. Silakan hubungi Administrator.'
      }
    };
  }

  const passwordValid = verifyPasswordLocal(cleanPwd, matched);
  if (!passwordValid) {
    return {
      ok: false,
      error: {
        code: 'INVALID_PASSWORD',
        title: 'Kata Sandi Tidak Cocok',
        message: 'Kata sandi tidak valid. Silakan periksa kembali huruf besar/kecil dan spasi.',
        hint: 'Pastikan Caps Lock tidak aktif dan tidak ada spasi tambahan. Bila password baru saja direset oleh Admin, gunakan kata sandi sementara terbaru.'
      }
    };
  }

  return {
    ok: true,
    user: toPublicSessionUser(matched),
    allUsers
  };
}

/**
 * Tambah akun pengurus baru ke tabel `public.users` Supabase.
 */
export async function createSupabaseUser({
  full_name,
  username,
  email,
  role,
  unit_kerja,
  temp_password,
  must_change_password = true
}) {
  const nowIso = new Date().toISOString();
  const payload = {
    id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    full_name: full_name.trim(),
    username: username.trim().toLowerCase(),
    email: email.trim().toLowerCase(),
    password_hash: hashPasswordLocal(temp_password.trim()),
    role: normalizeRole(role),
    unit_kerja: (unit_kerja || 'BUMKam Mekar Sari').trim(),
    is_active: true,
    must_change_password: Boolean(must_change_password),
    password_changed_at: must_change_password ? null : nowIso,
    is_default_account: false,
    created_at: nowIso,
    updated_at: nowIso,
    deactivated_at: null
  };

  const res = await supabaseRest.post(`/${USERS_TABLE}`, payload, {
    headers: { Prefer: 'return=representation' }
  });
  const created = Array.isArray(res.data) ? res.data[0] : res.data;
  return normalizeSupabaseUserRow(created || payload);
}

/**
 * Perbarui profil/peran pengguna di tabel `public.users` Supabase.
 */
export async function updateSupabaseUser(userId, { full_name, username, email, role, unit_kerja }) {
  const nowIso = new Date().toISOString();
  const payload = {
    full_name: full_name.trim(),
    username: username.trim().toLowerCase(),
    email: email.trim().toLowerCase(),
    role: normalizeRole(role),
    unit_kerja: (unit_kerja || 'BUMKam Mekar Sari').trim(),
    updated_at: nowIso
  };

  const res = await supabaseRest.patch(`/${USERS_TABLE}`, payload, {
    params: { id: `eq.${userId}` },
    headers: { Prefer: 'return=representation' }
  });
  const updated = Array.isArray(res.data) ? res.data[0] : res.data;
  if (!updated) {
    throw new Error('Akun tidak ditemukan di database Supabase atau akses update diblokir oleh RLS.');
  }
  return normalizeSupabaseUserRow(updated);
}

/**
 * Reset password pengguna langsung ke Supabase (`password_hash` baru & flag `must_change_password`).
 * Perubahan segera berlaku secara real-time di seluruh perangkat yang mencoba login.
 */
export async function resetSupabaseUserPassword(userId, newPassword, mustChangePassword = true) {
  const nowIso = new Date().toISOString();
  const payload = {
    password_hash: hashPasswordLocal(String(newPassword || '').trim()),
    must_change_password: Boolean(mustChangePassword),
    password_changed_at: mustChangePassword ? null : nowIso,
    is_default_account: false,
    updated_at: nowIso
  };

  const res = await supabaseRest.patch(`/${USERS_TABLE}`, payload, {
    params: { id: `eq.${userId}` },
    headers: { Prefer: 'return=representation' }
  });
  const updated = Array.isArray(res.data) ? res.data[0] : res.data;
  if (!updated) {
    throw new Error('Akun tidak ditemukan di database Supabase atau akses update diblokir oleh RLS.');
  }
  return normalizeSupabaseUserRow(updated);
}

/**
 * Aktifkan / nonaktifkan akun pengguna (soft-disable) langsung di Supabase.
 */
export async function toggleSupabaseUserStatus(userId, nextIsActive) {
  const nowIso = new Date().toISOString();
  const payload = {
    is_active: Boolean(nextIsActive),
    deactivated_at: nextIsActive ? null : nowIso,
    updated_at: nowIso
  };

  const res = await supabaseRest.patch(`/${USERS_TABLE}`, payload, {
    params: { id: `eq.${userId}` },
    headers: { Prefer: 'return=representation' }
  });
  const updated = Array.isArray(res.data) ? res.data[0] : res.data;
  if (!updated) {
    throw new Error('Akun tidak ditemukan di database Supabase atau akses update diblokir oleh RLS.');
  }
  return normalizeSupabaseUserRow(updated);
}

/**
 * Simpan perubahan kredensial awal (First-Time Login / Wajib Ganti Sandi) langsung ke Supabase.
 */
export async function completeSupabaseInitialCredentials(userId, { newUsername, newPassword }) {
  const nowIso = new Date().toISOString();
  const payload = {
    password_hash: hashPasswordLocal(String(newPassword || '').trim()),
    must_change_password: false,
    password_changed_at: nowIso,
    is_default_account: false,
    updated_at: nowIso
  };
  if (newUsername && newUsername.trim()) {
    payload.username = newUsername.trim().toLowerCase();
  }

  const res = await supabaseRest.patch(`/${USERS_TABLE}`, payload, {
    params: { id: `eq.${userId}` },
    headers: { Prefer: 'return=representation' }
  });
  const updated = Array.isArray(res.data) ? res.data[0] : res.data;
  if (!updated) {
    throw new Error('Gagal memperbarui kredensial di database Supabase.');
  }
  return normalizeSupabaseUserRow(updated);
}
