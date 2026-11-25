/**
 * Standarisasi 6 Peran Pengguna (Role & Permission) Resmi ARVÉA BUMKam Mekar Sari.
 * Satu sumber kebenaran (single source of truth) untuk Navbar Role Switcher,
 * sidebar RBAC, dan form Pengelolaan Pengguna.
 */

export const USER_ROLES = Object.freeze({
  ADMINISTRATOR: 'Administrator',
  KETUA_BUMKAM: 'Ketua BUMKam',
  SEKRETARIS_BUMKAM: 'Sekretaris BUMKam',
  BENDAHARA_BUMKAM: 'Bendahara BUMKam',
  AUDITOR: 'Auditor',
  UMUM: 'Umum'
});

export const OFFICIAL_ROLE_DEFINITIONS = [
  {
    value: USER_ROLES.ADMINISTRATOR,
    label: 'Administrator',
    shortLabel: 'Administrator',
    displayName: 'Administrator ARVÉA',
    initials: 'AD',
    defaultUnit: 'Kantor Pengelola BUMKam',
    description: 'Akses penuh ke semua menu, pengaturan, dan pengelolaan pengguna',
    accessTag: 'Akses Penuh',
    readOnly: false,
    dotColor: 'bg-emerald-500',
    badge:
      'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800',
    permissions: [
      'dashboard',
      'profil',
      'pengguna',
      'master',
      'aset',
      'landing_unit',
      'transaksi',
      'kas_bank',
      'jurnal',
      'jurnal_penyesuaian',
      'buku_besar',
      'neraca_saldo',
      'laporan',
      'analisis',
      'operasional',
      'penggajian'
    ]
  },
  {
    value: USER_ROLES.KETUA_BUMKAM,
    label: 'Ketua BUMKam',
    shortLabel: 'Ketua',
    displayName: 'Ketua BUMKam',
    initials: 'KB',
    defaultUnit: 'BUMKam Mekar Sari',
    description: 'Monitoring, validasi/persetujuan laporan, dan ringkasan eksekutif',
    accessTag: 'Monitoring & Validasi',
    readOnly: false,
    dotColor: 'bg-indigo-500',
    badge:
      'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800',
    permissions: [
      'dashboard',
      'profil',
      'landing_unit',
      'kas_bank',
      'laporan',
      'analisis',
      'operasional'
    ]
  },
  {
    value: USER_ROLES.SEKRETARIS_BUMKAM,
    label: 'Sekretaris BUMKam',
    shortLabel: 'Sekretaris',
    displayName: 'Sekretaris BUMKam',
    initials: 'SB',
    defaultUnit: 'Kantor Pengelola BUMKam',
    description: 'Administrasi, surat-menyurat, inventaris aset, dan data kelembagaan',
    accessTag: 'Administrasi & Aset',
    readOnly: false,
    dotColor: 'bg-sky-500',
    badge:
      'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800',
    permissions: [
      'dashboard',
      'profil',
      'master',
      'aset',
      'landing_unit',
      'operasional'
    ]
  },
  {
    value: USER_ROLES.BENDAHARA_BUMKAM,
    label: 'Bendahara BUMKam',
    shortLabel: 'Bendahara',
    displayName: 'Bendahara BUMKam',
    initials: 'BB',
    defaultUnit: 'Keuangan & Akuntansi',
    description: 'Keuangan, kas/bank, jurnal penyesuaian, dan pelaporan SAK EMKM',
    accessTag: 'Keuangan & SAK EMKM',
    readOnly: false,
    dotColor: 'bg-amber-500',
    badge:
      'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800',
    permissions: [
      'dashboard',
      'master',
      'aset',
      'landing_unit',
      'transaksi',
      'kas_bank',
      'jurnal',
      'jurnal_penyesuaian',
      'buku_besar',
      'neraca_saldo',
      'laporan',
      'analisis',
      'operasional',
      'penggajian'
    ]
  },
  {
    value: USER_ROLES.AUDITOR,
    label: 'Auditor',
    shortLabel: 'Auditor',
    displayName: 'Auditor Pengawas',
    initials: 'AU',
    defaultUnit: 'Pengawas Independen',
    description: 'Pemeriksaan (read-only) ke seluruh buku besar, jurnal, transaksi, dan laporan',
    accessTag: 'Read-Only Audit',
    readOnly: true,
    dotColor: 'bg-purple-500',
    badge:
      'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800',
    permissions: [
      'dashboard',
      'landing_unit',
      'transaksi',
      'kas_bank',
      'jurnal',
      'jurnal_penyesuaian',
      'buku_besar',
      'neraca_saldo',
      'laporan',
      'analisis',
      'operasional'
    ]
  },
  {
    value: USER_ROLES.UMUM,
    label: 'Umum',
    shortLabel: 'Umum',
    displayName: 'Masyarakat & Publik',
    initials: 'UM',
    defaultUnit: 'Transparansi Kampung',
    description: 'Akses publik terbatas: profil BUMKam, unit usaha, dan katalog produk',
    accessTag: 'Publik Terbatas',
    readOnly: true,
    dotColor: 'bg-slate-400',
    badge:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    permissions: [
      'profil',
      'landing_unit'
    ]
  }
];

