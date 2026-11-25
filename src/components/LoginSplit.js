import React, { useState } from 'react';
import { ShieldCheck, Lock, Sparkles, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import SectorBackground from './SectorBackground';
import ArveaLogo from './ArveaLogo';

export default function LoginSplit({ onLogin, onBackToStore, users = [] }) {
  const [email, setEmail] = useState('administrator');
  const [password, setPassword] = useState('BummaMekarSari2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const legacyDefaultPasswords = [
    'bummamekarsari2026!',
    'bumma123!',
    'admin123',
    'arvea2026!',
    'arvea123'
  ];

  const findManagedUser = (identifier) => {
    const idn = (identifier || '').trim().toLowerCase();
    if (!idn || !Array.isArray(users) || users.length === 0) return null;
    return (
      users.find(
        u =>
          (u.username || '').toLowerCase() === idn ||
          (u.email || '').toLowerCase() === idn ||
          (u.full_name || u.name || '').toLowerCase() === idn ||
          (idn === 'admin_bumma' && u.id === 'usr_admin')
      ) || null
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    const em = email.trim().toLowerCase();
    const pwRaw = password.trim();
    const pwLower = pwRaw.toLowerCase();

    const managed = findManagedUser(em);

    if (!managed) {
      toast.error('Akun tidak ditemukan. Periksa kembali username atau email Anda.');
      return;
    }

    // Tolak akun yang dinonaktifkan (soft-disable)
    if (managed.is_active === false) {
      toast.error('Akun Anda telah dinonaktifkan. Silakan hubungi Administrator.');
      return;
    }

    const storedPwd = (managed.password || '').trim();
    const isDefaultUnchanged = managed.is_default_account && managed.must_change_password;
    const passwordMatches =
      (storedPwd && pwRaw === storedPwd) ||
      (isDefaultUnchanged && legacyDefaultPasswords.includes(pwLower));

    if (!passwordMatches) {
      toast.error('Kata sandi tidak valid. Silakan periksa kembali kata sandi Anda.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onLogin({
        id: managed.id,
        username: managed.username,
        email: managed.email,
        name: managed.full_name || managed.name,
        full_name: managed.full_name || managed.name,
        role: managed.role,
        unit_kerja: managed.unit_kerja,
        initials: managed.initials,
        is_active: managed.is_active !== false,
        must_change_password: Boolean(managed.must_change_password),
        password_changed_at: managed.password_changed_at || null
      });
      if (managed.must_change_password || !managed.password_changed_at) {
        toast.info('Login perdana terdeteksi. Silakan ubah kredensial awal Anda terlebih dahulu.');
      } else {
        toast.success(`Selamat datang, ${managed.full_name || managed.name} (${managed.role})`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-[#F2EFFA] via-[#E8E2F6] to-[#DCD4F0] text-[#1E1B2E]">
      {/* Left Side: Lilac Brand Hero Panel (#9A90CC) */}
      <div
        className="md:w-5/12 lg:w-1/2 text-white p-6 sm:p-8 md:p-12 lg:p-14 flex flex-col justify-between relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #5F539C 0%, #8377BC 48%, #9A90CC 100%)'
        }}
      >
        {/* Animated Background Mesh & Sector Motifs */}
        <SectorBackground variant="dark" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div
          className="absolute bottom-10 right-10 w-80 h-80 bg-[#C4B9E5]/25 rounded-full blur-3xl pointer-events-none animate-pulse-glow"
          style={{ animationDelay: '2s' }}
        />
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Top Brand Logo ARVÉA */}
        <div className="flex items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-3">
            <ArveaLogo
              variant="horizontal"
              theme="light"
              size="md"
              subtitle="Financial Management System BUMKam Mekar Sari"
            />
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 text-[10px] font-extrabold text-white">
              SAK EMKM
            </span>
          </div>
        </div>

        {/* Main Hero Pitch */}
        <div className="my-8 z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/30 text-white text-xs font-bold mb-4 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" /> &ldquo;Satu Nilai, Satu Tujuan, Bertumbuh Bersama&rdquo;
          </div>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight mb-4">
            Kelola akuntansi &amp; aset BUMKam dengan akuntabel dan transparan.
          </h2>
          <p className="text-white/90 text-xs md:text-sm leading-relaxed mb-6">
            Standar pelaporan keuangan berbasis <strong>SAK EMKM</strong> terpadu, inventarisasi aset tetap &amp; operasional, jurnal penyesuaian, penggajian karyawan, dan pembukuan berpasangan digital.
          </p>

          {/* 3 Animated Sector Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {/* Unit 1: Peternakan */}
            <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-3 hover:bg-white/25 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden animate-float">
              <div className="flex items-center justify-between mb-1">
                <span className="text-base">🥚</span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-white bg-white/20 px-1.5 py-0.5 rounded">
                  Perdagangan
                </span>
              </div>
              <p className="text-xs font-black text-white leading-tight">Peternakan Ayam</p>
              <p className="text-[10px] text-white/85 font-bold mt-0.5">Produksi Telur Segar</p>
              <div className="mt-2 flex items-center gap-1.5 text-[9px] text-white/85">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
                <span>Monitoring Harian</span>
              </div>
            </div>

            {/* Unit 2: Tenda */}
            <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-3 hover:bg-white/25 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden animate-float-delayed">
              <div className="flex items-center justify-between mb-1">
                <span className="text-base">⛺</span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-white bg-white/20 px-1.5 py-0.5 rounded">
                  Jasa Sewa
                </span>
              </div>
              <p className="text-xs font-black text-white leading-tight">Tenda &amp; Kursi</p>
              <p className="text-[10px] text-white/85 font-bold mt-0.5">Rp 1.000.000 / Hari</p>
              <div className="mt-2 flex items-center gap-1.5 text-[9px] text-white/85">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
                <span>Manajemen Ketersediaan</span>
              </div>
            </div>

            {/* Unit 3: Gedung */}
            <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-3 hover:bg-white/25 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden animate-float">
              <div className="flex items-center justify-between mb-1">
                <span className="text-base">🏛️</span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-white bg-white/20 px-1.5 py-0.5 rounded">
                  Jasa Sewa
                </span>
              </div>
              <p className="text-xs font-black text-white leading-tight">Gedung Serbaguna</p>
              <p className="text-[10px] text-white/85 font-bold mt-0.5">Rp 2.000.000 / Acara</p>
              <div className="mt-2 flex items-center gap-1.5 text-[9px] text-white/85">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
                <span>Validasi Jadwal Ketat</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics (Clean, without 6 Peran RBAC) */}
          <div className="grid grid-cols-3 gap-4 pt-5 border-t border-white/25">
            <div>
              <p className="text-lg md:text-xl font-black text-white">SAK EMKM</p>
              <p className="text-[11px] text-white/85 font-medium">Standar Pelaporan</p>
            </div>
            <div>
              <p className="text-lg md:text-xl font-black text-white">Multi-Unit</p>
              <p className="text-[11px] text-white/85 font-medium">Perdagangan &amp; Jasa</p>
            </div>
            <div>
              <p className="text-lg md:text-xl font-black text-white">2019–2035</p>
              <p className="text-[11px] text-white/85 font-medium">Periode Terpadu</p>
            </div>
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="z-10 text-xs text-white/85 border-t border-white/20 pt-4 flex items-center justify-between">
          <span>BUMKam Mekar Sari &bull; Kampung Sabron Sari, Sentani Barat</span>
          <span className="text-[10px] text-white/75 font-semibold">TDA Kelompok 3C</span>
        </div>
      </div>

      {/* Right Side: Clean Lilac-Tinted Authentication Card (No 6 Peran Pengguna Box) */}
      <div className="md:w-7/12 lg:w-1/2 p-6 md:p-10 lg:p-12 flex flex-col justify-center items-center overflow-y-auto">
        <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-3xl border border-[#9A90CC]/35 shadow-xl p-7 sm:p-8 space-y-6">
          <div>
            {onBackToStore && (
              <button
                type="button"
                onClick={onBackToStore}
                className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#64589F] hover:text-[#4E4380] transition"
              >
                &larr; Kembali ke Landing Page
              </button>
            )}

            <div className="flex flex-col items-center text-center mb-5">
              <ArveaLogo variant="stacked" theme="lilac" size="md" showTagline />
            </div>

            <div className="flex justify-center mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2EFFA] text-[#524788] text-xs font-bold border border-[#9A90CC]/40">
                <ShieldCheck className="w-3.5 h-3.5 text-[#7C6FB8]" /> Portal Autentikasi Pengguna ARVÉA
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[#1E1B2E] text-center">
              Masuk ke Sistem ARVÉA
            </h2>
            <p className="text-xs text-slate-600 mt-1 text-center">
              Masukkan username atau email serta kata sandi akun pengurus Anda.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#3C3365] uppercase tracking-wider mb-1.5">
                Email / Username
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan username atau email"
                className="w-full px-4 py-2.5 rounded-xl border border-[#9A90CC]/50 bg-[#FAF9FD] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A90CC] text-xs text-[#1E1B2E] font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3C3365] uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 pr-10 py-2.5 rounded-xl border border-[#9A90CC]/50 bg-[#FAF9FD] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A90CC] text-xs text-[#1E1B2E] font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#64589F]"
                  aria-label="Tampilkan atau sembunyikan kata sandi"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-[#64589F] hover:bg-[#4E4380] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs"
            >
              <Lock className="w-3.5 h-3.5" /> {isSubmitting ? 'Memverifikasi...' : 'Masuk ke Aplikasi ARVÉA'}
            </button>
          </form>

          <p className="text-[11px] text-slate-500 text-center pt-2 border-t border-[#9A90CC]/20">
            Butuh akun pengurus baru atau lupa kata sandi? Hubungi Administrator BUMKam Mekar Sari.
          </p>
        </div>
      </div>
    </div>
  );
}
