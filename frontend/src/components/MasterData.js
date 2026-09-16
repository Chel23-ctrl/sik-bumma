import React, { useState } from 'react';
import { 
  Edit2, 
  Sparkles, 
  Image as ImageIcon, 
  CheckCircle, 
  RotateCcw, 
  X, 
  MessageCircle, 
  Save, 
  ShieldCheck, 
  Eye, 
  Building2, 
  Tag, 
  Layers
} from 'lucide-react';
import { toast } from 'sonner';
import { formatIDR } from './Transaksi';
import { DEFAULT_CORE_PRODUCTS } from './StorefrontUlambox';

export default function MasterData({
  accounts,
  setAccounts,
  products,
  setProducts,
  customers,
  setCustomers,
  suppliers,
  setSuppliers,
  employees,
  setEmployees,
  coreProducts = DEFAULT_CORE_PRODUCTS,
  setCoreProducts,
  user
}) {
  const [tab, setTab] = useState('landing_showcase');
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(null);

  const displayCoreProducts = coreProducts && coreProducts.length > 0 ? coreProducts : DEFAULT_CORE_PRODUCTS;

  const handleStartEdit = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      ...prod,
      features: prod.features ? [...prod.features] : ['', '', '', ''],
      images: prod.images ? prod.images.map(img => ({ ...img })) : [
        { url: '', caption: '' },
        { url: '', caption: '' },
        { url: '', caption: '' }
      ]
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!productForm) return;

    if (setCoreProducts) {
      setCoreProducts(prev => {
        const source = (prev && prev.length > 0) ? prev : DEFAULT_CORE_PRODUCTS;
        return source.map(p => p.id === productForm.id ? productForm : p);
      });
      toast.success(`Data "${productForm.title}" berhasil diperbarui! Perubahan sudah aktif di Landing Page.`);
    }
    setEditingProduct(null);
    setProductForm(null);
  };

  const handleResetToDefault = () => {
    if (window.confirm('Kembalikan data 3 Unit Usaha Landing Page ke pengaturan awal?')) {
      if (setCoreProducts) {
        setCoreProducts(DEFAULT_CORE_PRODUCTS);
        toast.success('Katalog Landing Page dikembalikan ke standar awal.');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Master Data Terpadu</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data katalog produk landing page, bagan akun akuntansi, rekanan bisnis, dan tarif layanan
          </p>
        </div>

        {/* Current User Role Badge */}
        {user && (
          <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1.5 rounded-xl text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-slate-600 dark:text-slate-300">Akses Pengurus:</span>
            <span className="font-bold text-emerald-800 dark:text-emerald-300">{user.name} ({user.role})</span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto text-xs">
        {[
          { id: 'landing_showcase', label: '🌟 3 Unit Usaha Landing Page' },
          { id: 'products', label: 'Daftar Produk Akuntansi' },
          { id: 'customers', label: 'Pelanggan' },
          { id: 'suppliers', label: 'Pemasok / Supplier' },
          { id: 'accounts', label: 'Bagan Akun (COA)' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
              tab === t.id 
                ? 'bg-[#0a3a2a] text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: 3 UNIT USAHA UTAMA LANDING PAGE (SHOWCASE EDITOR) */}
      {tab === 'landing_showcase' && (
        <div className="space-y-6">
          
          {/* Info Banner for Admins */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-850 p-4 rounded-2xl border border-emerald-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-black uppercase tracking-wide text-slate-800 dark:text-slate-200">
                  Pengaturan Konten &amp; Tarif 3 Unit Usaha Landing Page
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl">
                Bagian ini dapat dikelola oleh akun <strong>Administrator (admin_bumma)</strong>, <strong>Manajer BUMKam</strong>, maupun <strong>Sales</strong>. Perubahan nama, harga sewa, foto, dan fasilitas di sini langsung tersinkronisasi secara langsung (*real-time*) ke tampilan publik.
              </p>
            </div>

            <button
              onClick={handleResetToDefault}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 font-bold text-[11px] flex items-center gap-1.5 transition shrink-0"
              title="Kembalikan semua teks & foto ke bawaan asli"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset ke Default</span>
            </button>
          </div>

          {/* 3 Cards Display */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {displayCoreProducts.map((prod, idx) => (
              <div
                key={prod.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-emerald-500 transition duration-300"
              >
                <div>
                  {/* Image Preview Banner */}
                  <div className="h-44 relative bg-slate-900 overflow-hidden">
                    <img
                      src={prod.images && prod.images[0] ? prod.images[0].url : ''}
                      alt={prod.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#0a3a2a]/90 text-white border border-white/20">
                        Unit Usaha #{idx + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur">
                        📸 {prod.images ? prod.images.length : 0} Foto Galeri
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white text-emerald-900 shadow">
                        {prod.badge}
                      </span>
                    </div>
                  </div>

                  {/* Card Content Details */}
                  <div className="p-5 space-y-3">
                    <div>
                      <p className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                        {prod.category}
                      </p>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight mt-0.5">
                        {prod.title}
                      </h4>
                    </div>

                    <div className="inline-flex items-baseline gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                      <span className="text-sm font-black text-emerald-800 dark:text-emerald-300">{prod.price}</span>
                      <span className="text-[11px] text-slate-500">/ {prod.unit}</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {prod.description}
                    </p>

                    {/* Features List */}
                    <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                      <p className="font-bold text-slate-700 dark:text-slate-300">Keunggulan &amp; Fasilitas:</p>
                      {prod.features && prod.features.slice(0, 3).map((f, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-1.5 text-slate-600 dark:text-slate-400">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                      {prod.features && prod.features.length > 3 && (
                        <p className="text-[10px] text-slate-400 italic">+ {prod.features.length - 3} fasilitas lainnya</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() => handleStartEdit(prod)}
                    className="w-full py-2.5 rounded-xl bg-[#0a3a2a] hover:bg-[#06291d] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Edit Konten &amp; Tarif Layanan</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* EDIT MODAL */}
          {editingProduct && productForm && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
                
                {/* Modal Header */}
                <div className="p-5 bg-gradient-to-r from-[#0a3a2a] to-emerald-800 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Edit2 className="w-5 h-5 text-emerald-300" />
                    <div>
                      <h3 className="text-sm font-black">Edit Komoditas / Layanan Landing Page</h3>
                      <p className="text-[11px] text-emerald-200/90">{productForm.title}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setEditingProduct(null); setProductForm(null); }}
                    className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Form Content */}
                <form onSubmit={handleSaveEdit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
                  
                  {/* 1. Title & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nama Komoditas / Layanan
                      </label>
                      <input
                        type="text"
                        value={productForm.title}
                        onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Sub-Kategori / Unit Usaha
                      </label>
                      <input
                        type="text"
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  {/* 2. Price, Unit, Badge */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Tarif / Harga Tampilan
                      </label>
                      <input
                        type="text"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        placeholder="Contoh: Rp 70.000"
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black text-emerald-700 dark:text-emerald-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Satuan Tarif
                      </label>
                      <input
                        type="text"
                        value={productForm.unit}
                        onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                        placeholder="Contoh: Per Rak (30 Butir)"
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Badge Status Promosi
                      </label>
                      <input
                        type="text"
                        value={productForm.badge}
                        onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                        placeholder="Contoh: Panen Segar Harian"
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                        required
                      />
                    </div>
                  </div>

                  {/* 3. Floating Badge & WhatsApp Message */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Badge Mengambang di Foto
                      </label>
                      <input
                        type="text"
                        value={productForm.floatingBadge || ''}
                        onChange={(e) => setProductForm({ ...productForm, floatingBadge: e.target.value })}
                        placeholder="Contoh: 🥚 60+ Rak Telur Baru Dipanen Pagi Ini"
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Pesan Otomatis WhatsApp
                      </label>
                      <input
                        type="text"
                        value={productForm.whatsappMsg || ''}
                        onChange={(e) => setProductForm({ ...productForm, whatsappMsg: e.target.value })}
                        placeholder="Contoh: Halo BUMKam Mekar Sari, saya ingin pemesanan Telur"
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* 4. Description */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Deskripsi Lengkap Produk / Layanan
                    </label>
                    <textarea
                      rows={3}
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed"
                      required
                    />
                  </div>

                  {/* 5. Features List (4 items) */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                      Poin Keunggulan &amp; Fasilitas (Maksimal 4 Poin):
                    </label>
                    {[0, 1, 2, 3].map((fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {fIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={(productForm.features && productForm.features[fIdx]) || ''}
                          onChange={(e) => {
                            const updated = [...(productForm.features || [])];
                            updated[fIdx] = e.target.value;
                            setProductForm({ ...productForm, features: updated });
                          }}
                          placeholder={`Fasilitas/keunggulan poin ${fIdx + 1}`}
                          className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    ))}
                  </div>

                  {/* 6. Photo Gallery (3 Photos) */}
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                      Galeri Foto Produk (3 Sudut Pandang):
                    </label>
                    {[0, 1, 2].map((imgIdx) => (
                      <div key={imgIdx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          <span>Foto #{imgIdx + 1} {imgIdx === 0 ? '(Foto Utama Sampul)' : ''}</span>
                          {productForm.images && productForm.images[imgIdx]?.url && (
                            <a
                              href={productForm.images[imgIdx].url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 hover:underline flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" /> Cek URL
                            </a>
                          )}
                        </div>
                        <input
                          type="url"
                          value={(productForm.images && productForm.images[imgIdx]?.url) || ''}
                          onChange={(e) => {
                            const updatedImgs = [...(productForm.images || [])];
                            if (!updatedImgs[imgIdx]) updatedImgs[imgIdx] = { url: '', caption: '' };
                            updatedImgs[imgIdx].url = e.target.value;
                            setProductForm({ ...productForm, images: updatedImgs });
                          }}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                          required={imgIdx === 0}
                        />
                        <input
                          type="text"
                          value={(productForm.images && productForm.images[imgIdx]?.caption) || ''}
                          onChange={(e) => {
                            const updatedImgs = [...(productForm.images || [])];
                            if (!updatedImgs[imgIdx]) updatedImgs[imgIdx] = { url: '', caption: '' };
                            updatedImgs[imgIdx].caption = e.target.value;
                            setProductForm({ ...productForm, images: updatedImgs });
                          }}
                          placeholder="Keterangan foto (caption)"
                          className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-[11px]"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => { setEditingProduct(null); setProductForm(null); }}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#0a3a2a] hover:bg-[#06291d] text-white font-bold flex items-center gap-2 shadow-lg transition"
                    >
                      <Save className="w-4 h-4 text-emerald-300" />
                      <span>Simpan Perubahan ke Landing Page</span>
                    </button>
                  </div>

                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: DAFTAR PRODUK AKUNTANSI */}
      {tab === 'products' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-[11px]">
              <tr>
                <th className="p-3.5">Kode</th>
                <th className="p-3.5">Nama Produk/Layanan</th>
                <th className="p-3.5">Unit Usaha</th>
                <th className="p-3.5">Satuan</th>
                <th className="p-3.5 text-right">Harga Beli</th>
                <th className="p-3.5 text-right">Harga Jual</th>
                <th className="p-3.5 text-center">Stok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3.5 font-mono font-semibold">{p.code}</td>
                  <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{p.name}</td>
                  <td className="p-3.5 capitalize">{p.unit_usaha}</td>
                  <td className="p-3.5">{p.unit}</td>
                  <td className="p-3.5 text-right">{formatIDR(p.buy_price)}</td>
                  <td className="p-3.5 text-right font-bold text-emerald-700 dark:text-emerald-400">{formatIDR(p.sell_price)}</td>
                  <td className="p-3.5 text-center font-semibold">{p.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: PELANGGAN */}
      {tab === 'customers' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-[11px]">
              <tr>
                <th className="p-3.5">Nama Pelanggan</th>
                <th className="p-3.5">Telepon</th>
                <th className="p-3.5">Alamat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{c.name}</td>
                  <td className="p-3.5">{c.phone}</td>
                  <td className="p-3.5">{c.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: PEMASOK */}
      {tab === 'suppliers' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-[11px]">
              <tr>
                <th className="p-3.5">Nama Pemasok</th>
                <th className="p-3.5">Kontak</th>
                <th className="p-3.5">Rekening Bank</th>
                <th className="p-3.5">Alamat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {suppliers.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{s.name}</td>
                  <td className="p-3.5">{s.contact}</td>
                  <td className="p-3.5 font-mono">{s.bank}</td>
                  <td className="p-3.5">{s.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: COA */}
      {tab === 'accounts' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-[11px]">
              <tr>
                <th className="p-3.5">Kode</th>
                <th className="p-3.5">Nama Perkiraan (COA)</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5 text-center">Saldo Normal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {accounts.map(a => (
                <tr key={a.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3.5 font-mono font-bold text-slate-800 dark:text-slate-200">{a.code}</td>
                  <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">{a.name}</td>
                  <td className="p-3.5">{a.category}</td>
                  <td className="p-3.5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      a.normal === 'Debit' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {a.normal}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
