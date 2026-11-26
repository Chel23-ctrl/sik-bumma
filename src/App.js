import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Moon,
  Sun,
  Menu,
  LogOut,
  Store,
  ShieldCheck,
  Lock,
  Eye
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

import LoginSplit from './components/LoginSplit';
import ArveaLogo from './components/ArveaLogo';
import FirstTimePasswordGuard from './components/FirstTimePasswordGuard';
import PengelolaanPengguna, { INITIAL_USERS } from './components/PengelolaanPengguna';
import LandingUnit from './components/LandingUnit';
import DashboardView from './components/DashboardView';
import Transaksi from './components/Transaksi';
import KasBank from './components/KasBank';
import JurnalUmum from './components/JurnalUmum';
import JurnalPenyesuaian, { INITIAL_ADJUSTING_JOURNALS } from './components/JurnalPenyesuaian';
import BukuBesar from './components/BukuBesar';
import NeracaSaldo from './components/NeracaSaldo';
import LaporanKeuangan from './components/LaporanKeuangan';
import AnalisisKinerja from './components/AnalisisKinerja';
import LaporanOperasional from './components/LaporanOperasional';
import Penggajian from './components/Penggajian';
import MasterData from './components/MasterData';
import InventarisasiAset from './components/InventarisasiAset';
import ProfilBUMMA from './components/ProfilBUMMA';
import StorefrontUlambox, { DEFAULT_CORE_PRODUCTS } from './components/StorefrontUlambox';
import ScrollToTopButton from './components/ScrollToTopButton';
import LoadingScreen from './components/LoadingScreen';
import RoleSwitcherDropdown from './components/RoleSwitcherDropdown';
import SidebarNav from './components/SidebarNav';
import apiClient, { clearAuthToken, setAuthToken, isJsonApiResponse } from './utils/apiClient';
import { hashPasswordLocal, readStoredUsers, writeStoredUsers, USERS_STORAGE_KEY } from './utils/passwordAuth';
import {
  USER_ROLES,
  ROLE_PERMISSIONS,
  normalizeRole,
  getRoleMeta,
  isDeprecatedUnitRoleAccount,
  canRoleAccessMenu,
  getPathForMenu,
  resolveMenuFromPath
} from './utils/permissions';
import {
  isSupabaseConfigured,
  ensureSupabaseConfig,
  fetchSupabaseUsers,
  fetchSupabaseUserById,
  completeSupabaseInitialCredentials,
  formatSupabaseError
} from './utils/supabaseUsers';

export { ROLE_PERMISSIONS };

