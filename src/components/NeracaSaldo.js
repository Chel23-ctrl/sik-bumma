import React, { useMemo } from 'react';
import { formatIDR } from './Transaksi';

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

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Neraca Saldo</h1>
        <p className="text-xs text-slate-500 mt-0.5">Daftar saldo penutup setiap perkiraan buku besar sebelum penyesuaian</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-[11px] border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-3.5">Kode</th>
              <th className="p-3.5">Nama Akun</th>
              <th className="p-3.5">Kategori</th>
              <th className="p-3.5 text-right">Debit (IDR)</th>
              <th className="p-3.5 text-right">Kredit (IDR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {accountBalances.map(a => (
              <tr key={a.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-3.5 font-mono font-semibold">{a.code}</td>
                <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{a.name}</td>
                <td className="p-3.5 text-slate-400">{a.category}</td>
                <td className="p-3.5 text-right font-medium">{a.debitBal > 0 ? formatIDR(a.debitBal) : '-'}</td>
                <td className="p-3.5 text-right font-medium">{a.creditBal > 0 ? formatIDR(a.creditBal) : '-'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 dark:bg-slate-800 font-extrabold text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
            <tr>
              <td colSpan="3" className="p-3.5 text-right uppercase">Total Neraca Saldo :</td>
              <td className="p-3.5 text-right text-emerald-700 dark:text-emerald-400">{formatIDR(totalDeb)}</td>
              <td className="p-3.5 text-right text-emerald-700 dark:text-emerald-400">{formatIDR(totalCred)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
