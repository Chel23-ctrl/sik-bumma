import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Building2,
  Wallet,
  TrendingUp,
  Receipt,
  FileText,
  BookOpen,
  Scale,
  Package,
  Layers,
  Moon,
  Sun,
  Menu,
  DollarSign,
  LogOut,
  Store,
  Calendar,
  ClipboardList,
  ArrowUp,
  ShieldCheck,
  Lock,
  Unlock,
  Users
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

import LoginSplit, { DEMO_ACCOUNTS } from './components/LoginSplit';
import LandingUnit from './components/LandingUnit';
import DashboardView from './components/DashboardView';
import Transaksi from './components/Transaksi';
import KasBank from './components/KasBank';
import JurnalUmum from './components/JurnalUmum';
import BukuBesar from './components/BukuBesar';
import NeracaSaldo from './components/NeracaSaldo';
import LaporanKeuangan from './components/LaporanKeuangan';
import AnalisisKinerja from './components/AnalisisKinerja';
import LaporanOperasional from './components/LaporanOperasional';
import Penggajian from './components/Penggajian';
import MasterData from './components/MasterData';
import ProfilBUMMA from './components/ProfilBUMMA';
import StorefrontUlambox, { DEFAULT_CORE_PRODUCTS } from './components/StorefrontUlambox';
import ScrollToTopButton from './components/ScrollToTopButton';

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
  { id: 'acc_3001', code: '3001', name: 'Modal BUMMA', category: 'Ekuitas', type: 'equity', normal: 'Kredit' },
  { id: 'acc_3101', code: '3101', name: 'Saldo Laba Ditahan', category: 'Ekuitas', type: 'equity', normal: 'Kredit' },
  { id: 'acc_4001', code: '4001', name: 'Pendapatan Penjualan Perdagangan', category: 'Pendapatan', type: 'revenue', normal: 'Kredit' },
  { id: 'acc_4002', code: '4002', name: 'Pendapatan Jasa Penyewaan', category: 'Pendapatan', type: 'revenue', normal: 'Kredit' },
  { id: 'acc_5001', code: '5001', name: 'Harga Pokok Penjualan (HPP)', category: 'Beban Pokok', type: 'expense', normal: 'Debit' },
  { id: 'acc_5101', code: '5101', name: 'Beban Gaji Karyawan', category: 'Beban Operasional', type: 'expense', normal: 'Debit' },
  { id: 'acc_5102', code: '5102', name: 'Beban Listrik & Air', category: 'Beban Operasional', type: 'expense', normal: 'Debit' },
  { id: 'acc_5103', code: '5103', name: 'Beban Transportasi & Logistik', category: 'Beban Operasional', type: 'expense', normal: 'Debit' },
  { id: 'acc_5104', code: '5104', name: 'Beban Pemeliharaan & Operasional', category: 'Beban Operasional', type: 'expense', normal: 'Debit' },
  { id: 'acc_5199', code: '5199', name: 'Beban Operasional Lainnya', category: 'Beban Operasional', type: 'expense', normal: 'Debit' }
];

const INITIAL_PRODUCTS = [
  { id: 'prd_1', code: 'PRD-001', name: 'Telur Ayam Segar', category: 'Peternakan Ayam', unit_usaha: 'perdagangan', unit: 'rak', buy_price: 35000, sell_price: 70000, stock: 42 },
  { id: 'prd_2', code: 'PRD-002', name: 'Beras Lokal Papua', category: 'Produk Pertanian', unit_usaha: 'perdagangan', unit: 'kg', buy_price: 60000, sell_price: 120000, stock: 20 },
  { id: 'prd_3', code: 'PRD-003', name: 'Kerajinan Noken Asli', category: 'Kerajinan Lokal', unit_usaha: 'perdagangan', unit: 'pcs', buy_price: 125000, sell_price: 250000, stock: 10 },
  { id: 'prd_4', code: 'PRD-004', name: 'Pakan Ayam Petelur', category: 'Peternakan Ayam', unit_usaha: 'perdagangan', unit: 'karung', buy_price: 280000, sell_price: 560000, stock: 15 },
  { id: 'prd_5', code: 'PRD-005', name: 'Sewa Tenda Acara / Pesta', category: 'Jasa Penyewaan', unit_usaha: 'jasa', unit: 'hari', buy_price: 0, sell_price: 1000000, stock: 5 },
  { id: 'prd_6', code: 'PRD-006', name: 'Sewa Gedung Serba Guna', category: 'Jasa Penyewaan', unit_usaha: 'jasa', unit: 'acara', buy_price: 0, sell_price: 2000000, stock: 2 }
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
  { id: 'emp_1', nik: '9271000001', name: 'Eko L Wibowo', position: 'Direktur BUMKam', unit: 'BUMMA Mekar Sari', salary: 5000000, status: 'Aktif' },
  { id: 'emp_2', nik: '9271000002', name: 'Rita Fanghoi', position: 'Bendahara BUMKam', unit: 'BUMMA Mekar Sari', salary: 4500000, status: 'Aktif' },
  { id: 'emp_3', nik: '9271000003', name: 'Yohanis Wenda', position: 'Kepala Unit Perdagangan', unit: 'Unit Perdagangan & Peternakan', salary: 3800000, status: 'Aktif' },
  { id: 'emp_4', nik: '9271000004', name: 'Markus Krey', position: 'Kepala Unit Jasa', unit: 'Unit Jasa Penyewaan', salary: 3800000, status: 'Aktif' }
];