export const ROLE_PERMISSIONS = OFFICIAL_ROLE_DEFINITIONS.reduce((acc, item) => {
  acc[item.value] = item.permissions;
  return acc;
}, {});

const LEGACY_ROLE_MAP = {
  'admin bumkam': USER_ROLES.ADMINISTRATOR,
  'admin': USER_ROLES.ADMINISTRATOR,
  'super admin': USER_ROLES.ADMINISTRATOR,
  'bendahara': USER_ROLES.BENDAHARA_BUMKAM,
  'akuntansi': USER_ROLES.BENDAHARA_BUMKAM,
  'keuangan': USER_ROLES.BENDAHARA_BUMKAM,
  'manajer': USER_ROLES.KETUA_BUMKAM,
  'publik': USER_ROLES.UMUM,
  'umum / publik': USER_ROLES.UMUM
};

export const DEPRECATED_USER_IDS = new Set(['usr_perdagangan', 'usr_jasa']);
export const DEPRECATED_USERNAMES = new Set(['unit_perdagangan', 'unit_jasa']);
export const DEPRECATED_ROLE_NAMES = new Set([
  'pengurus unit perdagangan',
  'pengurus unit jasa',
  'unit perdagangan',
  'unit jasa'
]);

export function isDeprecatedUnitRoleAccount(userRecord) {
  if (!userRecord) return false;
  const id = String(userRecord.id || '').trim().toLowerCase();
  const uname = String(userRecord.username || '').trim().toLowerCase();
  const role = String(userRecord.role || '').trim().toLowerCase();
  return (
    DEPRECATED_USER_IDS.has(id) ||
    DEPRECATED_USERNAMES.has(uname) ||
    DEPRECATED_ROLE_NAMES.has(role)
  );
}

/**
 * Normalisasi role lama (misal dari localStorage sebelumnya) ke salah satu dari 6 role resmi.
 */
export function normalizeRole(rawRole) {
  if (!rawRole) return USER_ROLES.UMUM;
  const trimmed = String(rawRole).trim();
  const exact = OFFICIAL_ROLE_DEFINITIONS.find(
    r => r.value.toLowerCase() === trimmed.toLowerCase()
  );
  if (exact) return exact.value;
  return LEGACY_ROLE_MAP[trimmed.toLowerCase()] || USER_ROLES.UMUM;
}

export function getRoleMeta(role) {
  const normalized = normalizeRole(role);
  return (
    OFFICIAL_ROLE_DEFINITIONS.find(r => r.value === normalized) ||
    OFFICIAL_ROLE_DEFINITIONS[OFFICIAL_ROLE_DEFINITIONS.length - 1]
  );
}
