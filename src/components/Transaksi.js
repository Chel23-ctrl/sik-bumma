import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Receipt, 
  ShoppingBag, 
  Minus, 
  Store, 
  ListFilter, 
  CheckCircle2, 
  CreditCard,
  User,
  Search,
  FileSpreadsheet,
  Printer,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { exportToExcel } from '../utils/exportUtils';
import { SATUAN_OPTIONS } from './MasterData';

export const formatIDR = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(Number(val || 0));
};

const DEFAULT_PRODUCT_IMAGES = {
  'PRD-001': '/images/products/telur_segar_1.jpg',
  'PRD-002': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
  'PRD-003': 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&auto=format&fit=crop&q=80',
  'PRD-004': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=80',
  'PRD-005': '/images/products/tenda_marquee_1.jpg',
  'PRD-006': '/images/products/gedung_aula_1.jpg'
};

export default function Transaksi({
  transactions = [],
  setTransactions,
  products = [],
  customers = [],
  suppliers = [],
  selectedUnit = 'all',
  selectedYear = 'all'
}) {
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'pos'
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State for Manual Modal
  const [formType, setFormType] = useState('penjualan');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    unit_usaha: selectedUnit !== 'all' ? selectedUnit : 'perdagangan',
    transaction_method: 'Offline', // 'Online' | 'Offline' (Sesuai Butir Revisi Docx)
    contact_name: '',
    product_name: '',
    unit: 'Pcs', // Satuan dari 33 pilihan resmi
    quantity: 1,
    price: 0,
    payment_method: 'Tunai',
    description: ''
  });

  // POS State
  const [posCart, setPosCart] = useState([]);
  const [posCustomer, setPosCustomer] = useState('');
  const [posPaymentMethod, setPosPaymentMethod] = useState('Tunai');
  const [posTransactionMethod, setPosTransactionMethod] = useState('Offline');
  const [posCategory, setPosCategory] = useState('Semua');
  const [posSearch, setPosSearch] = useState('');

  const filteredTransactions = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (selectedUnit !== 'all' && t.unit_usaha !== selectedUnit) return false;
    if (selectedYear !== 'all') {
      const yr = (t.date || '').slice(0, 4);
      if (yr && yr !== selectedYear) return false;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormType('penjualan');
    setFormData({
      date: new Date().toISOString().slice(0, 10),
      unit_usaha: selectedUnit !== 'all' ? selectedUnit : 'perdagangan',
      transaction_method: 'Offline',
      contact_name: '',
      product_name: '',
      unit: 'Pcs',
      quantity: 1,
      price: 0,
      payment_method: 'Tunai',
      description: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (tx) => {
    setEditingId(tx.id);
    setFormType(tx.type);
    setFormData({
      date: tx.date,
      unit_usaha: tx.unit_usaha || 'perdagangan',
      transaction_method: tx.transaction_method || 'Offline',
      contact_name: tx.contact_name || '',
      product_name: tx.product_name || '',
      unit: tx.unit || 'Pcs',
      quantity: tx.quantity || 1,
      price: tx.price || 0,
      payment_method: tx.payment_method || 'Tunai',
      description: tx.description || ''
    });
    setShowModal(true);
  };

  const handleSaveTransaction = (e) => {
    e.preventDefault();
    const qty = Number(formData.quantity || 1);
    const prc = Number(formData.price || 0);
    const tot = qty * prc;

    if (tot <= 0) {
      toast.error('Jumlah total harus lebih besar dari Rp 0');
      return;
    }

    if (editingId) {
      setTransactions(transactions.map(t => {
        if (t.id === editingId) {
          return {
            ...t,
            type: formType,
            date: formData.date,
            unit_usaha: formData.unit_usaha,
            transaction_method: formData.transaction_method,
            contact_name: formData.contact_name,
            product_name: formData.product_name,
            unit: formData.unit,
            quantity: qty,
            price: prc,
            total: tot,
            payment_method: formData.payment_method,
            description: formData.description || `${formType === 'penjualan' ? 'Penjualan' : 'Pembelian'} ${formData.product_name} (${formData.transaction_method})`
          };
        }
        return t;
      }));
      toast.success('Data transaksi berhasil diperbarui!');
    } else {
      const prefix = formType === 'penjualan' ? 'INV' : 'BILL';
      const year = new Date().getFullYear();
      const num = `${prefix}-${year}-${String(transactions.length + 1).padStart(4, '0')}`;

      const newTx = {
        id: 'tx_' + Date.now(),
        number: num,
        type: formType,
        date: formData.date,
        unit_usaha: formData.unit_usaha,
        transaction_method: formData.transaction_method,
        contact_name: formData.contact_name,
        product_name: formData.product_name,
        unit: formData.unit,
        quantity: qty,
        price: prc,
        total: tot,
        payment_method: formData.payment_method,
        status: 'Selesai',
        description: formData.description || `${formType === 'penjualan' ? 'Penjualan' : 'Pembelian'} ${formData.product_name} (${formData.transaction_method})`,
        created_at: new Date().toISOString()
      };

      setTransactions([newTx, ...transactions]);
      toast.success(`Transaksi ${num} berhasil dicatat & masuk ke jurnal!`);
    }

    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Yakin ingin menghapus transaksi ini? Jurnal terkait juga akan dihapus.')) {
      setTransactions(transactions.filter(t => t.id !== id));
      toast.info('Transaksi telah dihapus.');
    }
  };

  // Export Transactions to Excel
  const handleExportExcel = () => {
    const data = filteredTransactions.map((tx, idx) => ({
      No: idx + 1,
      Tanggal: tx.date,
      'No. Bukti': tx.number,
      'Tipe Transaksi': tx.type,
      'Metode Transaksi': tx.transaction_method || 'Offline',
      'Unit Usaha': tx.unit_usaha,
      'Nama Kontak / Rekanan': tx.contact_name || '-',
      'Item / Produk': tx.product_name || tx.description,
      Kuantitas: tx.quantity || 1,
      Satuan: tx.unit || 'Unit',
      'Harga Satuan (IDR)': tx.price || tx.total,
      'Total Nilai (IDR)': tx.total,
      'Metode Pembayaran': tx.payment_method,
      Status: tx.status || 'Selesai'
    }));

    exportToExcel(data, `Laporan_Transaksi_BUMKam_${selectedYear}`, 'Transaksi');
    toast.success('File Excel transaksi berhasil diunduh!');
  };

  // POS Add to Cart
  const addToPosCart = (prod) => {
    setPosCart(prev => {
      const exist = prev.find(item => item.id === prod.id);
      if (exist) {
        return prev.map(item => item.id === prod.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...prod, qty: 1 }];
    });
  };

  const updatePosQty = (prodId, delta) => {
    setPosCart(prev => {
      return prev.map(item => {
        if (item.id === prodId) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const posTotal = posCart.reduce((sum, item) => sum + (item.sell_price * item.qty), 0);

  const handleProcessPos = () => {
    if (posCart.length === 0) {
      toast.error('Keranjang kasir masih kosong');
      return;
    }

    const year = new Date().getFullYear();
    const dateStr = new Date().toISOString().slice(0, 10);
    const orderNumber = `POS-${year}-${String(transactions.length + 1).padStart(4, '0')}`;

    const newTxList = posCart.map((item, idx) => ({
      id: 'tx_pos_' + Date.now() + '_' + idx,
      number: orderNumber + (posCart.length > 1 ? `-${idx + 1}` : ''),
      type: 'penjualan',
      date: dateStr,
      unit_usaha: item.unit_usaha || 'perdagangan',
      transaction_method: posTransactionMethod,
      contact_name: posCustomer || 'Pembeli Langsung',
      product_name: item.name,
      unit: item.unit || 'Pcs',
      quantity: item.qty,
      price: item.sell_price,
      total: item.qty * item.sell_price,
      payment_method: posPaymentMethod,
      status: 'Selesai',
      description: `Kasir POS (${posTransactionMethod}): ${item.name} (${item.qty} ${item.unit || 'unit'})`,
      created_at: new Date().toISOString()
    }));

    setTransactions([...newTxList, ...transactions]);
    setPosCart([]);
    setPosCustomer('');
    toast.success(`Transaksi Kasir POS ${orderNumber} berhasil dicatat!`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              TRANSAKSI TERPADU BUMKAM
            </span>
            <span className="text-xs text-slate-400 font-medium">SAK EMKM</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Transaksi Penjualan &amp; Pembelian
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pusat pencatatan transaksi terintegrasi dilengkapi <strong>Metode Online/Offline</strong>, 33 pilihan satuan, dan kasir POS
          </p>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Tabel Riwayat
            </button>
            <button
              onClick={() => setViewMode('pos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'pos'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Store className="w-3.5 h-3.5" /> Kasir POS
            </button>
          </div>

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

          <button
            onClick={handleOpenAdd}
            className="bg-[#0a3a2a] text-white px-4 py-2 rounded-xl text-xs font-bold shadow hover:bg-[#06291d] transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> + Catat Transaksi Baru
          </button>
        </div>
      </div>

      {/* VIEW 1: KASIR POINT OF SALE (POS) */}
      {viewMode === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Product Catalog */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filter and Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 flex-1 w-full bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={posSearch}
                  onChange={(e) => setPosSearch(e.target.value)}
                  placeholder="Cari komoditas atau layanan..."
                  className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none"
                />
              </div>

              <div className="flex gap-1 overflow-x-auto w-full sm:w-auto">
                {['Semua', 'Peternakan', 'Perdagangan', 'Jasa'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPosCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      posCategory === cat
                        ? 'bg-[#0a3a2a] text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {products
                .filter(p => posCategory === 'Semua' || (p.category && p.category.toLowerCase().includes(posCategory.toLowerCase())))
                .filter(p => !posSearch || p.name.toLowerCase().includes(posSearch.toLowerCase()))
                .map((prod) => {
                  const img = DEFAULT_PRODUCT_IMAGES[prod.code] || 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&auto=format&fit=crop&q=80';
                  return (
                    <div
                      key={prod.id}
                      onClick={() => addToPosCart(prod)}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:border-emerald-500 hover:shadow-md transition cursor-pointer p-3 flex flex-col justify-between group"
                    >
                      <div>
                        <div className="h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2.5">
                          <img src={img} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        </div>
                        <p className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{prod.name}</p>
                        <p className="text-[10px] text-slate-400 capitalize">{prod.unit_usaha} &bull; {prod.unit}</p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                          {formatIDR(prod.sell_price)}
                        </span>
                        <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs group-hover:bg-emerald-600 group-hover:text-white transition">
                          +
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Right 1 Col: Live POS Cashier Cart */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between h-fit">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                    Kasir Penjualan BUMKam
                  </h3>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {posCart.reduce((s, x) => s + x.qty, 0)} Item
                </span>
              </div>

              {/* Form Input Pelanggan, Metode Transaksi, & Pembayaran */}
              <div className="space-y-2.5 mb-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Nama Pembeli / Lembaga</label>
                  <input
                    type="text"
                    value={posCustomer}
                    onChange={(e) => setPosCustomer(e.target.value)}
                    placeholder="Contoh: Panitia Acara / Warga Adat"
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Metode Transaksi</label>
                    <select
                      value={posTransactionMethod}
                      onChange={(e) => setPosTransactionMethod(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                    >
                      <option value="Offline">Offline (Langsung)</option>
                      <option value="Online">Online (Digital)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Metode Bayar</label>
                    <select
                      value={posPaymentMethod}
                      onChange={(e) => setPosPaymentMethod(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                    >
                      <option value="Tunai">Tunai / Kas</option>
                      <option value="Transfer Bank Papua">Transfer Bank Papua</option>
                      <option value="Kredit">Kredit / Piutang</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Items in Cart */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {posCart.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Klik produk di sebelah kiri untuk menambahkan ke kasir.
                  </div>
                ) : (
                  posCart.map(item => (
                    <div key={item.id} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                        <p className="text-[10px] text-emerald-600 font-semibold">{formatIDR(item.sell_price)} x {item.qty} {item.unit || 'unit'}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updatePosQty(item.id, -1)}
                          className="w-5 h-5 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <span className="font-bold px-1">{item.qty}</span>
                        <button
                          onClick={() => updatePosQty(item.id, 1)}
                          className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* POS Total & Checkout Button */}
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Total Penjualan:</span>
                <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                  {formatIDR(posTotal)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleProcessPos}
                disabled={posCart.length === 0}
                className="w-full py-2.5 rounded-xl bg-[#0a3a2a] hover:bg-[#06291d] disabled:opacity-50 text-white font-bold text-xs shadow transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                Bayar &amp; Posting ke Jurnal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: TABEL RIWAYAT TRANSAKSI */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          {/* Table Filters */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Filter Tipe:</span>
              <div className="flex gap-1">
                {['all', 'penjualan', 'pembelian', 'kas_masuk', 'kas_keluar'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition ${
                      filterType === t
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {t === 'all' ? 'Semua' : t.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs text-slate-500 font-semibold">
              Total: {filteredTransactions.length} Transaksi Terdata
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800 text-[11px]">
                <tr>
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5">No. Bukti</th>
                  <th className="p-3.5">Tipe</th>
                  <th className="p-3.5 text-center">Metode</th>
                  <th className="p-3.5">Unit Usaha</th>
                  <th className="p-3.5">Deskripsi / Komoditas</th>
                  <th className="p-3.5 text-center">Volume</th>
                  <th className="p-3.5">Kontak</th>
                  <th className="p-3.5 text-right">Total (IDR)</th>
                  <th className="p-3.5">Pembayaran</th>
                  <th className="p-3.5 text-center print:hidden">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="text-center py-10 text-slate-400 text-xs">
                      Belum ada data transaksi. Klik <strong>"+ Catat Transaksi Baru"</strong> atau gunakan <strong>Kasir POS</strong>.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="p-3.5 whitespace-nowrap font-medium text-slate-800 dark:text-slate-200">{tx.date}</td>
                      <td className="p-3.5 whitespace-nowrap font-bold text-emerald-700 dark:text-emerald-400">{tx.number}</td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          tx.type === 'penjualan' ? 'bg-emerald-100 text-emerald-800' :
                          tx.type === 'pembelian' ? 'bg-amber-100 text-amber-800' :
                          tx.type === 'kas_masuk' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          tx.transaction_method === 'Online'
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {tx.transaction_method || 'Offline'}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap capitalize text-slate-500">{tx.unit_usaha}</td>
                      <td className="p-3.5 max-w-xs truncate text-slate-800 dark:text-slate-200 font-semibold">
                        {tx.product_name ? tx.product_name : tx.description}
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {tx.quantity || 1} {tx.unit || 'unit'}
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-slate-600 dark:text-slate-400">{tx.contact_name || '-'}</td>
                      <td className="p-3.5 whitespace-nowrap text-right font-extrabold text-slate-900 dark:text-white">
                        {formatIDR(tx.total)}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          tx.payment_method === 'Tunai' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {tx.payment_method}
                        </span>
                      </td>
                      <td className="p-3.5 text-center print:hidden">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(tx)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 transition"
                            title="Edit Transaksi"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-100 text-slate-600 hover:text-red-600 transition"
                            title="Hapus Transaksi"
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

      {/* MODAL INPUT & EDIT TRANSAKSI */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit Data Transaksi' : 'Catat Transaksi Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jenis Transaksi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType('penjualan')}
                    className={`py-2 rounded-xl font-bold border transition ${
                      formType === 'penjualan'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Penjualan (Invoice)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('pembelian')}
                    className={`py-2 rounded-xl font-bold border transition ${
                      formType === 'pembelian'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Pembelian (Stok / Sarana)
                  </button>
                </div>
              </div>

              {/* FIELD BARU: METODE TRANSAKSI (ONLINE / OFFLINE) */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Metode {formType === 'penjualan' ? 'Penjualan' : 'Pembelian'} *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Offline', 'Online'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFormData({ ...formData, transaction_method: m })}
                      className={`py-2 rounded-lg font-bold border text-xs transition ${
                        formData.transaction_method === m
                          ? 'bg-[#0a3a2a] text-white border-[#0a3a2a] shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {m === 'Offline' ? '🏬 Offline (Langsung / Fisik)' : '🌐 Online (Toko Digital / WA)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Unit Usaha BUMKam</label>
                  <select
                    value={formData.unit_usaha}
                    onChange={(e) => setFormData({ ...formData, unit_usaha: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                  >
                    <option value="perdagangan">Unit Perdagangan &amp; Peternakan</option>
                    <option value="jasa">Unit Jasa Penyewaan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {formType === 'penjualan' ? 'Nama Pelanggan / Lembaga' : 'Nama Pemasok / Supplier'}
                </label>
                <input
                  type="text"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  placeholder={formType === 'penjualan' ? 'Contoh: Toko Harapan Adat' : 'Contoh: CV Sumber Pangan Mandiri'}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pilih Produk / Komoditas</label>
                <select
                  value={formData.product_name}
                  onChange={(e) => {
                    const sel = products.find(p => p.name === e.target.value);
                    setFormData({
                      ...formData,
                      product_name: e.target.value,
                      unit: sel ? sel.unit : formData.unit,
                      price: sel ? (formType === 'penjualan' ? sel.sell_price : sel.buy_price) : formData.price,
                      unit_usaha: sel ? sel.unit_usaha : formData.unit_usaha
                    });
                  }}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                  required
                >
                  <option value="">-- Pilih dari Master Komoditas --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.name}>
                      {p.name} ({p.unit_usaha === 'jasa' ? 'Jasa' : 'Ternak/Dagang'} - {formatIDR(formType === 'penjualan' ? p.sell_price : p.buy_price)}/{p.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* SATUAN (33 PILIHAN SESUAI BUTIR CATATAN REVISI DOCX) & KUANTITAS & HARGA */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kuantitas</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-right"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Satuan Produk *</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                  >
                    {SATUAN_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Harga / Satuan (IDR)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-right"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 flex justify-between items-center">
                <span className="font-bold text-emerald-900 dark:text-emerald-200">Total Transaksi:</span>
                <span className="text-base font-black text-emerald-800 dark:text-emerald-300">
                  {formatIDR(Number(formData.quantity || 0) * Number(formData.price || 0))}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Metode Pembayaran</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                >
                  <option value="Tunai">Tunai (Kas Fisik - Akun 1001)</option>
                  <option value="Transfer Bank Papua">Transfer Bank Papua (Akun 1002)</option>
                  <option value="Kredit">Kredit / Piutang Usaha (Akun 1101)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Keterangan Tambahan</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Contoh: Pesanan telur untuk konsumsi acara adat"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0a3a2a] text-white font-bold hover:bg-[#06291d]"
                >
                  {editingId ? 'Simpan Perubahan' : 'Simpan Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
