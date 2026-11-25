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
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-[#F2EFFA] via-[#E8E2F6] to-[#DCD4F0] text-[#1E1B2E]">
      {/* Left Side: Lilac Brand Hero Panel (#9A90CC) with 2 Stacked Landscape Team Photos (Top & Bottom) */}
      <div
        className="md:w-5/12 lg:w-1/2 text-white px-6 sm:px-8 md:px-10 lg:px-12 pt-4 sm:pt-5 md:pt-6 pb-5 sm:pb-6 md:pb-7 flex flex-col justify-between relative overflow-hidden bg-[#8377BC]"
        style={{
          background: 'linear-gradient(145deg, #5F539C 0%, #8377BC 48%, #9A90CC 100%)'
        }}
      >
        {/* Background Layer (z-0): 2 Foto Tim Memanjang ke Samping (Foto 1 di Atas, Foto 2 di Bawah) — Tanpa Terpotong */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 flex flex-col justify-center pointer-events-none select-none overflow-hidden"
        >
          {/* Foto Pertama (Atas) — object-contain agar 100% seluruh anggota kiri-kanan utuh tanpa terpotong */}
          <div className="relative flex-1 w-full flex items-end justify-center overflow-hidden">
            <img
              src={`${process.env.PUBLIC_URL || ''}/assets/images/foto-bersama-1.jpg?v=3`}
              alt=""
              className="w-full h-full object-contain object-bottom opacity-[0.28] mix-blend-luminosity"
              style={{
                WebkitMaskImage:
                  'linear-gradient(to bottom, transparent 0%, black 14%, black 88%, transparent 100%)',
                maskImage:
                  'linear-gradient(to bottom, transparent 0%, black 14%, black 88%, transparent 100%)'
              }}
            />
          </div>

          {/* Foto Kedua (Bawah) — rapat di bawah foto pertama dengan transparansi lembut senada */}
          <div className="relative flex-1 w-full flex items-start justify-center overflow-hidden">
            <img
              src={`${process.env.PUBLIC_URL || ''}/assets/images/foto-bersama-2.jpg`}
              alt=""
              className="w-full h-full object-contain object-top opacity-[0.28] mix-blend-luminosity"
              style={{
                WebkitMaskImage:
                  'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
                maskImage:
                  'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)'
              }}
            />
          </div>
        </div>

        {/* Overlay Tint Ungu Lilac (z-0): Menjaga warna tema ungu lilac tetap dominan & tulisan putih kontras tajam */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(145deg, rgba(84, 71, 148, 0.46) 0%, rgba(131, 119, 188, 0.28) 50%, rgba(154, 144, 204, 0.42) 100%)'
          }}
        />

        <div className="absolute inset-0 z-0 pointer-events-none">
          <SectorBackground variant="dark" />
        </div>
        <div className="absolute top-1/4 left-1/4 z-0 w-96 h-96 bg-white/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div
          className="absolute bottom-10 right-10 z-0 w-80 h-80 bg-[#C4B9E5]/25 rounded-full blur-3xl pointer-events-none animate-pulse-glow"
          style={{ animationDelay: '2s' }}
        />
        <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Top Brand Logo ARVÉA (dipojokkan rapi ke sebelah kiri atas) */}
        <div className="relative z-10 flex items-center justify-between gap-3 -ml-1 sm:-ml-2">
          <ArveaLogo
            variant="horizontal"
            theme="light"
            size="sm"
            subtitle="Financial Management System BUMKam Mekar Sari"
          />
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs border border-white/30 text-[10px] font-extrabold text-white shrink-0">
            SAK EMKM
          </span>
        </div>

        {/* Main Hero Pitch (ruang lega di atas agar area wajah foto pertama tetap terlihat, slogan di tengah tepat di atas judul) */}
        <div className="relative z-10 mt-16 sm:mt-20 md:mt-24 mb-4 max-w-xl w-full">
          <div className="flex justify-center mb-3.5">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#4B3F82]/45 border border-white/40 text-white text-[11px] sm:text-xs font-semibold tracking-[0.05em] backdrop-blur-md shadow-sm arvea-slogan-light text-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-200 shrink-0" /> &ldquo;Satu Nilai, Satu Tujuan, Bertumbuh Bersama&rdquo;
            </div>
          </div>

          <h2 className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight text-white leading-tight mb-3 drop-shadow-sm">
            Kelola akuntansi &amp; aset BUMKam dengan akuntabel dan transparan.
          </h2>
          <p className="text-white/95 text-xs md:text-[13px] leading-relaxed mb-5 drop-shadow-xs">
            Standar pelaporan keuangan berbasis <strong>SAK EMKM</strong> terpadu, inventarisasi aset tetap &amp; operasional, jurnal penyesuaian, penggajian karyawan, dan pembukuan berpasangan digital.
          </p>

          {/* 3 Animated Sector Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-5">
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

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/30">
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

      {/* Right Side: Clean Authentication Card */}
      <div className="md:w-7/12 lg:w-1/2 p-6 md:p-10 lg:p-12 flex flex-col justify-center items-center overflow-y-auto relative z-10">
        <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-3xl border border-[#9A90CC]/35 shadow-xl p-7 sm:p-8 space-y-5">
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
