import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Printer, 
  X, 
  DollarSign, 
  FileSpreadsheet, 
  Users, 
  CheckCircle2, 
  Save, 
  Building2 
} from 'lucide-react';
import { toast } from 'sonner';
import { formatIDR } from './Transaksi';
import { exportToExcel } from '../utils/exportUtils';

export default function Penggajian({
  employees = [],
  setEmployees,
  profile = {},
  transactions = [],
  setTransactions,
  selectedYear = '2026'
}) {
  const [selectedEmp, setSelectedEmp] = useState(null); // for payslip preview/modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'Karyawan Tetap' | 'Tenaga Kerja Lepas'

  const [form, setForm] = useState({
    nik: '',
    name: '',
    worker_type: 'Karyawan Tetap', // 'Karyawan Tetap' (Gaji) | 'Tenaga Kerja Lepas' (Upah)
    position: '',
    unit: 'BUMKam Mekar Sari',
    salary: '',
    allowance: '', // Tunjangan (for Tetap) or Uang Makan/Transport (for Lepas)
    notes: ''
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      nik: `9271${String(employees.length + 1).padStart(6, '0')}`,
      name: '',
      worker_type: 'Karyawan Tetap',
      position: '',
      unit: 'BUMKam Mekar Sari',
      salary: '',
      allowance: '0',
      notes: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingId(emp.id);
    setForm({
      nik: emp.nik || '',
      name: emp.name || '',
      worker_type: emp.worker_type || 'Karyawan Tetap',
      position: emp.position || '',
      unit: emp.unit || 'BUMKam Mekar Sari',
      salary: emp.salary || '',
      allowance: emp.allowance || '0',
      notes: emp.notes || ''
    });
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const sal = Number(form.salary || 0);
    const allow = Number(form.allowance || 0);

    if (!form.name.trim()) {
      toast.error('Nama karyawan / tenaga kerja tidak boleh kosong');
      return;
    }

    if (editingId) {
      setEmployees(employees.map(emp => {
        if (emp.id === editingId) {
          return {
            ...emp,
            nik: form.nik,
            name: form.name,
            worker_type: form.worker_type,
            position: form.position,
            unit: form.unit,
            salary: sal,
            allowance: allow,
            notes: form.notes
          };
        }
        return emp;
      }));
      toast.success(`Data ${form.worker_type} "${form.name}" berhasil diperbarui!`);
    } else {
      const newEmp = {
        id: 'emp_' + Date.now(),
        nik: form.nik,
        name: form.name,
        worker_type: form.worker_type,
        position: form.position,
        unit: form.unit,
        salary: sal,
        allowance: allow,
        notes: form.notes,
        status: 'Aktif'
      };
      setEmployees([...employees, newEmp]);
      toast.success(`${form.worker_type} baru "${form.name}" berhasil ditambahkan!`);
    }
    setShowModal(false);
  };

  const handleDelete = (id, name, workerType) => {
    if (window.confirm(`Yakin ingin menghapus data ${workerType || 'karyawan'} "${name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      setEmployees(employees.filter(emp => emp.id !== id));
      toast.info(`Data ${name} telah dihapus.`);
    }
  };

  // Post to Double-Entry Journals (Kas Keluar)
  const handlePostPayroll = (emp) => {
    const isTetap = (emp.worker_type || 'Karyawan Tetap') === 'Karyawan Tetap';
    const totalPay = Number(emp.salary || 0) + Number(emp.allowance || 0);
    const payLabel = isTetap ? 'Gaji Pokok & Tunjangan' : 'Upah Kerja Lepas';

    if (!window.confirm(`Posting pembayaran ${payLabel} untuk ${emp.name} sebesar ${formatIDR(totalPay)} ke Jurnal Kas Keluar?`)) return;

    const newTx = {
      id: 'tx_pay_' + Date.now(),
      number: `PAY-${new Date().getFullYear()}-${String(transactions.length + 1).padStart(4, '0')}`,
      type: 'kas_keluar',
      date: new Date().toISOString().slice(0, 10),
      unit_usaha: 'perdagangan',
      contact_name: emp.name,
      product_name: `Beban ${isTetap ? 'Gaji' : 'Upah'} - ${emp.name} (${emp.position})`,
      quantity: 1,
      price: totalPay,
      total: totalPay,
      payment_method: 'Tunai',
      contra_account: '5101',
      contra_name: isTetap ? 'Beban Gaji Karyawan Tetap' : 'Beban Upah Tenaga Kerja Lepas',
      description: `Pembayaran ${payLabel} - ${emp.name} (${emp.worker_type})`,
      created_at: new Date().toISOString()
    };

    setTransactions([newTx, ...transactions]);
    toast.success(`Pembayaran ${payLabel} untuk ${emp.name} berhasil diposting ke Jurnal Kas Keluar!`);
  };

  // Export to Excel
  const handleExportExcel = () => {
    const data = filteredEmployees.map((emp, idx) => {
      const isTetap = (emp.worker_type || 'Karyawan Tetap') === 'Karyawan Tetap';
      const sal = Number(emp.salary || 0);
      const allow = Number(emp.allowance || 0);
      return {
        No: idx + 1,
        NIK: emp.nik,
        Nama: emp.name,
        'Jenis Tenaga Kerja': emp.worker_type || 'Karyawan Tetap',
        'Bentuk Pembayaran': isTetap ? 'Gaji' : 'Upah',
        Jabatan: emp.position,
        'Unit Penempatan': emp.unit,
        'Gaji Pokok / Upah Pokok (IDR)': sal,
        'Tunjangan / Insentif (IDR)': allow,
        'Total Diterima (IDR)': sal + allow,
        Status: emp.status || 'Aktif',
        Catatan: emp.notes || '-'
      };
    });

    exportToExcel(data, `Penggajian_Karyawan_BUMKam_${selectedYear}`, 'Penggajian');
    toast.success('File Excel data penggajian berhasil diunduh!');
  };

  // Filtered list
  const filteredEmployees = employees.filter(e => {
    const wType = e.worker_type || 'Karyawan Tetap';
    if (filterType !== 'all' && wType !== filterType) return false;
    return true;
  });

  const countTetap = employees.filter(e => (e.worker_type || 'Karyawan Tetap') === 'Karyawan Tetap').length;
  const countLepas = employees.filter(e => e.worker_type === 'Tenaga Kerja Lepas').length;
  const totalPayroll = employees.reduce((s, e) => s + Number(e.salary || 0) + Number(e.allowance || 0), 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              PENGGAJIAN TERPADU BUMKAM
            </span>
            <span className="text-xs text-slate-400 font-medium">SAK EMKM</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Penggajian Karyawan Tetap dan Tenaga Kerja Lepas BUMKam
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Klasifikasi resmi <strong>Karyawan Tetap</strong> (dibayar dengan <strong>Gaji</strong>) dan <strong>Tenaga Kerja Lepas</strong> (dibayar dengan <strong>Upah</strong>), dilengkapi slip resmi &amp; posting jurnal
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            title="Download Spreadsheet Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Excel
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-500" /> Cetak
          </button>
          <button
            onClick={handleOpenAdd}
            className="bg-[#0a3a2a] text-white px-4 py-2 rounded-xl text-xs font-bold shadow hover:bg-[#06291d] transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> + Tambah Tenaga Kerja
          </button>
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Karyawan Tetap (Gaji)</span>
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs">{countTetap} Orang</span>
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-2">{countTetap} Karyawan</p>
          <span className="text-[11px] text-slate-400">Pengurus struktural &amp; staf inti</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tenaga Kerja Lepas (Upah)</span>
            <span className="p-1.5 rounded-lg bg-purple-100 text-purple-800 font-bold text-xs">{countLepas} Orang</span>
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-2">{countLepas} Pekerja</p>
          <span className="text-[11px] text-slate-400">Petugas pasang tenda, panen, &amp; kebersihan</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Beban Gaji &amp; Upah</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-2">{formatIDR(totalPayroll)}</p>
          <span className="text-[11px] text-slate-400">Estimasi bulanan</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 print:hidden">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'Semua Tenaga Kerja', count: employees.length },
            { id: 'Karyawan Tetap', label: 'Karyawan Tetap (Gaji)', count: countTetap },
            { id: 'Tenaga Kerja Lepas', label: 'Tenaga Kerja Lepas (Upah)', count: countLepas }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setFilterType(t.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                filterType === t.id
                  ? 'bg-[#0a3a2a] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>{t.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                filterType === t.id ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
              }`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Printable Official Kop Surat Header */}
      <div className="hidden print:block mb-4 pb-3 border-b-2 border-slate-900 text-center kop-surat">
        <h2 className="text-base font-black uppercase text-slate-900 tracking-wide">ARVEA &bull; BUMKAM MEKAR SARI</h2>
        <p className="text-[11px] font-semibold text-slate-700">Financial Management System &bull; Standar SAK EMKM</p>
        <p className="text-[10px] text-slate-500">Kampung Sabron Sari, Distrik Sentani Barat, Kabupaten Jayapura, Papua</p>
        <h3 className="text-xs font-black uppercase mt-2 text-slate-900 underline">DAFTAR REKAPITULASI PENGGAJIAN &amp; UPAH KERJA</h3>
        <p className="text-[10px] text-slate-500">Tahun Buku: {selectedYear} &bull; Total Beban Gaji/Upah: {formatIDR(totalPayroll)} &bull; Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Table with Edit and Hapus */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm print:border-none print:shadow-none">
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-[11px] border-b border-slate-200 dark:border-slate-700 print:text-[7pt]">
              <tr>
                <th className="p-3.5 print:p-1">NIK</th>
                <th className="p-3.5 print:p-1">Nama Tenaga Kerja</th>
                <th className="p-3.5 print:p-1 text-center">Klasifikasi</th>
                <th className="p-3.5 print:p-1">Jabatan / Peran</th>
                <th className="p-3.5 print:p-1">Unit Penempatan</th>
                <th className="p-3.5 print:p-1 text-right">Gaji / Upah Pokok</th>
                <th className="p-3.5 print:p-1 text-right">Tunjangan</th>
                <th className="p-3.5 print:p-1 text-right">Total Diterima</th>
                <th className="p-3.5 print:p-1 text-center print:hidden">Aksi (Slip / Edit / Hapus / Posting)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-10 text-slate-400 print:py-4">
                    Belum ada data tenaga kerja. Klik "+ Tambah Tenaga Kerja" untuk menginput data.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(emp => {
                  const isTetap = (emp.worker_type || 'Karyawan Tetap') === 'Karyawan Tetap';
                  const sal = Number(emp.salary || 0);
                  const allow = Number(emp.allowance || 0);
                  const total = sal + allow;

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="p-3.5 print:p-1 font-mono text-slate-500 whitespace-nowrap print:text-[7.5pt]">{emp.nik}</td>
                      <td className="p-3.5 print:p-1 font-bold text-slate-900 dark:text-white print:text-[7.5pt] print:overflow-visible print:whitespace-normal">{emp.name}</td>
                      <td className="p-3.5 print:p-1 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold print:text-[6.5pt] ${
                          isTetap 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800' 
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                        }`}>
                          {isTetap ? 'Karyawan Tetap (Gaji)' : 'Tenaga Kerja Lepas (Upah)'}
                        </span>
                      </td>
                      <td className="p-3.5 print:p-1 font-medium print:text-[7.5pt] print:overflow-visible print:whitespace-normal">{emp.position}</td>
                      <td className="p-3.5 print:p-1 text-slate-500 print:text-[7.5pt] print:overflow-visible print:whitespace-normal">{emp.unit}</td>
                      <td className="p-3.5 print:p-1 text-right font-medium whitespace-nowrap print:text-[7.5pt]">{formatIDR(sal)}</td>
                      <td className="p-3.5 print:p-1 text-right font-medium text-slate-500 whitespace-nowrap print:text-[7.5pt]">{formatIDR(allow)}</td>
                      <td className="p-3.5 print:p-1 text-right font-black text-emerald-700 dark:text-emerald-400 whitespace-nowrap print:text-[7.5pt]">{formatIDR(total)}</td>
                      <td className="p-3.5 text-center print:hidden">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedEmp(emp)}
                            className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-lg font-bold text-[11px] transition flex items-center gap-1"
                            title={`Cetak ${isTetap ? 'Slip Gaji' : 'Slip Upah'}`}
                          >
                            <Printer className="w-3 h-3" /> Slip
                          </button>
                          <button
                            onClick={() => handleOpenEdit(emp)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 transition"
                            title="Edit Data Tenaga Kerja"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(emp.id, emp.name, emp.worker_type)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-100 text-slate-600 hover:text-red-600 transition"
                            title="Hapus Tenaga Kerja"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handlePostPayroll(emp)}
                            className="px-2 py-1 bg-[#0a3a2a] hover:bg-[#06291d] text-white rounded-lg font-bold text-[10px] transition"
                            title="Posting ke Jurnal Kas Keluar"
                          >
                            Posting
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Printable Official Signatures Block */}
        <div className="hidden print:flex justify-between items-center mt-6 pt-4 text-xs signature-block">
          <div className="text-center">
            <p className="text-[10px] text-slate-500 font-medium">Mengetahui,</p>
            <p className="font-bold text-slate-800">Direktur BUMKam</p>
            <div className="h-12"></div>
            <p className="font-bold underline text-slate-900">Eko L Wibowo</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-500 font-medium">Sentani Barat, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-bold text-slate-800">Bendahara BUMKam</p>
            <div className="h-12"></div>
            <p className="font-bold underline text-slate-900">Rita Fanghoi</p>
          </div>
        </div>
      </div>

      {/* MODAL INPUT & EDIT KARYAWAN */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                {editingId ? 'Edit Data Tenaga Kerja BUMKam' : 'Tambah Tenaga Kerja Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 mt-4 text-xs">
              {/* KLASIFIKASI: KARYAWAN TETAP (GAJI) VS TENAGA KERJA LEPAS (UPAH) */}
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <label className="block font-bold text-emerald-900 dark:text-emerald-200 mb-1.5">
                  Klasifikasi Hubungan Kerja *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Karyawan Tetap', label: 'Karyawan Tetap', pay: 'Dibayar via Gaji' },
                    { id: 'Tenaga Kerja Lepas', label: 'Tenaga Kerja Lepas', pay: 'Dibayar via Upah' }
                  ].map(k => (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => setForm({ ...form, worker_type: k.id })}
                      className={`p-2.5 rounded-lg border text-left transition ${
                        form.worker_type === k.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <p className="font-bold text-xs">{k.label}</p>
                      <p className={`text-[10px] ${form.worker_type === k.id ? 'text-emerald-100' : 'text-slate-400'}`}>{k.pay}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor Induk Kependudukan (NIK) *</label>
                <input
                  type="text"
                  value={form.nik}
                  onChange={(e) => setForm({ ...form, nik: e.target.value })}
                  placeholder="Contoh: 9271000005"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap Tenaga Kerja *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Contoh: Lukas Wenda"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jabatan / Peran</label>
                  <input
                    type="text"
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    placeholder="Contoh: Staf Logistik Kandang"
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Unit Penempatan</label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value="BUMKam Mekar Sari">Kantor Pusat BUMKam</option>
                    <option value="Unit Perdagangan & Peternakan">Unit Peternakan &amp; Perdagangan</option>
                    <option value="Unit Jasa Penyewaan">Unit Jasa Penyewaan Tenda/Gedung</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {form.worker_type === 'Karyawan Tetap' ? 'Gaji Pokok (IDR) *' : 'Upah Kerja Pokok (IDR) *'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    placeholder="Contoh: 3500000"
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {form.worker_type === 'Karyawan Tetap' ? 'Tunjangan (IDR)' : 'Insentif / Uang Makan (IDR)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.allowance}
                    onChange={(e) => setForm({ ...form, allowance: e.target.value })}
                    placeholder="Contoh: 500000"
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0a3a2a] hover:bg-[#06291d] text-white font-bold flex items-center gap-1.5 shadow"
                >
                  <Save className="w-4 h-4 text-emerald-300" /> Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CETAK SLIP GAJI / SLIP UPAH DENGAN TANDA TANGAN RESMI */}
      {selectedEmp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 print:fixed print:inset-0 print:bg-white print:z-[9999] print:p-6 print:flex print:items-center print:justify-center">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-xs print:border-none print:shadow-none print:p-0 print:max-w-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 print:hidden">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pratinjau {selectedEmp.worker_type === 'Karyawan Tetap' ? 'Slip Gaji Karyawan Tetap' : 'Slip Upah Tenaga Kerja Lepas'}
              </span>
              <button onClick={() => setSelectedEmp(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            {/* SLIP CONTAINER (PRINTABLE) */}
            <div className="mt-4 p-5 sm:p-6 border-2 border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/60 space-y-4 print:border-2 print:border-slate-900 print:bg-white print:p-6">
              {/* Header Slip */}
              <div className="text-center pb-3 border-b-2 border-slate-300 dark:border-slate-700">
                <h3 className="font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">BUMKAM MEKAR SARI</h3>
                <p className="text-[10px] text-slate-500 font-medium">Kampung Sabron Sari, Distrik Sentani Barat, Kabupaten Jayapura, Papua</p>
                <div className="mt-2 inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-[11px] uppercase tracking-wider">
                  {selectedEmp.worker_type === 'Karyawan Tetap' ? 'SLIP GAJI KARYAWAN TETAP' : 'SLIP UPAH TENAGA KERJA LEPAS'}
                </div>
              </div>

              {/* Data Karyawan */}
              <div className="grid grid-cols-2 gap-2 text-[11px] border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-slate-400 block text-[10px]">Nama Lengkap</span>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedEmp.name}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">NIK</span>
                  <p className="font-mono font-semibold">{selectedEmp.nik}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Jabatan / Peran</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedEmp.position}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Unit Penempatan</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedEmp.unit}</p>
                </div>
              </div>

              {/* Rincian Penghasilan */}
              <div className="space-y-1.5 py-1">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">
                    {selectedEmp.worker_type === 'Karyawan Tetap' ? 'Gaji Pokok Bulanan' : 'Upah Pokok Pekerjaan'}
                  </span>
                  <span className="font-bold">{formatIDR(selectedEmp.salary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">
                    {selectedEmp.worker_type === 'Karyawan Tetap' ? 'Tunjangan Kinerja / Jabatan' : 'Uang Makan / Transport'}
                  </span>
                  <span className="font-bold">{formatIDR(selectedEmp.allowance || 0)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 font-black text-sm text-emerald-800 dark:text-emerald-300">
                  <span>TOTAL PENGHASILAN DITERIMA</span>
                  <span>{formatIDR(Number(selectedEmp.salary || 0) + Number(selectedEmp.allowance || 0))}</span>
                </div>
              </div>

              {/* Tanda Tangan Resmi */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4 text-center text-[10px]">
                <div>
                  <p className="text-slate-500">Mengetahui,</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Bendahara BUMKam</p>
                  <div className="h-10"></div>
                  <p className="font-black underline text-slate-900 dark:text-white">{profile.treasurer || 'Rita Fanghoi'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Penerima,</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{selectedEmp.worker_type}</p>
                  <div className="h-10"></div>
                  <p className="font-black underline text-slate-900 dark:text-white">{selectedEmp.name}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 print:hidden">
              <button
                onClick={() => setSelectedEmp(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-[#0a3a2a] hover:bg-[#06291d] text-white font-bold rounded-xl flex items-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" /> Cetak Slip Ini
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
