import React from 'react';
import { Printer, CheckCircle2 } from 'lucide-react';
import { formatIDR } from './Transaksi';

export default function JurnalUmum({ journals, selectedUnit, selectedYear }) {
  const totalDebit = journals.reduce((s, j) => s + Number(j.debit || 0), 0);
  const totalCredit = journals.reduce((s, j) => s + Number(j.credit || 0), 0);
  const isBalanced = totalDebit === totalCredit;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Jurnal Umum (Double-Entry)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan berpasangan debit-kredit otomatis dilengkapi kolom <strong>Saldo Berjalan</strong>
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition flex items-center gap-2 self-start print:hidden"
        >
          <Printer className="w-4 h-4" /> Cetak Jurnal
        </button>
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-[11px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">No. Bukti</th>
                <th className="p-3.5">Keterangan</th>
                <th className="p-3.5">Kode &amp; Nama Akun</th>
                <th className="p-3.5 text-right">Debit (IDR)</th>
                <th className="p-3.5 text-right">Kredit (IDR)</th>
                <th className="p-3.5 text-right bg-emerald-50/50 dark:bg-emerald-950/30">Saldo Berjalan (IDR)</th>
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
                    <td className="p-3.5 whitespace-nowrap font-medium text-slate-800 dark:text-slate-200">{j.date}</td>
                    <td className="p-3.5 whitespace-nowrap font-bold text-emerald-700 dark:text-emerald-400">{j.tx_number}</td>
                    <td className="p-3.5 max-w-xs truncate text-slate-700 dark:text-slate-300">{j.description}</td>
                    <td className="p-3.5 whitespace-nowrap font-semibold">
                      <span className="text-slate-400 mr-1.5 font-mono">[{j.account_code}]</span>
                      <span className={j.credit > 0 ? 'pl-4 text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}>
                        {j.account_name}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-right font-medium text-slate-800 dark:text-slate-200">
                      {j.debit > 0 ? formatIDR(j.debit) : '-'}
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-right font-medium text-slate-800 dark:text-slate-200">
                      {j.credit > 0 ? formatIDR(j.credit) : '-'}
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-right font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/20">
                      {formatIDR(j.balance)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {journals.length > 0 && (
              <tfoot className="bg-slate-50 dark:bg-slate-800 font-extrabold text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
                <tr>
                  <td colSpan="4" className="p-3.5 text-right uppercase">Total :</td>
                  <td className="p-3.5 text-right text-emerald-700 dark:text-emerald-400">{formatIDR(totalDebit)}</td>
                  <td className="p-3.5 text-right text-emerald-700 dark:text-emerald-400">{formatIDR(totalCredit)}</td>
                  <td className="p-3.5 text-right text-emerald-800 dark:text-emerald-300">{formatIDR(totalDebit - totalCredit)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
