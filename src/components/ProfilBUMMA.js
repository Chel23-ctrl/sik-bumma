import React, { useState } from 'react';
import { toast } from 'sonner';

export default function ProfilBUMMA({ profile, setProfile }) {
  const [pForm, setPForm] = useState({ ...profile });

  const handleSave = (e) => {
    e.preventDefault();
    setProfile({ ...pForm });
    toast.success('Profil BUMKam berhasil diperbarui!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Profil Lembaga BUMKam</h1>
        <p className="text-xs text-slate-500 mt-0.5">Identitas resmi yang tercetak pada kop surat dan laporan keuangan</p>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Singkat BUMKam</label>
            <input
              type="text"
              value={pForm.name}
              onChange={(e) => setPForm({ ...pForm, name: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
              required
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lembaga Lengkap</label>
            <input
              type="text"
              value={pForm.legalName}
              onChange={(e) => setPForm({ ...pForm, legalName: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Wilayah Adat</label>
            <input
              type="text"
              value={pForm.region}
              onChange={(e) => setPForm({ ...pForm, region: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kabupaten / Provinsi</label>
            <input
              type="text"
              value={pForm.location}
              onChange={(e) => setPForm({ ...pForm, location: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Kantor</label>
          <input
            type="text"
            value={pForm.address}
            onChange={(e) => setPForm({ ...pForm, address: e.target.value })}
            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Direktur BUMKam (Tanda Tangan Kiri)</label>
            <input
              type="text"
              value={pForm.director}
              onChange={(e) => setPForm({ ...pForm, director: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Bendahara BUMKam (Tanda Tangan Kanan)</label>
            <input
              type="text"
              value={pForm.treasurer}
              onChange={(e) => setPForm({ ...pForm, treasurer: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Bank Rekening</label>
            <input
              type="text"
              value={pForm.bankName}
              onChange={(e) => setPForm({ ...pForm, bankName: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor Rekening</label>
            <input
              type="text"
              value={pForm.bankAccount}
              onChange={(e) => setPForm({ ...pForm, bankAccount: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Atas Nama Rekening</label>
            <input
              type="text"
              value={pForm.bankHolder}
              onChange={(e) => setPForm({ ...pForm, bankHolder: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            className="bg-[#0a3a2a] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#06291d] shadow transition"
          >
            Simpan Perubahan Profil
          </button>
        </div>
      </form>
    </div>
  );
}
