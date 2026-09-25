import React from 'react';
import { ShieldCheck, Plus, FileText, Filter, Building2, Egg, Tent, Store } from 'lucide-react';

export default function LandingUnit({
  profile,
  selectedUnit,
  setSelectedUnit,
  selectedYear,
  setSelectedYear,
  availableYears,
  onNavigate,
  stats
}) {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0a3a2a] to-[#125940] rounded-2xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-200 px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-emerald-400/30">
            <ShieldCheck className="w-3.5 h-3.5" /> ARVEA &bull; Portal Siklus Akuntansi SAK EMKM
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Selamat Datang di {profile.name}
          </h1>
          <p className="text-emerald-100/90 text-sm md:text-base mt-2 max-w-2xl">
            {profile.legalName} &mdash; {profile.village || 'Kampung Sabron Sari'}, {profile.region}, {profile.location}. Sistem pembukuan digital terpadu dengan standar SAK EMKM (double-entry).
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('transaksi')}
              className="bg-white text-[#0a3a2a] px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-emerald-50 transition shadow flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Catat Transaksi Baru
            </button>
            <button
              onClick={() => onNavigate('laporan')}
              className="bg-emerald-800/80 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition border border-emerald-600 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" /> Laporan Keuangan SAK EMKM
            </button>
          </div>
        </div>
      </div>

      {/* FILTER PANEL: UNIT USAHA, JENIS USAHA, TAHUN (Sesuai Butir Catatan Docx) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-600" /> Pengaturan Unit &amp; Periode Pembukuan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih unit usaha dan tahun laporan yang ingin dianalisis secara spesifik
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Nama Unit Usaha */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Pilih Unit Usaha
            </label>
            <div className="space-y-2">
              {[
                { id: 'all', name: 'Semua Unit (Konsolidasi BUMKam)', icon: Building2 },
                { id: 'perdagangan', name: 'Unit Perdagangan & Peternakan', icon: Egg },
                { id: 'jasa', name: 'Unit Jasa Penyewaan', icon: Tent }
              ].map((u) => {
                const Icon = u.icon;
                const isSelected = selectedUnit === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUnit(u.id)}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-center gap-3 text-xs font-semibold ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-600/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{u.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Jenis Usaha (Opsi: Perdagangan & Jasa) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Opsi Sektor Jenis Usaha
            </label>
            <div className="space-y-3">
              <div
                onClick={() => setSelectedUnit('perdagangan')}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  selectedUnit === 'perdagangan'
                    ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <Store className="w-4 h-4" /> 1. Sektor Perdagangan
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Usaha peternakan ayam petelur (penjualan telur segar, pakan), komoditas beras lokal Papua, dan kerajinan noken.
                </p>
              </div>

              <div
                onClick={() => setSelectedUnit('jasa')}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  selectedUnit === 'jasa'
                    ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-blue-800 dark:text-blue-300">
                  <Tent className="w-4 h-4 text-blue-600" /> 2. Sektor Jasa
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Layanan jasa penyewaan tenda acara, pesta adat, dan penyewaan Gedung Serba Guna BUMKam Mekar Sari.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Tahun Pembukuan (2019 dst) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Tahun Pembukuan (2019 - Seterusnya)
            </label>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <p className="text-xs text-slate-500">
                Laporan keuangan akan dikelompokkan berdasarkan tahun transaksi yang dipilih:
              </p>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {availableYears.map(y => (
                  <option key={y} value={y === 'Semua Tahun' ? 'all' : y}>
                    {y === 'all' || y === 'Semua Tahun' ? 'Semua Tahun Pembukuan' : `Tahun Buku ${y}`}
                  </option>
                ))}
              </select>

              <div className="pt-2">
                <span className="text-[11px] inline-block font-medium px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Aktif: {selectedYear === 'all' ? 'Seluruh Periode' : `Tahun Anggaran ${selectedYear}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PROFIL UNIT USAHA KARTU */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Unit Perdagangan */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full">
                Unit 01 &bull; Perdagangan
              </span>
              <span className="text-xs text-slate-400 font-medium">Kab. Jayapura</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Egg className="w-5 h-5 text-emerald-600" /> Unit Perdagangan &amp; Peternakan
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Fokus pada produksi dan distribusi telur ayam ras petelur lokal, pakan ternak berkwalitas, beras petani lokal, serta aneka noken anyaman tangan masyarakat adat.
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Penanggung Jawab:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Yohanis Wenda</span>
              </div>
              <div className="flex justify-between">
                <span>Metode Pembukuan:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Perpetual (HPP &amp; Persediaan)</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <button
              onClick={() => {
                setSelectedUnit('perdagangan');
                onNavigate('transaksi');
              }}
              className="flex-1 py-2 text-center text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg hover:bg-emerald-100 transition"
            >
              Lihat Transaksi Unit &rarr;
            </button>
          </div>
        </div>

        {/* Unit Jasa */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded-full">
                Unit 02 &bull; Jasa
              </span>
              <span className="text-xs text-slate-400 font-medium">Sentani</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Tent className="w-5 h-5 text-blue-600" /> Unit Jasa Penyewaan
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Menyediakan fasilitas perlengkapan pesta (tenda terop, kursi, sound system) serta pengelolaan sewa Gedung Serba Guna BUMMA untuk kegiatan adat, resepsi, dan rapat desa.
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Penanggung Jawab:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Markus Krey</span>
              </div>
              <div className="flex justify-between">
                <span>Model Pendapatan:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Pendapatan Jasa Sewa Langsung</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <button
              onClick={() => {
                setSelectedUnit('jasa');
                onNavigate('transaksi');
              }}
              className="flex-1 py-2 text-center text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 rounded-lg hover:bg-blue-100 transition"
            >
              Lihat Transaksi Unit &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
