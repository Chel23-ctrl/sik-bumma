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
  FileSpreadsheet
} from 'lucide-react';
import { formatIDR } from './Transaksi';

export default function AnalisisKinerja({ journals = [], accounts = [], transactions = [], profile = {} }) {
  // Filter States matching Bursa Efek / SAK standard layout (docx Paragraph 20 & img_1.png)
  const [filterReportType, setFilterReportType] = useState('Laporan Keuangan');
  const [filterUnit, setFilterUnit] = useState('Semua Unit');
  const [filterYear, setFilterYear] = useState('2026');
  const [filterPeriod, setFilterPeriod] = useState('Tahunan'); // 'Triwulan 1', 'Triwulan 2', 'Triwulan 3', 'Tahunan'

  // Applied filter state
  const [appliedFilter, setAppliedFilter] = useState({
    reportType: 'Laporan Keuangan',
    unit: 'Semua Unit',
    year: '2026',
    period: 'Tahunan'
  });

  const handleApplyFilter = () => {
    setAppliedFilter({
      reportType: filterReportType,
      unit: filterUnit,
      year: filterYear,
      period: filterPeriod
    });
  };

  const handleResetFilter = () => {
    setFilterReportType('Laporan Keuangan');
    setFilterUnit('Semua Unit');
    setFilterYear('2026');
    setFilterPeriod('Tahunan');
    setAppliedFilter({
      reportType: 'Laporan Keuangan',
      unit: 'Semua Unit',
      year: '2026',
      period: 'Tahunan'
    });
  };

  // Helper to compute ratios for a given period & year
  const computeMetricsForPeriod = (periodName, year) => {
    // Filter transactions for that specific quarter
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
      .filter(tx => tx.type === 'biaya' || tx.type === 'penggajian')
      .reduce((sum, tx) => sum + Number(tx.total || 0), 0);

    const netProfit = revenue - hpp - expenses;

    // Assets & Liquidity Estimation
    const cashNet = revenue - hpp - expenses;
    const baseCash = 15000000;
    const estimatedCash = Math.max(1000000, baseCash + cashNet);
    const estimatedReceivables = filteredTx
      .filter(tx => tx.type === 'penjualan' && tx.payment_method === 'Kredit')
      .reduce((s, x) => s + Number(x.total || 0), 0);
    const estimatedInventory = Math.max(5000000, 14440000 - (revenue > 0 ? hpp * 0.5 : 0));
    
    const currentAssets = estimatedCash + estimatedReceivables + estimatedInventory;
    const currentLiabilities = Math.max(500000, filteredTx
      .filter(tx => tx.type === 'pembelian' && tx.payment_method === 'Kredit')
      .reduce((s, x) => s + Number(x.total || 0), 0));

    const totalAssets = currentAssets + 35000000; // Fixed assets

    // Key Ratios
    const npm = revenue > 0 ? Math.round((netProfit / revenue) * 100) : (netProfit >= 0 ? 0 : -5);
    const cr = parseFloat((currentAssets / currentLiabilities).toFixed(2));
    const roa = parseFloat(((netProfit / totalAssets) * 100).toFixed(1));
    const it = estimatedInventory > 0 ? parseFloat((hpp / estimatedInventory).toFixed(2)) : 1.0;
    const dar = parseFloat(((currentLiabilities / totalAssets) * 100).toFixed(1));

    return {
      revenue,
      hpp,
      expenses,
      netProfit,
      currentAssets,
      currentLiabilities,
      totalAssets,
      npm,
      cr,
      roa,
      it,
      dar
    };
  };

  // Trend data across all 4 periods
  const trendData = useMemo(() => {
    const yr = appliedFilter.year;
    return {
      tw1: computeMetricsForPeriod('Triwulan 1', yr),
      tw2: computeMetricsForPeriod('Triwulan 2', yr),
      tw3: computeMetricsForPeriod('Triwulan 3', yr),
      tahunan: computeMetricsForPeriod('Tahunan', yr)
    };
  }, [transactions, appliedFilter]);

  // Current active metrics
  const activeMetrics = useMemo(() => {
    if (appliedFilter.period === 'Triwulan 1') return trendData.tw1;
    if (appliedFilter.period === 'Triwulan 2') return trendData.tw2;
    if (appliedFilter.period === 'Triwulan 3') return trendData.tw3;
    return trendData.tahunan;
  }, [trendData, appliedFilter.period]);

  // Define Ratios Configuration with Trend series
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
      desc: 'Mengukur persentase sisa pendapatan usaha setelah dikurangi seluruh beban operasional dan HPP.',
      formula: '(Laba Bersih / Total Pendapatan) x 100%',
      trend: [
        { label: 'TW 1', value: trendData.tw1.npm },
        { label: 'TW 2', value: trendData.tw2.npm },
        { label: 'TW 3', value: trendData.tw3.npm },
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
      status: activeMetrics.cr >= 2.0 ? 'Sangat Likuid' : activeMetrics.cr >= 1.5 ? 'Aman' : 'Rentan',
      desc: 'Kemampuan BUMKam memenuhi liabilitas jangka pendek dengan kas, piutang, dan persediaan komoditas.',
      formula: 'Aset Lancar / Liabilitas Jangka Pendek',
      trend: [
        { label: 'TW 1', value: trendData.tw1.cr },
        { label: 'TW 2', value: trendData.tw2.cr },
        { label: 'TW 3', value: trendData.tw3.cr },
        { label: 'Tahunan', value: trendData.tahunan.cr }
      ]
    },
    {
      id: 'roa',
      name: 'Return on Assets (ROA)',
      category: 'Efisiensi Aset',
      target: '> 10%',
      unit: '%',
      currentValue: activeMetrics.roa,
      isGood: activeMetrics.roa >= 10,
      status: activeMetrics.roa >= 10 ? 'Optimal' : activeMetrics.roa >= 5 ? 'Cukup Baik' : 'Kurang Efisien',
      desc: 'Efektivitas pemanfaatan seluruh aset milik masyarakat adat dalam mencetak laba bersih operasional.',
      formula: '(Laba Bersih / Total Aset) x 100%',
      trend: [
        { label: 'TW 1', value: trendData.tw1.roa },
        { label: 'TW 2', value: trendData.tw2.roa },
        { label: 'TW 3', value: trendData.tw3.roa },
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
      status: activeMetrics.it >= 2.0 ? 'Perputaran Cepat' : 'Perputaran Lambat',
      desc: 'Kecepatan perputaran stok barang dagang (telur ayam, pakan, bibit) menjadi penjualan kas.',
      formula: 'Beban Pokok Penjualan (HPP) / Rata-rata Persediaan',
      trend: [
        { label: 'TW 1', value: trendData.tw1.it },
        { label: 'TW 2', value: trendData.tw2.it },
        { label: 'TW 3', value: trendData.tw3.it },
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
      desc: 'Proporsi aset BUMKam yang dibiayai melalui kewajiban atau utang kepada pihak ketiga.',
      formula: '(Total Liabilitas / Total Aset) x 100%',
      trend: [
        { label: 'TW 1', value: trendData.tw1.dar },
        { label: 'TW 2', value: trendData.tw2.dar },
        { label: 'TW 3', value: trendData.tw3.dar },
        { label: 'Tahunan', value: trendData.tahunan.dar }
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              ANALISIS KINERJA & TREN
            </span>
            <span className="text-xs text-slate-400 font-medium">SAK Entitas Privat</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Analisis Rasio Kinerja Keuangan BUMKam
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluasi tren kesehatan finansial Badan Usaha Milik Masyarakat Adat Mekar Sari
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5 shadow-sm text-slate-700 dark:text-slate-200"
          >
            <Printer className="w-4 h-4 text-emerald-600" /> Cetak Tren Analisis
          </button>
        </div>
      </div>

      {/* FILTER BOX (MATCHING IDX / DOCX IMAGE 1) */}
      <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm print:hidden">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#8b0000] dark:text-red-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Filter Parameter Periode & Laporan (Format Bursa / SAK)
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Aktif: <strong className="text-slate-800 dark:text-slate-200">{appliedFilter.period} ({appliedFilter.year})</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs">
          {/* Kolom 1: Jenis Laporan */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wide">
              Jenis Laporan
            </label>
            <div className="space-y-1.5">
              {['Laporan Keuangan', 'Laporan Tahunan'].map(t => (
                <label key={t} className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="filterReportType"
                    checked={filterReportType === t}
                    onChange={() => setFilterReportType(t)}
                    className="w-4 h-4 text-[#8b0000] focus:ring-[#8b0000] accent-[#8b0000]"
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Kolom 2: Unit Usaha */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wide">
              Unit Usaha
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'Semua Unit', label: 'Semua Unit Usaha' },
                { id: 'Unit Perdagangan & Peternakan', label: 'Perdagangan & Ternak' },
                { id: 'Unit Jasa Penyewaan', label: 'Jasa & Persewaan' }
              ].map(u => (
                <label key={u.id} className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="filterUnit"
                    checked={filterUnit === u.id}
                    onChange={() => setFilterUnit(u.id)}
                    className="w-4 h-4 text-[#8b0000] focus:ring-[#8b0000] accent-[#8b0000]"
                  />
                  <span>{u.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Kolom 3: Tahun */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wide">
              Tahun Buku
            </label>
            <div className="space-y-1.5">
              {['2026', '2025', '2024', '2023', '2022'].map(yr => (
                <label key={yr} className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="filterYear"
                    checked={filterYear === yr}
                    onChange={() => setFilterYear(yr)}
                    className="w-4 h-4 text-[#8b0000] focus:ring-[#8b0000] accent-[#8b0000]"
                  />
                  <span>{yr}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Kolom 4: Periode (Triwulan 1, 2, 3, Tahunan) */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wide">
              Periode Evaluasi
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'Triwulan 1', label: 'Triwulan 1 (Jan - Mar)' },
                { id: 'Triwulan 2', label: 'Triwulan 2 (Apr - Jun)' },
                { id: 'Triwulan 3', label: 'Triwulan 3 (Jul - Sep)' },
                { id: 'Tahunan', label: 'Tahunan (Jan - Des)' }
              ].map(p => (
                <label key={p.id} className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="filterPeriod"
                    checked={filterPeriod === p.id}
                    onChange={() => setFilterPeriod(p.id)}
                    className="w-4 h-4 text-[#8b0000] focus:ring-[#8b0000] accent-[#8b0000]"
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
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> RESET
          </button>
          <button
            type="button"
            onClick={handleApplyFilter}
            className="px-6 py-2 rounded-xl bg-[#8b0000] hover:bg-[#6b0000] text-white font-bold transition shadow-md flex items-center gap-1.5"
          >
            Terapkan Filter
          </button>
        </div>
      </div>

      {/* SUMMARY BADGES BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Pendapatan ({appliedFilter.period})</p>
          <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
            {formatIDR(activeMetrics.revenue)}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Beban Pokok (HPP)</p>
          <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
            {formatIDR(activeMetrics.hpp)}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Laba Bersih Operasional</p>
          <p className={`text-base font-bold mt-1 ${activeMetrics.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatIDR(activeMetrics.netProfit)}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Aset Produktif</p>
          <p className="text-base font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            {formatIDR(activeMetrics.totalAssets)}
          </p>
        </div>
      </div>

      {/* TREND RATIO CARDS WITH VISUAL PROGRESSION */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Tren Rasio Keuangan Antar Periode
            </h2>
            <p className="text-xs text-slate-500">
              Perbandingan berkala: Triwulan 1, Triwulan 2, Triwulan 3, dan Konsolidasi Tahunan
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ratioConfigs.map((ratio) => {
            const maxVal = Math.max(1, ...ratio.trend.map(t => Math.abs(t.value)));

            return (
              <div
                key={ratio.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-emerald-500/50 transition duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {ratio.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
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

                  <div className="flex items-baseline gap-2.5 my-3">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {ratio.currentValue}{ratio.unit}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      Standar: {ratio.target}
                    </span>
                  </div>

                  {/* VISUAL TREND BAR CHART (TW1 -> TW2 -> TW3 -> Tahunan) */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-100 dark:border-slate-800 my-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Perjalanan Tren Periode:</span>
                      <span className="text-emerald-600 font-semibold">{appliedFilter.year}</span>
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {ratio.trend.map((pt, idx) => {
                        const isSelected = pt.label.toLowerCase() === appliedFilter.period.toLowerCase() || 
                                           (pt.label === 'Tahunan' && appliedFilter.period === 'Tahunan');
                        const barPct = Math.min(100, Math.max(15, Math.round((Math.abs(pt.value) / maxVal) * 100)));
                        
                        return (
                          <div key={idx} className="flex flex-col items-center">
                            <span className={`text-[10px] font-bold mb-1 ${isSelected ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-slate-600 dark:text-slate-300'}`}>
                              {pt.value}{ratio.unit}
                            </span>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-14 rounded-lg flex items-end p-0.5">
                              <div
                                style={{ height: `${barPct}%` }}
                                className={`w-full rounded-md transition-all duration-500 ${
                                  isSelected 
                                    ? 'bg-[#0a3a2a] dark:bg-emerald-500' 
                                    : 'bg-emerald-600/60 dark:bg-emerald-600/40'
                                }`}
                              />
                            </div>
                            <span className={`text-[9px] mt-1.5 uppercase font-bold ${isSelected ? 'text-emerald-700 font-black' : 'text-slate-400'}`}>
                              {pt.label}
                            </span>
                          </div>
                        );
                      })}
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

      {/* DETAILED COMPARISON TABLE (Triwulan 1-3 & Tahunan) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Tabel Matriks Komparasi Tren Kinerja (Triwulan 1 s/d Tahunan)
            </h3>
            <p className="text-xs text-slate-500">
              Data rasio keuangan konsolidasi unit usaha BUMKam tahun buku {appliedFilter.year}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Indikator Rasio Keuangan</th>
                <th className="p-3.5 text-center">Standar Acuan</th>
                <th className="p-3.5 text-center bg-emerald-50/50 dark:bg-emerald-950/20">Triwulan 1</th>
                <th className="p-3.5 text-center bg-emerald-50/50 dark:bg-emerald-950/20">Triwulan 2</th>
                <th className="p-3.5 text-center bg-emerald-50/50 dark:bg-emerald-950/20">Triwulan 3</th>
                <th className="p-3.5 text-center bg-emerald-100/50 dark:bg-emerald-900/30 font-extrabold text-emerald-900 dark:text-emerald-200">
                  Tahunan (Full)
                </th>
                <th className="p-3.5 text-center">Arah Tren</th>
                <th className="p-3.5 text-center">Status SAK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {ratioConfigs.map((r) => {
                const tw1Val = r.trend[0].value;
                const tw3Val = r.trend[2].value;
                const isIncreasing = tw3Val >= tw1Val;

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
                    <td className="p-3.5 text-center font-mono font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20">
                      {r.trend[3].value}{r.unit}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        isIncreasing ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isIncreasing ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {isIncreasing ? 'Meningkat' : 'Stabil/Fluktuatif'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        r.isGood ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
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

      {/* REKOMENDASI & TANDA TANGAN */}
      <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-2 mb-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          Kesimpulan & Catatan Tindak Lanjut Pengurus BUMKam Mekar Sari
        </h3>
        <p className="text-xs text-emerald-900/90 dark:text-emerald-300/90 leading-relaxed mb-6">
          Kondisi finansial BUMKam Mekar Sari sepanjang periode {appliedFilter.period} {appliedFilter.year} berada dalam kategori <strong>SEHAT</strong> dengan tingkat likuiditas aman untuk membiayai operasional ternak dan sewa. Disarankan untuk mempercepat perputaran persediaan pakan serta mengalokasikan cadangan laba bersih untuk dividen kas kampung adat.
        </p>

        {/* Tanda Tangan Resmi (Direktur Kiri, Bendahara Kanan) */}
        <div className="pt-6 border-t border-emerald-200/80 dark:border-emerald-800/60 grid grid-cols-2 text-center text-xs">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">Mengetahui,</p>
            <p className="font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              DIREKTUR BUMKAM / BUMMA
            </p>
            <p className="mt-14 font-bold underline text-slate-900 dark:text-white">
              {profile.director || 'Eko L Wibowo'}
            </p>
            <p className="text-[10px] text-slate-500">NIP / Reg: BUMMA-DIR-001</p>
          </div>

          <div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">Dibuat Oleh,</p>
            <p className="font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              BENDAHARA BUMKAM / BUMMA
            </p>
            <p className="mt-14 font-bold underline text-slate-900 dark:text-white">
              {profile.treasurer || 'Rita Fanghoi'}
            </p>
            <p className="text-[10px] text-slate-500">NIP / Reg: BUMMA-BEN-002</p>
          </div>
        </div>
      </div>
    </div>
  );
}
