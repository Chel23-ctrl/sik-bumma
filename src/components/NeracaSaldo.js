import React, { useMemo } from 'react';
import { formatIDR } from './Transaksi';
import { Printer, FileSpreadsheet } from 'lucide-react';
import { exportToExcel } from '../utils/exportUtils';
import { toast } from 'sonner';

export default function NeracaSaldo({ journals, accounts }) {
  const accountBalances = useMemo(() => {
    return accounts.map(acc => {
      const related = journals.filter(j => j.account_code === acc.code);
      const totalDeb = related.reduce((s, r) => s + Number(r.debit || 0), 0);
      const totalCred = related.reduce((s, r) => s + Number(r.credit || 0), 0);

      let debitBal = 0;
      let creditBal = 0;

      if (acc.normal === 'Debit') {
        const net = totalDeb - totalCred;
        if (net >= 0) debitBal = net;
        else creditBal = Math.abs(net);
      } else {
        const net = totalCred - totalDeb;
        if (net >= 0) creditBal = net;
        else debitBal = Math.abs(net);
      }

      return {
        ...acc,
        debitBal,
        creditBal
      };
    });
  }, [journals, accounts]);

  const totalDeb = accountBalances.reduce((s, a) => s + a.debitBal, 0);
  const totalCred = accountBalances.reduce((s, a) => s + a.creditBal, 0);

  const handleExportExcel = () => {
    const data = accountBalances.map((a, idx) => ({
      No: idx + 1,
      'Kode Akun': a.code,
      'Nama Akun': a.name,
      Kategori: a.category,
      'Saldo Debit (IDR)': a.debitBal,
      'Saldo Kredit (IDR)': a.creditBal
    }));
    exportToExcel(data, 'Neraca_Saldo_BUMKam', 'Neraca Saldo');
    toast.success('File Excel Neraca Saldo berhasil diunduh!');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Neraca Saldo (Trial Balance)</h1>
          <p className="text-xs text-slate-500 mt-0.5">Daftar saldo penutup setiap perkiraan buku besar sebelum penyesuaian SAK EMKM</p>
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
            className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-500" /> Cetak
          </button>
        </div>
      </div>

      {/* Printable Official Kop Surat Header */}
      <div className="hidden print:block mb-4 pb-3 border-b-2 border-slate-900 text-center kop-surat">
        <h2 className="text-base font-black uppercase text-slate-900 tracking-wide">ARVEA &bull; BUMKAM MEKAR SARI</h2>
        <p className="text-[11px] font-semibold text-slate-700">Financial Management System &bull; Standar SAK EMKM</p>
        <p className="text-[10px] text-slate-500">Kampung Sabron Sari, Distrik Sentani Barat, Kabupaten Jayapura, Papua</p>
        <h3 className="text-xs font-black uppercase mt-2 text-slate-900 underline">NERACA SALDO (TRIAL BALANCE)</h3>
        <p className="text-[10px] text-slate-500">Total Debit / Kredit: {formatIDR(totalDeb)} / {formatIDR(totalCred)} &bull; Status: {totalDeb === totalCred ? 'SEIMBANG (BALANCED)' : 'SELISIH'} &bull; Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm print:border-none print:shadow-none">
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-[11px] border-b border-slate-200 dark:border-slate-700 print:text-[7pt]">
              <tr>
                <th className="p-3.5 print:p-1">Kode</th>
                <th className="p-3.5 print:p-1">Nama Akun</th>
                <th className="p-3.5 print:p-1">Kategori</th>
                <th className="p-3.5 print:p-1 text-right">Debit (IDR)</th>
                <th className="p-3.5 print:p-1 text-right">Kredit (IDR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {accountBalances.map(a => (
                <tr key={a.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3.5 print:p-1 font-mono font-semibold whitespace-nowrap print:text-[7.5pt]">{a.code}</td>
                  <td className="p-3.5 print:p-1 font-bold text-slate-800 dark:text-slate-200 print:text-[7.5pt]">{a.name}</td>
                  <td className="p-3.5 print:p-1 text-slate-400 print:text-[7.5pt]">{a.category}</td>
                  <td className="p-3.5 print:p-1 text-right font-medium whitespace-nowrap print:text-[7.5pt]">{a.debitBal > 0 ? formatIDR(a.debitBal) : '-'}</td>
                  <td className="p-3.5 print:p-1 text-right font-medium whitespace-nowrap print:text-[7.5pt]">{a.creditBal > 0 ? formatIDR(a.creditBal) : '-'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 dark:bg-slate-800 font-extrabold text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700 print:text-[7pt]">
              <tr>
                <td colSpan="3" className="p-3.5 print:p-1 text-right uppercase">Total Neraca Saldo :</td>
                <td className="p-3.5 print:p-1 text-right text-emerald-700 dark:text-emerald-400">{formatIDR(totalDeb)}</td>
                <td className="p-3.5 print:p-1 text-right text-emerald-700 dark:text-emerald-400">{formatIDR(totalCred)}</td>
              </tr>
            </tfoot>
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
