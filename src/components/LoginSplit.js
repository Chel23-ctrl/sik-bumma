import React, { useState } from 'react';
import { Building2, ShieldCheck, Lock, Users, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import SectorBackground from './SectorBackground';

export const DEMO_ACCOUNTS = [
  {
    title: 'Admin BUMMA',
    username: 'admin_bumma',
    role: 'Administrator',
    name: 'Admin BUMMA',
    initials: 'AD'
  },
  {
    title: 'Akuntansi',
    username: 'accounting@bumma-demo.id',
    role: 'Akuntansi',
    name: 'Staf Akuntansi',
    initials: 'AK'
  },
  {
    title: 'Keuangan',
    username: 'finance@bumma-demo.id',
    role: 'Keuangan',
    name: 'Staf Keuangan',
    initials: 'KU'
  },
  {
    title: 'Sales',
    username: 'sales@bumma-demo.id',
    role: 'Sales',
    name: 'Staf Penjualan',
    initials: 'SL'
  },
  {
    title: 'Pembelian',
    username: 'purchasing@bumma-demo.id',
    role: 'Pembelian',
    name: 'Staf Pembelian',
    initials: 'PB'
  },
  {
    title: 'Gudang',
    username: 'warehouse@bumma-demo.id',
    role: 'Gudang',
    name: 'Staf Gudang',
    initials: 'GD'
  },
  {
    title: 'Manajer',
    username: 'manager@bumma-demo.id',
    role: 'Manajer',
    name: 'Manajer BUMKam',
    initials: 'MN'
  },
  {
    title: 'Auditor',
    username: 'auditor@bumma-demo.id',
    role: 'Auditor',
    name: 'Auditor Eksternal',
    initials: 'AU'
  }
];

export default function LoginSplit({ onLogin, onBackToStore }) {
  const [email, setEmail] = useState('admin_bumma');
  const [password, setPassword] = useState('BummaMekarSari2026!');

  const validPasswords = ['bummamekarsari2026!', 'bumma123!', 'admin123'];

  const handleSubmit = (e) => {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    const pw = password.trim().toLowerCase();

    // Check if password is valid
    if (!validPasswords.includes(pw)) {
      toast.error('Kata sandi salah. Gunakan BummaMekarSari2026! atau BUMMA123!');
      return;
    }

    // Match demo account
    const matched = DEMO_ACCOUNTS.find(
      acc => acc.username.toLowerCase() === em || 
             acc.title.toLowerCase() === em ||
             (acc.role && acc.role.toLowerCase() === em)
    );

    if (matched) {
      onLogin({
        email: matched.username,
        name: matched.name,
        role: matched.role,
        initials: matched.initials
      });
      toast.success(`Selamat datang, ${matched.name} (${matched.role})`);
    } else {
      // Default fallback if username not strictly in demo list
      onLogin({
        email: email,
        name: email.split('@')[0].toUpperCase(),
        role: 'Pengguna',
        initials: 'US'
      });
      toast.success(`Selamat datang, ${email}`);
    }
  };

  const handleQuickLogin = (acc) => {
    setEmail(acc.username);
    setPassword('BummaMekarSari2026!');
    onLogin({
      email: acc.username,
      name: acc.name,
      role: acc.role,
      initials: acc.initials
    });
    toast.success(`Berhasil masuk sebagai ${acc.title} (${acc.role})`);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-900">
      {/* Left Side: Dark Forest Green Brand Pitch with Animated Graphics */}
      <div className="md:w-5/12 lg:w-1/2 bg-[#0a3a2a] text-white p-6 sm:p-8 md:p-12 lg:p-14 flex flex-col justify-between relative overflow-hidden">
        
        {/* Animated Background Mesh & Sector Motifs */}
        <SectorBackground variant="dark" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Top Brand */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white">SIK-BUMMA</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-400/30 text-[10px] font-extrabold text-emerald-300">
                2026
              </span>
            </div>
            <p className="text-xs text-emerald-300/90 font-medium">Sistem Informasi Keuangan BUMKam Mekar Sari</p>
          </div>
        </div>

        {/* Main Hero Pitch */}
        <div className="my-6 sm:my-8 z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Tata Kelola Keuangan Masyarakat Adat
          </div>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight mb-4">
            Kelola keuangan BUMKam dengan transparan &amp; berdampak.
          </h2>
          <p className="text-emerald-100/85 text-xs md:text-sm leading-relaxed mb-6">
            Akuntansi berpasangan yang ketat, buku besar otomatis, dan 5 laporan keuangan SAK Entitas Privat yang dapat ditelusuri hingga bukti transaksi untuk kemakmuran masyarakat adat.
          </p>

          {/* 3 Animated Sector Feature Cards (Replacing Empty Space) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {/* Unit 1: Peternakan */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden animate-float">
              <div className="flex items-center justify-between mb-1">
                <span className="text-base">🥚</span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-400/20 px-1.5 py-0.5 rounded">
                  Perdagangan
                </span>
              </div>
              <p className="text-xs font-black text-white leading-tight">Telur Ayam Lokal</p>
              <p className="text-[10px] text-emerald-300 font-bold mt-0.5">Rp 70.000 / Rak</p>
              <div className="mt-2 flex items-center gap-1.5 text-[9px] text-emerald-200">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span>Panen Harian</span>
              </div>
            </div>

            {/* Unit 2: Tenda */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden animate-float-delayed">
              <div className="flex items-center justify-between mb-1">
                <span className="text-base">⛺</span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-400/20 px-1.5 py-0.5 rounded">
                  Jasa Sewa
                </span>
              </div>
              <p className="text-xs font-black text-white leading-tight">Tenda Acara &amp; Tratak</p>
              <p className="text-[10px] text-emerald-300 font-bold mt-0.5">Rp 1.000.000 / Hari</p>
              <div className="mt-2 flex items-center gap-1.5 text-[9px] text-emerald-200">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span>Siap Pasang</span>
              </div>
            </div>

            {/* Unit 3: Gedung */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden animate-float">
              <div className="flex items-center justify-between mb-1">
                <span className="text-base">🏛️</span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-400/20 px-1.5 py-0.5 rounded">
                  Jasa Sewa
                </span>
              </div>
              <p className="text-xs font-black text-white leading-tight">Gedung Serbaguna</p>
              <p className="text-[10px] text-emerald-300 font-bold mt-0.5">Rp 2.000.000 / Acara</p>
              <div className="mt-2 flex items-center gap-1.5 text-[9px] text-emerald-200">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span>Kapasitas 250+</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-4 pt-5 border-t border-emerald-800/60">
            <div>
              <p className="text-2xl md:text-3xl font-black text-amber-300">7</p>
              <p className="text-[11px] text-emerald-200 font-medium">Wilayah Adat</p>
            </div>
            <div>
              <p className="text-lg md:text-xl font-black text-white">SAK EP</p>
              <p className="text-[11px] text-emerald-200 font-medium">Entitas Privat</p>
            </div>
            <div>
              <p className="text-lg md:text-xl font-black text-emerald-300">IDR</p>
              <p className="text-[11px] text-emerald-200 font-medium">Multi-Unit</p>
            </div>
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="z-10 text-xs text-emerald-300/80 border-t border-emerald-800/40 pt-4 flex items-center justify-between">
          <span>BUMKam Mekar Sari &bull; Kabupaten Jayapura, Papua</span>
          <span className="text-[10px] text-emerald-400/60">TDA Kelompok 3C</span>
        </div>
      </div>

      {/* Right Side: Login Form & 8 Demo Roles */}
      <div className="md:w-7/12 lg:w-1/2 p-6 md:p-10 lg:p-12 flex flex-col justify-center bg-white overflow-y-auto">
        <div className="max-w-md w-full mx-auto space-y-5">
          <div>
            {onBackToStore && (
              <button
                type="button"
                onClick={onBackToStore}
                className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 transition"
              >
                &larr; Kembali ke Toko Digital (Storefront)
              </button>
            )}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Portal Autentikasi Pengguna
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Masuk ke SIK-BUMMA</h2>
            <p className="text-xs text-slate-500 mt-1">
              Pilih salah satu role demo di bawah atau masukkan akun Anda.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email / Username
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin_bumma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-xs text-slate-900 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Kata Sandi
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-xs text-slate-900"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#0a3a2a] hover:bg-[#06291d] text-white font-bold rounded-xl shadow transition flex items-center justify-center gap-2 text-xs"
            >
              <Lock className="w-3.5 h-3.5" /> Masuk ke Aplikasi
            </button>
          </form>

          {/* AKUN DEMO BOX (MATCHING USER SCREENSHOT EXACTLY) */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                AKUN DEMO (KATA SANDI: BummaMekarSari2026! / BUMMA123!)
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = email.toLowerCase() === acc.username.toLowerCase();
                return (
                  <button
                    key={acc.username}
                    type="button"
                    onClick={() => handleQuickLogin(acc)}
                    className={`p-3 rounded-xl border text-left transition duration-150 flex flex-col justify-center ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-emerald-500 hover:bg-slate-50 shadow-xs'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900 leading-tight">
                      {acc.title}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
                      {acc.username}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
