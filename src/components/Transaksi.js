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
  Search
} from 'lucide-react';
import { toast } from 'sonner';

export const formatIDR = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(Number(val || 0));
};

const DEFAULT_PRODUCT_IMAGES = {
  'PRD-001': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop&q=80',
  'PRD-002': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
  'PRD-003': 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&auto=format&fit=crop&q=80',
  'PRD-004': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=80',
  'PRD-005': 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80',
  'PRD-006': 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80'
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
    contact_name: '',
    product_name: '',
    quantity: 1,
    price: 0,
    payment_method: 'Tunai',
    description: ''
  });

  // POS State
  const [posCart, setPosCart] = useState([]);
  const [posCustomer, setPosCustomer] = useState('');
  const [posPaymentMethod, setPosPaymentMethod] = useState('Tunai');
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
      contact_name: '',
      product_name: '',
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
      contact_name: tx.contact_name || '',
      product_name: tx.product_name || '',
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
            contact_name: formData.contact_name,
            product_name: formData.product_name,
            quantity: qty,
            price: prc,
            total: tot,
            payment_method: formData.payment_method,
            description: formData.description || `${formType === 'penjualan' ? 'Penjualan' : 'Pembelian'} ${formData.product_name}`
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
        contact_name: formData.contact_name,
        product_name: formData.product_name,
        quantity: qty,
        price: prc,
        total: tot,
        payment_method: formData.payment_method,
        status: 'Selesai',
        description: formData.description || `${formType === 'penjualan' ? 'Penjualan' : 'Pembelian'} ${formData.product_name}`
      };

      setTransactions([newTx, ...transactions]);
      toast.success('Transaksi berhasil dicatat dan diposting ke Jurnal Umum!');
    }

    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data transaksi ini? Data di buku kas dan jurnal akan otomatis disesuaikan.')) {
      setTransactions(transactions.filter(t => t.id !== id));
      toast.info('Transaksi telah dihapus.');
    }
  };

  // POS Handlers
  const addPosCart = (prod) => {
    setPosCart(prev => {
      const existing = prev.find(p => p.id === prod.id);
      if (existing) {
        return prev.map(p => p.id === prod.id ? { ...p, qty: p.qty + 1 } : p);
      }
      return [...prev, { ...prod, qty: 1 }];
    });
    toast.success(`${prod.name} ditambahkan ke kasir`);
  };

  const updatePosQty = (id, delta) => {
    setPosCart(prev => {
      return prev.map(p => {
        if (p.id === id) {
          const n = p.qty + delta;
          return n > 0 ? { ...p, qty: n } : null;
        }
        return p;
      }).filter(Boolean);
    });
  };

  const posTotal = posCart.reduce((sum, item) => sum + (Number(item.sell_price || 0) * item.qty), 0);

  const handleProcessPos = () => {
    if (posCart.length === 0) {
      toast.error('Keranjang kasir masih kosong');
      return;
    }

    const year = new Date().getFullYear();
    const dateStr = new Date().toISOString().slice(0, 10);
    const newTransactions = posCart.map((item, idx) => {
      const num = `POS-${year}-${String(transactions.length + idx + 1).padStart(4, '0')}`;
      return {
        id: 'tx_pos_' + Date.now() + '_' + idx,
        number: num,
        type: 'penjualan',
        date: dateStr,
        unit_usaha: item.unit_usaha || 'perdagangan',
        contact_name: posCustomer || 'Pelanggan Umum',
        product_name: item.name,
        quantity: item.qty,
        price: item.sell_price,
        total: item.qty * item.sell_price,
        payment_method: posPaymentMethod,
        status: 'Selesai',
        description: `Penjualan Kasir POS: ${item.name} (${item.qty} ${item.unit})`
      };
    });

    setTransactions([...newTransactions, ...transactions]);
    toast.success(`Transaksi kasir sebesar ${formatIDR(posTotal)} berhasil disimpan dan otomatis masuk ke Jurnal Umum!`);
    setPosCart([]);
    setPosCustomer('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER SECTION WITH MODE SWITCHER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-600" />
            Manajemen Transaksi BUMKam
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan penjualan, pembelian barang dagang, dan layanan kasir terintegrasi otomatis ke SAK
          </p>
        </div>

        {/* View Mode Toggle (Table vs Kasir POS Visual) */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" /> Tabel Riwayat
            </button>
            <button
              onClick={() => setViewMode('pos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'pos'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Store className="w-3.5 h-3.5" /> Kasir POS Visual
            </button>
          </div>

          {viewMode === 'table' && (
            <button
              onClick={handleOpenAdd}
              className="bg-[#0a3a2a] hover:bg-[#06291d] text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Tambah Transaksi
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: KASIR POS VISUAL (ALA ULAMBOX) */}
      {viewMode === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Product Cards Catalog */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search & Category Filter Pills */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={posSearch}
                  onChange={(e) => setPosSearch(e.target.value)}
                  placeholder="Cari produk kasir..."
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
                {['Semua', 'Peternakan Ayam', 'Produk Pertanian', 'Kerajinan Lokal', 'Jasa Penyewaan'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setPosCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                      posCategory === cat
                        ? 'bg-[#0a3a2a] text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Product Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {products
                .filter(p => {
                  const matchCat = posCategory === 'Semua' || p.category === posCategory;
                  const matchSearch = p.name.toLowerCase().includes(posSearch.toLowerCase());
                  return matchCat && matchSearch;
                })
                .map(prod => {
                  const img = DEFAULT_PRODUCT_IMAGES[prod.code] || 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop&q=80';
                  return (
                    <div
                      key={prod.id}
                      onClick={() => addPosCart(prod)}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 hover:border-emerald-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        <div className="h-28 rounded-xl overflow-hidden mb-2 bg-slate-100 dark:bg-slate-800 relative">
                          <img src={img} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                          <span className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            {prod.stock} {prod.unit}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">{prod.category}</span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 transition">
                          {prod.name}
                        </h4>
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

              {/* Form Input Pelanggan & Pembayaran */}
              <div className="space-y-2.5 mb-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Nama Pembeli / Lembaga</label>
                  <input
                    type="text"
                    value={posCustomer}
                    onChange={(e) => setPosCustomer(e.target.value)}
                    placeholder="Contoh: Panitia Gereja / Toko Adat"
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                  />
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
                    <option value="Kredit">Kredit / Piutang Usaha</option>
                  </select>
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
                        <p className="text-[10px] text-emerald-600 font-semibold">{formatIDR(item.sell_price)} x {item.qty}</p>
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

      {/* VIEW 2: TABEL RIWAYAT TRANSAKSI DENGAN FITUR EDIT & HAPUS */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          {/* Table Filters */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
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
              Total: {filteredTransactions.length} Transaksi
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5">No. Bukti</th>
                  <th className="p-3.5">Tipe</th>
                  <th className="p-3.5">Unit Usaha</th>
                  <th className="p-3.5">Deskripsi / Produk</th>
                  <th className="p-3.5">Kontak</th>
                  <th className="p-3.5 text-right">Total (IDR)</th>
                  <th className="p-3.5">Metode Bayar</th>
                  <th className="p-3.5 text-center">Aksi (Edit / Hapus)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-10 text-slate-400 text-xs">
                      Belum ada data transaksi. Klik <strong>"+ Tambah Transaksi Baru"</strong> atau gunakan <strong>Kasir POS</strong> untuk mencatat.
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
                      <td className="p-3.5 whitespace-nowrap capitalize text-slate-500">{tx.unit_usaha}</td>
                      <td className="p-3.5 max-w-xs truncate text-slate-800 dark:text-slate-200">
                        {tx.product_name ? `${tx.product_name} (${tx.quantity}x)` : tx.description}
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
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(tx)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 text-slate-600 hover:text-emerald-700 transition"
                            title="Edit Transaksi"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-950/50 text-slate-600 hover:text-red-600 transition"
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
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
                        ? 'bg-emerald-600 text-white border-emerald-600'
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
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Pembelian (Stok / Sarana)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
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

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Harga Satuan (IDR)</label>
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
                  <option value="Tunai">Tunai (Masuk ke Kas Fisik BUMKam - 1001)</option>
                  <option value="Transfer Bank Papua">Transfer Bank Papua (1002)</option>
                  <option value="Kredit">Kredit / Bertempo (Piutang 1101 / Utang 2001)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Keterangan Tambahan</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Contoh: Pesanan telur untuk acara kampung"
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
