import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Printer, X, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { formatIDR } from './Transaksi';

export default function Penggajian({ employees, setEmployees, profile, transactions, setTransactions }) {
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    nik: '',
    name: '',
    position: '',
    unit: 'BUMMA Mekar Sari',
    salary: ''
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      nik: `9271${String(employees.length + 1).padStart(6, '0')}`,
      name: '',
      position: '',
      unit: 'BUMMA Mekar Sari',
      salary: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingId(emp.id);
    setForm({
      nik: emp.nik || '',
      name: emp.name || '',
      position: emp.position || '',
      unit: emp.unit || 'BUMMA Mekar Sari',
      salary: emp.salary || ''
    });
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const sal = Number(form.salary || 0);
    if (!form.name.trim()) {
      toast.error('Nama karyawan tidak boleh kosong');
      return;
    }

    if (editingId) {
      setEmployees(employees.map(emp => {
        if (emp.id === editingId) {
          return {
            ...emp,
            nik: form.nik,
            name: form.name,
            position: form.position,
            unit: form.unit,
            salary: sal
          };
        }
        return emp;
      }));
      toast.success('Data pengurus/karyawan berhasil diperbarui!');
    } else {
      const newEmp = {
        id: 'emp_' + Date.now(),
        nik: form.nik,
        name: form.name,
        position: form.position,
        unit: form.unit,
        salary: sal,
        status: 'Aktif'
      };
      setEmployees([...employees, newEmp]);
      toast.success('Karyawan baru berhasil ditambahkan!');
    }
    setShowModal(false);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Yakin ingin menghapus data pengurus/karyawan "${name}"?`)) {
      setEmployees(employees.filter(emp => emp.id !== id));
      toast.info(`Data ${name} telah dihapus.`);
    }
  };

  const handlePostPayroll = (emp) => {
    if (!window.confirm(`Posting pembayaran gaji untuk ${emp.name} sebesar ${formatIDR(emp.salary)}?`)) return;

    const newTx = {
      id: 'tx_pay_' + Date.now(),
      number: `PAY-${new Date().getFullYear()}-${String(transactions.length + 1).padStart(4, '0')}`,
      type: 'kas_keluar',
      date: new Date().toISOString().slice(0, 10),
      unit_usaha: 'perdagangan',
      contact_name: emp.name,
      product_name: `Beban Gaji - ${emp.name} (${emp.position})`,
      quantity: 1,
      price: emp.salary,
      total: emp.salary,
      payment_method: 'Tunai',
      contra_account: '5101',
      contra_name: 'Beban Gaji Karyawan',
      description: `Pembayaran Gaji Bulanan - ${emp.name}`,
      created_at: new Date().toISOString()
    };

    setTransactions([newTx, ...transactions]);
    toast.success(`Gaji ${emp.name} berhasil diposting ke jurnal umum!`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Penggajian &amp; Pengurus BUMKam</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola gaji pengurus, cetak slip gaji standar, dan manfaatkan fitur <strong>Edit &amp; Hapus</strong> data pengurus
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-[#0a3a2a] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow hover:bg-[#06291d] transition flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> + Tambah Pengurus / Karyawan
        </button>
      </div>

      {/* Table with Edit and Hapus */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-[11px] border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-3.5">NIK</th>
              <th className="p-3.5">Nama Pengurus/Karyawan</th>
              <th className="p-3.5">Jabatan</th>
              <th className="p-3.5">Unit Penempatan</th>
              <th className="p-3.5 text-right">Gaji Pokok (IDR)</th>
              <th className="p-3.5 text-center">Aksi (Edit / Hapus / Slip / Jurnal)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {employees.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">
                  Belum ada data pengurus. Klik "+ Tambah Pengurus / Karyawan" untuk menginput data.
                </td>
              </tr>
            ) : (
              employees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-3.5 font-mono text-slate-500">{emp.nik}</td>
                  <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{emp.name}</td>
                  <td className="p-3.5">{emp.position}</td>
                  <td className="p-3.5">{emp.unit}</td>
                  <td className="p-3.5 text-right font-bold text-emerald-700 dark:text-emerald-400">{formatIDR(emp.salary)}</td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(emp)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 transition"
                        title="Edit Data Pengurus"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id, emp.name)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-100 text-slate-600 hover:text-red-600 transition"
                        title="Hapus Pengurus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedEmp(emp)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-[11px]"
                        title="Lihat & Cetak Slip Gaji"
                      >
                        Slip
                      </button>
                      <button
                        onClick={() => handlePostPayroll(emp)}
                        className="px-2.5 py-1 bg-[#0a3a2a] hover:bg-[#06291d] text-white rounded-lg font-semibold text-[11px]"
                        title="Posting Beban Gaji ke Jurnal Umum"
                      >
                        Posting
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL INPUT & EDIT KARYAWAN */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit Data Pengurus / Karyawan' : 'Tambah Pengurus / Karyawan Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor Induk Kependudukan (NIK)</label>
                <input
                  type="text"
                  value={form.nik}
                  onChange={(e) => setForm({ ...form, nik: e.target.value })}
                  placeholder="Contoh: 9271000005"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap &amp; Gelar</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Contoh: Lukas Wenda, S.P."
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jabatan di BUMKam</label>
                <input
                  type="text"
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  placeholder="Contoh: Staf Logistik Peternakan"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Unit Penempatan</label>
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                >
                  <option value="BUMMA Mekar Sari">Kantor Pusat BUMKam Mekar Sari</option>
                  <option value="Unit Perdagangan & Peternakan">Unit Perdagangan &amp; Peternakan</option>
                  <option value="Unit Jasa Penyewaan">Unit Jasa Penyewaan</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Gaji Pokok Bulanan (IDR)</label>
                <input
                  type="number"
                  min="0"
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  placeholder="Contoh: 3500000"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-right"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0a3a2a] text-white font-bold hover:bg-[#06291d]"
                >
                  {editingId ? 'Simpan Perubahan' : 'Tambah Karyawan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SLIP GAJI PRINTABLE */}
      {selectedEmp && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-slate-300 text-slate-900">
            <div className="text-center border-b-2 border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-extrabold uppercase">{profile.legalName || 'BUMMA MEKAR SARI'}</h3>
              <p className="text-xs text-slate-600 font-semibold">SLIP GAJI PENGURUS &amp; KARYAWAN BUMKAM</p>
              <p className="text-[10px] text-slate-500">Periode: {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
            </div>

            <div className="text-xs space-y-2 mb-6">
              <div className="flex justify-between"><span>Nama:</span><span className="font-bold">{selectedEmp.name}</span></div>
              <div className="flex justify-between"><span>NIK:</span><span className="font-mono">{selectedEmp.nik}</span></div>
              <div className="flex justify-between"><span>Jabatan:</span><span className="font-semibold">{selectedEmp.position}</span></div>
              <div className="flex justify-between"><span>Unit Penempatan:</span><span>{selectedEmp.unit}</span></div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-sm text-emerald-800">
                <span>Gaji Bersih Diterima:</span>
                <span>{formatIDR(selectedEmp.salary)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center text-[11px] pt-6 border-t border-slate-200 mb-6">
              <div>
                <p>Penerima,</p>
                <p className="mt-12 font-bold underline">{selectedEmp.name}</p>
              </div>
              <div>
                <p>Bendahara BUMKam,</p>
                <p className="mt-12 font-bold underline">{profile.treasurer || 'Rita Fanghoi'}</p>
              </div>
            </div>

            <div className="flex gap-2 print:hidden">
              <button
                onClick={() => setSelectedEmp(null)}
                className="flex-1 py-2 rounded-xl border border-slate-300 font-bold text-xs"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl bg-[#0a3a2a] text-white font-bold text-xs"
              >
                Cetak Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
