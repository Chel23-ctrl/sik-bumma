import React, { useState } from 'react';
import { Printer, FileSpreadsheet } from 'lucide-react';
import { formatIDR } from './Transaksi';
import { exportToExcel } from '../utils/exportUtils';
import { toast } from 'sonner';

export default function BukuBesar({ journals, accounts }) {
  const [selectedAcc, setSelectedAcc] = useState('1001');

  const accInfo = accounts.find(a => a.code === selectedAcc) || accounts[0];
  const accRows = journals.filter(j => j.account_code === selectedAcc);

  let runBal = 0;
  const rowsWithBal = accRows.map(r => {
    if (accInfo?.normal === 'Debit') {
      runBal += (r.debit - r.credit);
    } else {
      runBal += (r.credit - r.debit);
    }
    return { ...r, currentBal: runBal };
  });

  const handleExportExcel = () => {
    const data = rowsWithBal.map((r, idx) => ({
      No: idx + 1,
      Tanggal: r.date,
      'No. Bukti': r.tx_number,
      Keterangan: r.description,
      'Debit (IDR)': r.debit,
      'Kredit (IDR)': r.credit,
      'Saldo Akhir (IDR)': r.currentBal
    }));
    exportToExcel(data, `Buku_Besar_Akun_${accInfo?.code}_${accInfo?.name}`, `Akun ${accInfo?.code}`);
    toast.success(`File Excel Buku Besar [${accInfo?.code}] berhasil diunduh!`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Buku Besar Akun (General Ledger)</h1>
          <p className="text-xs text-slate-500 mt-0.5">Rincian mutasi debit dan kredit tiap perkiraan rekening akuntansi SAK EMKM</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Pilih Akun:</label>
            <select
              value={selectedAcc}
              onChange={(e) => setSelectedAcc(e.target.value)}
              className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              {accounts.map(a => (
                <option key={a.code} value={a.code}>
                  {a.code} - {a.name} ({a.category})
                </option>
              ))}
            </select>
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
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            {accInfo?.category} &bull; Saldo Normal {accInfo?.normal}
          </span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            [{accInfo?.code}] {accInfo?.name}
          </h2>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 font-medium">Saldo Akhir Akun:</span>
          <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">{formatIDR(runBal)}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-[11px] border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-3.5">Tanggal</th>
              <th className="p-3.5">No. Bukti</th>
              <th className="p-3.5">Keterangan</th>
              <th className="p-3.5 text-right">Debit (IDR)</th>
              <th className="p-3.5 text-right">Kredit (IDR)</th>
              <th className="p-3.5 text-right">Saldo (IDR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rowsWithBal.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">
                  Tidak ada transaksi pada akun ini.
                </td>
              </tr>
            ) : (
              rowsWithBal.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-3.5 font-medium">{r.date}</td>
                  <td className="p-3.5 font-bold text-emerald-700 dark:text-emerald-400">{r.tx_number}</td>
                  <td className="p-3.5">{r.description}</td>
                  <td className="p-3.5 text-right">{r.debit > 0 ? formatIDR(r.debit) : '-'}</td>
                  <td className="p-3.5 text-right">{r.credit > 0 ? formatIDR(r.credit) : '-'}</td>
                  <td className="p-3.5 text-right font-bold text-slate-900 dark:text-white">{formatIDR(r.currentBal)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
