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

      {/* Printable Official Kop Surat Header */}
      <div className="hidden print:block mb-4 pb-3 border-b-2 border-slate-900 text-center kop-surat">
        <h2 className="text-base font-black uppercase text-slate-900 tracking-wide">ARVEA &bull; BUMKAM MEKAR SARI</h2>
        <p className="text-[11px] font-semibold text-slate-700">Financial Management System &bull; Standar SAK EMKM</p>
        <p className="text-[10px] text-slate-500">Kampung Sabron Sari, Distrik Sentani Barat, Kabupaten Jayapura, Papua</p>
        <h3 className="text-xs font-black uppercase mt-2 text-slate-900 underline">
          {tab === 'penjualan' && 'REKAPITULASI PENJUALAN OPERASIONAL'}
          {tab === 'pembelian' && 'REKAPITULASI PENGADAAN & PEMBELIAN LOGISTIK'}
          {tab === 'kas' && 'REKAPITULASI MUTASI KAS OPERASIONAL'}
          {tab === 'persediaan' && 'LAPORAN STATUS & VALUASI PERSEDIAAN KOMODITAS'}
        </h3>
        <p className="text-[10px] text-slate-500">Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* 1. Rekap Penjualan */}
      {tab === 'penjualan' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm print:border-none print:shadow-none">
          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-[11px] border-b border-slate-200 dark:border-slate-700 print:text-[7pt]">
                <tr>
                  <th className="p-3.5 print:p-1">Tanggal</th>
                  <th className="p-3.5 print:p-1">No. Faktur</th>
                  <th className="p-3.5 print:p-1">Pelanggan</th>
                  <th className="p-3.5 print:p-1">Komoditas / Layanan</th>
                  <th className="p-3.5 print:p-1 text-right">Volume</th>
                  <th className="p-3.5 print:p-1 text-right">Harga</th>
                  <th className="p-3.5 print:p-1 text-right">Total (IDR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {salesRows.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-8 text-slate-400 print:py-4">Belum ada transaksi penjualan operasional.</td></tr>
                ) : (
                  salesRows.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3.5 print:p-1 font-medium whitespace-nowrap print:text-[7.5pt]">{s.date}</td>
                      <td className="p-3.5 print:p-1 font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap print:text-[7.5pt]">{s.number}</td>
                      <td className="p-3.5 print:p-1 print:text-[7.5pt] print:overflow-visible print:whitespace-normal">{s.contact_name}</td>
                      <td className="p-3.5 print:p-1 print:text-[7.5pt] print:overflow-visible print:whitespace-normal">{s.product_name}</td>
                      <td className="p-3.5 print:p-1 text-right whitespace-nowrap print:text-[7.5pt]">{s.quantity}</td>
                      <td className="p-3.5 print:p-1 text-right whitespace-nowrap print:text-[7.5pt]">{formatIDR(s.price)}</td>
                      <td className="p-3.5 print:p-1 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap print:text-[7.5pt]">{formatIDR(s.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Rekap Pembelian */}
      {tab === 'pembelian' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm print:border-none print:shadow-none">
          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-[11px] border-b border-slate-200 dark:border-slate-700 print:text-[7pt]">
                <tr>
                  <th className="p-3.5 print:p-1">Tanggal</th>
                  <th className="p-3.5 print:p-1">No. PO</th>
                  <th className="p-3.5 print:p-1">Pemasok</th>
                  <th className="p-3.5 print:p-1">Item Barang</th>
                  <th className="p-3.5 print:p-1 text-right">Volume</th>
                  <th className="p-3.5 print:p-1 text-right">Harga Beli</th>
                  <th className="p-3.5 print:p-1 text-right">Total (IDR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {purchaseRows.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-8 text-slate-400 print:py-4">Belum ada transaksi pengadaan/pembelian.</td></tr>
                ) : (
                  purchaseRows.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3.5 print:p-1 font-medium whitespace-nowrap print:text-[7.5pt]">{p.date}</td>
                      <td className="p-3.5 print:p-1 font-bold text-amber-700 dark:text-amber-400 whitespace-nowrap print:text-[7.5pt]">{p.number}</td>
                      <td className="p-3.5 print:p-1 print:text-[7.5pt] print:overflow-visible print:whitespace-normal">{p.contact_name}</td>
                      <td className="p-3.5 print:p-1 print:text-[7.5pt] print:overflow-visible print:whitespace-normal">{p.product_name}</td>
                      <td className="p-3.5 print:p-1 text-right whitespace-nowrap print:text-[7.5pt]">{p.quantity}</td>
                      <td className="p-3.5 print:p-1 text-right whitespace-nowrap print:text-[7.5pt]">{formatIDR(p.price)}</td>
                      <td className="p-3.5 print:p-1 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap print:text-[7.5pt]">{formatIDR(p.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Mutasi Kas */}
      {tab === 'kas' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm print:border-none print:shadow-none">
          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-[11px] border-b border-slate-200 dark:border-slate-700 print:text-[7pt]">
                <tr>
                  <th className="p-3.5 print:p-1">Tanggal</th>
                  <th className="p-3.5 print:p-1">No. Bukti</th>
                  <th className="p-3.5 print:p-1">Kategori</th>
                  <th className="p-3.5 print:p-1">Keterangan</th>
                  <th className="p-3.5 print:p-1 text-right">Nominal (IDR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {cashRows.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-8 text-slate-400 print:py-4">Belum ada mutasi kas tercatat.</td></tr>
                ) : (
                  cashRows.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3.5 print:p-1 font-medium whitespace-nowrap print:text-[7.5pt]">{c.date}</td>
                      <td className="p-3.5 print:p-1 font-bold text-blue-700 dark:text-blue-400 whitespace-nowrap print:text-[7.5pt]">{c.number}</td>
                      <td className="p-3.5 print:p-1 capitalize print:text-[7.5pt]">{c.type.replace('_', ' ')}</td>
                      <td className="p-3.5 print:p-1 print:text-[7.5pt] print:overflow-visible print:whitespace-normal">{c.description}</td>
                      <td className="p-3.5 print:p-1 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap print:text-[7.5pt]">{formatIDR(c.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Status Persediaan */}
      {tab === 'persediaan' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm print:border-none print:shadow-none">
          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-[11px] border-b border-slate-200 dark:border-slate-700 print:text-[7pt]">
                <tr>
                  <th className="p-3.5 print:p-1">Kode</th>
                  <th className="p-3.5 print:p-1">Komoditas Produk</th>
                  <th className="p-3.5 print:p-1">Unit Usaha</th>
                  <th className="p-3.5 print:p-1 text-center">Sisa Stok</th>
                  <th className="p-3.5 print:p-1 text-right">Harga Pokok (HPP)</th>
                  <th className="p-3.5 print:p-1 text-right">Total Nilai Stok (Aset)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.map(p => {
                  const val = (p.stock || 0) * (p.buy_price || 0);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3.5 print:p-1 font-mono font-semibold whitespace-nowrap print:text-[7.5pt]">{p.code}</td>
                      <td className="p-3.5 print:p-1 font-bold text-slate-900 dark:text-white print:text-[7.5pt] print:overflow-visible print:whitespace-normal">{p.name}</td>
                      <td className="p-3.5 print:p-1 capitalize print:text-[7.5pt]">{p.unit_usaha}</td>
                      <td className="p-3.5 print:p-1 text-center font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap print:text-[7.5pt]">
                        {p.stock} {p.unit}
                      </td>
                      <td className="p-3.5 print:p-1 text-right whitespace-nowrap print:text-[7.5pt]">{formatIDR(p.buy_price)}</td>
                      <td className="p-3.5 print:p-1 text-right font-extrabold text-slate-900 dark:text-white whitespace-nowrap print:text-[7.5pt]">{formatIDR(val)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Printable Official Signatures Block */}
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
    </div>
  );
}
