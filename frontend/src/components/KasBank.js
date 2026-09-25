import React, { useState } from 'react';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, Printer, X, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { formatIDR } from './Transaksi';
import { exportToExcel } from '../utils/exportUtils';

export default function KasBank({ transactions, setTransactions, accounts }) {
  const [showModal, setShowModal] = useState(false);
  const [direction, setDirection] = useState('in');
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    amount: '',
    account_code: '3001',
    description: ''
  });

  const cashTransactions = transactions.filter(t => t.type === 'kas_masuk' || t.type === 'kas_keluar' || t.payment_method === 'Tunai');

  const totalIn = cashTransactions.filter(t => t.type === 'kas_masuk' || (t.type === 'penjualan' && t.payment_method === 'Tunai')).reduce((s, x) => s + Number(x.total || 0), 0);
  const totalOut = cashTransactions.filter(t => t.type === 'kas_keluar' || (t.type === 'pembelian' && t.payment_method === 'Tunai')).reduce((s, x) => s + Number(x.total || 0), 0);
  const balance = totalIn - totalOut;

  const handleExportExcel = () => {
    const data = cashTransactions.map((tx, idx) => ({
      No: idx + 1,
      Tanggal: tx.date,
      'No. Bukti': tx.number,
      Keterangan: tx.product_name || tx.description,
      'Tipe Mutasi': tx.type === 'kas_masuk' || (tx.type === 'penjualan' && tx.payment_method === 'Tunai') ? 'Penerimaan (Masuk)' : 'Pengeluaran (Keluar)',
      'Total (IDR)': tx.total,
      'Metode Bayar': tx.payment_method || 'Tunai',
      'Akun Kontra': `${tx.contra_account || '-'} - ${tx.contra_name || '-'}`
    }));
    exportToExcel(data, 'Buku_Kas_dan_Bank_BUMKam', 'Buku Kas');
    toast.success('File Excel Buku Kas & Bank berhasil diunduh!');
  };

  const handleSave = (e) => {
    e.preventDefault();
    const amt = Number(form.amount || 0);
    if (amt <= 0) {
      toast.error('Nominal harus lebih besar dari 0');
      return;
    }

    const type = direction === 'in' ? 'kas_masuk' : 'kas_keluar';
    const acc = accounts.find(a => a.code === form.account_code);
    const newTx = {
      id: 'csh_' + Date.now(),
      number: `CSH-${new Date().getFullYear()}-${String(transactions.length + 1).padStart(4, '0')}`,
      type: type,
      date: form.date,
      unit_usaha: 'perdagangan',
      contact_name: 'Kas Operasional',
      product_name: form.description || (direction === 'in' ? 'Penerimaan Kas' : 'Pengeluaran Kas'),
      quantity: 1,
      price: amt,
      total: amt,
      payment_method: 'Tunai',
      contra_account: form.account_code,
      contra_name: acc ? acc.name : (direction === 'in' ? 'Modal BUMMA' : 'Beban Operasional'),
      description: form.description || (direction === 'in' ? 'Penerimaan Kas' : 'Pengeluaran Kas'),
      created_at: new Date().toISOString()
    };

    setTransactions([newTx, ...transactions]);
    setShowModal(false);
    setForm({ date: new Date().toISOString().slice(0, 10), amount: '', account_code: '3001', description: '' });
    toast.success('Mutasi kas berhasil disimpan & dicatat di jurnal!');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold mb-0.5">KAS &amp; BANK</p>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Buku Kas &amp; Bank</h1>
          <p className="text-xs text-slate-500 mt-0.5">Pencatatan mutasi kas masuk, pengeluaran operasional, dan saldo kas riil SAK EMKM</p>
        </div>
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
            className="px-3.5 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-slate-500" /> Cetak Buku Kas
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-[#0a3a2a] hover:bg-[#06291d] text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> + Catat Mutasi Kas
          </button>
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Penerimaan (Masuk)</span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-2">{formatIDR(totalIn)}</p>
          <span className="text-[11px] text-slate-400">Penjualan tunai &amp; setoran</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pengeluaran (Keluar)</span>
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-700 dark:text-rose-400 mt-2">{formatIDR(totalOut)}</p>
          <span className="text-[11px] text-slate-400">Pembelian tunai &amp; beban usaha</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saldo Kas Akhir</span>
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-extrabold mt-2 ${balance >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-rose-600'}`}>
            {formatIDR(balance)}
          </p>
          <span className="text-[11px] text-slate-400">Kas tersedia di bendahara</span>
        </div>
      </div>

      {/* Table Mutasi Kas */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-[11px] border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-3.5">Tanggal</th>
              <th className="p-3.5">No. Bukti</th>
              <th className="p-3.5">Arah Mutasi</th>
              <th className="p-3.5">Keterangan</th>
              <th className="p-3.5 text-right">Masuk (Debit)</th>
              <th className="p-3.5 text-right">Keluar (Kredit)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {cashTransactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">
                  Belum ada mutasi kas tercatat.
                </td>
              </tr>
            ) : (
              cashTransactions.map(tx => {
                const isIn = tx.type === 'kas_masuk' || (tx.type === 'penjualan' && tx.payment_method === 'Tunai');
                return (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-3.5 font-medium">{tx.date}</td>
                    <td className="p-3.5 font-bold text-emerald-700 dark:text-emerald-400">{tx.number}</td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isIn ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isIn ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        {isIn ? 'Kas Masuk' : 'Kas Keluar'}
                      </span>
                    </td>
                    <td className="p-3.5 max-w-sm truncate">{tx.description || tx.product_name}</td>
                    <td className="p-3.5 text-right font-semibold text-emerald-700 dark:text-emerald-400">
                      {isIn ? formatIDR(tx.total) : '-'}
                    </td>
                    <td className="p-3.5 text-right font-semibold text-rose-700 dark:text-rose-400">
                      {!isIn ? formatIDR(tx.total) : '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Input Kas */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Catat Mutasi Kas / Bank</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Arah Kas</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setDirection('in'); setForm({ ...form, account_code: '3001' }); }}
                    className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                      direction === 'in' ? 'bg-emerald-700 text-white shadow' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4" /> Kas Masuk (Penerimaan)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDirection('out'); setForm({ ...form, account_code: '5102' }); }}
                    className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                      direction === 'out' ? 'bg-rose-700 text-white shadow' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" /> Kas Keluar (Beban)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nominal (IDR)</label>
                <input
                  type="number"
                  min="1"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="Contoh: 500000"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-right"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Perkiraan Akun Pasangan</label>
                <select
                  value={form.account_code}
                  onChange={(e) => setForm({ ...form, account_code: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  {direction === 'in' ? (
                    <>
                      <option value="3001">3001 - Modal BUMMA / Setoran</option>
                      <option value="4101">4101 - Pendapatan Lain-lain</option>
                      <option value="1101">1101 - Pelunasan Piutang Usaha</option>
                    </>
                  ) : (
                    <>
                      <option value="5102">5102 - Beban Listrik &amp; Air</option>
                      <option value="5103">5103 - Beban Transportasi &amp; Logistik</option>
                      <option value="5104">5104 - Beban Pemeliharaan &amp; Operasional</option>
                      <option value="5101">5101 - Beban Gaji Karyawan</option>
                      <option value="5199">5199 - Beban Operasional Lainnya</option>
                      <option value="2001">2001 - Pembayaran Utang Usaha</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Keterangan Transaksi</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Contoh: Pembayaran listrik kantor BUMMA"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  required
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
                  Simpan Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
