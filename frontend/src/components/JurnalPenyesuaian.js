import React, { useState, useMemo, useEffect } from 'react';
import {
  FileEdit,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Printer,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Save,
  Store,
  Briefcase,
  Building2,
  Landmark,
  Send,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { formatIDR } from './Transaksi';
import { exportToExcel } from '../utils/exportUtils';

export const AJE_UNIT_META = {
  perdagangan: {
    value: 'perdagangan',
    label: 'Unit Perdagangan',
    shortLabel: 'Perdagangan',
    badgeClass:
      'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800'
  },
  jasa: {
    value: 'jasa',
    label: 'Unit Jasa',
    shortLabel: 'Jasa',
    badgeClass:
      'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800'
  },
  kantor: {
    value: 'kantor',
    label: 'Kantor Pengelola / Umum',
    shortLabel: 'Kantor Pengelola',
    badgeClass:
      'bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800'
  }
};

export const AJE_CATEGORIES = [
  {
    value: 'Beban Penyusutan Aset Tetap',
    suggestedDebit: '5105',
    suggestedCredit: '1591'
  },
  {
    value: 'Penyesuaian Persediaan Barang Dagang Akhir',
    suggestedDebit: '5001',
    suggestedCredit: '1201'
  },
  {
    value: 'Pendapatan Diterima di Muka (Unit Jasa)',
    suggestedDebit: '2201',
    suggestedCredit: '4002'
  },
  {
    value: 'Beban yang Masih Harus Dibayar (Accrued Expense)',
    suggestedDebit: '5102',
    suggestedCredit: '2102'
  },
  {
    value: 'Penyesuaian Perlengkapan / Beban Operasional Lainnya',
    suggestedDebit: '5104',
    suggestedCredit: '1301'
  }
];

const MONTHS = [
  { value: 'all', label: 'Semua Bulan' },
  { value: '01', label: 'Januari' },
  { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Mei' },
  { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' },
  { value: '08', label: 'Agustus' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' }
];

const getEndOfMonthDate = (baseYear, baseMonth) => {
  const now = new Date();
  const y = Number(baseYear) || now.getFullYear();
  const m = Number(baseMonth) || now.getMonth() + 1;
  const lastDay = new Date(y, m, 0).getDate();
  return `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
};

export const INITIAL_ADJUSTING_JOURNALS = [
  {
    id: 'aje_seed_1',
    reference_no: 'AJE-202611-001',
    entry_date: '2026-11-30',
    unit_usaha: 'perdagangan',
    category: 'Beban Penyusutan Aset Tetap',
    description: 'Penyesuaian beban penyusutan Mesin Penetas Telur Otomatis 500 Butir November 2026',
    total_debit: 116667,
    total_credit: 116667,
    status: 'Posted',
    created_by: 'Administrator ARVEA',
    created_at: '2026-11-30T08:00:00Z',
    lines: [
      {
        id: 'ajel_1a',
        account_code: '5105',
        account_name: 'Beban Penyusutan Aset Tetap',
        debit: 116667,
        credit: 0,
        line_memo: 'Penyusutan bulanan mesin penetas telur ((7.500.000 - 500.000) / 5 thn / 12 bln)'
      },
      {
        id: 'ajel_1b',
        account_code: '1591',
        account_name: 'Akumulasi Penyusutan',
        debit: 0,
        credit: 116667,
        line_memo: 'Akumulasi penyusutan peralatan peternakan November 2026'
      }
    ]
  },
  {
    id: 'aje_seed_2',
    reference_no: 'AJE-202611-002',
    entry_date: '2026-11-30',
    unit_usaha: 'jasa',
    category: 'Pendapatan Diterima di Muka (Unit Jasa)',
    description: 'Pengakuan pendapatan sewa Gedung Serbaguna yang telah terealisasi November 2026',
    total_debit: 2000000,
    total_credit: 2000000,
    status: 'Posted',
    created_by: 'Rita Fanghoi',
    created_at: '2026-11-30T09:00:00Z',
    lines: [
      {
        id: 'ajel_2a',
        account_code: '2201',
        account_name: 'Pendapatan Diterima di Muka',
        debit: 2000000,
        credit: 0,
        line_memo: 'Reklasifikasi uang muka sewa gedung yang telah digunakan'
      },
      {
        id: 'ajel_2b',
        account_code: '4002',
        account_name: 'Pendapatan Jasa Penyewaan',
        debit: 0,
        credit: 2000000,
        line_memo: 'Pengakuan pendapatan jasa sewa gedung serbaguna'
      }
    ]
  },
  {
    id: 'aje_seed_3',
    reference_no: 'AJE-202611-003',
    entry_date: '2026-11-30',
    unit_usaha: 'kantor',
    category: 'Beban yang Masih Harus Dibayar (Accrued Expense)',
    description: 'Akrual beban listrik & utilitas Kantor Pengelola BUMKam November 2026',
    total_debit: 350000,
    total_credit: 350000,
    status: 'Draft',
    created_by: 'Rita Fanghoi',
    created_at: '2026-11-30T10:00:00Z',
    lines: [
      {
        id: 'ajel_3a',
        account_code: '5102',
        account_name: 'Beban Listrik & Air',
        debit: 350000,
        credit: 0,
        line_memo: 'Tagihan listrik kantor BUMKam periode November 2026'
      },
      {
        id: 'ajel_3b',
        account_code: '2102',
        account_name: 'Beban yang Masih Harus Dibayar',
        debit: 0,
        credit: 350000,
        line_memo: 'Utang biaya listrik kantor pengelola jatuh tempo Desember 2026'
      }
    ]
  }
];

const createEmptyLine = () => ({
  id: 'line_' + Math.random().toString(36).slice(2, 9),
  account_code: '',
  account_name: '',
  debit: '',
  credit: '',
  line_memo: ''
});

export default function JurnalPenyesuaian({
  adjustingJournals = [],
  setAdjustingJournals,
  accounts = [],
  profile = {},
  user = {},
  selectedUnit = 'all',
  selectedYear = '2026'
}) {
  // Unit Tab: 'all' | 'perdagangan' | 'jasa' | 'kantor'
  const [unitTab, setUnitTab] = useState(
    selectedUnit === 'perdagangan' || selectedUnit === 'jasa' || selectedUnit === 'kantor'
      ? selectedUnit
      : 'all'
  );

  useEffect(() => {
    if (['all', 'perdagangan', 'jasa', 'kantor'].includes(selectedUnit)) {
      setUnitTab(selectedUnit);
    }
  }, [selectedUnit]);

  // Period & Search Filters
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterYear, setFilterYear] = useState(
    selectedYear && selectedYear !== 'Semua Tahun' ? selectedYear : 'all'
  );
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (selectedYear && selectedYear !== 'Semua Tahun') {
      setFilterYear(selectedYear);
    } else {
      setFilterYear('all');
    }
  }, [selectedYear]);

  // Modals State
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [detailEntry, setDetailEntry] = useState(null);
  const [printVoucherEntry, setPrintVoucherEntry] = useState(null);

  // Multi-row Form State
  const [formHeader, setFormHeader] = useState({
    entry_date: getEndOfMonthDate(2026, 11),
    reference_no: '',
    unit_usaha: '',
    category: '',
    description: '',
    status: 'Posted'
  });
  const [formLines, setFormLines] = useState([createEmptyLine(), createEmptyLine()]);

  const availableYears = [
    'all',
    '2019', '2020', '2021', '2022', '2023', '2024',
    '2025', '2026', '2027', '2028', '2029', '2030',
    '2031', '2032', '2033', '2034', '2035'
  ];

  // Generate sequential AJE reference number (AJE-YYYYMM-NNN)
  const generateRefNumber = (dateStr, excludeId = null) => {
    const ym = (dateStr || '2026-11-30').slice(0, 7).replace('-', '');
    const prefix = `AJE-${ym}-`;
    const matchingNums = adjustingJournals
      .filter(j => j.id !== excludeId && (j.reference_no || '').startsWith(prefix))
      .map(j => parseInt((j.reference_no || '').replace(prefix, ''), 10))
      .filter(n => !isNaN(n));
    const nextSeq = (matchingNums.length > 0 ? Math.max(...matchingNums) : 0) + 1;
    return `${prefix}${String(nextSeq).padStart(3, '0')}`;
  };

  // Summary per Unit Usaha
  const unitSummary = useMemo(() => {
    const calc = (list) => ({
      count: list.length,
      postedCount: list.filter(x => x.status === 'Posted').length,
      draftCount: list.filter(x => x.status !== 'Posted').length,
      totalAmount: list.reduce((s, x) => s + Number(x.total_debit || 0), 0),
      postedAmount: list
        .filter(x => x.status === 'Posted')
        .reduce((s, x) => s + Number(x.total_debit || 0), 0)
    });

    return {
      all: calc(adjustingJournals),
      perdagangan: calc(adjustingJournals.filter(x => x.unit_usaha === 'perdagangan')),
      jasa: calc(adjustingJournals.filter(x => x.unit_usaha === 'jasa')),
      kantor: calc(adjustingJournals.filter(x => x.unit_usaha === 'kantor'))
    };
  }, [adjustingJournals]);

  // Filtered AJE List
  const filteredJournals = useMemo(() => {
    return adjustingJournals
      .filter(entry => {
        if (unitTab !== 'all' && entry.unit_usaha !== unitTab) return false;
        if (filterYear !== 'all' && !(entry.entry_date || '').startsWith(filterYear)) return false;
        if (filterMonth !== 'all' && (entry.entry_date || '').slice(5, 7) !== filterMonth) return false;
        if (filterStatus !== 'all' && entry.status !== filterStatus) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchRef = (entry.reference_no || '').toLowerCase().includes(q);
          const matchDesc = (entry.description || '').toLowerCase().includes(q);
          const matchCat = (entry.category || '').toLowerCase().includes(q);
          const matchUnit = (AJE_UNIT_META[entry.unit_usaha]?.label || '').toLowerCase().includes(q);
          const matchLine = (entry.lines || []).some(
            l =>
              (l.account_code || '').toLowerCase().includes(q) ||
              (l.account_name || '').toLowerCase().includes(q) ||
              (l.line_memo || '').toLowerCase().includes(q)
          );
          if (!matchRef && !matchDesc && !matchCat && !matchUnit && !matchLine) return false;
        }
        return true;
      })
      .sort((a, b) => (b.entry_date || '').localeCompare(a.entry_date || '') || (b.reference_no || '').localeCompare(a.reference_no || ''));
  }, [adjustingJournals, unitTab, filterYear, filterMonth, filterStatus, searchQuery]);

  // Live Balance Computation for Multi-row Form
  const formTotals = useMemo(() => {
    const totalDebit = formLines.reduce((sum, l) => sum + Math.max(0, Number(l.debit || 0)), 0);
    const totalCredit = formLines.reduce((sum, l) => sum + Math.max(0, Number(l.credit || 0)), 0);
    const diff = totalDebit - totalCredit;
    const isBalanced = totalDebit > 0 && totalCredit > 0 && totalDebit === totalCredit;
    const hasInvalidLine = formLines.some(l => {
      const d = Number(l.debit || 0);
      const k = Number(l.credit || 0);
      return !l.account_code || (d <= 0 && k <= 0) || (d > 0 && k > 0);
    });

    return {
      totalDebit,
      totalCredit,
      diff,
      absDiff: Math.abs(diff),
      isBalanced,
      hasInvalidLine
    };
  }, [formLines]);

  const canSubmit =
    Boolean(formHeader.unit_usaha) &&
    Boolean(formHeader.entry_date) &&
    Boolean(formHeader.description.trim()) &&
    formLines.length >= 2 &&
    formTotals.isBalanced &&
    !formTotals.hasInvalidLine;

  // Open New AJE Modal
  const handleOpenAdd = () => {
    const defaultYear = filterYear !== 'all' ? filterYear : (selectedYear !== 'Semua Tahun' ? selectedYear : new Date().getFullYear());
    const defaultMonth = filterMonth !== 'all' ? filterMonth : new Date().getMonth() + 1;
    const endOfMonth = getEndOfMonthDate(defaultYear, defaultMonth);

    setEditingId(null);
    setFormHeader({
      entry_date: endOfMonth,
      reference_no: generateRefNumber(endOfMonth),
      unit_usaha: unitTab !== 'all' ? unitTab : '',
      category: '',
      description: '',
      status: 'Posted'
    });
    setFormLines([createEmptyLine(), createEmptyLine()]);
    setShowFormModal(true);
  };

  // Open Edit AJE Modal
  const handleOpenEdit = (entry) => {
    setEditingId(entry.id);
    setFormHeader({
      entry_date: entry.entry_date,
      reference_no: entry.reference_no,
      unit_usaha: entry.unit_usaha || 'perdagangan',
      category: entry.category || '',
      description: entry.description || '',
      status: entry.status || 'Draft'
    });
    setFormLines(
      (entry.lines && entry.lines.length >= 2
        ? entry.lines
        : [createEmptyLine(), createEmptyLine()]
      ).map(l => ({
        id: l.id || 'line_' + Math.random().toString(36).slice(2, 9),
        account_code: l.account_code || '',
        account_name: l.account_name || '',
        debit: Number(l.debit || 0) > 0 ? Number(l.debit) : '',
        credit: Number(l.credit || 0) > 0 ? Number(l.credit) : '',
        line_memo: l.line_memo || ''
      }))
    );
    setShowFormModal(true);
  };

  // Auto-suggest Debit/Credit accounts when picking a Category preset (only if rows are still empty)
  const handleCategoryChange = (catVal) => {
    setFormHeader(prev => ({ ...prev, category: catVal }));
    const preset = AJE_CATEGORIES.find(c => c.value === catVal);
    if (!preset) return;

    const allEmpty = formLines.every(l => !l.account_code && !l.debit && !l.credit);
    if (allEmpty && formLines.length >= 2) {
      const debAcc = accounts.find(a => a.code === preset.suggestedDebit);
      const credAcc = accounts.find(a => a.code === preset.suggestedCredit);
      setFormLines(prev =>
        prev.map((line, idx) => {
          if (idx === 0 && debAcc) {
            return { ...line, account_code: debAcc.code, account_name: debAcc.name };
          }
          if (idx === 1 && credAcc) {
            return { ...line, account_code: credAcc.code, account_name: credAcc.name };
          }
          return line;
        })
      );
    }
  };

  // Line item handlers
  const handleLineAccountChange = (lineId, accCode) => {
    const matched = accounts.find(a => a.code === accCode);
    setFormLines(prev =>
      prev.map(l =>
        l.id === lineId
          ? { ...l, account_code: accCode, account_name: matched ? matched.name : '' }
          : l
      )
    );
  };

  const handleLineAmountChange = (lineId, side, rawValue) => {
    const val = rawValue === '' ? '' : Math.max(0, Number(rawValue));
    setFormLines(prev =>
      prev.map(l => {
        if (l.id !== lineId) return l;
        if (side === 'debit') {
          return { ...l, debit: val, credit: val && val > 0 ? '' : l.credit };
        }
        return { ...l, credit: val, debit: val && val > 0 ? '' : l.debit };
      })
    );
  };

  const handleLineMemoChange = (lineId, memo) => {
    setFormLines(prev => prev.map(l => (l.id === lineId ? { ...l, line_memo: memo } : l)));
  };

  const handleAddRow = () => {
    setFormLines(prev => [...prev, createEmptyLine()]);
  };

  const handleRemoveRow = (lineId) => {
    if (formLines.length <= 2) {
      toast.error('Jurnal penyesuaian minimal memiliki 2 baris akun (Debit & Kredit).');
      return;
    }
    setFormLines(prev => prev.filter(l => l.id !== lineId));
  };

  // Save Adjusting Journal Entry
  const handleSaveAJE = (e) => {
    e.preventDefault();

    if (!formHeader.unit_usaha) {
      toast.error('Unit Usaha wajib dipilih.');
      return;
    }
    if (!formHeader.description.trim()) {
      toast.error('Keterangan / deskripsi jurnal penyesuaian wajib diisi.');
      return;
    }
    if (!formTotals.isBalanced) {
      toast.error(`Jurnal belum seimbang! Selisih Debit & Kredit sebesar ${formatIDR(formTotals.absDiff)}.`);
      return;
    }
    if (formTotals.hasInvalidLine) {
      toast.error('Pastikan setiap baris telah memilih akun COA dan mengisi nominal Debit atau Kredit.');
      return;
    }

    const cleanLines = formLines.map(l => {
      const acc = accounts.find(a => a.code === l.account_code);
      return {
        id: l.id,
        account_code: l.account_code,
        account_name: acc ? acc.name : l.account_name,
        debit: Math.max(0, Number(l.debit || 0)),
        credit: Math.max(0, Number(l.credit || 0)),
        line_memo: (l.line_memo || '').trim()
      };
    });

    if (editingId) {
      const updated = adjustingJournals.map(j =>
        j.id === editingId
          ? {
              ...j,
              ...formHeader,
              total_debit: formTotals.totalDebit,
              total_credit: formTotals.totalCredit,
              lines: cleanLines,
              updated_at: new Date().toISOString()
            }
          : j
      );
      setAdjustingJournals(updated);
      toast.success(
        formHeader.status === 'Posted'
          ? `Jurnal ${formHeader.reference_no} diperbarui & diposting ke Buku Besar serta Neraca Saldo!`
          : `Draft jurnal ${formHeader.reference_no} berhasil diperbarui.`
      );
    } else {
      const newEntry = {
        id: 'aje_' + Date.now(),
        ...formHeader,
        reference_no: formHeader.reference_no.trim() || generateRefNumber(formHeader.entry_date),
        total_debit: formTotals.totalDebit,
        total_credit: formTotals.totalCredit,
        created_by: user?.name || 'Administrator',
        created_at: new Date().toISOString(),
        lines: cleanLines
      };
      setAdjustingJournals([newEntry, ...adjustingJournals]);
      toast.success(
        newEntry.status === 'Posted'
          ? `Jurnal ${newEntry.reference_no} berhasil diposting ke Buku Besar & Laporan Keuangan!`
          : `Draft jurnal ${newEntry.reference_no} berhasil disimpan.`
      );
    }

    setShowFormModal(false);
  };

  // Quick Post from Draft -> Posted
  const handlePostDraft = (entry) => {
    const td = (entry.lines || []).reduce((s, l) => s + Number(l.debit || 0), 0);
    const tc = (entry.lines || []).reduce((s, l) => s + Number(l.credit || 0), 0);
    if (td <= 0 || td !== tc) {
      toast.error('Jurnal tidak seimbang, silakan edit terlebih dahulu sebelum posting.');
      return;
    }
    setAdjustingJournals(prev =>
      prev.map(j =>
        j.id === entry.id
          ? { ...j, status: 'Posted', posted_at: new Date().toISOString() }
          : j
      )
    );
    toast.success(`Jurnal ${entry.reference_no} berstatus Posted dan langsung memperbarui Buku Besar & Neraca Saldo!`);
  };

  // Delete AJE
  const handleDeleteAJE = (entry) => {
    if (
      window.confirm(
        `Yakin ingin menghapus Jurnal Penyesuaian "${entry.reference_no}"? Jika berstatus Posted, dampaknya pada Buku Besar dan Laporan Keuangan akan dibatalkan.`
      )
    ) {
      setAdjustingJournals(prev => prev.filter(j => j.id !== entry.id));
      toast.info(`Jurnal Penyesuaian ${entry.reference_no} telah dihapus.`);
    }
  };

  // Print Individual Voucher (Bukti Memorial)
  const handlePrintVoucher = (entry) => {
    setPrintVoucherEntry(entry);
    setTimeout(() => {
      window.print();
    }, 180);
  };

  // Export Excel
  const handleExportExcel = () => {
    if (filteredJournals.length === 0) {
      toast.error('Tidak ada data jurnal penyesuaian untuk diekspor.');
      return;
    }
    const rows = [];
    filteredJournals.forEach((entry, idx) => {
      const unitLabel = AJE_UNIT_META[entry.unit_usaha]?.label || entry.unit_usaha;
      (entry.lines || []).forEach((line, lIdx) => {
        rows.push({
          No: lIdx === 0 ? idx + 1 : '',
          Tanggal: entry.entry_date,
          'No. Referensi': entry.reference_no,
          'Unit Usaha': unitLabel,
          Kategori: entry.category || '-',
          Keterangan: lIdx === 0 ? entry.description : line.line_memo || entry.description,
          'Kode Akun': line.account_code,
          'Nama Akun': line.account_name,
          'Debit (IDR)': Number(line.debit || 0),
          'Kredit (IDR)': Number(line.credit || 0),
          Status: entry.status
        });
      });
    });

    exportToExcel(rows, `Jurnal_Penyesuaian_ARVEA_${filterYear === 'all' ? 'Semua' : filterYear}`, 'Jurnal Penyesuaian');
    toast.success('File Excel Jurnal Penyesuaian berhasil diunduh!');
  };

  const handleResetFilters = () => {
    setFilterMonth('all');
    setFilterYear('all');
    setFilterStatus('all');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* PRINTABLE SINGLE VOUCHER VIEW (BUKTI MEMORIAL JURNAL PENYESUAIAN) */}
      {printVoucherEntry && (
        <div className="hidden print:block p-2 text-slate-900">
          <div className="mb-4 pb-3 border-b-2 border-slate-900 text-center kop-surat">
            <h2 className="text-base font-black uppercase tracking-wide">ARVEA &bull; BUMKAM MEKAR SARI</h2>
            <p className="text-[11px] font-semibold">Financial Management System &bull; Standar SAK EMKM</p>
            <p className="text-[10px] text-slate-600">Kampung Sabron Sari, Distrik Sentani Barat, Kabupaten Jayapura, Papua</p>
            <h3 className="text-xs font-black uppercase mt-2 underline">BUKTI MEMORIAL / JURNAL PENYESUAIAN (AJE)</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px] mb-4 border border-slate-300 p-3 rounded">
            <div>
              <p><strong>No. Referensi:</strong> {printVoucherEntry.reference_no}</p>
              <p><strong>Tanggal:</strong> {printVoucherEntry.entry_date}</p>
              <p><strong>Unit Usaha:</strong> {AJE_UNIT_META[printVoucherEntry.unit_usaha]?.label || printVoucherEntry.unit_usaha}</p>
            </div>
            <div>
              <p><strong>Kategori:</strong> {printVoucherEntry.category || '-'}</p>
              <p><strong>Status:</strong> {printVoucherEntry.status}</p>
              <p><strong>Keterangan:</strong> {printVoucherEntry.description}</p>
            </div>
          </div>

          <table className="w-full text-left text-xs border-collapse mb-4">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-2 border border-slate-300">Kode Akun</th>
                <th className="p-2 border border-slate-300">Nama Akun (COA)</th>
                <th className="p-2 border border-slate-300">Keterangan Baris</th>
                <th className="p-2 border border-slate-300 text-right">Debit (IDR)</th>
                <th className="p-2 border border-slate-300 text-right">Kredit (IDR)</th>
              </tr>
            </thead>
            <tbody>
              {(printVoucherEntry.lines || []).map((l, i) => (
                <tr key={i}>
                  <td className="p-2 border border-slate-300 font-mono">{l.account_code}</td>
                  <td className="p-2 border border-slate-300 font-bold">{l.account_name}</td>
                  <td className="p-2 border border-slate-300">{l.line_memo || '-'}</td>
                  <td className="p-2 border border-slate-300 text-right font-mono">{l.debit > 0 ? formatIDR(l.debit) : '-'}</td>
                  <td className="p-2 border border-slate-300 text-right font-mono">{l.credit > 0 ? formatIDR(l.credit) : '-'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold bg-slate-100">
                <td colSpan="3" className="p-2 border border-slate-300 text-right uppercase">Total Seimbang</td>
                <td className="p-2 border border-slate-300 text-right font-mono">{formatIDR(printVoucherEntry.total_debit)}</td>
                <td className="p-2 border border-slate-300 text-right font-mono">{formatIDR(printVoucherEntry.total_credit)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="flex justify-between items-center mt-8 pt-4 text-xs signature-block">
            <div className="text-center">
              <p className="text-[10px] text-slate-600">Mengetahui &amp; Menyetujui,</p>
              <p className="font-bold">Direktur BUMKam Mekar Sari</p>
              <div className="h-14" />
              <p className="font-bold underline">{profile.director || 'Eko L Wibowo'}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-600">Disiapkan oleh,</p>
              <p className="font-bold">Bendahara / Akuntansi BUMKam</p>
              <div className="h-14" />
              <p className="font-bold underline">{profile.treasurer || 'Rita Fanghoi'}</p>
            </div>
          </div>
        </div>
      )}

      {/* MAIN SCREEN CONTENT (HIDDEN IF PRINTING SINGLE VOUCHER) */}
      <div className={`space-y-6 ${printVoucherEntry ? 'print:hidden' : ''}`}>
        {/* 1. HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                ADJUSTING JOURNAL ENTRIES (AJE)
              </span>
              <span className="text-xs text-slate-400 font-medium">SAK EMKM Multi-Unit &amp; Konsolidasi</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Jurnal Penyesuaian (Akhir Periode)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Pencatatan penyusutan, persediaan akhir, pendapatan diterima di muka, dan akrual beban per unit usaha yang langsung terintegrasi ke Buku Besar &amp; Neraca Saldo Setelah Penyesuaian.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Excel
            </button>

            <button
              onClick={() => {
                setPrintVoucherEntry(null);
                setTimeout(() => window.print(), 100);
              }}
              className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4 text-slate-500" /> Cetak Rekap
            </button>

            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-[#0a3a2a] hover:bg-[#06291d] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Tambah Jurnal Penyesuaian
            </button>
          </div>
        </div>

        {/* 2. SUMMARY CARDS PER UNIT USAHA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
          <button
            type="button"
            onClick={() => setUnitTab('all')}
            className={`text-left rounded-2xl border p-4 transition shadow-xs ${
              unitTab === 'all'
                ? 'bg-slate-900 dark:bg-slate-800 border-slate-900 dark:border-emerald-600 text-white ring-2 ring-emerald-500/30'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-extrabold uppercase tracking-wider ${unitTab === 'all' ? 'text-emerald-300' : 'text-slate-400'}`}>
                Konsolidasi (Semua Unit)
              </span>
              <Building2 className={`w-4 h-4 ${unitTab === 'all' ? 'text-emerald-300' : 'text-slate-400'}`} />
            </div>
            <p className={`text-base font-black mt-1 font-mono ${unitTab === 'all' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              {formatIDR(unitSummary.all.totalAmount)}
            </p>
            <p className={`text-[10px] mt-1 font-semibold ${unitTab === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
              {unitSummary.all.postedCount} Posted &bull; {unitSummary.all.draftCount} Draft
            </p>
          </button>

          <button
            type="button"
            onClick={() => setUnitTab('perdagangan')}
            className={`text-left rounded-2xl border p-4 transition shadow-xs ${
              unitTab === 'perdagangan'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/25'
                : 'bg-white dark:bg-slate-900 border-emerald-200/80 dark:border-emerald-900/50 hover:border-emerald-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Unit Perdagangan
              </span>
              <Store className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-base font-black text-slate-900 dark:text-white mt-1 font-mono">
              {formatIDR(unitSummary.perdagangan.totalAmount)}
            </p>
            <p className="text-[10px] mt-1 font-semibold text-emerald-700 dark:text-emerald-300">
              {unitSummary.perdagangan.count} Jurnal ({unitSummary.perdagangan.postedCount} Posted)
            </p>
          </button>

          <button
            type="button"
            onClick={() => setUnitTab('jasa')}
            className={`text-left rounded-2xl border p-4 transition shadow-xs ${
              unitTab === 'jasa'
                ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/25'
                : 'bg-white dark:bg-slate-900 border-blue-200/80 dark:border-blue-900/50 hover:border-blue-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                Unit Jasa
              </span>
              <Briefcase className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-base font-black text-slate-900 dark:text-white mt-1 font-mono">
              {formatIDR(unitSummary.jasa.totalAmount)}
            </p>
            <p className="text-[10px] mt-1 font-semibold text-blue-700 dark:text-blue-300">
              {unitSummary.jasa.count} Jurnal ({unitSummary.jasa.postedCount} Posted)
            </p>
          </button>

          <button
            type="button"
            onClick={() => setUnitTab('kantor')}
            className={`text-left rounded-2xl border p-4 transition shadow-xs ${
              unitTab === 'kantor'
                ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-500 ring-2 ring-purple-500/25'
                : 'bg-white dark:bg-slate-900 border-purple-200/80 dark:border-purple-900/50 hover:border-purple-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                Kantor Pengelola / Umum
              </span>
              <Landmark className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-base font-black text-slate-900 dark:text-white mt-1 font-mono">
              {formatIDR(unitSummary.kantor.totalAmount)}
            </p>
            <p className="text-[10px] mt-1 font-semibold text-purple-700 dark:text-purple-300">
              {unitSummary.kantor.count} Jurnal ({unitSummary.kantor.postedCount} Posted)
            </p>
          </button>
        </div>

        {/* 3. TAB PILIHAN UNIT USAHA */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-xs print:hidden">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'Semua Unit (Konsolidasi)', icon: Building2, activeCls: 'bg-[#0a3a2a] text-white', idleCls: 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800', count: unitSummary.all.count },
              { id: 'perdagangan', label: 'Unit Perdagangan', icon: Store, activeCls: 'bg-emerald-600 text-white', idleCls: 'text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40', count: unitSummary.perdagangan.count },
              { id: 'jasa', label: 'Unit Jasa', icon: Briefcase, activeCls: 'bg-blue-600 text-white', idleCls: 'text-blue-800 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40', count: unitSummary.jasa.count },
              { id: 'kantor', label: 'Kantor Pengelola / Umum', icon: Landmark, activeCls: 'bg-purple-600 text-white', idleCls: 'text-purple-800 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40', count: unitSummary.kantor.count }
            ].map(tab => {
              const Icon = tab.icon;
              const active = unitTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setUnitTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    active ? `${tab.activeCls} shadow-xs` : tab.idleCls
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. FILTER PERIODE (BULAN & TAHUN) + SEARCH */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs print:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end text-xs">
            <div className="lg:col-span-5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cari Jurnal Penyesuaian</label>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari No. Bukti (AJE-...), keterangan, kategori, atau akun..."
                  className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Bulan</label>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200"
              >
                {MONTHS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tahun</label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200"
              >
                {availableYears.map(y => (
                  <option key={y} value={y}>{y === 'all' ? 'Semua Tahun' : y}</option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="all">Semua Status</option>
                <option value="Posted">Posted</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            <div className="lg:col-span-1">
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full py-2 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold flex items-center justify-center gap-1"
                title="Reset Filter"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 5. TABEL DAFTAR JURNAL PENYESUAIAN */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm print:border-none print:shadow-none">
          {/* Printable Recap Kop Surat */}
          <div className="hidden print:block mb-4 pb-3 border-b-2 border-slate-900 text-center kop-surat">
            <h2 className="text-base font-black uppercase text-slate-900 tracking-wide">ARVEA &bull; BUMKAM MEKAR SARI</h2>
            <p className="text-[11px] font-semibold text-slate-700">Financial Management System &bull; Standar SAK EMKM</p>
            <h3 className="text-xs font-black uppercase mt-2 text-slate-900 underline">REKAPITULASI JURNAL PENYESUAIAN (AJE)</h3>
            <p className="text-[10px] text-slate-500">
              Unit: {unitTab === 'all' ? 'Semua Unit (Konsolidasi)' : AJE_UNIT_META[unitTab]?.label} &bull; Periode: {filterMonth === 'all' ? 'Semua Bulan' : MONTHS.find(m => m.value === filterMonth)?.label} {filterYear === 'all' ? 'Semua Tahun' : filterYear}
            </p>
          </div>

          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-[11px] border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5">No. Bukti / Ref</th>
                  <th className="p-3.5">Unit Usaha</th>
                  <th className="p-3.5">Keterangan &amp; Kategori</th>
                  <th className="p-3.5 text-right">Total Nominal</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-center print:hidden">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredJournals.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-slate-400">
                      Belum ada Jurnal Penyesuaian yang sesuai filter. Klik &ldquo;+ Tambah Jurnal Penyesuaian&rdquo; untuk membuat entri baru.
                    </td>
                  </tr>
                ) : (
                  filteredJournals.map(entry => {
                    const uMeta = AJE_UNIT_META[entry.unit_usaha] || AJE_UNIT_META.kantor;
                    const isPosted = entry.status === 'Posted';
                    return (
                      <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="p-3.5 font-mono whitespace-nowrap text-slate-600 dark:text-slate-300">
                          {entry.entry_date}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {entry.reference_no}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${uMeta.badgeClass}`}>
                            {uMeta.shortLabel}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <p className="font-bold text-slate-900 dark:text-white leading-snug">{entry.description}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {entry.category || 'Penyesuaian Umum'} &bull; {(entry.lines || []).length} baris akun
                          </p>
                        </td>
                        <td className="p-3.5 text-right font-mono font-black text-slate-900 dark:text-white whitespace-nowrap">
                          {formatIDR(entry.total_debit)}
                        </td>
                        <td className="p-3.5 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            isPosted
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {isPosted ? <CheckCircle2 className="w-3 h-3" /> : <FileEdit className="w-3 h-3" />}
                            {entry.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-center whitespace-nowrap print:hidden">
                          <div className="flex items-center justify-center gap-1">
                            {!isPosted && (
                              <button
                                onClick={() => handlePostDraft(entry)}
                                className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition flex items-center gap-1"
                                title="Posting ke Buku Besar & Neraca Saldo"
                              >
                                <Send className="w-3 h-3" /> Post
                              </button>
                            )}
                            <button
                              onClick={() => setDetailEntry(entry)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition"
                              title="Detail Baris Akun"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(entry)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 transition"
                              title="Edit Jurnal Penyesuaian"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handlePrintVoucher(entry)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 text-slate-600 hover:text-blue-700 transition"
                              title="Cetak Bukti Memorial"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAJE(entry)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-100 text-slate-600 hover:text-red-600 transition"
                              title="Hapus Jurnal"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        </div>
      </div>

      {/* 6. MODAL FORM INPUT / EDIT JURNAL PENYESUAIAN (MULTI-ROW) */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileEdit className="w-5 h-5 text-emerald-600" />
                {editingId ? 'Edit Jurnal Penyesuaian (AJE)' : 'Tambah Jurnal Penyesuaian (AJE)'}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAJE} className="space-y-5 mt-4 text-xs">
              {/* HEADER FORM */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Transaksi (Akhir Bulan) *
                  </label>
                  <input
                    type="date"
                    value={formHeader.entry_date}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setFormHeader(prev => ({
                        ...prev,
                        entry_date: newDate,
                        reference_no: editingId ? prev.reference_no : generateRefNumber(newDate)
                      }));
                    }}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    No. Bukti / Referensi (Otomatis) *
                  </label>
                  <input
                    type="text"
                    value={formHeader.reference_no}
                    onChange={(e) => setFormHeader(prev => ({ ...prev, reference_no: e.target.value }))}
                    placeholder="AJE-202611-001"
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-emerald-700 dark:text-emerald-400"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Unit Usaha *
                  </label>
                  <select
                    value={formHeader.unit_usaha}
                    onChange={(e) => setFormHeader(prev => ({ ...prev, unit_usaha: e.target.value }))}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    required
                  >
                    <option value="">-- Pilih Unit Usaha --</option>
                    <option value="perdagangan">Unit Perdagangan</option>
                    <option value="jasa">Unit Jasa</option>
                    <option value="kantor">Kantor Pengelola / Umum</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori Penyesuaian (Opsional &mdash; Preset Akun)
                  </label>
                  <select
                    value={formHeader.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                  >
                    <option value="">-- Pilih Kategori Penyesuaian (Opsional) --</option>
                    {AJE_CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.value}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status Jurnal *
                  </label>
                  <select
                    value={formHeader.status}
                    onChange={(e) => setFormHeader(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  >
                    <option value="Posted">Posted (Langsung ke Buku Besar)</option>
                    <option value="Draft">Draft (Simpan Sementara)</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Keterangan / Deskripsi Penyesuaian *
                  </label>
                  <input
                    type="text"
                    value={formHeader.description}
                    onChange={(e) => setFormHeader(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Contoh: Penyesuaian beban penyusutan mesin penetas telur November 2026"
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                    required
                  />
                </div>
              </div>

              {/* TABEL BARIS AKUN (MULTI-ROW DEBIT & KREDIT) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                    Rincian Baris Akun (Double-Entry Debit &amp; Kredit)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-bold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Baris
                  </button>
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase text-[10px] font-extrabold">
                      <tr>
                        <th className="p-2.5 min-w-[210px]">Akun (COA) *</th>
                        <th className="p-2.5 min-w-[140px] text-right">Debit (Rp)</th>
                        <th className="p-2.5 min-w-[140px] text-right">Kredit (Rp)</th>
                        <th className="p-2.5 min-w-[180px]">Keterangan Baris</th>
                        <th className="p-2.5 w-10 text-center">Hapus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {formLines.map((line, idx) => (
                        <tr key={line.id} className="bg-white dark:bg-slate-900">
                          <td className="p-2">
                            <select
                              value={line.account_code}
                              onChange={(e) => handleLineAccountChange(line.id, e.target.value)}
                              className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-xs"
                              required
                            >
                              <option value="">-- Pilih Akun Baris #{idx + 1} --</option>
                              {accounts.map(acc => (
                                <option key={acc.code} value={acc.code}>
                                  [{acc.code}] {acc.name} ({acc.category})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              value={line.debit}
                              onChange={(e) => handleLineAmountChange(line.id, 'debit', e.target.value)}
                              placeholder="0"
                              className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              value={line.credit}
                              onChange={(e) => handleLineAmountChange(line.id, 'credit', e.target.value)}
                              placeholder="0"
                              className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-right font-mono font-bold text-blue-700 dark:text-blue-400"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={line.line_memo}
                              onChange={(e) => handleLineMemoChange(line.id, e.target.value)}
                              placeholder="Catatan rincian baris..."
                              className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(line.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                              title="Hapus Baris"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* VALIDASI KESEIMBANGAN (WAJIB BALANCE) */}
                <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  formTotals.isBalanced
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                }`}>
                  <div className="flex flex-wrap items-center gap-4 font-mono">
                    <div>
                      <span className="text-[10px] font-sans font-bold uppercase text-slate-500 block">Total Debit</span>
                      <strong className="text-sm text-emerald-800 dark:text-emerald-300">{formatIDR(formTotals.totalDebit)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-sans font-bold uppercase text-slate-500 block">Total Kredit</span>
                      <strong className="text-sm text-blue-800 dark:text-blue-300">{formatIDR(formTotals.totalCredit)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-sans font-bold uppercase text-slate-500 block">Selisih</span>
                      <strong className={`text-sm ${formTotals.absDiff === 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-400'}`}>
                        {formatIDR(formTotals.absDiff)}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 font-extrabold text-xs">
                    {formTotals.isBalanced ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-800 dark:text-emerald-300">SEIMBANG (BALANCED)</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span className="text-rose-700 dark:text-rose-300">
                          {formTotals.totalDebit === 0 && formTotals.totalCredit === 0
                            ? 'Isi nominal Debit & Kredit terlebih dahulu'
                            : 'BELUM SEIMBANG — Total Debit harus sama dengan Total Kredit'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="px-5 py-2 rounded-xl bg-[#0a3a2a] hover:bg-[#06291d] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold flex items-center gap-1.5 shadow transition"
                >
                  <Save className="w-4 h-4 text-emerald-300" />
                  {formHeader.status === 'Posted' ? 'Simpan & Posting Jurnal' : 'Simpan sebagai Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL DETAIL JURNAL PENYESUAIAN */}
      {detailEntry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[88vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileEdit className="w-4 h-4 text-emerald-600" />
                  Detail Bukti Memorial: {detailEntry.reference_no}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{detailEntry.entry_date} &bull; {detailEntry.category || 'Penyesuaian Umum'}</p>
              </div>
              <button onClick={() => setDetailEntry(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 block">Unit Usaha</span>
                  <span className={`inline-flex mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${(AJE_UNIT_META[detailEntry.unit_usaha] || AJE_UNIT_META.kantor).badgeClass}`}>
                    {(AJE_UNIT_META[detailEntry.unit_usaha] || AJE_UNIT_META.kantor).label}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Status Posting</span>
                  <span className={`inline-flex mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    detailEntry.status === 'Posted'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {detailEntry.status}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-400 block">Keterangan</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{detailEntry.description}</p>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-2.5">Akun</th>
                      <th className="p-2.5">Keterangan Baris</th>
                      <th className="p-2.5 text-right">Debit</th>
                      <th className="p-2.5 text-right">Kredit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(detailEntry.lines || []).map((l, i) => (
                      <tr key={i}>
                        <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">
                          <span className="font-mono text-emerald-700 dark:text-emerald-400 mr-1.5">[{l.account_code}]</span>
                          {l.account_name}
                        </td>
                        <td className="p-2.5 text-slate-500">{l.line_memo || '-'}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {l.debit > 0 ? formatIDR(l.debit) : '-'}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-blue-700 dark:text-blue-400">
                          {l.credit > 0 ? formatIDR(l.credit) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 dark:bg-slate-800/80 font-extrabold border-t border-slate-200 dark:border-slate-700">
                    <tr>
                      <td colSpan="2" className="p-2.5 text-right uppercase text-[10px]">Total Seimbang</td>
                      <td className="p-2.5 text-right font-mono text-emerald-700 dark:text-emerald-400">{formatIDR(detailEntry.total_debit)}</td>
                      <td className="p-2.5 text-right font-mono text-blue-700 dark:text-blue-400">{formatIDR(detailEntry.total_credit)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => handlePrintVoucher(detailEntry)}
                className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Cetak Bukti Memorial
              </button>
              <button
                type="button"
                onClick={() => setDetailEntry(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
