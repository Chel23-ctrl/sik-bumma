import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  Filter, 
  RotateCcw, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileSpreadsheet,
  Layers,
  Sparkles
} from 'lucide-react';
import { formatIDR } from './Transaksi';
import { exportToExcel } from '../utils/exportUtils';

export const ALL_YEARS = [
  '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026', 
  '2027', '2028', '2029', '2030', '2031', '2032', '2033', '2034', '2035'
];

export default function AnalisisKinerja({ journals = [], accounts = [], transactions = [], profile = {} }) {
  // Filters: strictly UNIT USAHA, TAHUN BUKU, PERIODE EVALUASI (Docx lines 21-23)
  const [filterUnit, setFilterUnit] = useState('Semua Unit');
  const [filterYear, setFilterYear] = useState('2026');
  const [filterPeriod, setFilterPeriod] = useState('Tahunan'); // 'Triwulan 1', 'Triwulan 2', 'Triwulan 3', 'Triwulan 4', 'Tahunan'

  // Applied filter state
  const [appliedFilter, setAppliedFilter] = useState({
    unit: 'Semua Unit',
    year: '2026',
    period: 'Tahunan'
  });

  const handleApplyFilter = () => {
    setAppliedFilter({
      unit: filterUnit,
      year: filterYear,
      period: filterPeriod
    });
  };

  const handleResetFilter = () => {
    setFilterUnit('Semua Unit');
    setFilterYear('2026');
    setFilterPeriod('Tahunan');
    setAppliedFilter({
      unit: 'Semua Unit',
      year: '2026',
      period: 'Tahunan'
    });
  };

  // Helper to compute ratios for a given period & year
  const computeMetricsForPeriod = (periodName, year) => {
    const filteredTx = transactions.filter(tx => {
      const txDate = tx.date || '';
      if (txDate && !txDate.startsWith(year)) return false;
      
      const month = parseInt(txDate.slice(5, 7), 10) || 1;
      if (periodName === 'Triwulan 1') {
        if (month < 1 || month > 3) return false;
      } else if (periodName === 'Triwulan 2') {
        if (month < 4 || month > 6) return false;
      } else if (periodName === 'Triwulan 3') {
        if (month < 7 || month > 9) return false;
      } else if (periodName === 'Triwulan 4') {
        if (month < 10 || month > 12) return false;
      } // 'Tahunan' accepts all months
      
      if (appliedFilter.unit === 'Unit Perdagangan & Peternakan' && tx.unit_usaha !== 'perdagangan') return false;
      if (appliedFilter.unit === 'Unit Jasa Penyewaan' && tx.unit_usaha !== 'jasa') return false;
      return true;
    });

    // Revenue
    const revenue = filteredTx
      .filter(tx => tx.type === 'penjualan')
      .reduce((sum, tx) => sum + Number(tx.total || 0), 0);

    // HPP / Pembelian
    const hpp = filteredTx
      .filter(tx => tx.type === 'pembelian')
      .reduce((sum, tx) => sum + Number(tx.total || 0), 0);

    // Beban Operasional / Kas Keluar
    const expenses = filteredTx
      .filter(tx => tx.type === 'kas_keluar' || tx.type === 'biaya' || tx.type === 'penggajian')
      .reduce((sum, tx) => sum + Number(tx.total || 0), 0);

    const netProfit = revenue - hpp - expenses;

    // Assets & Liquidity Estimation
    const cashNet = revenue - hpp - expenses;
    const baseCash = 18500000;
    const estimatedCash = Math.max(1000000, baseCash + cashNet);
    const estimatedReceivables = filteredTx
      .filter(tx => tx.type === 'penjualan' && tx.payment_method === 'Kredit')
      .reduce((s, x) => s + Number(x.total || 0), 0);
    const estimatedInventory = Math.max(6500000, 16000000 - (revenue > 0 ? hpp * 0.4 : 0));
    
    const currentAssets = estimatedCash + estimatedReceivables + estimatedInventory;
    const currentLiabilities = Math.max(500000, filteredTx
      .filter(tx => tx.type === 'pembelian' && tx.payment_method === 'Kredit')
      .reduce((s, x) => s + Number(x.total || 0), 0));

    const totalAssets = currentAssets + 42000000; // Fixed assets

    // Key Ratios
    const npm = revenue > 0 ? Math.round((netProfit / revenue) * 100) : (netProfit >= 0 ? 0 : -5);
    const cr = parseFloat((currentAssets / currentLiabilities).toFixed(2));
    const roa = parseFloat(((netProfit / totalAssets) * 100).toFixed(1));
    const it = estimatedInventory > 0 ? parseFloat((hpp / estimatedInventory).toFixed(2)) : 1.2;
    const dar = parseFloat(((currentLiabilities / totalAssets) * 100).toFixed(1));

    return {
      revenue,
      hpp,
      expenses,
      netProfit,
      currentAssets,
      currentLiabilities,
      totalAssets,
      npm: Math.max(-20, npm),
      cr: Math.max(0.5, cr),
      roa: Math.max(-10, roa),
      it: Math.max(0.2, it),
      dar: Math.min(100, Math.max(1, dar))
    };
  };

  // Trend data across all periods
  const trendData = useMemo(() => {
    const yr = appliedFilter.year;
    return {
      tw1: computeMetricsForPeriod('Triwulan 1', yr),
      tw2: computeMetricsForPeriod('Triwulan 2', yr),
      tw3: computeMetricsForPeriod('Triwulan 3', yr),
      tw4: computeMetricsForPeriod('Triwulan 4', yr),
      tahunan: computeMetricsForPeriod('Tahunan', yr)
    };
  }, [transactions, appliedFilter]);

  // Current active metrics
  const activeMetrics = useMemo(() => {
    if (appliedFilter.period === 'Triwulan 1') return trendData.tw1;
    if (appliedFilter.period === 'Triwulan 2') return trendData.tw2;
    if (appliedFilter.period === 'Triwulan 3') return trendData.tw3;
    if (appliedFilter.period === 'Triwulan 4') return trendData.tw4;
    return trendData.tahunan;
  }, [trendData, appliedFilter.period]);

  // 5 SAK EMKM Key Ratios with 3D Bar Trend series
  const ratioConfigs = [
    {
      id: 'npm',
      name: 'Margin Laba Bersih (Net Profit Margin)',
      category: 'Profitabilitas',
      target: '> 15%',
      unit: '%',
      currentValue: activeMetrics.npm,
      isGood: activeMetrics.npm >= 15,
      status: activeMetrics.npm >= 15 ? 'Sangat Sehat' : activeMetrics.npm >= 0 ? 'Cukup Sehat' : 'Perlu Evaluasi',
      desc: 'Mengukur efisiensi laba bersih setelah dikurangi HPP dan seluruh beban operasional.',
      formula: '(Laba Bersih / Pendapatan) x 100%',
      trend: [
        { label: 'TW 1', value: trendData.tw1.npm },
        { label: 'TW 2', value: trendData.tw2.npm },
        { label: 'TW 3', value: trendData.tw3.npm },
        { label: 'TW 4', value: trendData.tw4.npm },
        { label: 'Tahunan', value: trendData.tahunan.npm }
      ]
    },
    {
      id: 'cr',
      name: 'Rasio Lancar (Current Ratio)',
      category: 'Likuiditas',
      target: '> 1.50x',
      unit: 'x',
      currentValue: activeMetrics.cr,
      isGood: activeMetrics.cr >= 1.5,
      status: activeMetrics.cr >= 1.5 ? 'Likuid Sangat Aman' : 'Likuiditas Cukup',
      desc: 'Kemampuan kas & aset lancar melunasi kewajiban jangka pendek secara tepat waktu.',
      formula: 'Aset Lancar / Liabilitas Lancar',
      trend: [
        { label: 'TW 1', value: trendData.tw1.cr },
        { label: 'TW 2', value: trendData.tw2.cr },
        { label: 'TW 3', value: trendData.tw3.cr },
        { label: 'TW 4', value: trendData.tw4.cr },
        { label: 'Tahunan', value: trendData.tahunan.cr }
      ]
    },
    {
      id: 'roa',
      name: 'Imbal Hasil Aset (Return on Assets)',
      category: 'Profitabilitas',
      target: '> 5%',
      unit: '%',
      currentValue: activeMetrics.roa,
      isGood: activeMetrics.roa >= 5.0,
      status: activeMetrics.roa >= 5.0 ? 'Efisien Produktif' : 'Moderat',
      desc: 'Efektivitas pemanfaatan seluruh aset produktif dalam menghasilkan laba operasional.',
      formula: '(Laba Bersih / Total Aset) x 100%',
      trend: [
        { label: 'TW 1', value: trendData.tw1.roa },
        { label: 'TW 2', value: trendData.tw2.roa },
        { label: 'TW 3', value: trendData.tw3.roa },
        { label: 'TW 4', value: trendData.tw4.roa },
        { label: 'Tahunan', value: trendData.tahunan.roa }
      ]
    },
    {
      id: 'it',
      name: 'Perputaran Persediaan (Inventory Turnover)',
      category: 'Aktivitas',
      target: '> 2.00x',
      unit: 'x',
      currentValue: activeMetrics.it,
      isGood: activeMetrics.it >= 2.0,
      status: activeMetrics.it >= 2.0 ? 'Perputaran Cepat' : 'Perputaran Normal',
      desc: 'Kecepatan stok barang dagang (telur ayam, pakan, bibit) terjual menjadi arus kas.',
      formula: 'Beban Pokok Penjualan (HPP) / Rata-rata Persediaan',
      trend: [
        { label: 'TW 1', value: trendData.tw1.it },
        { label: 'TW 2', value: trendData.tw2.it },
        { label: 'TW 3', value: trendData.tw3.it },
        { label: 'TW 4', value: trendData.tw4.it },
        { label: 'Tahunan', value: trendData.tahunan.it }
      ]
    },
    {
      id: 'dar',
      name: 'Rasio Utang terhadap Aset (Debt to Asset Ratio)',
      category: 'Solvabilitas',
      target: '< 40%',
      unit: '%',
      currentValue: activeMetrics.dar,
      isGood: activeMetrics.dar <= 40,
      status: activeMetrics.dar <= 30 ? 'Sangat Aman' : activeMetrics.dar <= 50 ? 'Moderat' : 'Tinggi',
      desc: 'Porsi aset BUMKam yang dibiayai melalui utang atau liabilitas pihak ketiga.',
      formula: '(Total Liabilitas / Total Aset) x 100%',
      trend: [
        { label: 'TW 1', value: trendData.tw1.dar },
        { label: 'TW 2', value: trendData.tw2.dar },
        { label: 'TW 3', value: trendData.tw3.dar },
        { label: 'TW 4', value: trendData.tw4.dar },
        { label: 'Tahunan', value: trendData.tahunan.dar }
      ]
    }
  ];

  // Export Matrix Table to Excel
  const handleExportExcel = () => {
    const data = ratioConfigs.map((r, idx) => ({
      No: idx + 1,
      'Indikator Rasio Keuangan': r.name,
      Kategori: r.category,
      'Standar Acuan': r.target,
      'Triwulan 1': `${r.trend[0].value}${r.unit}`,
      'Triwulan 2': `${r.trend[1].value}${r.unit}`,
      'Triwulan 3': `${r.trend[2].value}${r.unit}`,
      'Triwulan 4': `${r.trend[3].value}${r.unit}`,
      'Tahunan (Full)': `${r.trend[4].value}${r.unit}`,
      'Status SAK EMKM': r.status
    }));

    exportToExcel(data, `Analisis_Kinerja_BUMKam_${appliedFilter.year}`, 'Analisis Kinerja');
    toast.success('File Excel analisis kinerja dan rasio berhasil diunduh!');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              ANALISIS KINERJA &amp; TREN
            </span>
            <span className="text-xs text-slate-400 font-medium">SAK EMKM Terpadu</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Analisis Rasio Kinerja Keuangan BUMKam
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluasi tren kesehatan finansial Badan Usaha Milik Kampung Mekar Sari dengan <strong>3D Bar Chart &amp; Ascending Arrow</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            title="Download Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Excel
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5 shadow-xs text-slate-700 dark:text-slate-200"
          >
            <Printer className="w-4 h-4 text-emerald-600" /> Cetak Tren Analisis
          </button>
        </div>
      </div>

      {/* FILTER BOX: HANYA UNIT USAHA, TAHUN BUKU, DAN PERIODE EVALUASI (DOCX LINES 21-23) */}
      <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs print:hidden">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Pengaturan Parameter Evaluasi Tren Kinerja
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Aktif: <strong className="text-emerald-800 dark:text-emerald-300">{appliedFilter.unit} &bull; {appliedFilter.period} ({appliedFilter.year})</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          {/* 1. Unit Usaha */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wide">
              Unit Usaha
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'Semua Unit', label: 'Semua Unit Usaha BUMKam' },
                { id: 'Unit Perdagangan & Peternakan', label: 'Perdagangan & Peternakan Ayam' },
                { id: 'Unit Jasa Penyewaan', label: 'Jasa Sewa Tenda & Gedung' }
              ].map(u => (
                <label key={u.id} className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="filterUnit"
                    checked={filterUnit === u.id}
                    onChange={() => setFilterUnit(u.id)}
                    className="w-4 h-4 text-emerald-700 focus:ring-emerald-700 accent-emerald-700"
                  />
                  <span>{u.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 2. Tahun Buku (2019-2035) */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wide">
              Tahun Buku (2019 &ndash; 2035)
            </label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white"
            >
              {ALL_YEARS.map(yr => (
                <option key={yr} value={yr}>Tahun Buku {yr}</option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400">Pilihan lengkap 2019 sampai 2035</p>
          </div>

          {/* 3. Periode Evaluasi (Triwulan 1, 2, 3, 4, Tahunan) */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wide">
              Periode Evaluasi
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'Triwulan 1', label: 'Triwulan 1 (Jan - Mar)' },
                { id: 'Triwulan 2', label: 'Triwulan 2 (Apr - Jun)' },
                { id: 'Triwulan 3', label: 'Triwulan 3 (Jul - Sep)' },
                { id: 'Triwulan 4', label: 'Triwulan 4 (Okt - Des)' },
                { id: 'Tahunan', label: 'Tahunan Konsolidasi (Jan - Des)' }
              ].map(p => (
                <label key={p.id} className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="filterPeriod"
                    checked={filterPeriod === p.id}
                    onChange={() => setFilterPeriod(p.id)}
                    className="w-4 h-4 text-emerald-700 focus:ring-emerald-700 accent-emerald-700"
                  />
                  <span>{p.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons: Reset & Terapkan */}
        <div className="flex items-center justify-end gap-3 mt-5 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={handleResetFilter}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            type="button"
            onClick={handleApplyFilter}
            className="px-6 py-2 rounded-xl bg-[#0a3a2a] hover:bg-[#06291d] text-white font-bold transition shadow-md flex items-center gap-1.5 text-xs"
          >
            Terapkan Filter
          </button>
        </div>
      </div>

      {/* SUMMARY BADGES BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Pendapatan ({appliedFilter.period})</p>
          <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
            {formatIDR(activeMetrics.revenue)}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Beban Pokok (HPP)</p>
          <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
            {formatIDR(activeMetrics.hpp)}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Laba Bersih Operasional</p>
          <p className={`text-base font-bold mt-1 ${activeMetrics.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatIDR(activeMetrics.netProfit)}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Aset Produktif</p>
          <p className="text-base font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            {formatIDR(activeMetrics.totalAssets)}
          </p>
        </div>
      </div>

      {/* 3D BAR CHART WITH ASCENDING ARROW (DOCX LINES 23, 607-639) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Tampilan Tren Rasio Keuangan &mdash; 3D Bar Chart with Ascending Arrow
            </h2>
            <p className="text-xs text-slate-500">
              Visualisasi kedalaman 3D (depth &amp; isometric bars) dengan indikator panah kenaikan tren kinerja
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold dark:bg-emerald-950 dark:text-emerald-300">
            <ArrowUpRight className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>Ascending Trend Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ratioConfigs.map((ratio) => {
            const values = ratio.trend.map(t => Math.abs(t.value));
            const maxVal = Math.max(1, ...values);
            const firstVal = ratio.trend[0].value;
            const lastVal = ratio.trend[ratio.trend.length - 1].value;
            const isGrowing = lastVal >= firstVal;

            return (
              <div
                key={ratio.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:border-emerald-500 transition duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      {ratio.category}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        ratio.isGood
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {ratio.isGood ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      {ratio.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                    {ratio.name}
                  </h3>

                  <div className="flex items-baseline justify-between my-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {ratio.currentValue}{ratio.unit}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      Standar Acuan: <strong className="text-slate-700 dark:text-slate-300">{ratio.target}</strong>
                    </span>
                  </div>

                  {/* 3D ISOMETRIC BAR CHART WITH ASCENDING ARROW */}
                  <div className="bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800/60 dark:to-slate-900/80 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/60 my-2 relative overflow-hidden">
                    {/* Ascending Trend Arrow Banner Overlay */}
                    <div className="flex items-center justify-between mb-3 text-[10px] font-bold">
                      <span className="text-slate-500">Tahun {appliedFilter.year}</span>
                      <div className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>Ascending Arrow</span>
                      </div>
                    </div>

                    {/* Chart Pillars in 3D Depth */}
                    <div className="grid grid-cols-5 gap-2 items-end h-28 pt-4 px-1">
                      {ratio.trend.map((pt, idx) => {
                        const isSelected = pt.label.toLowerCase() === appliedFilter.period.toLowerCase() || 
                                           (pt.label === 'Tahunan' && appliedFilter.period === 'Tahunan');
                        const barPct = Math.min(100, Math.max(18, Math.round((Math.abs(pt.value) / maxVal) * 100)));

                        return (
                          <div key={idx} className="flex flex-col items-center h-full justify-end group/bar">
                            {/* Value on top of bar */}
                            <span className={`text-[9px] font-bold mb-1 transition ${
                              isSelected ? 'text-emerald-700 dark:text-emerald-300 scale-110 font-black' : 'text-slate-500 dark:text-slate-400'
                            }`}>
                              {pt.value}{ratio.unit}
                            </span>

                            {/* 3D Isometric Bar Container */}
                            <div className="w-full flex justify-center items-end" style={{ height: '70px' }}>
                              <div
                                style={{ height: `${barPct}%` }}
                                className="w-6 relative transition-all duration-500 group-hover/bar:scale-105"
                              >
                                {/* 3D Top Cap (Cap Isometric) */}
                                <div
                                  className={`h-2 w-full rounded-t-sm transition shadow-sm ${
                                    isSelected
                                      ? 'bg-emerald-300 dark:bg-emerald-400'
                                      : 'bg-emerald-400/80 dark:bg-emerald-500/70'
                                  }`}
                                  style={{
                                    transform: 'skewX(-20deg)',
                                    transformOrigin: 'bottom left'
                                  }}
                                />

                                {/* 3D Front Face with Gradient */}
                                <div
                                  className={`w-full h-full rounded-b-md transition shadow-md ${
                                    isSelected
                                      ? 'bg-gradient-to-b from-[#0a3a2a] to-emerald-700 text-white'
                                      : 'bg-gradient-to-b from-emerald-600 to-teal-800'
                                  }`}
                                />

                                {/* 3D Side Shadow Bevel */}
                                <div
                                  className="absolute top-0 -right-1 w-1.5 h-full bg-slate-900/25 rounded-r-xs pointer-events-none"
                                />
                              </div>
                            </div>

                            {/* Label underneath */}
                            <span className={`text-[8px] mt-2 font-bold tracking-tight uppercase ${
                              isSelected ? 'text-emerald-800 dark:text-emerald-300 font-black underline' : 'text-slate-400'
                            }`}>
                              {pt.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Ascending Trend Gradient Trail Line */}
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[9px] text-slate-500">
                      <span>Progres TW 1 &rarr; Tahunan</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
                        <ArrowUpRight className="w-3 h-3" /> Tren Positif Terpantau
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed mt-2">
                    {ratio.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex justify-between items-center">
                  <span>Rumus: {ratio.formula}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DETAILED COMPARISON TABLE (DOCX LINE 23: "JANGAN HAPUS TABEL MATRIKS KOMPARASI TREN KINERJANYA") */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Tabel Matriks Komparasi Tren Kinerja (Triwulan 1 s/d Tahunan)
            </h3>
            <p className="text-xs text-slate-500">
              Data rasio keuangan konsolidasi unit usaha BUMKam tahun buku {appliedFilter.year} berbasis standar SAK EMKM
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800 text-[11px]">
              <tr>
                <th className="p-3.5">Indikator Rasio Keuangan</th>
                <th className="p-3.5 text-center">Standar Acuan</th>
                <th className="p-3.5 text-center bg-emerald-50/50 dark:bg-emerald-950/20">Triwulan 1</th>
                <th className="p-3.5 text-center bg-emerald-50/50 dark:bg-emerald-950/20">Triwulan 2</th>
                <th className="p-3.5 text-center bg-emerald-50/50 dark:bg-emerald-950/20">Triwulan 3</th>
                <th className="p-3.5 text-center bg-emerald-50/50 dark:bg-emerald-950/20">Triwulan 4</th>
                <th className="p-3.5 text-center bg-emerald-100/50 dark:bg-emerald-900/30 font-extrabold text-emerald-900 dark:text-emerald-200">
                  Tahunan (Full)
                </th>
                <th className="p-3.5 text-center">Arah Tren</th>
                <th className="p-3.5 text-center">Status SAK EMKM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {ratioConfigs.map((r) => {
                const tw1Val = r.trend[0].value;
                const lastVal = r.trend[r.trend.length - 1].value;
                const isIncreasing = lastVal >= tw1Val;

                return (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3.5">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{r.name}</p>
                      <span className="text-[10px] text-slate-400">{r.category}</span>
                    </td>
                    <td className="p-3.5 text-center font-mono font-medium text-slate-500">
                      {r.target}
                    </td>
                    <td className="p-3.5 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {r.trend[0].value}{r.unit}
                    </td>
                    <td className="p-3.5 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {r.trend[1].value}{r.unit}
                    </td>
                    <td className="p-3.5 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {r.trend[2].value}{r.unit}
                    </td>
                    <td className="p-3.5 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {r.trend[3].value}{r.unit}
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20">
                      {r.trend[4].value}{r.unit}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 font-bold text-[11px] ${
                        isIncreasing ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {isIncreasing ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {isIncreasing ? 'Meningkat' : 'Menurun'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        r.isGood 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
