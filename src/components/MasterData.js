import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Save, 
  X, 
  Sparkles, 
  RotateCcw, 
  ShieldCheck, 
  Building2, 
  Layers, 
  Users, 
  Truck, 
  Package, 
  FileSpreadsheet, 
  Printer,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { formatIDR } from './Transaksi';
import { DEFAULT_CORE_PRODUCTS } from './StorefrontUlambox';
import { exportToExcel } from '../utils/exportUtils';

export const PERLAKUAN_OPTIONS = [
  'Persediaan',
  'Aset Tetap',
  'Inventaris Operasional',
  'Bahan Habis Pakai',
  'Jasa'
];

export const SATUAN_OPTIONS = [
  'Pcs', 'Unit', 'Buah', 'Set', 'Paket', 'Lusin', 'Rim', 'Lembar',
  'Batang', 'Gulung', 'Milimeter (mm)', 'Centimeter (cm)', 'Meter (m)',
  'Meter Persegi (m²)', 'Meter Kubik (m³)', 'Gram (g)', 'Kilogram (kg)',
  'Ton', 'Mililiter (mL)', 'Liter (L)', 'Kaleng', 'Botol', 'Jerigen',
  'Karton', 'Box', 'Karung', 'Sak', 'Butir', 'Tray', 'Rak', 'Ekor',
  'Jam', 'Hari'
];