const getStorage = (key, defaultVal) => {
  try {
    const data = localStorage.getItem('sik_bumma_' + key);
    return data ? JSON.parse(data) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

const setStorage = (key, val) => {
  try {
    localStorage.setItem('sik_bumma_' + key, JSON.stringify(val));
  } catch (e) {}
};

const INITIAL_ACCOUNTS = [
  { id: 'acc_1001', code: '1001', name: 'Kas', category: 'Aset Lancar', type: 'asset', normal: 'Debit' },
  { id: 'acc_1002', code: '1002', name: 'Bank Papua', category: 'Aset Lancar', type: 'asset', normal: 'Debit' },
  { id: 'acc_1101', code: '1101', name: 'Piutang Usaha', category: 'Aset Lancar', type: 'asset', normal: 'Debit' },
  { id: 'acc_1201', code: '1201', name: 'Persediaan Barang Dagang', category: 'Aset Lancar', type: 'asset', normal: 'Debit' },
  { id: 'acc_1301', code: '1301', name: 'Perlengkapan Usaha', category: 'Aset Lancar', type: 'asset', normal: 'Debit' },
  { id: 'acc_1501', code: '1501', name: 'Aset Tetap & Peralatan', category: 'Aset Tetap', type: 'asset', normal: 'Debit' },
  { id: 'acc_1591', code: '1591', name: 'Akumulasi Penyusutan', category: 'Aset Tetap', type: 'asset', normal: 'Kredit' },
  { id: 'acc_2001', code: '2001', name: 'Utang Usaha', category: 'Liabilitas', type: 'liability', normal: 'Kredit' },
  { id: 'acc_2101', code: '2101', name: 'Utang Lainnya', category: 'Liabilitas', type: 'liability', normal: 'Kredit' },
  { id: 'acc_2102', code: '2102', name: 'Beban yang Masih Harus Dibayar', category: 'Liabilitas', type: 'liability', normal: 'Kredit' },
  { id: 'acc_2201', code: '2201', name: 'Pendapatan Diterima di Muka', category: 'Liabilitas', type: 'liability', normal: 'Kredit' },
  { id: 'acc_3001', code: '3001', name: 'Modal BUMKam', category: 'Ekuitas', type: 'equity', normal: 'Kredit' },
  { id: 'acc_3101', code: '3101', name: 'Saldo Laba Ditahan', category: 'Ekuitas', type: 'equity', normal: 'Kredit' },
  { id: 'acc_4001', code: '4001', name: 'Pendapatan Penjualan Perdagangan', category: 'Pendapatan', type: 'revenue', normal: 'Kredit' },
  { id: 'acc_4002', code: '4002', name: 'Pendapatan Jasa Penyewaan', category: 'Pendapatan', type: 'revenue', normal: 'Kredit' },
  { id: 'acc_5001', code: '5001', name: 'Harga Pokok Penjualan (HPP)', category: 'Beban Pokok', type: 'expense', normal: 'Debit' },
  { id: 'acc_5101', code: '5101', name: 'Beban Gaji Karyawan', category: 'Beban Operasional', type: 'expense', normal: 'Debit' },
  { id: 'acc_5102', code: '5102', name: 'Beban Listrik & Air', category: 'Beban Operasional', type: 'expense', normal: 'Debit' },
  { id: 'acc_5103', code: '5103', name: 'Beban Transportasi & Logistik', category: 'Beban Operasional', type: 'expense', normal: 'Debit' },
  { id: 'acc_5104', code: '5104', name: 'Beban Pemeliharaan & Operasional', category: 'Beban Operasional', type: 'expense', normal: 'Debit' },
  { id: 'acc_5105', code: '5105', name: 'Beban Penyusutan Aset Tetap', category: 'Beban Operasional', type: 'expense', normal: 'Debit' },
  { id: 'acc_5199', code: '5199', name: 'Beban Operasional Lainnya', category: 'Beban Operasional', type: 'expense', normal: 'Debit' }
];

const INITIAL_PRODUCTS = [
  { id: 'prd_1', code: 'PRD-001', name: 'Telur Ayam Segar', category: 'Peternakan Ayam', unit_usaha: 'perdagangan', unit: 'rak', buy_price: 35000, sell_price: 70000, stock: 42, perlakuan: 'Persediaan' },
  { id: 'prd_2', code: 'PRD-002', name: 'Beras Lokal Papua', category: 'Produk Pertanian', unit_usaha: 'perdagangan', unit: 'kg', buy_price: 60000, sell_price: 120000, stock: 20, perlakuan: 'Persediaan' },
  { id: 'prd_3', code: 'PRD-003', name: 'Kerajinan Noken Asli', category: 'Kerajinan Lokal', unit_usaha: 'perdagangan', unit: 'pcs', buy_price: 125000, sell_price: 250000, stock: 10, perlakuan: 'Persediaan' },
  { id: 'prd_4', code: 'PRD-004', name: 'Pakan Ayam Petelur', category: 'Peternakan Ayam', unit_usaha: 'perdagangan', unit: 'karung', buy_price: 280000, sell_price: 560000, stock: 15, perlakuan: 'Persediaan' },
  { id: 'prd_5', code: 'PRD-005', name: 'Sewa Tenda Acara / Pesta', category: 'Jasa Penyewaan', unit_usaha: 'jasa', unit: 'hari', buy_price: 0, sell_price: 1000000, stock: 5, perlakuan: 'Jasa' },
  { id: 'prd_6', code: 'PRD-006', name: 'Sewa Gedung Serba Guna', category: 'Jasa Penyewaan', unit_usaha: 'jasa', unit: 'acara', buy_price: 0, sell_price: 2000000, stock: 2, perlakuan: 'Jasa' },
  { id: 'prd_7', code: 'PRD-007', name: 'Mesin Penetas Telur Otomatis 500 Butir', category: 'Mesin & Peralatan', unit_usaha: 'perdagangan', unit: 'unit', buy_price: 6500000, sell_price: 0, stock: 2, perlakuan: 'Aset Tetap' },
  { id: 'prd_8', code: 'PRD-008', name: 'Laptop Asus Core i5 Kantor BUMKam', category: 'Peralatan Elektronik', unit_usaha: 'jasa', unit: 'unit', buy_price: 8500000, sell_price: 0, stock: 2, perlakuan: 'Aset Tetap' },
  { id: 'prd_9', code: 'PRD-009', name: 'Kursi Plastik Napolly Hijau', category: 'Perlengkapan Acara', unit_usaha: 'jasa', unit: 'buah', buy_price: 85000, sell_price: 0, stock: 50, perlakuan: 'Inventaris Operasional' },
  { id: 'prd_10', code: 'PRD-010', name: 'Timbangan Digital Peternakan 150kg', category: 'Peralatan Peternakan', unit_usaha: 'perdagangan', unit: 'unit', buy_price: 750000, sell_price: 0, stock: 3, perlakuan: 'Inventaris Operasional' }
];

const INITIAL_CUSTOMERS = [
  { id: 'cus_1', name: 'Koperasi Masyarakat Mamta', phone: '0812-4000-1122', address: 'Kabupaten Jayapura' },
  { id: 'cus_2', name: 'Toko Harapan Adat', phone: '0812-4000-2233', address: 'Sentani, Jayapura' },
  { id: 'cus_3', name: 'Panitia Acara Kampung', phone: '0812-4000-3344', address: 'Distrik Nimboran' }
];

const INITIAL_SUPPLIERS = [
  { id: 'sup_1', name: 'CV Sumber Pangan Mandiri', contact: '0813-5000-1122', address: 'Jayapura', bank: 'Bank Papua (101-020-3040)' },
  { id: 'sup_2', name: 'Kelompok Peternak Adat', contact: '0813-5000-2233', address: 'Sentani', bank: 'BRI (4567-01-002345-53-1)' }
];

const INITIAL_EMPLOYEES = [
  { id: 'emp_1', nik: '9271000001', name: 'Eko L Wibowo', position: 'Direktur BUMKam', unit: 'BUMKam Mekar Sari', worker_type: 'Karyawan Tetap', basic_salary: 5000000, allowance: 750000, hourly_rate: 0, hours_worked: 0, deductions: 0, salary: 5750000, status: 'Aktif' },
  { id: 'emp_2', nik: '9271000002', name: 'Rita Fanghoi', position: 'Bendahara BUMKam', unit: 'BUMKam Mekar Sari', worker_type: 'Karyawan Tetap', basic_salary: 4500000, allowance: 500000, hourly_rate: 0, hours_worked: 0, deductions: 0, salary: 5000000, status: 'Aktif' },
  { id: 'emp_3', nik: '9271000003', name: 'Yohanis Wenda', position: 'Kepala Unit Perdagangan', unit: 'Unit Perdagangan & Peternakan', worker_type: 'Karyawan Tetap', basic_salary: 3800000, allowance: 350000, hourly_rate: 0, hours_worked: 0, deductions: 0, salary: 4150000, status: 'Aktif' },
  { id: 'emp_4', nik: '9271000004', name: 'Markus Krey', position: 'Kepala Unit Jasa', unit: 'Unit Jasa Penyewaan', worker_type: 'Karyawan Tetap', basic_salary: 3800000, allowance: 350000, hourly_rate: 0, hours_worked: 0, deductions: 0, salary: 4150000, status: 'Aktif' },
  { id: 'emp_5', nik: '9271000005', name: 'Korneles Tabuni', position: 'Tenaga Bongkar Muat & Panen', unit: 'Unit Perdagangan & Peternakan', worker_type: 'Tenaga Kerja Lepas', basic_salary: 0, allowance: 0, hourly_rate: 35000, hours_worked: 48, deductions: 0, salary: 1680000, status: 'Aktif' }
];

const INITIAL_PROFILE = {
  name: 'BUMKAM MEKAR SARI',
  systemName: 'ARVÉA',
  tagline: 'Satu Nilai, Satu Tujuan, Bertumbuh Bersama',
  standard: 'SAK EMKM',
  legalName: 'Badan Usaha Milik Kampung Mekar Sari',
  village: 'Kampung Sabron Sari',
  region: 'Distrik Sentani Barat',
  location: 'Kabupaten Jayapura, Provinsi Papua',
  address: 'Jl. Poros Sabron Sari, Distrik Sentani Barat, Kabupaten Jayapura, Papua',
  phone: '0812-4000-1122',
  email: 'bumkammekarsari.sabronsari@gmail.com',
  director: 'Eko L Wibowo',
  treasurer: 'Rita Fanghoi',
  bankName: 'Bank Papua',
  bankAccount: '100-01-02-03040-5',
  bankHolder: 'BUMKAM MEKAR SARI'
};

export default function App() {
  const [darkMode, setDarkMode] = useState(() => getStorage('dark_mode', false));
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Global Fullscreen Loading Screen (CoreTaxify-style)
  const [globalLoading, setGlobalLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Menyiapkan sistem ARVÉA...');
  const loaderTimerRef = useRef(null);

  useEffect(() => {
    const bootTimer = setTimeout(() => {
      setGlobalLoading(false);
    }, 850);
    return () => {
      clearTimeout(bootTimer);
      if (loaderTimerRef.current) clearTimeout(loaderTimerRef.current);
    };
  }, []);

  const runWithLoader = (message, taskFn, minDuration = 420) => {
    if (loaderTimerRef.current) clearTimeout(loaderTimerRef.current);
    const start = Date.now();
    setLoadingMessage(message || 'Memuat data...');
    setGlobalLoading(true);

    return new Promise((resolve, reject) => {
      const finish = (err, result) => {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, minDuration - elapsed);
        loaderTimerRef.current = setTimeout(() => {
          setGlobalLoading(false);
          if (err) reject(err);
          else resolve(result);
        }, remaining);
      };

      // Allow fade-in to cover view before swapping screen state
      setTimeout(async () => {
        try {
          const res = typeof taskFn === 'function' ? await taskFn() : undefined;
          finish(null, res);
        } catch (err) {
          finish(err);
        }
      }, 180);
    });
  };

  // App Mode ('storefront' | 'backoffice') — bila user mengetik langsung path modul (misal /jurnal-umum), langsung arahkan ke backoffice agar Route Guard bekerja
  const [appMode, setAppMode] = useState(() => {
    const requested = resolveMenuFromPath(window.location.pathname);
    if (requested && window.location.pathname !== '/') {
      return 'backoffice';
    }
    return getStorage('app_mode', 'storefront');
  });
  useEffect(() => { setStorage('app_mode', appMode); }, [appMode]);

  const [supabaseEnabled, setSupabaseEnabled] = useState(() => isSupabaseConfigured());

  useEffect(() => {
    if (supabaseEnabled) return;
    let active = true;
    ensureSupabaseConfig().then((ready) => {
      if (active && ready) {
        try { localStorage.removeItem(USERS_STORAGE_KEY); } catch (e) {}
        setSupabaseEnabled(true);
      }
    });
    return () => { active = false; };
  }, [supabaseEnabled]);

  // Auth & Managed Users (Cloud Supabase sebagai sumber utama, fallback localStorage hanya bila offline dev)
  const [users, setUsers] = useState(() => {
    if (supabaseEnabled) {
      // Hapus cache kredensial lama dari localStorage agar sumber kebenaran 100% dari Supabase
      try { localStorage.removeItem(USERS_STORAGE_KEY); } catch (e) {}
      return [];
    }
    const stored = readStoredUsers(INITIAL_USERS);
    const source = Array.isArray(stored) && stored.length > 0 ? stored : INITIAL_USERS;
    let migratedAny = false;
    // Hapus akun legacy role "Unit Perdagangan" & "Unit Jasa" dari cache browser lama
    const filteredSource = source.filter(u => {
      if (isDeprecatedUnitRoleAccount(u)) {
        migratedAny = true;
        return false;
      }
      return true;
    });
    const normalized = filteredSource.map(u => {
      const normalizedRole = normalizeRole(u.role);
      const next = {
        ...u,
        role: normalizedRole,
        is_active: u.is_active !== false
      };
      if (normalizedRole !== u.role) {
        migratedAny = true;
      }
      // Migrasi aman: konversi plaintext password lama ke salted hash dan hapus field plaintext
      if (!next.password_hash && typeof next.password === 'string' && next.password.trim()) {
        next.password_hash = hashPasswordLocal(next.password.trim());
        delete next.password;
        migratedAny = true;
      } else if (next.password_hash && 'password' in next) {
        delete next.password;
        migratedAny = true;
      }
      return next;
    });
    if (migratedAny || !localStorage.getItem(USERS_STORAGE_KEY)) {
      writeStoredUsers(normalized);
    }
    return normalized;
  });

  useEffect(() => {
    if (!supabaseEnabled) {
      writeStoredUsers(users);
    }
  }, [users, supabaseEnabled]);

  // Sinkronisasi otomatis daftar pengguna dari Supabase saat aplikasi dibuka
  useEffect(() => {
    if (!supabaseEnabled) return;
    let active = true;
    fetchSupabaseUsers(INITIAL_USERS)
      .then(cloudUsers => {
        if (active && Array.isArray(cloudUsers)) {
          setUsers(cloudUsers);
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, [supabaseEnabled]);

  // Sinkronisasi otomatis lintas tab browser (hanya untuk mode fallback lokal)
  useEffect(() => {
    if (supabaseEnabled) return;
    const handleStorageSync = (event) => {
      if (event.key === USERS_STORAGE_KEY && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setUsers(parsed);
          }
        } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, [supabaseEnabled]);

  const [user, setUser] = useState(() => getStorage('user', null));

  // Validasi live status akun yang sedang login terhadap database Supabase (lintas perangkat)
  useEffect(() => {
    if (!supabaseEnabled || !user?.id) return;
    let active = true;
    fetchSupabaseUserById(user.id)
      .then(fresh => {
        if (!active || !fresh) return;
        if (fresh.is_active === false) {
          setUser(null);
          toast.error('Akun Anda telah dinonaktifkan. Silakan hubungi Administrator.');
          return;
        }
        setUser(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            username: fresh.username || prev.username,
            email: fresh.email || prev.email,
            name: fresh.full_name || prev.name,
            full_name: fresh.full_name || prev.full_name,
            role: normalizeRole(fresh.role),
            unit_kerja: fresh.unit_kerja || prev.unit_kerja,
            initials: fresh.initials || prev.initials,
            is_active: fresh.is_active !== false,
            auth_source: 'supabase'
          };
        });
      })
      .catch(() => {});
    return () => { active = false; };
  }, [supabaseEnabled, user?.id]);

  // Sync active user profile/status with managed users store (detect live deactivation)
  const activeUserRecord = useMemo(() => {
    if (!user) return null;
    if (user.auth_source === 'api') return user;
    const found = users.find(
      u =>
        (user.id && u.id === user.id) ||
        (user.username && u.username === user.username) ||
        (user.email && (u.email === user.email || u.username === user.email)) ||
        (user.email === 'admin_bumma' && u.id === 'usr_admin')
    );
    return found ? { ...user, ...found, name: found.full_name || found.name } : user;
  }, [user, users]);

  // Route Guard 1: Kick out immediately if account was deactivated
  useEffect(() => {
    if (activeUserRecord && activeUserRecord.is_active === false) {
      setUser(null);
      toast.error('Akun Anda telah dinonaktifkan. Silakan hubungi Administrator.');
    }
  }, [activeUserRecord]);

  // Route Guard 2: Detect mandatory password change on login session
  // (Gunakan flag sesi login `user` agar admin yang mereset sandinya sendiri tidak langsung terlempar sebelum modal ditutup,
  //  lalu wajib ganti password saat login berikutnya dengan password sementara)
  const requiresInitialPasswordChange = Boolean(
    user && (user.must_change_password === true || !user.password_changed_at)
  );

  const handleCompleteInitialCredentials = ({ newUsername, newPassword }) =>
    runWithLoader(
      'Menyimpan kredensial baru & membuka Dashboard...',
      async () => {
        const changedAt = new Date().toISOString();
        let savedRow = null;

        if (supabaseEnabled) {
          try {
            savedRow = await completeSupabaseInitialCredentials(activeUserRecord.id, {
              newUsername,
              newPassword
            });
          } catch (sbErr) {
            const parsed = formatSupabaseError(sbErr, 'Gagal menyimpan kredensial baru ke Supabase.');
            toast.error(parsed.message);
            throw sbErr;
          }
        } else if (activeUserRecord?.auth_source === 'api') {
          const res = await apiClient.post('/auth/change-initial-credentials', {
            new_username: newUsername,
            new_password: newPassword,
            confirm_password: newPassword
          });
          if (isJsonApiResponse(res) && res.data?.access_token) {
            setAuthToken(res.data.access_token);
          }
        }

        const hashedNewPwd = savedRow?.password_hash || hashPasswordLocal(newPassword);
        const finalChangedAt = savedRow?.password_changed_at || changedAt;
        const finalUsername = savedRow?.username || newUsername || activeUserRecord.username;

        setUsers(prev => {
          const next = prev.map(u => {
            if (
              u.id === activeUserRecord.id ||
              (u.username && u.username === activeUserRecord.username)
            ) {
              const updated = {
                ...u,
                ...(savedRow || {}),
                username: finalUsername,
                password_hash: hashedNewPwd,
                must_change_password: false,
                password_changed_at: finalChangedAt,
                is_default_account: false,
                updated_at: savedRow?.updated_at || changedAt
              };
              delete updated.password;
              return updated;
            }
            return u;
          });
          if (!supabaseEnabled) {
            writeStoredUsers(next);
          }
          return next;
        });
        setUser(prev => ({
          ...prev,
          username: finalUsername,
          must_change_password: false,
          password_changed_at: finalChangedAt
        }));
        const startMenus = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS[USER_ROLES.UMUM];
        setActiveMenu(startMenus[0] || 'dashboard');
      },
      520
    ).then(() => {
      toast.success('Kredensial awal berhasil diperbarui! Selamat datang di ARVÉA.');
    });

  // Current page (disinkronkan dengan URL address bar agar Route Guard dapat mencegat akses URL langsung)
  const syncBrowserUrl = (menuId, replace = false) => {
    try {
      const targetPath = getPathForMenu(menuId);
      if (window.location.pathname !== targetPath) {
        if (replace) window.history.replaceState({ menuId }, '', targetPath);
        else window.history.pushState({ menuId }, '', targetPath);
      }
    } catch (e) {}
  };

  const [activeMenu, setActiveMenu] = useState(() => {
    return resolveMenuFromPath(window.location.pathname) || 'dashboard';
  });

  // Tangkap tombol Back/Forward browser agar proteksi Route Guard tetap berjalan pada perubahan URL
  useEffect(() => {
    const handlePopState = () => {
      const fromUrl = resolveMenuFromPath(window.location.pathname);
      if (fromUrl) {
        setActiveMenu(fromUrl);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Refresh daftar pengguna langsung dari Supabase setiap kali membuka menu Pengelolaan Pengguna
  useEffect(() => {
    if (!supabaseEnabled || activeMenu !== 'pengguna') return;
    let active = true;
    fetchSupabaseUsers(INITIAL_USERS)
      .then(cloudUsers => {
        if (active && Array.isArray(cloudUsers)) {
          setUsers(cloudUsers);
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, [supabaseEnabled, activeMenu]);

  // Role Switcher State (6 Peran Resmi ARVÉA — tersimpan per sesi untuk simulasi real-time)
  const [simulatedRole, setSimulatedRole] = useState(() => {
    try {
      const saved = sessionStorage.getItem('arvea_simulated_role');
      return saved ? normalizeRole(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const baseUserRole = normalizeRole(activeUserRecord?.role || user?.role || USER_ROLES.ADMINISTRATOR);
  const canSwitchRole = baseUserRole === USER_ROLES.ADMINISTRATOR;
  const userRole = canSwitchRole && simulatedRole ? normalizeRole(simulatedRole) : baseUserRole;
  const activeRoleMeta = getRoleMeta(userRole);
  const isSimulatingRole = canSwitchRole && Boolean(simulatedRole) && userRole !== baseUserRole;

  const allowedMenus = useMemo(() => {
    return ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS[USER_ROLES.UMUM];
  }, [userRole]);

  // Profil pengguna efektif yang tampil di navbar, sidebar, & halaman (otomatis ter-update saat role diganti)
  const effectiveUser = useMemo(() => {
    if (!activeUserRecord) return null;
    if (!isSimulatingRole) {
      return {
        ...activeUserRecord,
        role: userRole,
        readOnly: activeRoleMeta.readOnly
      };
    }
    return {
      ...activeUserRecord,
      name: activeRoleMeta.displayName,
      full_name: activeRoleMeta.displayName,
      initials: activeRoleMeta.initials,
      role: userRole,
      unit_kerja: activeRoleMeta.defaultUnit,
      readOnly: activeRoleMeta.readOnly,
      isSimulated: true
    };
  }, [activeUserRecord, isSimulatingRole, userRole, activeRoleMeta]);

  const handleSelectRole = (nextRole) => {
    const cleanRole = normalizeRole(nextRole);
    const nextSim = cleanRole === baseUserRole ? null : cleanRole;
    setSimulatedRole(nextSim);
    try {
      if (nextSim) sessionStorage.setItem('arvea_simulated_role', nextSim);
      else sessionStorage.removeItem('arvea_simulated_role');
    } catch (e) {}

    const nextMenus = ROLE_PERMISSIONS[cleanRole] || ROLE_PERMISSIONS[USER_ROLES.UMUM];
    if (!nextMenus.includes(activeMenu)) {
      const fallbackMenu = nextMenus[0] || 'dashboard';
      setActiveMenu(fallbackMenu);
      syncBrowserUrl(fallbackMenu, true);
    }
    toast.success(`Role akses diganti ke "${cleanRole}"`, {
      description: `${nextMenus.length} menu aktif sesuai wewenang ${cleanRole}.`
    });
  };

  const handleResetRole = () => {
    setSimulatedRole(null);
    try {
      sessionStorage.removeItem('arvea_simulated_role');
    } catch (e) {}
    toast.info(`Kembali ke peran asli: ${baseUserRole}`);
  };

  // Saat berpindah role, pastikan menu aktif selalu valid untuk role tersebut
  const prevUserRoleRef = useRef(userRole);
  useEffect(() => {
    if (prevUserRoleRef.current !== userRole) {
      prevUserRoleRef.current = userRole;
      if (allowedMenus && !allowedMenus.includes(activeMenu)) {
        const fallbackMenu = allowedMenus[0] || 'dashboard';
        setActiveMenu(fallbackMenu);
        syncBrowserUrl(fallbackMenu, true);
      }
    }
  }, [userRole, allowedMenus, activeMenu]);

  // Notifikasi Route Guard bila user mengetik langsung URL terlarang di address bar (403 Akses Ditolak)
  const lastBlockedToastRef = useRef('');
  useEffect(() => {
    if (!user || appMode !== 'backoffice' || requiresInitialPasswordChange) return;
    if (!canRoleAccessMenu(userRole, activeMenu)) {
      const key = `${userRole}:${activeMenu}`;
      if (lastBlockedToastRef.current !== key) {
        lastBlockedToastRef.current = key;
        toast.error(`403 Akses Ditolak: Peran "${userRole}" tidak memiliki izin membuka ${getPathForMenu(activeMenu)}.`);
      }
    } else {
      lastBlockedToastRef.current = '';
    }
  }, [user, appMode, requiresInitialPasswordChange, userRole, activeMenu]);

  // Backoffice Scroll-to-Top
  const mainRef = useRef(null);
  const [showBackofficeScrollTop, setShowBackofficeScrollTop] = useState(false);

  const handleMainScroll = (e) => {
    setShowBackofficeScrollTop(e.target.scrollTop > 200);
  };

  const scrollToTopBackoffice = () => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Business Unit & Year Filter
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [selectedYear, setSelectedYear] = useState('2026');

  // App Data
  const [transactions, setTransactions] = useState(() => getStorage('transactions', []));
  const [adjustingJournals, setAdjustingJournals] = useState(() =>
    getStorage('adjusting_journals', INITIAL_ADJUSTING_JOURNALS)
  );
  const [accounts, setAccounts] = useState(() => {
    const stored = getStorage('accounts', INITIAL_ACCOUNTS);
    if (Array.isArray(stored) && stored.length > 0) {
      const merged = [...stored];
      INITIAL_ACCOUNTS.forEach(acc => {
        if (!merged.some(a => a.code === acc.code)) {
          merged.push(acc);
        }
      });
      return merged.sort((a, b) => String(a.code).localeCompare(String(b.code)));
    }
    return INITIAL_ACCOUNTS;
  });
  const [products, setProducts] = useState(() => {
    const stored = getStorage('products', INITIAL_PRODUCTS);
    if (Array.isArray(stored) && stored.length > 0) {
      const needsMigration = stored.some(p => !p.perlakuan);
      if (needsMigration) {
        const migrated = stored.map(p => {
          if (p.perlakuan) return p;
          if (p.unit_usaha === 'jasa') return { ...p, perlakuan: 'Jasa' };
          return { ...p, perlakuan: 'Persediaan' };
        });
        INITIAL_PRODUCTS.forEach(ip => {
          if (!migrated.some(p => p.code === ip.code)) {
            migrated.push(ip);
          }
        });
        return migrated;
      }
      return stored;
    }
    return INITIAL_PRODUCTS;
  });
  const [customers, setCustomers] = useState(() => getStorage('customers', INITIAL_CUSTOMERS));
  const [suppliers, setSuppliers] = useState(() => getStorage('suppliers', INITIAL_SUPPLIERS));
  const [employees, setEmployees] = useState(() => {
    const stored = getStorage('employees', INITIAL_EMPLOYEES);
    if (Array.isArray(stored) && stored.length > 0) {
      const needsMigration = stored.some(e => !e.worker_type);
      if (needsMigration) {
        return INITIAL_EMPLOYEES;
      }
      return stored;
    }
    return INITIAL_EMPLOYEES;
  });
  const [coreProducts, setCoreProducts] = useState(() => {
    const stored = getStorage('core_products', DEFAULT_CORE_PRODUCTS);
    if (Array.isArray(stored)) {
      const hasOutdatedImages = stored.some(p => 
        p.images && p.images.some(img => 
          img.url && (
            img.url.includes('1516467508483-a7212febe31a') ||
            img.url.includes('1519741497674-611481863552') ||
            img.url.includes('1464366400600-7168b8af9bc3') ||
            img.url.includes('1533174072545-7a4b6ad7a6c3') ||
            img.url.includes('1492684223066-81342ee5ff30') ||
            img.url.includes('1475721027785-f74eccf877e2')
          )
        )
      );
      if (hasOutdatedImages) {
        return DEFAULT_CORE_PRODUCTS;
      }
      return stored;
    }
    return DEFAULT_CORE_PRODUCTS;
  });
  const [profile, setProfile] = useState(() => {
    const p = getStorage('profile', INITIAL_PROFILE);
    return { ...INITIAL_PROFILE, ...p, director: 'Eko L Wibowo', treasurer: 'Rita Fanghoi' };
  });

  useEffect(() => { setStorage('dark_mode', darkMode); }, [darkMode]);
  useEffect(() => { setStorage('user', user); }, [user]);
  useEffect(() => { setStorage('transactions', transactions); }, [transactions]);
  useEffect(() => { setStorage('adjusting_journals', adjustingJournals); }, [adjustingJournals]);
  useEffect(() => { setStorage('accounts', accounts); }, [accounts]);
  useEffect(() => { setStorage('products', products); }, [products]);
  useEffect(() => { setStorage('core_products', coreProducts); }, [coreProducts]);
  useEffect(() => { setStorage('customers', customers); }, [customers]);
  useEffect(() => { setStorage('suppliers', suppliers); }, [suppliers]);
  useEffect(() => { setStorage('employees', employees); }, [employees]);
  useEffect(() => { setStorage('profile', profile); }, [profile]);

  const handleLogout = () => {
    runWithLoader('Mengakhiri sesi...', () => {
      clearAuthToken();
      apiClient.post('/auth/logout').catch(() => {});
      setSimulatedRole(null);
      try {
        sessionStorage.removeItem('arvea_simulated_role');
      } catch (e) {}
      setUser(null);
    }, 480).then(() => {
      toast.info('Anda telah keluar.');
    });
  };

  const handleNavigateMenu = (menuId, label) => {
    if (!canRoleAccessMenu(userRole, menuId)) {
      toast.error(`403 Akses Ditolak: Peran "${userRole}" tidak memiliki izin mengakses ${label || menuId}.`);
      return;
    }
    if (menuId === activeMenu) return;
    runWithLoader(`Memuat ${label || menuTitles[menuId] || menuId}...`, () => {
      setActiveMenu(menuId);
      syncBrowserUrl(menuId);
      if (mainRef.current) {
        mainRef.current.scrollTo({ top: 0 });
      }
    }, 300);
  };

  // Double-Entry Journals (Transaksi Operasional + Jurnal Penyesuaian berstatus Posted)
  const journals = useMemo(() => {
    const rawEntries = [];
    const filterByYear = selectedYear !== 'all' && selectedYear !== 'Semua Tahun';

    const filteredTx = transactions.filter(tx => {
      if (filterByYear) {
        const txYear = (tx.date || '').slice(0, 4);
        if (txYear && txYear !== selectedYear) return false;
      }
      if (selectedUnit !== 'all') {
        if (tx.unit_usaha && tx.unit_usaha !== selectedUnit) return false;
      }
      return true;
    });

    filteredTx.forEach((tx) => {
      const total = Number(tx.total || 0);
      const lines = [];

      if (tx.type === 'penjualan') {
        const debitCode = tx.payment_method === 'Tunai' ? '1001' : '1101';
        const debitName = tx.payment_method === 'Tunai' ? 'Kas' : 'Piutang Usaha';
        const revCode = tx.unit_usaha === 'jasa' ? '4002' : '4001';
        const revName = tx.unit_usaha === 'jasa' ? 'Pendapatan Jasa Penyewaan' : 'Pendapatan Penjualan Perdagangan';

        lines.push({ account_code: debitCode, account_name: debitName, debit: total, credit: 0 });
        lines.push({ account_code: revCode, account_name: revName, debit: 0, credit: total });
      } else if (tx.type === 'pembelian') {
        const creditCode = tx.payment_method === 'Tunai' ? '1001' : '2001';
        const creditName = tx.payment_method === 'Tunai' ? 'Kas' : 'Utang Usaha';

        lines.push({ account_code: '1201', account_name: 'Persediaan Barang Dagang', debit: total, credit: 0 });
        lines.push({ account_code: creditCode, account_name: creditName, debit: 0, credit: total });
      } else if (tx.type === 'kas_masuk') {
        lines.push({ account_code: '1001', account_name: 'Kas', debit: total, credit: 0 });
        lines.push({ account_code: tx.contra_account || '3001', account_name: tx.contra_name || 'Modal BUMMA / Penerimaan', debit: 0, credit: total });
      } else if (tx.type === 'kas_keluar') {
        lines.push({ account_code: tx.contra_account || '5102', account_name: tx.contra_name || 'Beban Operasional', debit: total, credit: 0 });
        lines.push({ account_code: '1001', account_name: 'Kas', debit: 0, credit: total });
      }

      lines.forEach((l, idx) => {
        rawEntries.push({
          id: `${tx.id}_${l.account_code}_${idx}`,
          date: tx.date,
          tx_number: tx.number,
          description: tx.description || `${tx.type.toUpperCase()} - ${tx.product_name || tx.contact_name || ''}`,
          unit_usaha: tx.unit_usaha,
          source_type: 'general',
          account_code: l.account_code,
          account_name: l.account_name,
          debit: l.debit,
          credit: l.credit
        });
      });
    });

    // Include Posted Adjusting Journal Entries (Jurnal Penyesuaian)
    const postedAJE = adjustingJournals.filter(aje => {
      if (aje.status !== 'Posted') return false;
      if (filterByYear) {
        const ajeYear = (aje.entry_date || '').slice(0, 4);
        if (ajeYear && ajeYear !== selectedYear) return false;
      }
      if (selectedUnit !== 'all' && aje.unit_usaha !== selectedUnit) return false;
      return true;
    });

    postedAJE.forEach(aje => {
      (aje.lines || []).forEach((l, idx) => {
        rawEntries.push({
          id: `${aje.id}_${l.account_code}_${idx}`,
          date: aje.entry_date,
          tx_number: aje.reference_no,
          description: `[Penyesuaian] ${l.line_memo || aje.description}`,
          unit_usaha: aje.unit_usaha,
          source_type: 'adjusting',
          account_code: l.account_code,
          account_name: l.account_name,
          debit: Number(l.debit || 0),
          credit: Number(l.credit || 0)
        });
      });
    });

    // Sort chronologically and compute running balance
    rawEntries.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    let runningBalance = 0;
    return rawEntries.map(item => {
      runningBalance += (item.debit - item.credit);
      return { ...item, balance: runningBalance };
    });
  }, [transactions, adjustingJournals, selectedYear, selectedUnit]);

  // KPI Computations
  const stats = useMemo(() => {
    let salesTotal = 0;
    let purchaseTotal = 0;
    let cashIn = 0;
    let cashOut = 0;
    let receivables = 0;

    transactions.forEach(t => {
      const amt = Number(t.total || 0);
      if (t.type === 'penjualan') {
        salesTotal += amt;
        if (t.payment_method === 'Kredit') receivables += amt;
      } else if (t.type === 'pembelian') {
        purchaseTotal += amt;
      } else if (t.type === 'kas_masuk') {
        cashIn += amt;
      } else if (t.type === 'kas_keluar') {
        cashOut += amt;
      }
    });

    const netCash = (salesTotal + cashIn) - (purchaseTotal + cashOut);
    const inventoryVal = products.reduce((s, p) => s + ((p.stock || 0) * (p.buy_price || 0)), 0);
    const profit = salesTotal - purchaseTotal - cashOut;

    return {
      salesTotal,
      purchaseTotal,
      cashIn,
      cashOut,
      netCash: Math.max(0, netCash),
      profit,
      inventoryVal,
      receivables,
      employeeCount: employees.length,
      txCount: transactions.length
    };
  }, [transactions, products, employees]);

  const availableYears = [
    'Semua Tahun',
    '2019', '2020', '2021', '2022', '2023', '2024',
    '2025', '2026', '2027', '2028', '2029', '2030',
    '2031', '2032', '2033', '2034', '2035'
  ];

  const menuTitles = {
    dashboard: 'Dashboard',
    profil: 'Profil BUMKam',
    pengguna: 'Pengelolaan Pengguna',
    master: 'Master Data',
    aset: 'Inventarisasi Aset',
    landing_unit: 'Profil Unit Usaha',
    transaksi: 'Transaksi (Jual & Beli)',
    kas_bank: 'Kas & Bank',
    jurnal: 'Jurnal Umum',
    jurnal_penyesuaian: 'Jurnal Penyesuaian',
    buku_besar: 'Buku Besar',
    neraca_saldo: 'Neraca Saldo',
    laporan: 'Laporan Keuangan',
    analisis: 'Analisis Kinerja',
    operasional: 'Laporan Operasional',
    penggajian: 'Penggajian Karyawan & Tenaga Lepas'
  };

  const handleDirectOrder = (orderData) => {
    const year = new Date().getFullYear();
    const dateStr = new Date().toISOString().slice(0, 10);
    const orderNumber = `ORD-${year}-${String(transactions.length + 1).padStart(4, '0')}`;

    const newTxList = orderData.items.map((item, idx) => ({
      id: 'tx_ord_' + Date.now() + '_' + idx,
      number: orderNumber + (orderData.items.length > 1 ? `-${idx + 1}` : ''),
      type: 'penjualan',
      date: dateStr,
      unit_usaha: item.unit_usaha || 'perdagangan',
      contact_name: `${orderData.customerName} (${orderData.customerPhone})`,
      product_name: item.name,
      quantity: item.qty,
      price: item.sell_price,
      total: item.qty * item.sell_price,
      payment_method: orderData.paymentMethod || 'Tunai',
      status: 'Selesai',
      description: `Pesanan Toko Digital: ${item.name} (${item.qty} ${item.unit}) - Alamat: ${orderData.customerAddress || 'Sentani'}`
    }));

    setTransactions(prev => [...newTxList, ...prev]);
  };

  const handleLogin = (u) =>
    runWithLoader(
      `Memverifikasi akses ${normalizeRole(u.role) || 'Pengguna'}...`,
      () => {
        const normalizedRole = normalizeRole(u.role);
        setSimulatedRole(null);
        try {
          sessionStorage.removeItem('arvea_simulated_role');
        } catch (e) {}
        setUser({ ...u, role: normalizedRole });
        const startMenus = ROLE_PERMISSIONS[normalizedRole] || ROLE_PERMISSIONS[USER_ROLES.UMUM];
        const requested = resolveMenuFromPath(window.location.pathname);
        const initialTarget = requested && window.location.pathname !== '/' ? requested : (startMenus[0] || 'dashboard');
        setActiveMenu(initialTarget);
        if (canRoleAccessMenu(normalizedRole, initialTarget)) {
          syncBrowserUrl(initialTarget, true);
        }
      },
      650
    );

  // Unified render so LoadingScreen stays mounted across mode/route changes for seamless fade transitions
  let viewContent;
  if (appMode === 'storefront') {
    viewContent = (
      <StorefrontUlambox
        products={products}
        coreProducts={coreProducts}
        onOpenBackoffice={() =>
          runWithLoader('Membuka Portal ARVÉA...', () => setAppMode('backoffice'), 480)
        }
        onDirectOrder={handleDirectOrder}
        profile={profile}
      />
    );
  } else if (!user) {
    viewContent = (
      <>
        <LoginSplit
          users={users}
          onSyncUsers={setUsers}
          onLogin={handleLogin}
          onBackToStore={() =>
            runWithLoader('Membuka Toko Digital...', () => setAppMode('storefront'), 450)
          }
        />
        <ScrollToTopButton />
      </>
    );
  } else if (requiresInitialPasswordChange) {
    viewContent = (
      <FirstTimePasswordGuard
        user={activeUserRecord}
        users={users}
        onCompleteChange={handleCompleteInitialCredentials}
        onLogout={handleLogout}
      />
    );
  } else {
    viewContent = (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark bg-[#1D1833] text-slate-100' : 'bg-gradient-to-br from-[#F2EFFA] via-[#EAE5F7] to-[#DFD8F2] text-[#1E1B2E]'} print:bg-white print:text-slate-900 print:min-h-0 print:h-auto print:block`}>

      {/* TOP HEADER */}
      <header className="h-16 border-b border-[#9A90CC]/30 dark:border-[#9A90CC]/20 bg-white/95 dark:bg-[#251F42]/95 backdrop-blur flex items-center justify-between px-6 sticky top-0 z-30 print:hidden shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-[#F2EFFA] dark:hover:bg-[#332B59] text-[#4E4380] dark:text-[#DDD6F0]"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 text-xs font-semibold">
            <ArveaLogo variant="horizontal" theme={darkMode ? 'light' : 'lilac'} size="sm" />
            <span className="text-[#9A90CC]/60">/</span>
            <span className="text-[#1E1B2E] dark:text-white font-bold">{menuTitles[activeMenu] || 'Dashboard'}</span>
            <span className="hidden md:inline-block text-[10px] text-slate-400 font-normal pl-1">
              &bull; SAK EMKM
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 bg-[#F2EFFA] dark:bg-[#332B59] px-3 py-1 rounded-full text-xs font-semibold text-[#4E4380] dark:text-[#DDD6F0] border border-[#9A90CC]/30">
            <span>Periode {selectedYear}</span>
          </div>

          {/* Switcher to Storefront */}
          <button
            onClick={() =>
              runWithLoader('Membuka Toko Digital...', () => setAppMode('storefront'), 450)
            }
            className="px-3 py-1.5 rounded-xl bg-[#F2EFFA] dark:bg-[#332B59] hover:bg-[#E4DDF5] text-[#4E4380] dark:text-[#DDD6F0] text-xs font-bold border border-[#9A90CC]/45 flex items-center gap-1.5 transition shadow-xs"
            title="Buka Toko Digital Pemesanan BUMKam"
          >
            <Store className="w-3.5 h-3.5 text-[#64589F] dark:text-[#C4B9E5]" />
            <span className="hidden sm:inline">Toko Digital</span>
          </button>

          {/* Menu Dropdown Pilih Role Akses (6 Peran Resmi ARVÉA) */}
          <RoleSwitcherDropdown
            activeRole={userRole}
            baseRole={baseUserRole}
            canSwitch={canSwitchRole}
            onSelectRole={handleSelectRole}
            onResetRole={handleResetRole}
          />

          <div className="hidden md:flex items-center gap-1.5 bg-[#F2EFFA] dark:bg-[#332B59] border border-[#9A90CC]/40 px-3 py-1 rounded-lg text-xs">
            <Store className="w-3.5 h-3.5 text-[#64589F] dark:text-[#C4B9E5]" />
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="bg-transparent font-bold text-[#3C3365] dark:text-[#EDE9F7] outline-none cursor-pointer"
            >
              <option value="all" className="text-slate-900 bg-white">Semua Unit</option>
              <option value="perdagangan" className="text-slate-900 bg-white">Unit Perdagangan</option>
              <option value="jasa" className="text-slate-900 bg-white">Unit Jasa</option>
              <option value="kantor" className="text-slate-900 bg-white">Kantor Pengelola</option>
            </select>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg hover:bg-[#F2EFFA] dark:hover:bg-[#332B59] text-[#4E4380] dark:text-slate-300"
            title="Ganti Tema"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#64589F]" />}
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-[#9A90CC]/30 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-[#64589F] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {effectiveUser?.initials || (effectiveUser?.name ? effectiveUser.name.slice(0, 2).toUpperCase() : 'AD')}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold leading-none text-[#1E1B2E] dark:text-slate-200">{effectiveUser?.name || 'Administrator ARVÉA'}</p>
              <p className="text-[10px] text-[#64589F] dark:text-[#C4B9E5] font-semibold leading-tight mt-0.5">
                {effectiveUser?.role || userRole}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-600 ml-1"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden print:overflow-visible print:block">
        {/* SIDEBAR DINAMIS BERBASIS 6 ROLE RESMI */}
        <SidebarNav
          sidebarOpen={sidebarOpen}
          darkMode={darkMode}
          userRole={userRole}
          isSimulatingRole={isSimulatingRole}
          activeMenu={activeMenu}
          onNavigate={handleNavigateMenu}
          effectiveUser={effectiveUser}
          onLogout={handleLogout}
          activeUsersCount={users.filter(u => u.is_active !== false).length}
          transactionsCount={transactions.length}
          adjustingJournalsCount={adjustingJournals.length}
        />

        {/* WORKSPACE CONTENT */}
        <main ref={mainRef} onScroll={handleMainScroll} className="flex-1 overflow-y-auto p-5 md:p-8 relative print:overflow-visible print:p-0 print:m-0 print:block">
          {/* Active Role Simulation / Read-Only Notice Banner */}
          {(isSimulatingRole || activeRoleMeta.readOnly) && (
            <div className="mb-5 px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-[#251F42]/90 border border-[#9A90CC]/45 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-[#F2EFFA] dark:bg-[#332B59] text-[#64589F] dark:text-[#C4B9E5] flex items-center justify-center shrink-0">
                  {activeRoleMeta.readOnly ? <Eye className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                </span>
                <div>
                  <p className="font-bold text-[#3C3365] dark:text-white leading-snug">
                    {isSimulatingRole ? `Simulasi Peran Aktif: ${userRole}` : `Mode Akses ${userRole}`}
                    {activeRoleMeta.readOnly && (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 text-[10px] font-extrabold">
                        Read-Only
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-300">{activeRoleMeta.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {userRole === USER_ROLES.UMUM && (
                  <button
                    type="button"
                    onClick={() => runWithLoader('Membuka Katalog Produk & Toko Digital...', () => setAppMode('storefront'), 420)}
                    className="px-3 py-1.5 rounded-xl bg-[#F2EFFA] hover:bg-[#E4DDF5] text-[#4E4380] font-bold text-[11px] border border-[#9A90CC]/45 flex items-center gap-1.5 transition"
                  >
                    <Store className="w-3.5 h-3.5" /> Lihat Katalog Produk
                  </button>
                )}
                {isSimulatingRole && (
                  <button
                    type="button"
                    onClick={handleResetRole}
                    className="px-3 py-1.5 rounded-xl bg-[#64589F] hover:bg-[#4E4380] text-white font-bold text-[11px] transition shadow-xs"
                  >
                    Kembali ke {baseUserRole}
                  </button>
                )}
              </div>
            </div>
          )}

          {!canRoleAccessMenu(userRole, activeMenu) ? (
            <div className="max-w-xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/50 shadow-xl text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 flex items-center justify-center shadow-inner">
                <Lock className="w-8 h-8" />
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[11px] font-bold uppercase tracking-wider inline-block mb-3">
                403 &bull; Akses Ditolak (RBAC Route Guard)
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
                Halaman Dibatasi untuk Peran &ldquo;{userRole}&rdquo;
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Berdasarkan pemisahan wewenang (<em>Segregation of Duties</em>), peran{' '}
                <strong className="text-[#524788] dark:text-[#C4B9E5]">{userRole}</strong> tidak memiliki izin mengakses halaman{' '}
                <strong className="text-slate-900 dark:text-white">{menuTitles[activeMenu] || activeMenu}</strong>{' '}
                (<code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">{getPathForMenu(activeMenu)}</code>).
              </p>

              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/60 mb-6 text-left">
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#64589F]" /> Modul Resmi yang Dapat Diakses ({allowedMenus.length} Menu):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {allowedMenus.map(m => (
                    <button
                      key={m}
                      onClick={() => handleNavigateMenu(m, menuTitles[m])}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-[#64589F] text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                    >
                      {menuTitles[m] || m} &rarr;
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    const fallback = allowedMenus[0] || 'dashboard';
                    setActiveMenu(fallback);
                    syncBrowserUrl(fallback, true);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Kembali ke Dashboard
                </button>
                {isSimulatingRole && (
                  <button
                    onClick={handleResetRole}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#64589F] hover:bg-[#4E4380] text-white text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" /> Kembali ke Peran {baseUserRole}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {activeMenu === 'dashboard' && (
            <DashboardView
              stats={stats}
              transactions={transactions}
              user={effectiveUser}
              profile={profile}
              onNavigate={(menu) => handleNavigateMenu(menu, menuTitles[menu])}
            />
          )}

          {activeMenu === 'aset' && (
            <InventarisasiAset
              products={products}
              setProducts={setProducts}
              profile={profile}
              selectedYear={selectedYear}
              selectedUnit={selectedUnit}
            />
          )}

          {activeMenu === 'landing_unit' && (
            <LandingUnit
              profile={profile}
              selectedUnit={selectedUnit}
              setSelectedUnit={setSelectedUnit}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              availableYears={availableYears}
              onNavigate={(menu) => handleNavigateMenu(menu, menuTitles[menu])}
              stats={stats}
            />
          )}

          {activeMenu === 'transaksi' && (
            <Transaksi
              transactions={transactions}
              setTransactions={setTransactions}
              products={products}
              customers={customers}
              suppliers={suppliers}
              selectedUnit={selectedUnit}
              selectedYear={selectedYear}
            />
          )}

          {activeMenu === 'kas_bank' && (
            <KasBank
              transactions={transactions}
              setTransactions={setTransactions}
              accounts={accounts}
            />
          )}

          {activeMenu === 'jurnal' && (
            <JurnalUmum
              journals={journals}
              selectedUnit={selectedUnit}
              selectedYear={selectedYear}
            />
          )}

          {activeMenu === 'jurnal_penyesuaian' && (
            <JurnalPenyesuaian
              adjustingJournals={adjustingJournals}
              setAdjustingJournals={setAdjustingJournals}
              accounts={accounts}
              profile={profile}
              user={effectiveUser}
              selectedUnit={selectedUnit}
              selectedYear={selectedYear}
            />
          )}

          {activeMenu === 'buku_besar' && (
            <BukuBesar
              journals={journals}
              accounts={accounts}
            />
          )}

          {activeMenu === 'neraca_saldo' && (
            <NeracaSaldo
              journals={journals}
              accounts={accounts}
            />
          )}

          {activeMenu === 'laporan' && (
            <LaporanKeuangan
              journals={journals}
              accounts={accounts}
              transactions={transactions}
              profile={profile}
              selectedYear={selectedYear}
            />
          )}

          {activeMenu === 'analisis' && (
            <AnalisisKinerja
              journals={journals}
              accounts={accounts}
              transactions={transactions}
              profile={profile}
            />
          )}

          {activeMenu === 'operasional' && (
            <LaporanOperasional
              transactions={transactions}
              products={products}
            />
          )}

          {activeMenu === 'penggajian' && (
            <Penggajian
              employees={employees}
              profile={profile}
              transactions={transactions}
              setTransactions={setTransactions}
            />
          )}

          {activeMenu === 'master' && (
            <MasterData
              accounts={accounts}
              setAccounts={setAccounts}
              products={products}
              setProducts={setProducts}
              customers={customers}
              setCustomers={setCustomers}
              suppliers={suppliers}
              setSuppliers={setSuppliers}
              employees={employees}
              setEmployees={setEmployees}
              coreProducts={coreProducts}
              setCoreProducts={setCoreProducts}
              user={effectiveUser}
            />
          )}

          {activeMenu === 'profil' && (
            <ProfilBUMMA
              profile={profile}
              setProfile={setProfile}
            />
          )}

          {activeMenu === 'pengguna' && (
            <PengelolaanPengguna
              users={users}
              setUsers={setUsers}
              currentUser={activeUserRecord}
            />
          )}
            </>
          )}

          {/* Backoffice Footer */}
          <footer className="mt-14 pt-6 border-t border-[#9A90CC]/30 dark:border-slate-800 text-center text-slate-500 text-xs print:hidden">
            <p className="font-semibold text-[#3C3365] dark:text-slate-300">ARVÉA &bull; Financial Management System BUMKam Mekar Sari</p>
            <p className="italic text-[#64589F] dark:text-[#C4B9E5] text-[11px] mt-0.5">&ldquo;Satu Nilai, Satu Tujuan, Bertumbuh Bersama&rdquo;</p>
            <p className="mt-1 text-slate-500 text-[11px]">Kampung Sabron Sari, Distrik Sentani Barat, Kabupaten Jayapura &bull; Standar SAK EMKM</p>
            <p className="mt-1 text-slate-400 text-[10px]">Teknologi Digital Akuntansi (TDA) Kelompok 3C &bull; S1 Akuntansi FEB Uncen</p>
          </footer>

          {/* Floating Universal Scroll to Top Button */}
          <ScrollToTopButton targetRef={mainRef} />
        </main>
      </div>
    </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      <LoadingScreen isLoading={globalLoading} message={loadingMessage} />
      {viewContent}
    </>
  );
}
