import React, { useState } from 'react';
import { Printer, Download, Filter, Search } from 'lucide-react';
import { formatIDR } from './Transaksi';
import { exportToExcel, triggerPrint } from '../utils/exportUtils';

export default function LaporanOperasional({ transactions, products }) {
  const [tab, setTab] = useState('penjualan');
  const [search, setSearch] = useState('');

  const salesRows = transactions.filter(t => t.type === 'penjualan');
  const purchaseRows = transactions.filter(t => t.type === 'pembelian');
  const cashRows = transactions.filter(t => t.type === 'kas_masuk' || t.type === 'kas_keluar');

  const handleExportExcel = () => {
    if (tab === 'penjualan') {
      const data = salesRows.map(s => ({
        'Tanggal': s.date,
        'No. Faktur': s.number,
        'Pelanggan': s.contact_name,
        'Komoditas / Layanan': s.product_name,
        'Volume': s.quantity,
        'Harga Satuan (IDR)': s.price,
        'Total (IDR)': s.total
      }));
      exportToExcel(data, 'Laporan_Operasional_Penjualan_BUMKam', 'Penjualan');
    } else if (tab === 'pembelian') {
      const data = purchaseRows.map(p => ({
        'Tanggal': p.date,
        'No. PO': p.number,
        'Pemasok': p.contact_name,
        'Item Barang': p.product_name,
        'Volume': p.quantity,
        'Harga Beli (IDR)': p.price,
        'Total (IDR)': p.total
      }));
      exportToExcel(data, 'Laporan_Operasional_Pembelian_BUMKam', 'Pembelian');
    } else if (tab === 'kas') {
      const data = cashRows.map(c => ({
        'Tanggal': c.date,
        'No. Bukti': c.number,
        'Kategori': c.type,
        'Keterangan': c.description,
        'Nominal (IDR)': c.total
      }));
      exportToExcel(data, 'Laporan_Mutasi_Kas_BUMKam', 'Mutasi Kas');
    } else if (tab === 'persediaan') {
      const data = products.map(p => ({
        'Kode': p.code,
        'Komoditas': p.name,
        'Unit Usaha': p.unit_usaha,
        'Perlakuan': p.perlakuan || 'Persediaan',
        'Sisa Stok': p.stock,
        'Satuan': p.unit,
        'Harga Pokok (HPP)': p.buy_price,
        'Nilai Stok (IDR)': (p.stock || 0) * (p.buy_price || 0)
      }));
      exportToExcel(data, 'Laporan_Status_Persediaan_BUMKam', 'Persediaan');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold mb-0.5">LAPORAN</p>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Laporan Operasional BUMKam</h1>
          <p className="text-xs text-slate-500 mt-0.5">Rekapitulasi berkala penjualan, pengadaan logistik, arus kas harian, dan mutasi persediaan</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4" /> Ekspor Excel (.xlsx)
          </button>
          <button
            onClick={() => triggerPrint()}
            className="px-3.5 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Cetak Rekapitulasi
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto text-xs">
        {[
          { id: 'penjualan', label: '1. Rekap Penjualan' },
          { id: 'pembelian', label: '2. Rekap Pembelian' },
          { id: 'kas', label: '3. Mutasi Kas' },
          { id: 'persediaan', label: '4. Status Persediaan' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-2 rounded-xl font-bold transition whitespace-nowrap ${
              tab === t.id ? 'bg-[#0a3a2a] text-white shadow' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 1. Rekap Penjualan */}
      {tab === 'penjualan' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-[11px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">No. Faktur</th>
                <th className="p-3.5">Pelanggan</th>
                <th className="p-3.5">Komoditas / Layanan</th>
                <th className="p-3.5 text-right">Volume</th>
                <th className="p-3.5 text-right">Harga</th>
                <th className="p-3.5 text-right">Total (IDR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {salesRows.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-8 text-slate-400">Belum ada transaksi penjualan operasional.</td></tr>
              ) : (
                salesRows.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3.5 font-medium">{s.date}</td>
                    <td className="p-3.5 font-bold text-emerald-700 dark:text-emerald-400">{s.number}</td>
                    <td className="p-3.5">{s.contact_name}</td>
                    <td className="p-3.5">{s.product_name}</td>
                    <td className="p-3.5 text-right">{s.quantity}</td>
                    <td className="p-3.5 text-right">{formatIDR(s.price)}</td>
                    <td className="p-3.5 text-right font-bold text-slate-900 dark:text-white">{formatIDR(s.total)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. Rekap Pembelian */}
      {tab === 'pembelian' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-[11px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">No. PO</th>
                <th className="p-3.5">Pemasok</th>
                <th className="p-3.5">Item Barang</th>
                <th className="p-3.5 text-right">Volume</th>
                <th className="p-3.5 text-right">Harga Beli</th>
                <th className="p-3.5 text-right">Total (IDR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {purchaseRows.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-8 text-slate-400">Belum ada transaksi pengadaan/pembelian.</td></tr>
              ) : (
                purchaseRows.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3.5 font-medium">{p.date}</td>
                    <td className="p-3.5 font-bold text-amber-700 dark:text-amber-400">{p.number}</td>
                    <td className="p-3.5">{p.contact_name}</td>
                    <td className="p-3.5">{p.product_name}</td>
                    <td className="p-3.5 text-right">{p.quantity}</td>
                    <td className="p-3.5 text-right">{formatIDR(p.price)}</td>
                    <td className="p-3.5 text-right font-bold text-slate-900 dark:text-white">{formatIDR(p.total)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. Mutasi Kas */}
      {tab === 'kas' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-[11px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">No. Bukti</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Keterangan</th>
                <th className="p-3.5 text-right">Nominal (IDR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {cashRows.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-slate-400">Belum ada mutasi kas tercatat.</td></tr>
              ) : (
                cashRows.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3.5 font-medium">{c.date}</td>
                    <td className="p-3.5 font-bold text-blue-700 dark:text-blue-400">{c.number}</td>
                    <td className="p-3.5 capitalize">{c.type.replace('_', ' ')}</td>
                    <td className="p-3.5">{c.description}</td>
                    <td className="p-3.5 text-right font-bold text-slate-900 dark:text-white">{formatIDR(c.total)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. Status Persediaan */}
      {tab === 'persediaan' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-[11px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Kode</th>
                <th className="p-3.5">Komoditas Produk</th>
                <th className="p-3.5">Unit Usaha</th>
                <th className="p-3.5 text-center">Sisa Stok</th>
                <th className="p-3.5 text-right">Harga Pokok (HPP)</th>
                <th className="p-3.5 text-right">Total Nilai Stok (Aset)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {products.map(p => {
                const val = (p.stock || 0) * (p.buy_price || 0);
                return (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3.5 font-mono font-semibold">{p.code}</td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{p.name}</td>
                    <td className="p-3.5 capitalize">{p.unit_usaha}</td>
                    <td className="p-3.5 text-center font-bold text-emerald-700 dark:text-emerald-400">
                      {p.stock} {p.unit}
                    </td>
                    <td className="p-3.5 text-right">{formatIDR(p.buy_price)}</td>
                    <td className="p-3.5 text-right font-extrabold text-slate-900 dark:text-white">{formatIDR(val)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