const INITIAL_PROFILE = {
  name: 'BUMMA MEKAR SARI',
  legalName: 'Badan Usaha Milik Masyarakat Adat Mekar Sari',
  region: 'Wilayah Adat Mamta',
  location: 'Kabupaten Jayapura, Provinsi Papua',
  address: 'Jl. Raya Adat Mamta No. 12, Sentani, Kabupaten Jayapura',
  phone: '0812-4000-1122',
  email: 'bummamekarsari@gmail.com',
  director: 'Eko L Wibowo',
  treasurer: 'Rita Fanghoi',
  bankName: 'Bank Papua',
  bankAccount: '100-01-02-03040-5',
  bankHolder: 'BUMMA MEKAR SARI'
};

export const ROLE_PERMISSIONS = {
  'Administrator': [
    'dashboard', 'profil', 'master', 'landing_unit', 'transaksi', 
    'kas_bank', 'jurnal', 'buku_besar', 'neraca_saldo', 'laporan', 
    'analisis', 'operasional', 'penggajian'
  ],
  'Akuntansi': [
    'dashboard', 'master', 'landing_unit', 'transaksi', 'kas_bank', 
    'jurnal', 'buku_besar', 'neraca_saldo', 'laporan', 'analisis'
  ],
  'Keuangan': [
    'dashboard', 'landing_unit', 'transaksi', 'kas_bank', 
    'neraca_saldo', 'laporan', 'analisis', 'penggajian'
  ],
  'Sales': [
    'dashboard', 'landing_unit', 'master', 'transaksi', 'operasional'
  ],
  'Pembelian': [
    'dashboard', 'landing_unit', 'master', 'transaksi', 'operasional'
  ],
  'Gudang': [
    'dashboard', 'landing_unit', 'master', 'operasional'
  ],
  'Manajer': [
    'dashboard', 'profil', 'master', 'landing_unit', 'transaksi', 
    'kas_bank', 'laporan', 'analisis', 'operasional', 'penggajian'
  ],
  'Auditor': [
    'dashboard', 'landing_unit', 'jurnal', 'buku_besar', 'neraca_saldo', 
    'laporan', 'analisis', 'operasional'
  ]
};

