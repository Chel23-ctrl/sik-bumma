import React, { useState } from 'react';
import { ShieldCheck, Lock, Sparkles, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import SectorBackground from './SectorBackground';
import ArveaLogo from './ArveaLogo';
import apiClient, {
  setAuthToken,
  isJsonApiResponse,
  parseAuthError,
  hasExplicitRemoteApi
} from '../utils/apiClient';
import { readStoredUsers, verifyPasswordLocal } from '../utils/passwordAuth';

export default function LoginSplit({ onLogin, onBackToStore, users = [] }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const findManagedUser = (identifier) => {
    const idn = (identifier || '').trim().toLowerCase();
    // Selalu baca data pengguna paling mutakhir dari storage (bukan state lama/stale)
    const latestUsers = readStoredUsers(users);
    if (!idn || !Array.isArray(latestUsers) || latestUsers.length === 0) return null;
    return (
      latestUsers.find(
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
    setLoginError(null);

    // Trim spasi tersembunyi dari keyboard HP / copy-paste & normalisasi huruf kecil untuk username/email
    const cleanIdentifier = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanIdentifier || !cleanPassword) {
      const errObj = {
        code: 'EMPTY_FIELDS',
        title: 'Form Belum Lengkap',
        message: 'Harap masukkan Email/Username dan Kata Sandi terlebih dahulu.'
      };
      setLoginError(errObj);
      toast.error(errObj.message);
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Coba autentikasi ke Backend API terlebih dahulu (sinkronisasi multi-device & Bearer Token)
      let apiHandled = false;
      try {
        const res = await apiClient.post('/auth/login', {
          email: cleanIdentifier,
          password: cleanPassword
        });
        if (isJsonApiResponse(res) && res.data?.id) {
          apiHandled = true;
          if (res.data.access_token) {
            setAuthToken(res.data.access_token);
          }
          const serverUser = res.data;
          await onLogin({
            id: serverUser.id,
            username: serverUser.username || cleanIdentifier,
            email: serverUser.email || cleanIdentifier,
            name: serverUser.full_name || serverUser.name,
            full_name: serverUser.full_name || serverUser.name,
            role: serverUser.role,
            unit_kerja: serverUser.unit_kerja,
            initials: serverUser.initials,
            is_active: serverUser.is_active !== false,
            must_change_password: Boolean(serverUser.must_change_password),
            password_changed_at: serverUser.password_changed_at || null,
            auth_source: 'api'
          });
          if (serverUser.must_change_password || !serverUser.password_changed_at) {
            toast.info('Login perdana terdeteksi. Silakan ubah kredensial awal Anda terlebih dahulu.');
          } else {
            toast.success(`Selamat datang, ${serverUser.full_name || serverUser.name} (${serverUser.role})`);
          }
          return;
        }
      } catch (apiErr) {
        const httpStatus = apiErr?.response?.status;
        // Jika server API merespons eksplisit (400/401/403/419/5xx) ATAU remote API dikonfigurasi, tampilkan error spesifik
        if ((httpStatus && httpStatus !== 404 && httpStatus !== 405) || hasExplicitRemoteApi) {
          const parsed = parseAuthError(apiErr);
          setLoginError(parsed);
          toast.error(parsed.message);
          return;
        }
        // Jika 404/405/HTML dari static Vercel hosting tanpa backend terpisah, lanjut ke verifikasi penyimpanan lokal SPA
      }

      if (apiHandled) return;

      // 2. Fallback autentikasi penyimpanan lokal SPA (dengan pesan diagnostik jelas lintas perangkat)
      const managed = findManagedUser(cleanIdentifier);

      if (!managed) {
        const errObj = {
          code: 'USER_NOT_FOUND',
          title: 'Akun Tidak Ditemukan di Perangkat Ini',
          message: `Username/email "${cleanIdentifier}" tidak ditemukan.`,
          hint: 'Pastikan ejaan benar tanpa spasi. Jika akun baru dibuat di perangkat lain (mode penyimpanan lokal), sinkronkan data akun terlebih dahulu lewat menu Pengelolaan Pengguna atau hubungkan database server.'
        };
        setLoginError(errObj);
        toast.error(errObj.message);
        return;
      }

      // Tolak akun yang dinonaktifkan (soft-disable)
      if (managed.is_active === false) {
        const errObj = {
          code: 'ACCOUNT_DEACTIVATED',
          title: 'Akun Dinonaktifkan',
          message: 'Akun Anda telah dinonaktifkan. Silakan hubungi Administrator.'
        };
        setLoginError(errObj);
        toast.error(errObj.message);
        return;
      }

      // Verifikasi ketat terhadap hash/password terkini yang tersimpan pada data user (tanpa hardcoded password)
      const passwordMatches = verifyPasswordLocal(cleanPassword, managed);

      if (!passwordMatches) {
        const looksLikeGeneratedReset = cleanPassword.startsWith('Arvea#');
        const errObj = {
          code: 'INVALID_PASSWORD',
          title: 'Kata Sandi Tidak Cocok',
          message: 'Kata sandi tidak valid. Silakan periksa kembali huruf besar/kecil dan spasi.',
          hint: looksLikeGeneratedReset
            ? 'Terdeteksi password sementara hasil Reset Sandi (Arvea#...). Jika reset dilakukan di perangkat lain tanpa database cloud terhubung, password di perangkat ini belum ikut tersinkronisasi — gunakan "Impor Kode Sinkronisasi" dari Admin atau hubungkan MONGO_URI di server.'
            : 'Periksa tombol Caps Lock dan pastikan keyboard tidak menambahkan spasi otomatis di akhir kata sandi.'
        };
        setLoginError(errObj);
        toast.error(errObj.message);
        return;
      }

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
        password_changed_at: managed.password_changed_at || null,
        auth_source: 'local'
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
    <div
      className="min-h-screen flex flex-col md:flex-row relative overflow-hidden bg-[#8377BC] text-[#1E1B2E]"
      style={{
        background: 'linear-gradient(115deg, #5A4E98 0%, #7C6FB8 45%, #9A90CC 72%, #C9BFE8 100%)'
      }}
    >
      {/* Full-Width Background Layer (z-0): Foto Bersama Tim memanjang penuh dari kiri ke kanan agar seluruh wajah terlihat */}
      <img
        src={`${process.env.PUBLIC_URL || ''}/assets/images/foto-bersama.jpg`}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 z-0 w-full h-full object-cover object-[center_55%] opacity-[0.30] mix-blend-luminosity select-none pointer-events-none"
      />

      {/* Full-Width Lilac Overlay Tint (z-0): Ungu lilac lebih pekat di kiri (kontras teks putih) & lembut transparan di kanan */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(105deg, rgba(82, 70, 146, 0.58) 0%, rgba(114, 101, 178, 0.44) 46%, rgba(154, 144, 204, 0.34) 68%, rgba(235, 230, 248, 0.50) 100%)'
        }}
      />

      {/* Soft Ambient Orbs & Dot Texture (z-0) */}
      <div className="absolute top-1/4 left-1/4 z-0 w-96 h-96 bg-white/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div
        className="absolute bottom-10 right-10 z-0 w-80 h-80 bg-[#C4B9E5]/25 rounded-full blur-3xl pointer-events-none animate-pulse-glow"
        style={{ animationDelay: '2s' }}
      />
      <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* Left Side: Lilac Brand Hero Content (Transparan menyatu dengan foto penuh) */}
      <div className="md:w-5/12 lg:w-1/2 text-white p-6 sm:p-8 md:p-12 lg:p-14 flex flex-col justify-between relative z-10 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <SectorBackground variant="dark" />
        </div>

        {/* Top Brand Logo ARVÉA */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ArveaLogo
              variant="horizontal"
              theme="light"
              size="md"
              subtitle="Financial Management System BUMKam Mekar Sari"
            />
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs border border-white/30 text-[10px] font-extrabold text-white">
              SAK EMKM
            </span>
          </div>
        </div>

        {/* Main Hero Pitch */}
        <div className="relative z-10 my-8 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4B3F82]/35 border border-white/30 text-white text-xs font-bold mb-4 backdrop-blur-md shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" /> &ldquo;Satu Nilai, Satu Tujuan, Bertumbuh Bersama&rdquo;
          </div>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight mb-4 drop-shadow-sm">
            Kelola akuntansi &amp; aset BUMKam dengan akuntabel dan transparan.
          </h2>
          <p className="text-white/95 text-xs md:text-sm leading-relaxed mb-6 drop-shadow-xs">
            Standar pelaporan keuangan berbasis <strong>SAK EMKM</strong> terpadu, inventarisasi aset tetap &amp; operasional, jurnal penyesuaian, penggajian karyawan, dan pembukuan berpasangan digital.
          </p>

          {/* 3 Animated Sector Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-[#4B3F82]/35 backdrop-blur-md border border-white/30 rounded-2xl p-3 hover:bg-[#4B3F82]/45 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden animate-float shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-base">🥚</span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-white bg-white/20 px-1.5 py-0.5 rounded">
                  Perdagangan
                </span>
              </div>
              <p className="text-xs font-black text-white leading-tight">Peternakan Ayam</p>
              <p className="text-[10px] text-white/90 font-bold mt-0.5">Produksi Telur Segar</p>
              <div className="mt-2 flex items-center gap-1.5 text-[9px] text-white/90">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
                <span>Monitoring Harian</span>
              </div>
            </div>

            <div className="bg-[#4B3F82]/35 backdrop-blur-md border border-white/30 rounded-2xl p-3 hover:bg-[#4B3F82]/45 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden animate-float-delayed shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-base">⛺</span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-white bg-white/20 px-1.5 py-0.5 rounded">
                  Jasa Sewa
                </span>
              </div>
              <p className="text-xs font-black text-white leading-tight">Tenda &amp; Kursi</p>
              <p className="text-[10px] text-white/90 font-bold mt-0.5">Rp 1.000.000 / Hari</p>
              <div className="mt-2 flex items-center gap-1.5 text-[9px] text-white/90">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
                <span>Manajemen Ketersediaan</span>
              </div>
            </div>

            <div className="bg-[#4B3F82]/35 backdrop-blur-md border border-white/30 rounded-2xl p-3 hover:bg-[#4B3F82]/45 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden animate-float shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-base">🏛️</span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-white bg-white/20 px-1.5 py-0.5 rounded">
                  Jasa Sewa
                </span>
              </div>
              <p className="text-xs font-black text-white leading-tight">Gedung Serbaguna</p>
              <p className="text-[10px] text-white/90 font-bold mt-0.5">Rp 2.000.000 / Acara</p>
              <div className="mt-2 flex items-center gap-1.5 text-[9px] text-white/90">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
                <span>Validasi Jadwal Ketat</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-5 border-t border-white/30">
            <div>
              <p className="text-lg md:text-xl font-black text-white drop-shadow-xs">SAK EMKM</p>
              <p className="text-[11px] text-white/90 font-medium">Standar Pelaporan</p>
            </div>
            <div>
              <p className="text-lg md:text-xl font-black text-white drop-shadow-xs">Multi-Unit</p>
              <p className="text-[11px] text-white/90 font-medium">Perdagangan &amp; Jasa</p>
            </div>
            <div>
              <p className="text-lg md:text-xl font-black text-white drop-shadow-xs">2019–2035</p>
              <p className="text-[11px] text-white/90 font-medium">Periode Terpadu</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-white/90 border-t border-white/25 pt-4 flex items-center justify-between">
          <span>BUMKam Mekar Sari &bull; Kampung Sabron Sari, Sentani Barat</span>
          <span className="text-[10px] text-white/85 font-semibold">TDA Kelompok 3C</span>
        </div>
      </div>

      {/* Right Side: Clean Frosted-Glass Authentication Card over Continuous Full-Width Team Photo */}
      <div className="md:w-7/12 lg:w-1/2 p-6 md:p-10 lg:p-12 flex flex-col justify-center items-center overflow-y-auto relative z-10">
        <div className="max-w-md w-full bg-white/82 backdrop-blur-md rounded-3xl border border-white/65 shadow-2xl p-7 sm:p-8 space-y-5">
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
              <ArveaLogo variant="stacked" theme="periwinkle" size="md" showTagline />
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

          {/* Inline Specific Error Banner (never fails silently) */}
          {loginError && (
            <div
              role="alert"
              className="rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-900 space-y-1.5"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-extrabold text-rose-800">{loginError.title}</p>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                      {loginError.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
                    {loginError.message}
                  </p>
                  {loginError.hint && (
                    <p className="text-[10px] text-rose-600/90 mt-1.5 pt-1.5 border-t border-rose-200/80 leading-relaxed">
                      <strong>Saran:</strong> {loginError.hint}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-bold text-[#3C3365] uppercase tracking-wider mb-1.5">
                Email / Username
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (loginError) setLoginError(null);
                }}
                onBlur={(e) => setEmail(e.target.value.trim())}
                placeholder="Masukkan username atau email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                autoComplete="username"
                inputMode="email"
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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (loginError) setLoginError(null);
                  }}
                  placeholder="••••••••••••"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="current-password"
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
