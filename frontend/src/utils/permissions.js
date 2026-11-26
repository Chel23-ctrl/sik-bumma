/**
 * Konfigurasi Terpusat Hak Akses (Role & Permission) & Pemetaan Route URL ARVÉA BUMKam Mekar Sari.
 *
 * 6 Peran Resmi & Jumlah Menu Eksak:
 * 1. Administrator     (16 menu — akses penuh)
 * 2. Ketua BUMKam      (8 menu)
 * 3. Sekretaris BUMKam (8 menu)
 * 4. Bendahara BUMKam  (13 menu)
 * 5. Auditor           (7 menu — Read Only)
 * 6. Umum              (4 menu — Publik / Terbatas)
 */

export const USER_ROLES = Object.freeze({
  ADMINISTRATOR: 'Administrator',
  KETUA_BUMKAM: 'Ketua BUMKam',
  SEKRETARIS_BUMKAM: 'Sekretaris BUMKam',
  BENDAHARA_BUMKAM: 'Bendahara BUMKam',
  AUDITOR: 'Auditor',
  UMUM: 'Umum'
});

/**
 * Pemetaan ID Menu <-> URL Path resmi (dipakai oleh Sidebar dan Route Guard URL).
 */
export const MENU_ROUTES = Object.freeze({
  dashboard: '/dashboard',
  profil: '/profil-bumkam',
  pengguna: '/pengelolaan-pengguna',
  master: '/master-data',
  aset: '/inventarisasi-aset',
  landing_unit: '/profil-unit-usaha',
  transaksi: '/transaksi',
  kas_bank: '/kas-bank',
  jurnal: '/jurnal-umum',
  jurnal_penyesuaian: '/jurnal-penyesuaian',
  buku_besar: '/buku-besar',
  neraca_saldo: '/neraca-saldo',
  laporan: '/laporan-keuangan',
  analisis: '/analisis-kinerja',
  operasional: '/laporan-operasional',
  penggajian: '/penggajian'
});

/**
 * Alias slug URL agar proteksi Route Guard menangkap semua variasi URL yang diketik di address bar.
 */
const PATH_TO_MENU_MAP = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/profil': 'profil',
  '/profil-bumkam': 'profil',
  '/pengguna': 'pengguna',
  '/pengelolaan-pengguna': 'pengguna',
  '/users': 'pengguna',
  '/user-management': 'pengguna',
  '/master': 'master',
  '/master-data': 'master',
  '/aset': 'aset',
  '/inventarisasi-aset': 'aset',
  '/landing-unit': 'landing_unit',
  '/landing_unit': 'landing_unit',
  '/profil-unit-usaha': 'landing_unit',
  '/unit-usaha': 'landing_unit',
  '/transaksi': 'transaksi',
  '/kas-bank': 'kas_bank',
  '/kas_bank': 'kas_bank',
  '/jurnal': 'jurnal',
  '/jurnal-umum': 'jurnal',
  '/jurnal-penyesuaian': 'jurnal_penyesuaian',
  '/jurnal_penyesuaian': 'jurnal_penyesuaian',
  '/buku-besar': 'buku_besar',
  '/buku_besar': 'buku_besar',
  '/neraca-saldo': 'neraca_saldo',
  '/neraca_saldo': 'neraca_saldo',
  '/laporan': 'laporan',
  '/laporan-keuangan': 'laporan',
  '/analisis': 'analisis',
  '/analisis-kinerja': 'analisis',
  '/operasional': 'operasional',
  '/laporan-operasional': 'operasional',
  '/penggajian': 'penggajian'
};

export const OFFICIAL_ROLE_DEFINITIONS = [
  {
    value: USER_ROLES.ADMINISTRATOR,
    label: 'Administrator',
    shortLabel: 'Administrator',
    displayName: 'Administrator ARVÉA',
    initials: 'AD',
    defaultUnit: 'Kantor Pengelola BUMKam',
    description: 'Akses penuh ke seluruh 16 menu, pengaturan sistem, dan pengelolaan pengguna',
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
    description: 'Monitoring aset, kas/bank, laporan keuangan, analisis kinerja, dan operasional',
    accessTag: 'Monitoring & Validasi',
    readOnly: false,
    dotColor: 'bg-indigo-500',
    badge:
      'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800',
    permissions: [
      'dashboard',
      'profil',
      'aset',
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
    description: 'Administrasi kelembagaan, inventaris aset, unit usaha, kas/bank, dan laporan',
    accessTag: 'Administrasi & Aset',
    readOnly: false,
    dotColor: 'bg-sky-500',
    badge:
      'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800',
    permissions: [
      'dashboard',
      'profil',
      'aset',
      'landing_unit',
      'kas_bank',
      'laporan',
      'analisis',
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
    description: 'Master data, aset, transaksi, kas/bank, jurnal, buku besar, laporan, dan penggajian',
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
    description:
      'Pemeriksaan (Read-Only): Dashboard, Inventarisasi Aset, Profil Unit Usaha, Jurnal Umum, Buku Besar, Neraca Saldo, dan Laporan Keuangan (Hanya Lihat & Unduh/Cetak)',
    accessTag: 'Read-Only Audit',
    readOnly: true,
    dotColor: 'bg-purple-500',
    badge:
      'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800',
    permissions: [
      'dashboard',
      'aset',
      'landing_unit',
      'jurnal',
      'buku_besar',
      'neraca_saldo',
      'laporan'
    ]
  },
  {
    value: USER_ROLES.UMUM,
    label: 'Umum',
    shortLabel: 'Umum',
    displayName: 'Masyarakat & Publik',
    initials: 'UM',
    defaultUnit: 'Transparansi Kampung',
    description: 'Akses publik terbatas: Dashboard, Profil BUMKam, Profil Unit Usaha, dan Laporan Keuangan',
    accessTag: 'Publik Terbatas',
    readOnly: true,
    dotColor: 'bg-slate-400',
    badge:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    permissions: [
      'dashboard',
      'profil',
      'landing_unit',
      'laporan'
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
 * Normalisasi nama role lama ke salah satu dari 6 role resmi.
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

export function getAllowedMenusForRole(role) {
  const normalized = normalizeRole(role);
  return ROLE_PERMISSIONS[normalized] || ROLE_PERMISSIONS[USER_ROLES.UMUM];
}

export function canRoleAccessMenu(role, menuId) {
  const allowed = getAllowedMenusForRole(role);
  return allowed.includes(menuId);
}

export function filterMenusForRole(menuItems = [], role) {
  const allowedSet = new Set(getAllowedMenusForRole(role));
  return menuItems.filter(item => allowedSet.has(item.id));
}

export function getPathForMenu(menuId) {
  return MENU_ROUTES[menuId] || '/dashboard';
}

export function resolveMenuFromPath(pathname) {
  const clean = String(pathname || '/').trim().toLowerCase().replace(/\/+$/, '') || '/';
  return PATH_TO_MENU_MAP[clean] || null;
}
