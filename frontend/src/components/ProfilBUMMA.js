import React, { useState, useEffect } from 'react';
import { Lock, FileText, Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { USER_ROLES, normalizeRole } from '../utils/permissions';

export default function ProfilBUMMA({ profile, setProfile, readOnly = false, userRole }) {
  const [pForm, setPForm] = useState({ ...profile });
  const normalizedRole = userRole ? normalizeRole(userRole) : null;
  const isReadOnly = Boolean(
    readOnly ||
      normalizedRole === USER_ROLES.AUDITOR ||
      normalizedRole === USER_ROLES.UMUM
  );
  const documents = Array.isArray(profile?.documents) ? profile.documents : [];

  useEffect(() => {
    setPForm({ ...profile });
  }, [profile]);

  const updateField = (field, value) => {
    if (isReadOnly) return;
    setPForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (isReadOnly) {
      const msg =
        normalizedRole === USER_ROLES.AUDITOR
          ? 'Role Auditor hanya memiliki hak akses baca pada Profil BUMKam.'
          : 'Mode Read-Only: Peran Anda hanya dapat melihat Profil BUMKam dan tidak diizinkan mengubah data.';
      toast.error(msg);
      return;
    }
    setProfile({ ...pForm });
    toast.success('Profil BUMKam berhasil diperbarui!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Profil Lembaga BUMKam</h1>
          <p className="text-xs text-slate-500 mt-0.5">Identitas resmi yang tercetak pada kop surat dan laporan keuangan</p>
        </div>
        {isReadOnly && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-bold">
            <Lock className="w-3.5 h-3.5" /> Mode Lihat Saja (Read-Only)
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 text-xs">
        <fieldset disabled={isReadOnly} className="space-y-4 border-0 p-0 m-0 disabled:[&_input]:bg-slate-50 disabled:[&_input]:dark:bg-slate-800/60 disabled:[&_input]:cursor-not-allowed disabled:[&_input]:text-slate-700 disabled:[&_input]:dark:text-slate-300">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
          <div>
            <label className="block font-bold text-emerald-900 dark:text-emerald-300 mb-1">Nama Aplikasi / Sistem</label>
            <input
              type="text"
              readOnly={isReadOnly}
              value={pForm.systemName || 'ARVÉA'}
              onChange={(e) => updateField('systemName', e.target.value)}
              className="w-full p-2.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 font-extrabold text-emerald-800 dark:text-emerald-300"
              required
            />
          </div>
          <div>
            <label className="block font-bold text-emerald-900 dark:text-emerald-300 mb-1">Slogan / Tagline Resmi</label>
            <input
              type="text"
              readOnly={isReadOnly}
              value={pForm.tagline || 'Satu Nilai, Satu Tujuan, Bertumbuh Bersama'}
              onChange={(e) => updateField('tagline', e.target.value)}
              className="w-full p-2.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 font-semibold"
              required
            />
          </div>
          <div>
            <label className="block font-bold text-emerald-900 dark:text-emerald-300 mb-1">Standar Akuntansi</label>
            <input
              type="text"
              readOnly={isReadOnly}
              value={pForm.standard || 'SAK EMKM'}
              onChange={(e) => updateField('standard', e.target.value)}
              className="w-full p-2.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 font-bold"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Singkat BUMKam</label>
            <input
              type="text"
              readOnly={isReadOnly}
              value={pForm.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
              required
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lembaga Lengkap</label>
            <input
              type="text"
              readOnly={isReadOnly}
              value={pForm.legalName}
              onChange={(e) => updateField('legalName', e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Wilayah / Distrik</label>
            <input
              type="text"
              readOnly={isReadOnly}
              value={pForm.region}
              onChange={(e) => updateField('region', e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kabupaten / Provinsi</label>
            <input
              type="text"
              readOnly={isReadOnly}
              value={pForm.location}
              onChange={(e) => updateField('location', e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Kantor</label>
          <input
            type="text"
            readOnly={isReadOnly}
            value={pForm.address}
            onChange={(e) => updateField('address', e.target.value)}
            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Direktur BUMKam (Tanda Tangan Kiri)</label>
            <input
              type="text"
              readOnly={isReadOnly}
              value={pForm.director}
              onChange={(e) => updateField('director', e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Bendahara BUMKam (Tanda Tangan Kanan)</label>
            <input
              type="text"
              readOnly={isReadOnly}
              value={pForm.treasurer}
              onChange={(e) => updateField('treasurer', e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Bank Rekening</label>
            <input
              type="text"
              readOnly={isReadOnly}
              value={pForm.bankName}
              onChange={(e) => updateField('bankName', e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor Rekening</label>
            <input
              type="text"
              readOnly={isReadOnly}
              value={pForm.bankAccount}
              onChange={(e) => updateField('bankAccount', e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Atas Nama Rekening</label>
            <input
              type="text"
              readOnly={isReadOnly}
              value={pForm.bankHolder}
              onChange={(e) => updateField('bankHolder', e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
            />
          </div>
        </div>

        </fieldset>

        {documents.length > 0 && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <h2 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#64589F]" /> Dokumen Legalitas Terlampir (Perdes / SK Pendirian)
            </h2>
            <div className="space-y-2">
              {documents.map((doc, idx) => (
                <div
                  key={doc.id || doc.filename || idx}
                  className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {doc.title || doc.filename || `Dokumen #${idx + 1}`}
                  </span>
                  {doc.url && (
                    <div className="flex items-center gap-2">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-[#64589F] text-[#524788] dark:text-[#C4B9E5] font-bold transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Lihat
                      </a>
                      <a
                        href={doc.url}
                        download={doc.filename || true}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#64589F] hover:bg-[#4E4380] text-white font-bold transition"
                      >
                        <Download className="w-3.5 h-3.5" /> Unduh
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          {isReadOnly ? (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700">
              <Lock className="w-3.5 h-3.5 text-[#64589F]" />
              <span>Akses Read-Only: Perubahan data profil hanya dapat dilakukan oleh pengurus berwenang.</span>
            </div>
          ) : (
            <button
              type="submit"
              className="bg-[#64589F] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#4E4380] shadow transition"
            >
              Simpan Perubahan Profil
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
