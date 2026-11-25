import React, { useState } from 'react';
import {
  ShieldAlert,
  KeyRound,
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import ArveaLogo from './ArveaLogo';

const DEFAULT_BLOCKED_PASSWORDS = ['bummamekarsari2026!', 'bumma123!', 'admin123', 'arvea2026!', 'arvea123'];

export default function FirstTimePasswordGuard({
  user,
  users = [],
  onCompleteChange,
  onLogout
}) {
  const [newUsername, setNewUsername] = useState(user?.username || user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedUsername = newUsername.trim().toLowerCase();
  const trimmedPwd = newPassword.trim();
  const trimmedConfirm = confirmPassword.trim();

  const isLengthOk = trimmedPwd.length >= 8;
  const isNotDefault =
    trimmedPwd.length > 0 && !DEFAULT_BLOCKED_PASSWORDS.includes(trimmedPwd.toLowerCase());
  const isMatch = trimmedPwd.length > 0 && trimmedPwd === trimmedConfirm;
  const isUsernameValid = trimmedUsername.length >= 4 && !/\s/.test(trimmedUsername);

  const canSubmit = isLengthOk && isNotDefault && isMatch && isUsernameValid && !isSubmitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isUsernameValid) {
      toast.error('Username minimal 4 karakter dan tidak boleh mengandung spasi.');
      return;
    }
    if (!isLengthOk) {
      toast.error('Password baru minimal harus terdiri dari 8 karakter.');
      return;
    }
    if (!isNotDefault) {
      toast.error('Password baru tidak boleh menggunakan password bawaan sistem.');
      return;
    }
    if (!isMatch) {
      toast.error('Konfirmasi password baru tidak cocok.');
      return;
    }

    // Check username uniqueness against other users
    const duplicate = users.some(
      u =>
        u.id !== user?.id &&
        (u.username || '').toLowerCase() === trimmedUsername
    );
    if (duplicate) {
      toast.error(`Username "${trimmedUsername}" sudah digunakan oleh akun lain.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onCompleteChange({
        newUsername: trimmedUsername,
        newPassword: trimmedPwd
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{
        background: 'linear-gradient(145deg, #5A4F96 0%, #8377BC 50%, #9A90CC 100%)'
      }}
    >
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl border border-[#9A90CC]/40 overflow-hidden">
        {/* Top Security Banner */}
        <div className="bg-gradient-to-r from-[#F4F1FA] to-[#EAE5F7] border-b border-[#9A90CC]/35 px-6 py-5">
          <div className="flex items-center justify-between mb-3">
            <ArveaLogo variant="horizontal" theme="lilac" size="sm" />
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider border border-amber-200">
              Proteksi Login Perdana
            </span>
          </div>
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#9A90CC]/20 border border-[#9A90CC]/40 text-[#524788] flex items-center justify-center shrink-0 shadow-xs">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-[#1E1B2E]">
                Wajib Ubah Kredensial Awal
              </h1>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Halo <strong>{user?.full_name || user?.name}</strong> ({user?.role}). Anda masuk menggunakan kata sandi awal/sementara. Demi keamanan data keuangan BUMKam, ubah kata sandi Anda terlebih dahulu sebelum mengakses menu aplikasi.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Optional New Username */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
              Username Baru <span className="text-slate-400 normal-case font-medium">(Opsional / dapat diganti)</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="misal: admin_mekarsari"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 font-mono font-semibold text-slate-900"
                required
              />
            </div>
            {!isUsernameValid && (
              <p className="text-[11px] text-rose-600 mt-1">Username minimal 4 karakter tanpa spasi.</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
              Password Baru *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showNewPwd ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 8 karakter yang kuat"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-slate-900 font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPwd(!showNewPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
              Konfirmasi Password Baru *
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirmPwd ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang password baru"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-slate-900 font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Live Security Checklist */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 space-y-1.5 text-[11px]">
            <p className="font-bold text-slate-700 mb-1">Syarat Keamanan Kredensial Baru:</p>
            <div className={`flex items-center gap-2 ${isLengthOk ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
              {isLengthOk ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 text-slate-400" />}
              <span>Minimal 8 karakter</span>
            </div>
            <div className={`flex items-center gap-2 ${isNotDefault ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
              {isNotDefault ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 text-slate-400" />}
              <span>Berbeda dari kata sandi bawaan sistem</span>
            </div>
            <div className={`flex items-center gap-2 ${isMatch ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
              {isMatch ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 text-slate-400" />}
              <span>Konfirmasi password baru cocok</span>
            </div>
          </div>

          {/* Submit + Logout */}
          <div className="pt-2 space-y-2.5">
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-3 px-4 rounded-xl bg-[#64589F] hover:bg-[#4E4380] disabled:opacity-45 disabled:cursor-not-allowed text-white font-bold shadow-md transition flex items-center justify-center gap-2 text-xs"
            >
              <KeyRound className="w-4 h-4 text-white/90" />
              {isSubmitting ? 'Menyimpan Kredensial...' : 'Simpan Kredensial & Masuk ke Dashboard'}
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition flex items-center justify-center gap-1.5 text-xs"
            >
              <LogOut className="w-3.5 h-3.5" /> Keluar &amp; Kembali ke Halaman Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