export default function App() {
  const [darkMode, setDarkMode] = useState(() => getStorage('dark_mode', false));
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // App Mode ('storefront' | 'backoffice')
  const [appMode, setAppMode] = useState(() => getStorage('app_mode', 'storefront'));
  useEffect(() => { setStorage('app_mode', appMode); }, [appMode]);

  // Auth
  const [user, setUser] = useState(() => getStorage('user', null));

  // Current page
  const [activeMenu, setActiveMenu] = useState('dashboard');

  // RBAC Dual Mode (Strict by role vs Open Demo for presentations)
  const [rbacStrict, setRbacStrict] = useState(() => getStorage('rbac_strict', true));
  useEffect(() => { setStorage('rbac_strict', rbacStrict); }, [rbacStrict]);

  const userRole = user?.role || 'Administrator';
  const allowedMenus = useMemo(() => {
    if (!rbacStrict) {
      return [
        'dashboard', 'profil', 'master', 'landing_unit', 'transaksi', 
        'kas_bank', 'jurnal', 'buku_besar', 'neraca_saldo', 'laporan', 
        'analisis', 'operasional', 'penggajian'
      ];
    }
    return ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS['Administrator'];
  }, [rbacStrict, userRole]);

  // When switching user role, ensure we gracefully default to dashboard if current menu is restricted
  const prevUserRoleRef = useRef(userRole);
  useEffect(() => {
    if (prevUserRoleRef.current !== userRole) {
      prevUserRoleRef.current = userRole;
      if (allowedMenus && !allowedMenus.includes(activeMenu)) {
        setActiveMenu('dashboard');
      }
    }
  }, [userRole, allowedMenus, activeMenu]);

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
  const [accounts, setAccounts] = useState(() => getStorage('accounts', INITIAL_ACCOUNTS));
  const [products, setProducts] = useState(() => getStorage('products', INITIAL_PRODUCTS));
  const [customers, setCustomers] = useState(() => getStorage('customers', INITIAL_CUSTOMERS));
  const [suppliers, setSuppliers] = useState(() => getStorage('suppliers', INITIAL_SUPPLIERS));
  const [employees, setEmployees] = useState(() => getStorage('employees', INITIAL_EMPLOYEES));
  const [coreProducts, setCoreProducts] = useState(() => getStorage('core_products', DEFAULT_CORE_PRODUCTS));
  const [profile, setProfile] = useState(() => {
    const p = getStorage('profile', INITIAL_PROFILE);
    return { ...p, director: 'Eko L Wibowo', treasurer: 'Rita Fanghoi' };
  });

  useEffect(() => { setStorage('dark_mode', darkMode); }, [darkMode]);
  useEffect(() => { setStorage('user', user); }, [user]);
  useEffect(() => { setStorage('transactions', transactions); }, [transactions]);
  useEffect(() => { setStorage('accounts', accounts); }, [accounts]);
  useEffect(() => { setStorage('products', products); }, [products]);
  useEffect(() => { setStorage('core_products', coreProducts); }, [coreProducts]);
  useEffect(() => { setStorage('customers', customers); }, [customers]);
  useEffect(() => { setStorage('suppliers', suppliers); }, [suppliers]);
  useEffect(() => { setStorage('employees', employees); }, [employees]);
  useEffect(() => { setStorage('profile', profile); }, [profile]);

  const handleLogout = () => {
    setUser(null);
    toast.info('Anda telah keluar.');
  };

  // Double-Entry Journals
  const journals = useMemo(() => {
    let runningBalance = 0;
    const entries = [];

    const filteredTx = transactions.filter(tx => {
      if (selectedYear !== 'all') {
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

      lines.forEach((l) => {
        runningBalance += (l.debit - l.credit);
        entries.push({
          id: tx.id + '_' + l.account_code,
          date: tx.date,
          tx_number: tx.number,
          description: tx.description || `${tx.type.toUpperCase()} - ${tx.product_name || tx.contact_name || ''}`,
          unit_usaha: tx.unit_usaha,
          account_code: l.account_code,
          account_name: l.account_name,
          debit: l.debit,
          credit: l.credit,
          balance: runningBalance
        });
      });
    });

    return entries;
  }, [transactions, selectedYear, selectedUnit]);

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

  const availableYears = ['Semua Tahun', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028'];

  const menuTitles = {
    dashboard: 'Dashboard',
    landing_unit: 'Profil Unit Usaha',
    transaksi: 'Transaksi (Jual & Beli)',
    kas_bank: 'Kas & Bank',
    jurnal: 'Jurnal Umum',
    buku_besar: 'Buku Besar',
    neraca_saldo: 'Neraca Saldo',
    laporan: 'Laporan Keuangan',
    analisis: 'Analisis Kinerja',
    operasional: 'Laporan Operasional',
    penggajian: 'Penggajian',
    master: 'Master Data',
    profil: 'Profil BUMKam'
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

  // Render Storefront when in storefront mode
  if (appMode === 'storefront') {
    return (
      <>
        <Toaster position="top-right" richColors />
        <StorefrontUlambox
          products={products}
          coreProducts={coreProducts}
          onOpenBackoffice={() => setAppMode('backoffice')}
          onDirectOrder={handleDirectOrder}
          profile={profile}
        />
      </>
    );
  }

  // Render Login when in backoffice mode without user
  if (!user) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <LoginSplit
          onLogin={(u) => {
            setUser(u);
            setActiveMenu('dashboard');
          }}
          onBackToStore={() => setAppMode('storefront')}
        />
        <ScrollToTopButton />
      </>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Toaster position="top-right" richColors />

      {/* TOP HEADER */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 sticky top-0 z-30 print:hidden shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-slate-400">BUMMA</span>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-slate-900 dark:text-white font-bold">{menuTitles[activeMenu] || 'Dashboard'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300">
            <span>Periode {selectedYear}</span>
          </div>

          {/* Switcher to Storefront */}
          <button
            onClick={() => setAppMode('storefront')}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-700 flex items-center gap-1.5 transition shadow-xs"
            title="Buka Toko Digital Pemesanan BUMKam (Tampilan Ulambox)"
          >
            <Store className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Toko Digital</span>
          </button>

          {/* RBAC Mode Switcher (Ketat vs Demo) */}
          <button
            onClick={() => {
              const nextMode = !rbacStrict;
              setRbacStrict(nextMode);
              toast.info(nextMode ? 'Mode Ketat (Sesuai Role) diaktifkan.' : 'Mode Demo (Semua Menu Terbuka) diaktifkan.');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition shadow-xs cursor-pointer ${
              rbacStrict
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
            }`}
            title={rbacStrict ? 'Akses dibatasi sesuai role. Klik untuk buka semua menu (Mode Demo).' : 'Semua menu terbuka. Klik untuk kunci sesuai role (Mode Ketat).'}
          >
            {rbacStrict ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Unlock className="w-3.5 h-3.5 text-amber-600" />}
            <span className="hidden xl:inline">{rbacStrict ? 'Akses: Sesuai Role (Ketat)' : 'Akses: Mode Demo (Bebas)'}</span>
            <span className="xl:hidden">{rbacStrict ? 'Role RBAC' : 'Demo Bebas'}</span>
          </button>

          {/* Quick Role Switcher for Demo / Presentation */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl text-xs border border-slate-200 dark:border-slate-700">
            <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="text-slate-400 text-[11px] font-medium shrink-0">Peran:</span>
            <select
              value={userRole}
              onChange={(e) => {
                const targetRole = e.target.value;
                const matched = DEMO_ACCOUNTS.find(acc => acc.role === targetRole);
                if (matched) {
                  setUser({
                    email: matched.username,
                    name: matched.name,
                    role: matched.role,
                    initials: matched.initials
                  });
                  toast.success(`Beralih ke peran: ${matched.role} (${matched.name})`);
                }
              }}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer pr-1"
              title="Ganti Peran Pengguna Cepat (Mode Presentasi)"
            >
              {DEMO_ACCOUNTS.map(acc => (
                <option key={acc.role} value={acc.role} className="text-slate-900 bg-white dark:bg-slate-900 dark:text-slate-100">
                  {acc.role} ({acc.title})
                </option>
              ))}
            </select>
          </div>

          <div className="hidden md:flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-lg text-xs">
            <Store className="w-3.5 h-3.5 text-emerald-600" />
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="bg-transparent font-bold text-emerald-900 dark:text-emerald-200 outline-none cursor-pointer"
            >
              <option value="all">Semua Unit</option>
              <option value="perdagangan">Unit Perdagangan</option>
              <option value="jasa">Unit Jasa</option>
            </select>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            title="Ganti Tema"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              {user?.initials || (user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD')}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold leading-none text-slate-800 dark:text-slate-200">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-slate-400 leading-tight">{user?.role || 'Administrator'}</p>
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

      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-20'
          } transition-all duration-200 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between shrink-0 print:hidden overflow-y-auto`}
        >
          <div>
            <div className="p-4 flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs">
                BM
              </div>
              {sidebarOpen && (
                <div>
                  <h2 className="font-extrabold text-xs tracking-tight text-slate-900 dark:text-white uppercase">BUMMA</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">MEKAR SARI</p>
                </div>
              )}
            </div>

            {/* Role Indicator & Menu Count Pill */}
            {sidebarOpen && (
              <div className="px-3 py-1.5 mx-3 mb-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-[10px] flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-semibold truncate">
                  Role: <strong className="text-emerald-700 dark:text-emerald-300">{userRole}</strong>
                </span>
                <span className={`px-1.5 py-0.5 rounded-md font-bold shrink-0 ${
                  rbacStrict 
                    ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200' 
                    : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200'
                }`}>
                  {sidebarOpen && (rbacStrict ? `${allowedMenus.length} Menu` : 'Demo (13)')}
                </span>
              </div>
            )}

            <div className="p-3 space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Store },
                { id: 'profil', label: 'Profil BUMKam', icon: Building2 },
                { id: 'master', label: 'Master Data', icon: Package },
                { id: 'landing_unit', label: 'Profil Unit Usaha', icon: Building2 },
                { id: 'transaksi', label: 'Transaksi', icon: Receipt, badge: transactions.length ? String(transactions.length) : null },
                { id: 'kas_bank', label: 'Kas & Bank', icon: Wallet },
                { id: 'jurnal', label: 'Jurnal Umum', icon: BookOpen },
                { id: 'buku_besar', label: 'Buku Besar', icon: Layers },
                { id: 'neraca_saldo', label: 'Neraca Saldo', icon: Scale },
                { id: 'laporan', label: 'Laporan Keuangan', icon: FileText, highlight: true },
                { id: 'analisis', label: 'Analisis Kinerja', icon: TrendingUp },
                { id: 'operasional', label: 'Laporan Operasional', icon: ClipboardList },
                { id: 'penggajian', label: 'Penggajian', icon: DollarSign }
              ]
                .filter(item => allowedMenus.includes(item.id))
                .map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveMenu(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm font-bold'
                        : item.highlight
                        ? 'text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title={item.label}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-emerald-600' : 'text-slate-400'}`} />
                    {sidebarOpen && <span className="flex-1 text-left truncate">{item.label}</span>}
                    {sidebarOpen && item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-emerald-800 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {sidebarOpen && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  {user?.initials || (user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD')}
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white leading-tight">{user?.name || 'Administrator'}</p>
                  <p className="text-[10px] text-slate-400 leading-tight">{user?.role || 'Administrator'}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="text-slate-400 hover:text-red-600 p-1">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </aside>

        {/* WORKSPACE CONTENT */}
        <main ref={mainRef} onScroll={handleMainScroll} className="flex-1 overflow-y-auto p-5 md:p-8 relative">
          {!allowedMenus.includes(activeMenu) ? (
            <div className="max-w-xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/50 shadow-xl text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 flex items-center justify-center shadow-inner">
                <Lock className="w-8 h-8" />
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[11px] font-bold uppercase tracking-wider inline-block mb-3">
                Hak Akses Terbatas (RBAC)
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
                Modul Dibatasi untuk Peran "{userRole}"
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Berdasarkan prinsip tata kelola akuntansi dan pemisahan fungsi (<em>Segregation of Duties</em>), 
                akun Anda dengan wewenang <strong className="text-emerald-700 dark:text-emerald-400">{userRole}</strong> tidak memiliki izin mengakses modul <strong className="text-slate-900 dark:text-white">{menuTitles[activeMenu] || activeMenu}</strong>.
              </p>

              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/60 mb-6 text-left">
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Modul Resmi yang Dapat Diakses:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {allowedMenus.map(m => (
                    <button
                      key={m}
                      onClick={() => setActiveMenu(m)}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                    >
                      {menuTitles[m] || m} &rarr;
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setActiveMenu('dashboard')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Kembali ke Dashboard
                </button>
                <button
                  onClick={() => {
                    setRbacStrict(false);
                    toast.info('Mode Demo diaktifkan: Akses ke seluruh modul dibuka untuk keperluan presentasi.');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Unlock className="w-4 h-4" /> Buka Akses Demo (Presentasi)
                </button>
              </div>
            </div>
          ) : (
            <>
              {activeMenu === 'dashboard' && (
            <DashboardView
              stats={stats}
              transactions={transactions}
              onNavigate={(menu) => setActiveMenu(menu)}
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
              onNavigate={(menu) => setActiveMenu(menu)}
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
              user={user}
            />
          )}

          {activeMenu === 'profil' && (
            <ProfilBUMMA
              profile={profile}
              setProfile={setProfile}
            />
          )}
            </>
          )}

          {/* Backoffice Footer */}
          <footer className="mt-14 pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs print:hidden">
            <p>&copy; 2026 BUMKam Mekar Sari. Hak Cipta Dilindungi Undang-Undang.</p>
            <p className="mt-1 text-slate-500 text-[11px]">Teknologi Digital Akuntansi (TDA) Kelompok 3C &bull; &bull; S1 Akuntansi FEB Uncen</p>
          </footer>

          {/* Floating Universal Scroll to Top Button */}
          <ScrollToTopButton targetRef={mainRef} />
        </main>
      </div>
    </div>
  );
}
