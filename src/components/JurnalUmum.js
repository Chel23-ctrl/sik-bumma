import React from 'react';
import { Printer, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { formatIDR } from './Transaksi';
import { exportToExcel } from '../utils/exportUtils';
import { toast } from 'sonner';

export default function JurnalUmum({ journals, selectedUnit, selectedYear }) {
  const totalDebit = journals.reduce((s, j) => s + Number(j.debit || 0), 0);
  const totalCredit = journals.reduce((s, j) => s + Number(j.credit || 0), 0);
  const isBalanced = totalDebit === totalCredit;

  const handleExportExcel = () => {
    const data = journals.map((j, idx) => ({
      No: idx + 1,
      Tanggal: j.date,
      'No. Bukti': j.tx_number,
      Keterangan: j.description,
      'Kode Akun': j.account_code,
      'Nama Akun': j.account_name,
      'Debit (IDR)': j.debit,
      'Kredit (IDR)': j.credit,
      'Saldo Berjalan (IDR)': j.balance
    }));
    exportToExcel(data, `Jurnal_Umum_BUMKam_${selectedYear || '2026'}`, 'Jurnal Umum');
    toast.success('File Excel Jurnal Umum berhasil diunduh!');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Jurnal Umum (Double-Entry)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan berpasangan debit-kredit otomatis SAK EMKM dilengkapi kolom <strong>Saldo Berjalan</strong>
          </p>
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
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-slate-500" /> Cetak Jurnal
          </button>
        </div>
      </div>

      {/* Status Balance Indicator */}
      <div className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
        isBalanced
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-200'
          : 'bg-rose-50 border-rose-300 text-rose-800'
      }`}>
        <div className="flex items-center gap-2 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Status Jurnal: {isBalanced ? 'SEIMBANG (Balanced Double-Entry)' : 'TIDAK SEIMBANG'}</span>
        </div>
        <div className="flex gap-4 font-semibold">
          <span>Total Debit: {formatIDR(totalDebit)}</span>
          <span>Total Kredit: {formatIDR(totalCredit)}</span>
        </div>
      </div>

      {/* Table Jurnal dengan Kolom SALDO */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm print:overflow-visible print:border-none print:shadow-none">
        {/* Printable Official Kop Surat Header */}
        <div className="hidden print:block mb-4 pb-3 border-b-2 border-slate-900 text-center kop-surat">
          <h2 className="text-base font-black uppercase text-slate-900 tracking-wide">ARVEA &bull; BUMKAM MEKAR SARI</h2>
          <p className="text-[11px] font-semibold text-slate-700">Financial Management System &bull; Standar SAK EMKM</p>
          <p className="text-[10px] text-slate-500">Kampung Sabron Sari, Distrik Sentani Barat, Kabupaten Jayapura, Papua</p>
          <h3 className="text-xs font-black uppercase mt-2 text-slate-900 underline">JURNAL UMUM (DOUBLE-ENTRY)</h3>
          <p className="text-[10px] text-slate-500">Tahun Buku: {selectedYear} &bull; Unit: {selectedUnit === 'all' ? 'Semua Unit Konsolidasi' : selectedUnit} &bull; Total Debit/Kredit: {formatIDR(totalDebit)} / {formatIDR(totalCredit)} &bull; Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-[11px] border-b border-slate-200 dark:border-slate-700 print:text-[7pt]">
              <tr>
                <th className="p-3.5 print:p-1">Tanggal</th>
                <th className="p-3.5 print:p-1">No. Bukti</th>
                <th className="p-3.5 print:p-1">Keterangan</th>
                <th className="p-3.5 print:p-1">Kode &amp; Nama Akun</th>
                <th className="p-3.5 print:p-1 text-right">Debit (IDR)</th>
                <th className="p-3.5 print:p-1 text-right">Kredit (IDR)</th>
                <th className="p-3.5 print:p-1 text-right bg-emerald-50/50 dark:bg-emerald-950/30">Saldo Berjalan (IDR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {journals.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400 text-xs">
                    Belum ada jurnal umum. Transaksi yang dicatat akan otomatis masuk ke jurnal berpasangan di sini.
                  </td>
                </tr>
              ) : (
                journals.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-3.5 print:p-1 whitespace-nowrap font-medium text-slate-800 dark:text-slate-200 print:text-[7.5pt]">{j.date}</td>
                    <td className="p-3.5 print:p-1 whitespace-nowrap font-bold text-emerald-700 dark:text-emerald-400 print:text-[7.5pt]">{j.tx_number}</td>
                    <td className="p-3.5 print:p-1 max-w-xs print:max-w-none truncate print:overflow-visible print:whitespace-normal text-slate-700 dark:text-slate-300 print:text-[7.5pt]">{j.description}</td>
                    <td className="p-3.5 print:p-1 font-semibold print:text-[7.5pt]">
                      <span className="text-slate-400 mr-1.5 font-mono">[{j.account_code}]</span>
                      <span className={j.credit > 0 ? 'pl-4 text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}>
                        {j.account_name}
                      </span>
                    </td>
                    <td className="p-3.5 print:p-1 whitespace-nowrap text-right font-medium text-slate-800 dark:text-slate-200 print:text-[7.5pt]">
                      {j.debit > 0 ? formatIDR(j.debit) : '-'}
                    </td>
                    <td className="p-3.5 print:p-1 whitespace-nowrap text-right font-medium text-slate-800 dark:text-slate-200 print:text-[7.5pt]">
                      {j.credit > 0 ? formatIDR(j.credit) : '-'}
                    </td>
                    <td className="p-3.5 print:p-1 whitespace-nowrap text-right font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/20 print:text-[7.5pt]">
                      {formatIDR(j.balance)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {journals.length > 0 && (
              <tfoot className="bg-slate-50 dark:bg-slate-800 font-extrabold text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700 print:text-[7pt]">
                <tr>
                  <td colSpan="4" className="p-3.5 print:p-1 text-right uppercase">Total :</td>
                  <td className="p-3.5 print:p-1 text-right text-emerald-700 dark:text-emerald-400">{formatIDR(totalDebit)}</td>
                  <td className="p-3.5 print:p-1 text-right text-emerald-700 dark:text-emerald-400">{formatIDR(totalCredit)}</td>
                  <td className="p-3.5 print:p-1 text-right text-emerald-800 dark:text-emerald-300">{formatIDR(totalDebit - totalCredit)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

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
    </div>
  );
}
