import React from 'react';
import {
  Wallet,
  Receipt,
  BarChart3,
  Boxes,
  FileText,
  Users,
  ShoppingCart,
  ClipboardList,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight
} from 'lucide-react';
import { formatIDR } from './Transaksi';

export default function DashboardView({ stats, transactions, user, profile, onNavigate }) {
  const userName = user?.name || 'Pengurus BUMKam';
  const profileName = profile?.name || 'BUMKam Mekar Sari';
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Title */}
      <div>
        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-1">
          RINGKASAN KEUANGAN &bull; ARVEA SAK EMKM
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          Selamat datang, {userName} <span className="text-2xl">👋</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Berikut ringkasan aktivitas keuangan dan operasional {profileName} Kampung Sabron Sari.
        </p>
      </div>

      {/* 6 KPI Cards in a row (Matching Screenshot) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* 1. Saldo Kas */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mb-3">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Saldo Kas</span>
            <p className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
              {formatIDR(stats.netCash)}
            </p>
          </div>
        </div>

        {/* 2. Penjualan */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mb-3">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Penjualan</span>
            <p className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
              {formatIDR(stats.salesTotal)}
            </p>
          </div>
        </div>

        {/* 3. Laba / Rugi */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mb-3">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Laba / Rugi</span>
            <p className={`text-base font-extrabold tracking-tight mt-0.5 ${stats.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatIDR(stats.profit)}
            </p>
          </div>
        </div>

        {/* 4. Nilai Persediaan */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center mb-3">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Nilai Persediaan</span>
            <p className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
              {formatIDR(stats.inventoryVal)}
            </p>
          </div>
        </div>

        {/* 5. Piutang Usaha */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center mb-3">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Piutang Usaha</span>
            <p className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
              {formatIDR(stats.receivables)}
            </p>
          </div>
        </div>

        {/* 6. Karyawan Aktif */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-950/50 text-pink-600 flex items-center justify-center mb-3">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Karyawan Aktif</span>
            <p className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
              {stats.employeeCount}
            </p>
          </div>
        </div>
      </div>

      {/* Chart & Recent Activity (Matching Screenshot) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pendapatan vs Beban Chart (2/3 width) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pendapatan vs Beban</h3>
                <p className="text-xs text-slate-400">Performa keuangan bulanan</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Pendapatan
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Beban
                </span>
              </div>
            </div>

            {/* Visual Monthly Bars */}
            <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-100 dark:border-slate-800">
              {[
                { m: 'Jan', rev: 15, exp: 12 },
                { m: 'Feb', rev: 25, exp: 18 },
                { m: 'Mar', rev: 35, exp: 20 },
                { m: 'Apr', rev: 28, exp: 15 },
                { m: 'Mei', rev: 45, exp: 22 },
                { m: 'Jun', rev: 55, exp: 30 }
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center gap-1.5 h-32">
                    <div
                      className="w-3.5 bg-emerald-500 rounded-t-sm transition-all duration-500 hover:opacity-80"
                      style={{ height: `${item.rev}%` }}
                      title={`Pendapatan: ${item.rev}%`}
                    />
                    <div
                      className="w-3.5 bg-blue-500 rounded-t-sm transition-all duration-500 hover:opacity-80"
                      style={{ height: `${item.exp}%` }}
                      title={`Beban: ${item.exp}%`}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">{item.m}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Transaksi Terbaru (1/3 width) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Transaksi Terbaru</h3>
                <p className="text-xs text-slate-400">Aktivitas terakhir dalam sistem</p>
              </div>
              <button
                onClick={() => onNavigate('transaksi')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
              >
                Lihat semua &gt;
              </button>
            </div>

            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Belum ada transaksi. Tambah transaksi penjualan atau kas untuk melihat mutasi di sini.
                </div>
              ) : (
                transactions.slice(0, 4).map(tx => {
                  const isIncome = tx.type === 'penjualan' || tx.type === 'kas_masuk';
                  return (
                    <div key={tx.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {isIncome ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                            {tx.product_name || tx.description}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">{tx.number}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-extrabold ${isIncome ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600'}`}>
                        {formatIDR(tx.total)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Quick Action Cards (Matching Screenshot) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div
          onClick={() => onNavigate('transaksi')}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/20 transition group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Buat Penjualan</p>
              <p className="text-[11px] text-slate-400">Catat invoice baru</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition" />
        </div>

        <div
          onClick={() => onNavigate('transaksi')}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex items-center justify-between cursor-pointer hover:border-blue-500 hover:bg-blue-50/20 transition group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Catat Pembelian</p>
              <p className="text-[11px] text-slate-400">Tambah stok barang</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition" />
        </div>

        <div
          onClick={() => onNavigate('penggajian')}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/20 transition group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Proses Penggajian</p>
              <p className="text-[11px] text-slate-400">Kelola payroll</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition" />
        </div>
      </div>
    </div>
  );
}
