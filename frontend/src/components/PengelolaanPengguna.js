import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  Search,
  Edit2,
  KeyRound,
  ShieldCheck,
  X,
  Save,
  Eye,
  EyeOff,
  RefreshCw,
  RotateCcw,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

export const USER_ROLE_OPTIONS = [
  { value: 'Administrator', label: 'Administrator (Super Admin)', defaultUnit: 'Kantor Pengelola BUMKam', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800' },
  { value: 'Admin BUMKam', label: 'Admin BUMKam', defaultUnit: 'Kantor Pengelola BUMKam', badge: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/70 dark:text-teal-300 dark:border-teal-800' },
  { value: 'Ketua BUMKam', label: 'Ketua BUMKam', defaultUnit: 'BUMKam Mekar Sari', badge: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800' },
  { value: 'Sekretaris BUMKam', label: 'Sekretaris BUMKam', defaultUnit: 'Kantor Pengelola BUMKam', badge: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800' },
  { value: 'Bendahara', label: 'Bendahara', defaultUnit: 'Keuangan & Akuntansi', badge: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800' },
  { value: 'Pengurus Unit Perdagangan', label: 'Pengurus Unit Perdagangan', defaultUnit: 'Unit Perdagangan', badge: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/70 dark:text-green-300 dark:border-green-800' },
  { value: 'Pengurus Unit Jasa', label: 'Pengurus Unit Jasa', defaultUnit: 'Unit Jasa', badge: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800' },
  { value: 'Auditor', label: 'Auditor', defaultUnit: 'Pengawas Independen', badge: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800' },
  { value: 'Umum', label: 'Umum / Publik', defaultUnit: 'Transparansi Kampung', badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' }
];

export const INITIAL_USERS = [
  {
    id: 'usr_admin',
    full_name: 'Administrator ARVEA',
    name: 'Administrator ARVEA',
    username: 'administrator',
    email: 'admin@arvea-mekarsari.id',
    role: 'Administrator',
    unit_kerja: 'Kantor Pengelola BUMKam',
    initials: 'AD',
    password: 'BummaMekarSari2026!',
    is_active: true,
    must_change_password: true,
    password_changed_at: null,
    is_default_account: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'usr_ketua',
    full_name: 'Eko L Wibowo',
    name: 'Eko L Wibowo',
    username: 'ketua_bumkam',
    email: 'ketua@arvea-mekarsari.id',
    role: 'Ketua BUMKam',
    unit_kerja: 'BUMKam Mekar Sari',
    initials: 'KB',
    password: 'BummaMekarSari2026!',
    is_active: true,
    must_change_password: false,
    password_changed_at: '2026-01-15T08:00:00Z',
    is_default_account: false,
    created_at: '2026-01-05T08:00:00Z'
  },
  {
    id: 'usr_sekretaris',
    full_name: 'Sekretaris BUMKam',
    name: 'Sekretaris BUMKam',
    username: 'sekretaris_bumkam',
    email: 'sekretaris@arvea-mekarsari.id',
    role: 'Sekretaris BUMKam',
    unit_kerja: 'Kantor Pengelola BUMKam',
    initials: 'SB',
    password: 'BummaMekarSari2026!',
    is_active: true,
    must_change_password: false,
    password_changed_at: '2026-01-15T08:00:00Z',
    is_default_account: false,
    created_at: '2026-01-05T08:30:00Z'
  },
  {
    id: 'usr_bendahara',
    full_name: 'Rita Fanghoi',
    name: 'Rita Fanghoi',
    username: 'bendahara_bumkam',
    email: 'bendahara@arvea-mekarsari.id',
    role: 'Bendahara',
    unit_kerja: 'Keuangan & Akuntansi',
    initials: 'BD',
    password: 'BummaMekarSari2026!',
    is_active: true,
    must_change_password: false,
    password_changed_at: '2026-01-15T09:00:00Z',
    is_default_account: false,
    created_at: '2026-01-05T09:00:00Z'
  },
  {
    id: 'usr_perdagangan',
    full_name: 'Yohanis Wenda',
    name: 'Yohanis Wenda',
    username: 'unit_perdagangan',
    email: 'perdagangan@arvea-mekarsari.id',
    role: 'Pengurus Unit Perdagangan',
    unit_kerja: 'Unit Perdagangan',
    initials: 'YW',
    password: 'BummaMekarSari2026!',
    is_active: true,
    must_change_password: false,
    password_changed_at: '2026-01-15T09:30:00Z',
    is_default_account: false,
    created_at: '2026-01-06T08:00:00Z'
  },
  {
    id: 'usr_jasa',
    full_name: 'Markus Krey',
    name: 'Markus Krey',
    username: 'unit_jasa',
    email: 'jasa@arvea-mekarsari.id',
    role: 'Pengurus Unit Jasa',
    unit_kerja: 'Unit Jasa',
    initials: 'MK',
    password: 'BummaMekarSari2026!',
    is_active: true,
    must_change_password: false,
    password_changed_at: '2026-01-15T10:00:00Z',
    is_default_account: false,
    created_at: '2026-01-06T08:30:00Z'
  },
  {
    id: 'usr_auditor',
    full_name: 'Auditor Pengawas',
    name: 'Auditor Pengawas',
    username: 'auditor',
    email: 'auditor@arvea-mekarsari.id',
    role: 'Auditor',
    unit_kerja: 'Pengawas Independen',
    initials: 'AU',
    password: 'BummaMekarSari2026!',
    is_active: true,
    must_change_password: false,
    password_changed_at: '2026-01-15T10:30:00Z',
    is_default_account: false,
    created_at: '2026-01-07T08:00:00Z'
  },
  {
    id: 'usr_umum',
    full_name: 'Masyarakat & Publik',
    name: 'Masyarakat & Publik',
    username: 'umum',
    email: 'publik@arvea-mekarsari.id',
    role: 'Umum',
    unit_kerja: 'Transparansi Kampung',
    initials: 'UM',
    password: 'BummaMekarSari2026!',
    is_active: true,
    must_change_password: false,
    password_changed_at: '2026-01-15T11:00:00Z',
    is_default_account: false,
    created_at: '2026-01-07T09:00:00Z'
  }
];

const getInitials = (fullName = '') => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'US';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const generateTempPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let out = 'Arvea#';
  for (let i = 0; i < 6; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
};

export default function PengelolaanPengguna({
  users = [],
  setUsers,
  currentUser
}) {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [roleFilter, setRoleFilter] = useState('all');

  // Create / Edit User Modal state
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [showTempPwd, setShowTempPwd] = useState(false);
  const [userForm, setUserForm] = useState({
    full_name: '',
    username: '',
    email: '',
    role: 'Pengurus Unit Perdagangan',
    unit_kerja: 'Unit Perdagangan',
    temp_password: '',
    must_change_password: true
  });

  // Reset Password Modal state
  const [resetTarget, setResetTarget] = useState(null);
  const [resetPwd, setResetPwd] = useState('');
  const [resetForceChange, setResetForceChange] = useState(true);
  const [showResetPwd, setShowResetPwd] = useState(false);

  // Summary metrics
  const summary = useMemo(() => {
    const active = users.filter(u => u.is_active !== false).length;
    const inactive = users.filter(u => u.is_active === false).length;
    const pendingChange = users.filter(u => u.must_change_password || !u.password_changed_at).length;
    return { total: users.length, active, inactive, pendingChange };
  }, [users]);

  // Filtered user list
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const isAct = u.is_active !== false;
      if (statusFilter === 'active' && !isAct) return false;
      if (statusFilter === 'inactive' && isAct) return false;
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (u.full_name || u.name || '').toLowerCase().includes(q);
        const matchUser = (u.username || '').toLowerCase().includes(q);
        const matchEmail = (u.email || '').toLowerCase().includes(q);
        const matchRole = (u.role || '').toLowerCase().includes(q);
        const matchUnit = (u.unit_kerja || '').toLowerCase().includes(q);
        if (!matchName && !matchUser && !matchEmail && !matchRole && !matchUnit) return false;
      }
      return true;
    });
  }, [users, statusFilter, roleFilter, searchQuery]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingUserId(null);
    setShowTempPwd(true);
    setUserForm({
      full_name: '',
      username: '',
      email: '',
      role: 'Pengurus Unit Perdagangan',
      unit_kerja: 'Unit Perdagangan',
      temp_password: generateTempPassword(),
      must_change_password: true
    });
    setShowUserModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (u) => {
    setEditingUserId(u.id);
    setUserForm({
      full_name: u.full_name || u.name || '',
      username: u.username || '',
      email: u.email || '',
      role: u.role || 'Umum',
      unit_kerja: u.unit_kerja || 'BUMKam Mekar Sari',
      temp_password: '',
      must_change_password: Boolean(u.must_change_password)
    });
    setShowUserModal(true);
  };

  // Save Create / Edit User
  const handleSaveUser = (e) => {
    e.preventDefault();
    const fullName = userForm.full_name.trim();
    const username = userForm.username.trim().toLowerCase();
    const email = userForm.email.trim().toLowerCase();

    if (!fullName) {
      toast.error('Nama Lengkap wajib diisi.');
      return;
    }
    if (username.length < 4 || /\s/.test(username)) {
      toast.error('Username minimal 4 karakter dan tanpa spasi.');
      return;
    }
    if (!email || !email.includes('@')) {
      toast.error('Masukkan alamat email yang valid.');
      return;
    }

    const dupUsername = users.some(
      u => u.id !== editingUserId && (u.username || '').toLowerCase() === username
    );
    if (dupUsername) {
      toast.error(`Username "${username}" sudah digunakan akun lain.`);
      return;
    }

    const dupEmail = users.some(
      u => u.id !== editingUserId && (u.email || '').toLowerCase() === email
    );
    if (dupEmail) {
      toast.error(`Email "${email}" sudah terdaftar pada akun lain.`);
      return;
    }

    if (editingUserId) {
      setUsers(prev =>
        prev.map(u =>
          u.id === editingUserId
            ? {
                ...u,
                full_name: fullName,
                name: fullName,
                username,
                email,
                role: userForm.role,
                unit_kerja: userForm.unit_kerja.trim() || 'BUMKam Mekar Sari',
                initials: getInitials(fullName),
                updated_at: new Date().toISOString()
              }
            : u
        )
      );
      toast.success(`Data pengurus "${fullName}" berhasil diperbarui!`);
    } else {
      const tempPwd = userForm.temp_password.trim();
      if (tempPwd.length < 6) {
        toast.error('Password sementara minimal 6 karakter.');
        return;
      }

      const newUser = {
        id: 'usr_' + Date.now(),
        full_name: fullName,
        name: fullName,
        username,
        email,
        role: userForm.role,
        unit_kerja: userForm.unit_kerja.trim() || 'BUMKam Mekar Sari',
        initials: getInitials(fullName),
        password: tempPwd,
        is_active: true,
        must_change_password: Boolean(userForm.must_change_password),
        password_changed_at: userForm.must_change_password ? null : new Date().toISOString(),
        is_default_account: false,
        created_at: new Date().toISOString()
      };
      setUsers(prev => [...prev, newUser]);
      toast.success(
        `Akun pengurus "${fullName}" (${username}) berhasil dibuat!${
          newUser.must_change_password ? ' User wajib mengganti password saat login perdana.' : ''
        }`
      );
    }

    setShowUserModal(false);
  };

  // Open Reset Password Modal
  const handleOpenReset = (u) => {
    setResetTarget(u);
    setResetPwd(generateTempPassword());
    setResetForceChange(true);
    setShowResetPwd(true);
  };

  // Confirm Reset Password
  const handleConfirmReset = (e) => {
    e.preventDefault();
    if (!resetTarget) return;
    const pwd = resetPwd.trim();
    if (pwd.length < 6) {
      toast.error('Password baru sementara minimal 6 karakter.');
      return;
    }

    setUsers(prev =>
      prev.map(u =>
        u.id === resetTarget.id
          ? {
              ...u,
              password: pwd,
              must_change_password: Boolean(resetForceChange),
              password_changed_at: resetForceChange ? null : new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          : u
      )
    );
    toast.success(
      `Password akun "${resetTarget.full_name || resetTarget.name}" berhasil direset.${
        resetForceChange ? ' User akan diminta mengganti password saat login berikutnya.' : ''
      }`
    );
    setResetTarget(null);
  };

  // Toggle Active / Inactive (Soft Disable — Never Hard Delete!)
  const handleToggleStatus = (u) => {
    const currentlyActive = u.is_active !== false;
    const isSelf =
      currentUser?.id === u.id ||
      (currentUser?.username && currentUser.username === u.username);

    if (currentlyActive && isSelf) {
      toast.error('Anda tidak dapat menonaktifkan akun yang sedang dipakai login saat ini.');
      return;
    }

    if (currentlyActive && (u.role === 'Administrator' || u.role === 'Admin BUMKam')) {
      const otherActiveAdmins = users.filter(
        x =>
          x.id !== u.id &&
          x.is_active !== false &&
          (x.role === 'Administrator' || x.role === 'Admin BUMKam')
      );
      if (otherActiveAdmins.length === 0) {
        toast.error('Minimal harus ada 1 akun Administrator / Admin BUMKam yang tetap aktif.');
        return;
      }
    }

    const nextStatus = !currentlyActive;
    setUsers(prev =>
      prev.map(item =>
        item.id === u.id
          ? {
              ...item,
              is_active: nextStatus,
              deactivated_at: nextStatus ? null : new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          : item
      )
    );

    if (nextStatus) {
      toast.success(`Akun "${u.full_name || u.name}" telah diaktifkan kembali.`);
    } else {
      toast.info(
        `Akun "${u.full_name || u.name}" dinonaktifkan (akses login diblokir). Seluruh riwayat transaksi yang pernah dicatat tetap aman.`
      );
    }
  };

  const getRoleBadgeClass = (role) => {
    const found = USER_ROLE_OPTIONS.find(r => r.value === role);
    return found
      ? found.badge
      : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              USER MANAGEMENT &amp; KEAMANAN AKSES
            </span>
            <span className="text-xs text-slate-400 font-medium">Soft-Disable &amp; Proteksi Login Perdana</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Pengelolaan Pengguna (Pengurus BUMKam)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola akun pengurus secara mandiri, atur peran unit kerja, reset password, dan nonaktifkan akun pengurus lama tanpa menghapus riwayat transaksi.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-[#0a3a2a] hover:bg-[#06291d] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 text-emerald-300" /> Tambah Pengurus Baru
        </button>
      </div>

      {/* 2. SUMMARY METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Akun Pengurus</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{summary.total}</p>
          <span className="text-[10px] text-slate-500 font-medium">Terdaftar di ARVEA</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50 p-4 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">Akun Aktif</span>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{summary.active}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Diizinkan masuk sistem</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200/80 dark:border-rose-900/50 p-4 shadow-xs">
          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">Akun Nonaktif</span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{summary.inactive}</p>
          <span className="text-[10px] text-slate-500 font-medium">Akses diblokir &bull; Riwayat aman</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 p-4 shadow-xs">
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Wajib Ganti Sandi</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{summary.pendingChange}</p>
          <span className="text-[10px] text-amber-700/80 dark:text-amber-300/80 font-medium">Menunggu login perdana</span>
        </div>
      </div>

      {/* 3. SEARCH & FILTER BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end text-xs">
          <div className="sm:col-span-6">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cari Pengurus</label>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama lengkap, username, email, atau unit kerja..."
                className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status Akun</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Peran / Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="all">Semua Peran</option>
              {USER_ROLE_OPTIONS.map(r => (
                <option key={r.value} value={r.value}>{r.value}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-1">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setRoleFilter('all');
              }}
              className="w-full py-2 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold flex items-center justify-center"
              title="Reset Filter"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. USER TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-[11px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Nama Lengkap</th>
                <th className="p-3.5">Username</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Peran / Role</th>
                <th className="p-3.5 text-center">Status (Aktif / Nonaktif)</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    Tidak ada akun pengurus yang sesuai filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => {
                  const isAct = u.is_active !== false;
                  const mustChange = Boolean(u.must_change_password || !u.password_changed_at);
                  const isSelf = currentUser?.id === u.id || currentUser?.username === u.username;

                  return (
                    <tr
                      key={u.id}
                      className={`transition ${
                        isAct
                          ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          : 'bg-slate-50/70 dark:bg-slate-900/60 opacity-75'
                      }`}
                    >
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isAct
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {u.initials || getInitials(u.full_name || u.name)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-slate-900 dark:text-white leading-tight">
                                {u.full_name || u.name}
                              </p>
                              {isSelf && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] font-black uppercase">
                                  Anda
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">{u.unit_kerja || 'BUMKam Mekar Sari'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {u.username}
                        {mustChange && (
                          <span className="block mt-1 w-fit px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[9px] font-sans font-extrabold">
                            Wajib Ganti Sandi
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {u.email}
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${getRoleBadgeClass(u.role)}`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-2.5">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isAct}
                            onClick={() => handleToggleStatus(u)}
                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                              isAct ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                            title={isAct ? 'Klik untuk Nonaktifkan Akun' : 'Klik untuk Aktifkan Akun'}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                isAct ? 'translate-x-5' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <span
                            className={`text-[10px] font-extrabold uppercase min-w-[54px] text-left ${
                              isAct ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {isAct ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-700 dark:text-slate-200 hover:text-emerald-800 font-bold transition flex items-center gap-1 text-[11px]"
                            title="Edit Data Pengurus"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenReset(u)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold transition flex items-center gap-1 text-[11px]"
                            title="Reset Password Pengguna"
                          >
                            <KeyRound className="w-3 h-3" /> Reset Sandi
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Soft-Disable Governance Note */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Kebijakan Audit BUMKam: Akun pengurus tidak dihapus permanen melainkan dinonaktifkan (<em>soft-disable</em>) agar seluruh riwayat transaksi, jurnal, dan audit trail tetap utuh.
          </span>
        </div>
      </div>

      {/* 5. MODAL TAMBAH / EDIT PENGURUS */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {editingUserId ? <Edit2 className="w-4 h-4 text-emerald-600" /> : <UserPlus className="w-5 h-5 text-emerald-600" />}
                {editingUserId ? 'Edit Data Pengurus' : 'Tambah Pengurus Baru'}
              </h3>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 mt-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={userForm.full_name}
                  onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                  placeholder="Contoh: Maria Wally"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Username *</label>
                  <input
                    type="text"
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    placeholder="contoh: maria_perdagangan"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="maria@arvea-mekarsari.id"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Peran / Role *</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => {
                      const nextRole = e.target.value;
                      const matched = USER_ROLE_OPTIONS.find(r => r.value === nextRole);
                      setUserForm(prev => ({
                        ...prev,
                        role: nextRole,
                        unit_kerja: matched ? matched.defaultUnit : prev.unit_kerja
                      }));
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                    required
                  >
                    {USER_ROLE_OPTIONS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Unit Kerja</label>
                  <input
                    type="text"
                    value={userForm.unit_kerja}
                    onChange={(e) => setUserForm({ ...userForm, unit_kerja: e.target.value })}
                    placeholder="Unit Perdagangan / Unit Jasa"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {!editingUserId && (
                <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-emerald-900 dark:text-emerald-200">Password Sementara *</label>
                      <button
                        type="button"
                        onClick={() => setUserForm(prev => ({ ...prev, temp_password: generateTempPassword() }))}
                        className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Generate Acak
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showTempPwd ? 'text' : 'password'}
                        value={userForm.temp_password}
                        onChange={(e) => setUserForm({ ...userForm, temp_password: e.target.value })}
                        placeholder="Minimal 6 karakter"
                        className="w-full pl-9 pr-9 p-2.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 font-mono font-bold"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowTempPwd(!showTempPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showTempPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={userForm.must_change_password}
                      onChange={(e) => setUserForm({ ...userForm, must_change_password: e.target.checked })}
                      className="mt-0.5 rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-200 leading-snug">
                      Wajib ganti password saat user pertama kali login (Direkomendasikan)
                    </span>
                  </label>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0a3a2a] hover:bg-[#06291d] text-white font-bold flex items-center gap-1.5 shadow"
                >
                  <Save className="w-4 h-4 text-emerald-300" />
                  {editingUserId ? 'Simpan Perubahan' : 'Buat Akun Pengurus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL RESET PASSWORD */}
      {resetTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-600" />
                Reset Password Pengguna
              </h3>
              <button onClick={() => setResetTarget(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReset} className="space-y-4 mt-4">
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-3.5">
                <p className="font-bold text-amber-900 dark:text-amber-200">{resetTarget.full_name || resetTarget.name}</p>
                <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 font-mono mt-0.5">
                  @{resetTarget.username} &bull; {resetTarget.role}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Password Baru Sementara *</label>
                  <button
                    type="button"
                    onClick={() => setResetPwd(generateTempPassword())}
                    className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Generate Acak
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showResetPwd ? 'text' : 'password'}
                    value={resetPwd}
                    onChange={(e) => setResetPwd(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pr-9 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPwd(!showResetPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showResetPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={resetForceChange}
                  onChange={(e) => setResetForceChange(e.target.checked)}
                  className="mt-0.5 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 leading-snug">
                  Wajibkan user mengganti password saat login berikutnya
                </span>
              </label>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetTarget(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5 shadow"
                >
                  <KeyRound className="w-3.5 h-3.5" /> Terapkan Password Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