export default function MasterData({
  accounts = [],
  setAccounts,
  products = [],
  setProducts,
  customers = [],
  setCustomers,
  suppliers = [],
  setSuppliers,
  employees = [],
  setEmployees,
  coreProducts = DEFAULT_CORE_PRODUCTS,
  setCoreProducts,
  user
}) {
  const [tab, setTab] = useState('products'); // Default to products
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [modalType, setModalType] = useState(null); // 'product' | 'customer' | 'supplier' | 'account' | null
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Forms state
  const [productForm, setProductForm] = useState({
    code: '',
    name: '',
    category: 'Peternakan Ayam',
    unit_usaha: 'perdagangan',
    unit: 'Pcs',
    perlakuan: 'Persediaan',
    buy_price: 0,
    sell_price: 0,
    stock: 0
  });

  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contact: '',
    bank: '',
    address: ''
  });

  const [accountForm, setAccountForm] = useState({
    code: '',
    name: '',
    category: 'Aset Lancar',
    type: 'asset',
    normal: 'Debit'
  });

  // Showcase Landing Page Editor state
  const [editingShowcase, setEditingShowcase] = useState(null);
  const [showcaseForm, setShowcaseForm] = useState(null);

  const displayCoreProducts = coreProducts && coreProducts.length > 0 ? coreProducts : DEFAULT_CORE_PRODUCTS;

  // PRODUCT HANDLERS
  const handleOpenAddProduct = () => {
    setIsEditing(false);
    setCurrentId(null);
    const nextNum = products.length + 1;
    setProductForm({
      code: `PRD-${String(nextNum).padStart(3, '0')}`,
      name: '',
      category: 'Peternakan Ayam',
      unit_usaha: 'perdagangan',
      unit: 'Pcs',
      perlakuan: 'Persediaan',
      buy_price: 0,
      sell_price: 0,
      stock: 0
    });
    setModalType('product');
  };

  const handleOpenEditProduct = (prod) => {
    setIsEditing(true);
    setCurrentId(prod.id);
    setProductForm({
      code: prod.code || '',
      name: prod.name || '',
      category: prod.category || 'Peternakan Ayam',
      unit_usaha: prod.unit_usaha || 'perdagangan',
      unit: prod.unit || 'Pcs',
      perlakuan: prod.perlakuan || 'Persediaan',
      buy_price: prod.buy_price || 0,
      sell_price: prod.sell_price || 0,
      stock: prod.stock || 0
    });
    setModalType('product');
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      toast.error('Nama produk wajib diisi.');
      return;
    }
    if (!productForm.perlakuan) {
      toast.error('Perlakuan produk wajib dipilih.');
      return;
    }

    if (isEditing) {
      setProducts(products.map(p => p.id === currentId ? { ...p, ...productForm, buy_price: Number(productForm.buy_price), sell_price: Number(productForm.sell_price), stock: Number(productForm.stock) } : p));
      toast.success(`Produk "${productForm.name}" berhasil diperbarui.`);
    } else {
      const newProd = {
        id: 'prd_' + Date.now(),
        ...productForm,
        buy_price: Number(productForm.buy_price),
        sell_price: Number(productForm.sell_price),
        stock: Number(productForm.stock)
      };
      setProducts([newProd, ...products]);
      toast.success(`Produk "${productForm.name}" berhasil ditambahkan.`);
    }
    setModalType(null);
  };

  const handleDeleteProduct = (prod) => {
    if (window.confirm(`Yakin ingin menghapus produk "${prod.name}" (${prod.code})? Data master akan dihapus.`)) {
      setProducts(products.filter(p => p.id !== prod.id));
      toast.info(`Produk "${prod.name}" telah dihapus.`);
    }
  };

  // CUSTOMER HANDLERS
  const handleOpenAddCustomer = () => {
    setIsEditing(false);
    setCurrentId(null);
    setCustomerForm({ name: '', phone: '', address: '' });
    setModalType('customer');
  };

  const handleOpenEditCustomer = (cus) => {
    setIsEditing(true);
    setCurrentId(cus.id);
    setCustomerForm({
      name: cus.name || '',
      phone: cus.phone || '',
      address: cus.address || ''
    });
    setModalType('customer');
  };

  const handleSaveCustomer = (e) => {
    e.preventDefault();
    if (!customerForm.name.trim()) {
      toast.error('Nama pelanggan wajib diisi.');
      return;
    }

    if (isEditing) {
      setCustomers(customers.map(c => c.id === currentId ? { ...c, ...customerForm } : c));
      toast.success(`Data pelanggan "${customerForm.name}" berhasil diperbarui.`);
    } else {
      const newCus = {
        id: 'cus_' + Date.now(),
        ...customerForm
      };
      setCustomers([...customers, newCus]);
      toast.success(`Pelanggan "${customerForm.name}" berhasil ditambahkan.`);
    }
    setModalType(null);
  };

  const handleDeleteCustomer = (cus) => {
    if (window.confirm(`Hapus pelanggan "${cus.name}"?`)) {
      setCustomers(customers.filter(c => c.id !== cus.id));
      toast.info(`Pelanggan "${cus.name}" telah dihapus.`);
    }
  };

  // SUPPLIER HANDLERS
  const handleOpenAddSupplier = () => {
    setIsEditing(false);
    setCurrentId(null);
    setSupplierForm({ name: '', contact: '', bank: '', address: '' });
    setModalType('supplier');
  };

  const handleOpenEditSupplier = (sup) => {
    setIsEditing(true);
    setCurrentId(sup.id);
    setSupplierForm({
      name: sup.name || '',
      contact: sup.contact || '',
      bank: sup.bank || '',
      address: sup.address || ''
    });
    setModalType('supplier');
  };

  const handleSaveSupplier = (e) => {
    e.preventDefault();
    if (!supplierForm.name.trim()) {
      toast.error('Nama pemasok wajib diisi.');
      return;
    }

    if (isEditing) {
      setSuppliers(suppliers.map(s => s.id === currentId ? { ...s, ...supplierForm } : s));
      toast.success(`Data pemasok "${supplierForm.name}" berhasil diperbarui.`);
    } else {
      const newSup = {
        id: 'sup_' + Date.now(),
        ...supplierForm
      };
      setSuppliers([...suppliers, newSup]);
      toast.success(`Pemasok "${supplierForm.name}" berhasil ditambahkan.`);
    }
    setModalType(null);
  };

  const handleDeleteSupplier = (sup) => {
    if (window.confirm(`Hapus pemasok "${sup.name}"?`)) {
      setSuppliers(suppliers.filter(s => s.id !== sup.id));
      toast.info(`Pemasok "${sup.name}" telah dihapus.`);
    }
  };

  // COA HANDLERS
  const handleOpenAddAccount = () => {
    setIsEditing(false);
    setCurrentId(null);
    setAccountForm({ code: '', name: '', category: 'Aset Lancar', type: 'asset', normal: 'Debit' });
    setModalType('account');
  };

  const handleOpenEditAccount = (acc) => {
    setIsEditing(true);
    setCurrentId(acc.code);
    setAccountForm({
      code: acc.code || '',
      name: acc.name || '',
      category: acc.category || 'Aset Lancar',
      type: acc.type || 'asset',
      normal: acc.normal || 'Debit'
    });
    setModalType('account');
  };

  const handleSaveAccount = (e) => {
    e.preventDefault();
    if (!accountForm.code.trim() || !accountForm.name.trim()) {
      toast.error('Kode akun dan nama akun wajib diisi.');
      return;
    }

    if (isEditing) {
      setAccounts(accounts.map(a => a.code === currentId ? { ...a, ...accountForm } : a));
      toast.success(`Bagan akun [${accountForm.code}] berhasil diperbarui.`);
    } else {
      if (accounts.some(a => a.code === accountForm.code)) {
        toast.error(`Kode akun ${accountForm.code} sudah digunakan.`);
        return;
      }
      const newAcc = {
        id: 'acc_' + accountForm.code,
        ...accountForm
      };
      setAccounts([...accounts, newAcc]);
      toast.success(`Akun [${accountForm.code}] ${accountForm.name} berhasil ditambahkan.`);
    }
    setModalType(null);
  };

  const handleDeleteAccount = (acc) => {
    if (window.confirm(`Hapus bagan akun [${acc.code}] ${acc.name}? Pastikan akun ini tidak digunakan dalam transaksi aktif.`)) {
      setAccounts(accounts.filter(a => a.code !== acc.code));
      toast.info(`Akun [${acc.code}] telah dihapus.`);
    }
  };

  // Export handlers
  const handleExportExcel = () => {
    if (tab === 'products') {
      const data = products.map((p, idx) => ({
        No: idx + 1,
        'Kode Produk': p.code,
        'Nama Produk': p.name,
        Kategori: p.category,
        'Unit Usaha': p.unit_usaha,
        Satuan: p.unit,
        'Perlakuan Produk': p.perlakuan || '-',
        'Harga Beli (IDR)': p.buy_price,
        'Harga Jual (IDR)': p.sell_price,
        Stok: p.stock
      }));
      exportToExcel(data, 'Master_Daftar_Produk_Akuntansi', 'Daftar Produk');
    } else if (tab === 'customers') {
      const data = customers.map((c, idx) => ({
        No: idx + 1,
        'Nama Pelanggan': c.name,
        Telepon: c.phone,
        Alamat: c.address
      }));
      exportToExcel(data, 'Master_Pelanggan_BUMKam', 'Pelanggan');
    } else if (tab === 'suppliers') {
      const data = suppliers.map((s, idx) => ({
        No: idx + 1,
        'Nama Pemasok': s.name,
        Kontak: s.contact,
        'Rekening Bank': s.bank,
        Alamat: s.address
      }));
      exportToExcel(data, 'Master_Pemasok_BUMKam', 'Pemasok');
    } else if (tab === 'accounts') {
      const data = accounts.map((a, idx) => ({
        No: idx + 1,
        'Kode Akun': a.code,
        'Nama Akun (COA)': a.name,
        Kategori: a.category,
        Tipe: a.type,
        'Saldo Normal': a.normal
      }));
      exportToExcel(data, 'Master_Bagan_Akun_COA', 'Bagan Akun');
    }
  };

  // Helper Badge for Perlakuan Produk
  const renderPerlakuanBadge = (perlakuan) => {
    switch (perlakuan) {
      case 'Aset Tetap':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800">Aset Tetap</span>;
      case 'Inventaris Operasional':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800">Inventaris Operasional</span>;
      case 'Bahan Habis Pakai':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">Bahan Habis Pakai</span>;
      case 'Jasa':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-800">Jasa</span>;
      case 'Persediaan':
      default:
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">Persediaan</span>;
    }
  };

  // Filtered lists
  const filteredProducts = products.filter(p => 
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.perlakuan || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomers = customers.filter(c => 
    (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.address || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSuppliers = suppliers.filter(s => 
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.address || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAccounts = accounts.filter(a => 
    (a.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              MASTER DATA TERPADU
            </span>
            <span className="text-xs text-slate-400 font-medium">SAK EMKM</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Pengelolaan Master Data BUMKam
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar Produk Akuntansi, Rekanan Pelanggan, Pemasok Logistik, dan Bagan Akun (COA) dengan aksi <strong>Edit &amp; Hapus</strong>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            title="Download Spreadsheet Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Excel
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-500" /> Cetak
          </button>
        </div>
      </div>

      {/* Tabs Navigation (4 Standard Tabs + 1 Showcase Tab) */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto text-xs gap-3">
        <div className="flex items-center gap-2">
          {[
            { id: 'products', label: 'Daftar Produk Akuntansi', icon: Package, count: products.length },
            { id: 'customers', label: 'Pelanggan', icon: Users, count: customers.length },
            { id: 'suppliers', label: 'Pemasok / Supplier', icon: Truck, count: suppliers.length },
            { id: 'accounts', label: 'Bagan Akun (COA)', icon: Layers, count: accounts.length },
            { id: 'landing_showcase', label: '🌟 Showcase Landing Page', icon: Sparkles, count: 3 }
          ].map(t => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setSearchQuery(''); }}
                className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${
                  isActive 
                    ? 'bg-[#0a3a2a] text-white shadow-md' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-300' : 'text-slate-400'}`} />
                <span>{t.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {tab !== 'landing_showcase' && (
          <div className="flex items-center gap-2 shrink-0">
            {tab === 'products' && (
              <button
                onClick={handleOpenAddProduct}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" /> + Tambah Produk
              </button>
            )}
            {tab === 'customers' && (
              <button
                onClick={handleOpenAddCustomer}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" /> + Tambah Pelanggan
              </button>
            )}
            {tab === 'suppliers' && (
              <button
                onClick={handleOpenAddSupplier}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" /> + Tambah Pemasok
              </button>
            )}
            {tab === 'accounts' && (
              <button
                onClick={handleOpenAddAccount}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" /> + Tambah Akun COA
              </button>
            )}
          </div>
        )}
      </div>

      {/* SEARCH BOX FOR TAB TABLES */}
      {tab !== 'landing_showcase' && (
        <div className="flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 print:hidden">
          <div className="flex items-center gap-2 flex-1 max-w-md bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Cari dalam ${tab === 'products' ? 'daftar produk...' : tab === 'customers' ? 'pelanggan...' : tab === 'suppliers' ? 'pemasok...' : 'bagan akun...'}`}
              className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Menampilkan data aktual Master Data terintegrasi
          </span>
        </div>
      )}

      {/* Printable Official Kop Surat Header */}
      {tab !== 'landing_showcase' && (
        <div className="hidden print:block mb-4 pb-3 border-b-2 border-slate-900 text-center kop-surat">
          <h2 className="text-base font-black uppercase text-slate-900 tracking-wide">ARVEA &bull; BUMKAM MEKAR SARI</h2>
          <p className="text-[11px] font-semibold text-slate-700">Financial Management System &bull; Standar SAK EMKM</p>
          <p className="text-[10px] text-slate-500">Kampung Sabron Sari, Distrik Sentani Barat, Kabupaten Jayapura, Papua</p>
          <h3 className="text-xs font-black uppercase mt-2 text-slate-900 underline">
            {tab === 'products' && 'MASTER DATA &bull; DAFTAR PRODUK DAN KOMODITAS'}
            {tab === 'customers' && 'MASTER DATA &bull; DAFTAR PELANGGAN / PEMBELI'}
            {tab === 'suppliers' && 'MASTER DATA &bull; DAFTAR PEMASOK / MITRA USAHA'}
            {tab === 'accounts' && 'MASTER DATA &bull; BAGAN AKUN STANDAR SAK EMKM (COA)'}
          </h3>
          <p className="text-[10px] text-slate-500">Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      )}

      {/* TAB 1: DAFTAR PRODUK AKUNTANSI */}
      {tab === 'products' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm print:border-none print:shadow-none">
          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-[11px] border-b border-slate-200 dark:border-slate-700 print:text-[7pt]">
                <tr>
                  <th className="p-3.5 print:p-1">Kode</th>
                  <th className="p-3.5 print:p-1">Nama Produk</th>
                  <th className="p-3.5 print:p-1">Kategori</th>
                  <th className="p-3.5 print:p-1">Satuan</th>
                  <th className="p-3.5 print:p-1 text-center">Perlakuan Produk</th>
                  <th className="p-3.5 print:p-1 text-right">Harga Beli</th>
                  <th className="p-3.5 print:p-1 text-right">Harga Jual</th>
                  <th className="p-3.5 print:p-1 text-center">Stok</th>
                  <th className="p-3.5 print:p-1 text-center print:hidden">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-10 text-slate-400 print:py-4">
                      Tidak ada data produk ditemukan. Klik "+ Tambah Produk" untuk menambahkan.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="p-3.5 print:p-1 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap print:text-[7.5pt]">{p.code}</td>
                      <td className="p-3.5 print:p-1 font-bold text-slate-800 dark:text-slate-200 print:text-[7.5pt] print:overflow-visible print:whitespace-normal">{p.name}</td>
                      <td className="p-3.5 print:p-1 print:text-[7.5pt]">{p.category}</td>
                      <td className="p-3.5 print:p-1 whitespace-nowrap print:text-[7.5pt]">{p.unit}</td>
                      <td className="p-3.5 print:p-1 text-center whitespace-nowrap">{renderPerlakuanBadge(p.perlakuan)}</td>
                      <td className="p-3.5 print:p-1 text-right font-medium whitespace-nowrap print:text-[7.5pt]">{formatIDR(p.buy_price)}</td>
                      <td className="p-3.5 print:p-1 text-right font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap print:text-[7.5pt]">{formatIDR(p.sell_price)}</td>
                      <td className="p-3.5 print:p-1 text-center font-bold whitespace-nowrap print:text-[7.5pt]">{p.stock}</td>
                      <td className="p-3.5 text-center print:hidden">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 transition"
                            title="Edit Produk"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-100 text-slate-600 hover:text-red-600 transition"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PELANGGAN */}
      {tab === 'customers' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm print:border-none print:shadow-none">
          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-[11px] border-b border-slate-200 dark:border-slate-700 print:text-[7pt]">
                <tr>
                  <th className="p-3.5 print:p-1">Nama Pelanggan</th>
                  <th className="p-3.5 print:p-1">Telepon</th>
                  <th className="p-3.5 print:p-1">Alamat</th>
                  <th className="p-3.5 print:p-1 text-center print:hidden">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-10 text-slate-400 print:py-4">
                      Tidak ada data pelanggan. Klik "+ Tambah Pelanggan" untuk menambahkan.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="p-3.5 print:p-1 font-bold text-slate-800 dark:text-slate-200 print:text-[7.5pt] print:overflow-visible print:whitespace-normal">{c.name}</td>
                      <td className="p-3.5 print:p-1 whitespace-nowrap print:text-[7.5pt]">{c.phone}</td>
                      <td className="p-3.5 print:p-1 text-slate-600 dark:text-slate-400 print:text-[7.5pt] print:overflow-visible print:whitespace-normal">{c.address}</td>
                      <td className="p-3.5 text-center print:hidden">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditCustomer(c)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 transition"
                            title="Edit Pelanggan"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(c)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-100 text-slate-600 hover:text-red-600 transition"
                            title="Hapus Pelanggan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PEMASOK / SUPPLIER */}
      {tab === 'suppliers' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm print:border-none print:shadow-none">
          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-[11px] border-b border-slate-200 dark:border-slate-700 print:text-[7pt]">
                <tr>
                  <th className="p-3.5 print:p-1">Nama Pemasok</th>
                  <th className="p-3.5 print:p-1">Kontak</th>
                  <th className="p-3.5 print:p-1">Rekening Bank</th>
                  <th className="p-3.5 print:p-1">Alamat</th>
                  <th className="p-3.5 print:p-1 text-center print:hidden">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-slate-400 print:py-4">
                      Tidak ada data pemasok. Klik "+ Tambah Pemasok" untuk menambahkan.
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="p-3.5 print:p-1 font-bold text-slate-800 dark:text-slate-200 print:text-[7.5pt] print:overflow-visible print:whitespace-normal">{s.name}</td>
                      <td className="p-3.5 print:p-1 whitespace-nowrap print:text-[7.5pt]">{s.contact}</td>
                      <td className="p-3.5 print:p-1 font-mono whitespace-nowrap print:text-[7.5pt]">{s.bank}</td>
                      <td className="p-3.5 print:p-1 text-slate-600 dark:text-slate-400 print:text-[7.5pt] print:overflow-visible print:whitespace-normal">{s.address}</td>
                      <td className="p-3.5 text-center print:hidden">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditSupplier(s)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 transition"
                            title="Edit Pemasok"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSupplier(s)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-100 text-slate-600 hover:text-red-600 transition"
                            title="Hapus Pemasok"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: BAGAN AKUN (COA) */}
      {tab === 'accounts' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm print:border-none print:shadow-none">
          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-[11px] border-b border-slate-200 dark:border-slate-700 print:text-[7pt]">
                <tr>
                  <th className="p-3.5 print:p-1">Kode</th>
                  <th className="p-3.5 print:p-1">Nama Perkiraan (COA)</th>
                  <th className="p-3.5 print:p-1">Kategori</th>
                  <th className="p-3.5 print:p-1 text-center">Saldo Normal</th>
                  <th className="p-3.5 print:p-1 text-center print:hidden">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-slate-400 print:py-4">
                      Tidak ada bagan akun ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map(a => (
                    <tr key={a.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="p-3.5 print:p-1 font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap print:text-[7.5pt]">{a.code}</td>
                      <td className="p-3.5 print:p-1 font-bold text-slate-900 dark:text-white print:text-[7.5pt] print:overflow-visible print:whitespace-normal">{a.name}</td>
                      <td className="p-3.5 print:p-1 print:text-[7.5pt]">{a.category}</td>
                      <td className="p-3.5 print:p-1 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold print:text-[6.5pt] ${
                          a.normal === 'Debit' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {a.normal}
                        </span>
                      </td>
                      <td className="p-3.5 text-center print:hidden">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditAccount(a)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 transition"
                            title="Edit Akun"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAccount(a)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-100 text-slate-600 hover:text-red-600 transition"
                            title="Hapus Akun"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Printable Official Signatures Block */}
      {tab !== 'landing_showcase' && (
        <div className="hidden print:flex justify-between items-center mt-6 pt-4 text-xs signature-block">
          <div className="text-center">
            <p className="text-[10px] text-slate-500 font-medium">Mengetahui,</p>
            <p className="font-bold text-slate-800">Direktur BUMKam</p>
            <div className="h-12"></div>
            <p className="font-bold underline text-slate-900">Eko L Wibowo</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-500 font-medium">Sentani Barat, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-bold text-slate-800">Bendahara BUMKam</p>
            <div className="h-12"></div>
            <p className="font-bold underline text-slate-900">Rita Fanghoi</p>
          </div>
        </div>
      )}

      {/* TAB 5: SHOWCASE LANDING PAGE EDITOR */}
      {tab === 'landing_showcase' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-850 p-4 rounded-2xl border border-emerald-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-black uppercase tracking-wide text-slate-800 dark:text-slate-200">
                  Pengaturan Konten &amp; Tarif 3 Unit Usaha Landing Page
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl">
                Bagian ini dapat dikelola oleh Administrator untuk memperbarui tarif, fasilitas, dan foto komoditas di Landing Page publik.
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Kembalikan 3 Unit Usaha ke bawaan awal?')) {
                  if (setCoreProducts) setCoreProducts(DEFAULT_CORE_PRODUCTS);
                  toast.success('Katalog landing page dikembalikan ke standar awal.');
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 font-bold text-[11px] flex items-center gap-1.5 transition shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset ke Default
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {displayCoreProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-emerald-500 transition duration-300"
              >
                <div>
                  <div className="h-44 relative bg-slate-900 overflow-hidden">
                    <img
                      src={prod.images?.[0]?.url || '/images/products/telur_segar_1.jpg'}
                      alt={prod.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-[#0a3a2a]/90 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
                      {prod.badge}
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">{prod.title}</h3>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-black">{prod.price} <span className="text-[10px] text-slate-400 font-normal">/ {prod.unit}</span></p>
                    <p className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed">{prod.description}</p>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <button
                    onClick={() => {
                      setEditingShowcase(prod);
                      setShowcaseForm({
                        ...prod,
                        features: prod.features ? [...prod.features] : ['', '', '', ''],
                        images: prod.images ? prod.images.map(i => ({ ...i })) : [{ url: '', caption: '' }]
                      });
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit Showcase
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: TAMBAH / EDIT PRODUK DENGAN ATRIBUT "PERLAKUAN PRODUK" */}
      {modalType === 'product' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                {isEditing ? 'Edit Data Produk Akuntansi' : 'Tambah Produk Akuntansi Baru'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kode Produk *</label>
                  <input
                    type="text"
                    value={productForm.code}
                    onChange={(e) => setProductForm({ ...productForm, code: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Unit Usaha</label>
                  <select
                    value={productForm.unit_usaha}
                    onChange={(e) => setProductForm({ ...productForm, unit_usaha: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="perdagangan">Unit Perdagangan &amp; Peternakan</option>
                    <option value="jasa">Unit Jasa Penyewaan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Produk / Komoditas *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Contoh: Telur Ayam Segar / Mesin Tetas / Kursi Lipat"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                  <input
                    type="text"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    placeholder="Contoh: Peternakan / Peralatan / Sewa"
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Satuan Produk</label>
                  <select
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    {SATUAN_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ATRIBUT WAJIB: PERLAKUAN PRODUK (PERSYARATAN INTEGRASI INVENTARISASI ASET) */}
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <label className="block font-bold text-emerald-900 dark:text-emerald-200 mb-1 flex items-center justify-between">
                  <span>Perlakuan Produk (Klasifikasi Sistem) *</span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300">Wajib Dipilih</span>
                </label>
                <select
                  value={productForm.perlakuan}
                  onChange={(e) => setProductForm({ ...productForm, perlakuan: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-100"
                  required
                >
                  {PERLAKUAN_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <p className="text-[10px] text-emerald-800 dark:text-emerald-300/80 mt-1.5 leading-relaxed">
                  * <strong>Aset Tetap</strong> &amp; <strong>Inventaris Operasional</strong> akan otomatis dapat dipilih pada modul <strong>Inventarisasi Aset</strong>.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Harga Beli / Unit (IDR)</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.buy_price}
                    onChange={(e) => setProductForm({ ...productForm, buy_price: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Harga Jual / Unit (IDR)</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.sell_price}
                    onChange={(e) => setProductForm({ ...productForm, sell_price: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Stok Awal</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0a3a2a] hover:bg-[#06291d] text-white font-bold flex items-center gap-1.5 shadow"
                >
                  <Save className="w-4 h-4 text-emerald-300" /> Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TAMBAH / EDIT PELANGGAN */}
      {modalType === 'customer' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                {isEditing ? 'Edit Data Pelanggan' : 'Tambah Pelanggan Baru'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Pelanggan / Institusi *</label>
                <input
                  type="text"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  placeholder="Contoh: Koperasi Warga Sentani"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor Telepon / WhatsApp</label>
                <input
                  type="text"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  placeholder="Contoh: 0812-4000-1122"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Domisili</label>
                <textarea
                  rows={3}
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                  placeholder="Contoh: Distrik Sentani Barat, Kab. Jayapura"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0a3a2a] hover:bg-[#06291d] text-white font-bold flex items-center gap-1.5 shadow"
                >
                  <Save className="w-4 h-4 text-emerald-300" /> Simpan Pelanggan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: TAMBAH / EDIT PEMASOK */}
      {modalType === 'supplier' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" />
                {isEditing ? 'Edit Data Pemasok' : 'Tambah Pemasok Baru'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Pemasok / Rekanan *</label>
                <input
                  type="text"
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  placeholder="Contoh: CV Sumber Pangan Papua"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kontak Person / Telepon</label>
                <input
                  type="text"
                  value={supplierForm.contact}
                  onChange={(e) => setSupplierForm({ ...supplierForm, contact: e.target.value })}
                  placeholder="Contoh: 0813-5000-1122"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor Rekening &amp; Bank</label>
                <input
                  type="text"
                  value={supplierForm.bank}
                  onChange={(e) => setSupplierForm({ ...supplierForm, bank: e.target.value })}
                  placeholder="Contoh: Bank Papua (101-020-3040)"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Kantor / Gudang</label>
                <textarea
                  rows={2}
                  value={supplierForm.address}
                  onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                  placeholder="Contoh: Kota Jayapura"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0a3a2a] hover:bg-[#06291d] text-white font-bold flex items-center gap-1.5 shadow"
                >
                  <Save className="w-4 h-4 text-emerald-300" /> Simpan Pemasok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: TAMBAH / EDIT BAGAN AKUN (COA) */}
      {modalType === 'account' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                {isEditing ? 'Edit Bagan Akun (COA)' : 'Tambah Bagan Akun Baru'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-3.5 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kode Akun *</label>
                  <input
                    type="text"
                    value={accountForm.code}
                    onChange={(e) => setAccountForm({ ...accountForm, code: e.target.value })}
                    placeholder="Contoh: 1003"
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                    required
                    disabled={isEditing}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Saldo Normal</label>
                  <select
                    value={accountForm.normal}
                    onChange={(e) => setAccountForm({ ...accountForm, normal: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    <option value="Debit">Debit</option>
                    <option value="Kredit">Kredit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Perkiraan Akun *</label>
                <input
                  type="text"
                  value={accountForm.name}
                  onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                  placeholder="Contoh: Piutang Karyawan"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori Akun</label>
                <select
                  value={accountForm.category}
                  onChange={(e) => setAccountForm({ ...accountForm, category: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="Aset Lancar">Aset Lancar</option>
                  <option value="Aset Tetap">Aset Tetap</option>
                  <option value="Liabilitas">Liabilitas (Utang)</option>
                  <option value="Ekuitas">Ekuitas (Modal)</option>
                  <option value="Pendapatan">Pendapatan</option>
                  <option value="Beban Pokok">Beban Pokok (HPP)</option>
                  <option value="Beban Operasional">Beban Operasional</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0a3a2a] hover:bg-[#06291d] text-white font-bold flex items-center gap-1.5 shadow"
                >
                  <Save className="w-4 h-4 text-emerald-300" /> Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
