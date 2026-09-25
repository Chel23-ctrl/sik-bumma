import React, { useState, useMemo } from 'react';
import { 
  Boxes, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter, 
  RotateCcw, 
  FileSpreadsheet, 
  Printer, 
  Eye, 
  Scissors, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Save, 
  Info,
  Calendar,
  MapPin,
  User,
  Layers,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { formatIDR } from './Transaksi';
import { exportToExcel } from '../utils/exportUtils';

export const INITIAL_ASSETS = [
  {
    id: 'ast_1',
    inv_number: 'AST-0001',
    product_code: 'PRD-007',
    product_name: 'Mesin Penetas Telur Otomatis',
    category: 'Peralatan Peternakan',
    asset_type: 'Aset Tetap',
    model_type: 'Individual',
    brand: 'Inkubator Sentani Tech',
    type_name: 'Super Hatch 500',
    serial_number: 'SN-INC-2024-0089',
    qty: 1,
    unit: 'Unit',
    unit_price: 7500000,
    total_cost: 7500000,
    acq_date: '2024-03-15',
    acq_source: 'Pembelian',
    useful_life: 5,
    salvage_value: 500000,
    deprec_method: 'Garis Lurus',
    location: 'Tempat Produksi Kandang',
    department: 'Unit Perdagangan & Peternakan',
    pic: 'Yohanis Wenda',
    condition: 'Baik',
    status: 'Aktif/Digunakan',
    notes: 'Kondisi prima, digunakan untuk penetasan bibit ayam petelur lokal'
  },
  {
    id: 'ast_2',
    inv_number: 'AST-0002',
    product_code: 'PRD-008',
    product_name: 'Komputer Administrasi Kantor',
    category: 'Teknologi & Kantor',
    asset_type: 'Aset Tetap',
    model_type: 'Individual',
    brand: 'Lenovo ThinkCentre',
    type_name: 'M70s Gen 3 Core i5',
    serial_number: 'SN-LNV-2024-7712',
    qty: 1,
    unit: 'Unit',
    unit_price: 6500000,
    total_cost: 6500000,
    acq_date: '2024-01-10',
    acq_source: 'Penyertaan Modal',
    useful_life: 4,
    salvage_value: 500000,
    deprec_method: 'Garis Lurus',
    location: 'Kantor BUMKam',
    department: 'Sekretariat & Keuangan',
    pic: 'Rita Fanghoi',
    condition: 'Baik',
    status: 'Aktif/Digunakan',
    notes: 'Komputer utama pencatatan aplikasi akuntansi SAK EMKM ARVEA'
  },
  {
    id: 'ast_3',
    inv_number: 'INV-0001',
    product_code: 'PRD-010',
    product_name: 'Kursi Lipat Acara / Pesta',
    category: 'Perlengkapan Acara',
    asset_type: 'Inventaris Operasional',
    model_type: 'Kelompok',
    brand: 'Futura',
    type_name: 'Chitose Standard',
    serial_number: '-',
    qty: 150,
    unit: 'Unit',
    unit_price: 150000,
    total_cost: 22500000,
    acq_date: '2024-05-20',
    acq_source: 'Pembelian',
    useful_life: 0,
    salvage_value: 0,
    deprec_method: '-',
    location: 'Gudang Tenda & Perlengkapan',
    department: 'Unit Jasa Penyewaan',
    pic: 'Markus Krey',
    condition: 'Baik',
    status: 'Aktif/Digunakan',
    notes: '150 unit kursi sewa dalam kelompok, bersih dan siap pasang'
  },
  {
    id: 'ast_4',
    inv_number: 'INV-0002',
    product_code: 'PRD-011',
    product_name: 'Meja Persegi Acara / Pertemuan',
    category: 'Perlengkapan Acara',
    asset_type: 'Inventaris Operasional',
    model_type: 'Kelompok',
    brand: 'Olympic Adat',
    type_name: 'Meja Lipat 120x60',
    serial_number: '-',
    qty: 20,
    unit: 'Unit',
    unit_price: 450000,
    total_cost: 9000000,
    acq_date: '2024-06-12',
    acq_source: 'Pembelian',
    useful_life: 0,
    salvage_value: 0,
    deprec_method: '-',
    location: 'Gudang Tenda & Perlengkapan',
    department: 'Unit Jasa Penyewaan',
    pic: 'Markus Krey',
    condition: 'Baik',
    status: 'Aktif/Digunakan',
    notes: 'Meja operasional acara sewa warga kampung'
  }
];

export const INITIAL_ASSET_LOGS = [
  {
    id: 'log_1',
    date: '2024-01-10',
    inv_number: 'AST-0002',
    asset_name: 'Komputer Administrasi Kantor',
    action: 'Perolehan',
    notes: 'Aset diperoleh dari Penyertaan Modal BUMKam',
    user: 'Administrator'
  },
  {
    id: 'log_2',
    date: '2024-03-15',
    inv_number: 'AST-0001',
    asset_name: 'Mesin Penetas Telur Otomatis',
    action: 'Perolehan',
    notes: 'Aset dibeli untuk unit peternakan',
    user: 'Yohanis Wenda'
  },
  {
    id: 'log_3',
    date: '2024-05-20',
    inv_number: 'INV-0001',
    asset_name: 'Kursi Lipat Acara / Pesta (150 Unit)',
    action: 'Perolehan Kelompok',
    notes: 'Pencatatan awal kelompok 150 kursi sewa',
    user: 'Markus Krey'
  }
];

export default function InventarisasiAset({
  products = [],
  profile = {},
  selectedYear = '2026'
}) {
  const [assets, setAssets] = useState(() => {
    try {
      const stored = localStorage.getItem('arvea_assets');
      return stored ? JSON.parse(stored) : INITIAL_ASSETS;
    } catch (e) {
      return INITIAL_ASSETS;
    }
  });

  const [assetLogs, setAssetLogs] = useState(() => {
    try {
      const stored = localStorage.getItem('arvea_asset_logs');
      return stored ? JSON.parse(stored) : INITIAL_ASSET_LOGS;
    } catch (e) {
      return INITIAL_ASSET_LOGS;
    }
  });

  // Save to localStorage
  const saveAssets = (newAssets) => {
    setAssets(newAssets);
    try { localStorage.setItem('arvea_assets', JSON.stringify(newAssets)); } catch (e) {}
  };

  const saveLogs = (newLogs) => {
    setAssetLogs(newLogs);
    try { localStorage.setItem('arvea_asset_logs', JSON.stringify(newLogs)); } catch (e) {}
  };

  // View Mode: 'list' | 'logs'
  const [activeTab, setActiveTab] = useState('list');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'Aset Tetap' | 'Inventaris Operasional'
  const [filterModel, setFilterModel] = useState('all'); // 'all' | 'Individual' | 'Kelompok'
  const [filterCondition, setFilterCondition] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(null);
  const [showSplitModal, setShowSplitModal] = useState(null);
  const [editingAssetId, setEditingAssetId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    asset_type: 'Aset Tetap',
    model_type: 'Individual',
    product_id: '',
    inv_number: '',
    product_code: '',
    product_name: '',
    category: '',
    unit: 'Unit',
    brand: '',
    type_name: '',
    serial_number: '',
    qty: 1,
    unit_price: 0,
    total_cost: 0,
    acq_date: new Date().toISOString().slice(0, 10),
    acq_source: 'Pembelian',
    useful_life: 5,
    salvage_value: 0,
    deprec_method: 'Garis Lurus',
    location: 'Kantor BUMKam',
    department: 'Unit Perdagangan & Peternakan',
    pic: '',
    condition: 'Baik',
    status: 'Aktif/Digunakan',
    notes: ''
  });

  // Split Form State
  const [splitQty, setSplitQty] = useState(1);

  // Straight-line Depreciation Calculator
  const calculateDepreciation = (asset) => {
    if (asset.asset_type !== 'Aset Tetap' || !asset.useful_life || asset.useful_life <= 0) {
      return {
        annualDeprec: 0,
        accumDeprec: 0,
        bookValue: asset.total_cost || 0
      };
    }

    const cost = Number(asset.total_cost || 0);
    const salvage = Number(asset.salvage_value || 0);
    const life = Number(asset.useful_life || 1);
    const annualDeprec = Math.max(0, (cost - salvage) / life);

    // Compute years elapsed based on acq_date and current selectedYear
    const acqYear = parseInt((asset.acq_date || '2024').slice(0, 4), 10) || 2024;
    const currentYr = parseInt(selectedYear, 10) || 2026;
    const yearsElapsed = Math.max(0, currentYr - acqYear);

    const accumDeprec = Math.min(cost - salvage, annualDeprec * yearsElapsed);
    const bookValue = Math.max(salvage, cost - accumDeprec);

    return {
      annualDeprec,
      accumDeprec,
      bookValue
    };
  };

  // Summary Metrics Computation
  const summaryStats = useMemo(() => {
    let countFixed = 0;
    let countOper = 0;
    let totalAcqCost = 0;
    let totalBookVal = 0;
    let countActive = 0;
    let countDamaged = 0;

    assets.forEach(a => {
      const cost = Number(a.total_cost || 0);
      totalAcqCost += cost;

      if (a.asset_type === 'Aset Tetap') {
        countFixed += a.model_type === 'Individual' ? 1 : Number(a.qty || 1);
        const { bookValue } = calculateDepreciation(a);
        totalBookVal += bookValue;
      } else {
        countOper += Number(a.qty || 1);
        totalBookVal += cost; // Operational inventory doesn't depreciate
      }

      if (a.status === 'Aktif/Digunakan') {
        countActive += 1;
      }
      if (a.condition === 'Rusak Berat' || a.status === 'Tidak Digunakan' || a.status === 'Dalam Perbaikan') {
        countDamaged += 1;
      }
    });

    return {
      countFixed,
      countOper,
      totalAcqCost,
      totalBookVal,
      countActive,
      countDamaged,
      totalCount: assets.length
    };
  }, [assets, selectedYear]);

  // Filtered Products from Master Data based on selected asset_type
  const availableMasterProducts = useMemo(() => {
    return products.filter(p => {
      if (formData.asset_type === 'Aset Tetap') {
        return p.perlakuan === 'Aset Tetap';
      }
      if (formData.asset_type === 'Inventaris Operasional') {
        return p.perlakuan === 'Inventaris Operasional';
      }
      return false;
    });
  }, [products, formData.asset_type]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingAssetId(null);
    const nextNum = String(assets.length + 1).padStart(4, '0');
    setFormData({
      asset_type: 'Aset Tetap',
      model_type: 'Individual',
      product_id: '',
      inv_number: `AST-${nextNum}`,
      product_code: '',
      product_name: '',
      category: '',
      unit: 'Unit',
      brand: '',
      type_name: '',
      serial_number: '',
      qty: 1,
      unit_price: 0,
      total_cost: 0,
      acq_date: new Date().toISOString().slice(0, 10),
      acq_source: 'Pembelian',
      useful_life: 5,
      salvage_value: 0,
      deprec_method: 'Garis Lurus',
      location: 'Kantor BUMKam',
      department: 'Unit Perdagangan & Peternakan',
      pic: '',
      condition: 'Baik',
      status: 'Aktif/Digunakan',
      notes: ''
    });
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (ast) => {
    setEditingAssetId(ast.id);
    setFormData({
      ...ast,
      product_id: ''
    });
    setShowAddModal(true);
  };

  // When changing Asset Type in Add form
  const handleTypeChange = (newType) => {
    const isFixed = newType === 'Aset Tetap';
    const nextPrefix = isFixed ? 'AST' : 'INV';
    const nextNum = String(assets.length + 1).padStart(4, '0');
    setFormData(prev => ({
      ...prev,
      asset_type: newType,
      inv_number: `${nextPrefix}-${nextNum}`,
      product_id: '',
      product_code: '',
      product_name: '',
      category: '',
      unit: 'Unit',
      unit_price: 0,
      total_cost: 0
    }));
  };

  // When changing Model Type in Add form
  const handleModelChange = (newModel) => {
    const isIndiv = newModel === 'Individual';
    const qty = isIndiv ? 1 : Math.max(2, formData.qty || 2);
    setFormData(prev => ({
      ...prev,
      model_type: newModel,
      qty: qty,
      total_cost: qty * Number(prev.unit_price || 0)
    }));
  };

  // When selecting a Product from Master Data
  const handleSelectProduct = (prodId) => {
    const matched = products.find(p => p.id === prodId);
    if (!matched) return;

    const unitPrice = Number(matched.buy_price || 0);
    const qty = formData.model_type === 'Individual' ? 1 : Math.max(1, formData.qty || 1);
    setFormData(prev => ({
      ...prev,
      product_id: prodId,
      product_code: matched.code,
      product_name: matched.name,
      category: matched.category,
      unit: matched.unit || 'Unit',
      unit_price: unitPrice,
      total_cost: qty * unitPrice
    }));
  };

  // Save Asset Form
  const handleSaveAsset = (e) => {
    e.preventDefault();

    if (!formData.product_name.trim()) {
      toast.error('Harap pilih produk dari Master Data terlebih dahulu.');
      return;
    }
    if (!formData.inv_number.trim()) {
      toast.error('Nomor Inventaris wajib diisi.');
      return;
    }

    // Validate unique inv_number
    const duplicate = assets.some(a => a.inv_number.toLowerCase() === formData.inv_number.trim().toLowerCase() && a.id !== editingAssetId);
    if (duplicate) {
      toast.error(`Nomor Inventaris "${formData.inv_number}" sudah digunakan. Gunakan nomor unik.`);
      return;
    }

    const qty = formData.model_type === 'Individual' ? 1 : Math.max(1, Number(formData.qty || 1));
    const unitPrice = Number(formData.unit_price || 0);
    const totalCost = qty * unitPrice;

    if (editingAssetId) {
      const updated = assets.map(a => {
        if (a.id === editingAssetId) {
          return {
            ...a,
            ...formData,
            qty,
            unit_price: unitPrice,
            total_cost: totalCost
          };
        }
        return a;
      });
      saveAssets(updated);

      // Log update
      const newLog = {
        id: 'log_' + Date.now(),
        date: new Date().toISOString().slice(0, 10),
        inv_number: formData.inv_number,
        asset_name: formData.product_name,
        action: 'Pembaruan Data',
        notes: `Informasi aset diperbarui (Kondisi: ${formData.condition}, Status: ${formData.status})`,
        user: 'Administrator'
      };
      saveLogs([newLog, ...assetLogs]);

      toast.success(`Aset "${formData.product_name}" (${formData.inv_number}) berhasil diperbarui!`);
    } else {
      const newAsset = {
        id: 'ast_' + Date.now(),
        ...formData,
        qty,
        unit_price: unitPrice,
        total_cost: totalCost
      };
      saveAssets([newAsset, ...assets]);

      // Log creation
      const newLog = {
        id: 'log_' + Date.now(),
        date: new Date().toISOString().slice(0, 10),
        inv_number: formData.inv_number,
        asset_name: formData.product_name,
        action: formData.model_type === 'Individual' ? 'Perolehan Individual' : 'Perolehan Kelompok',
        notes: `Pencatatan aset baru (${qty} ${formData.unit}) senilai ${formatIDR(totalCost)}`,
        user: 'Administrator'
      };
      saveLogs([newLog, ...assetLogs]);

      toast.success(`Aset "${formData.product_name}" berhasil dicatat dalam inventaris!`);
    }

    setShowAddModal(false);
  };

  // Delete Asset
  const handleDeleteAsset = (ast) => {
    if (window.confirm(`Yakin ingin menghapus aset "${ast.product_name}" (${ast.inv_number}) dari daftar inventarisasi? Data riwayat akan tetap disimpan.`)) {
      const remaining = assets.filter(a => a.id !== ast.id);
      saveAssets(remaining);

      // Log deletion
      const newLog = {
        id: 'log_' + Date.now(),
        date: new Date().toISOString().slice(0, 10),
        inv_number: ast.inv_number,
        asset_name: ast.product_name,
        action: 'Penghapusan Aset',
        notes: `Aset dihapus dari sistem inventaris aktif`,
        user: 'Administrator'
      };
      saveLogs([newLog, ...assetLogs]);

      toast.info(`Aset "${ast.product_name}" telah dihapus.`);
    }
  };

  // Feature: Pecah Menjadi Individual
  const handleExecuteSplit = (e) => {
    e.preventDefault();
    if (!showSplitModal) return;

    const parent = showSplitModal;
    const splitCount = Math.max(1, parseInt(splitQty, 10) || 1);

    if (splitCount >= parent.qty) {
      toast.error(`Jumlah pecah harus lebih kecil dari jumlah kelompok (${parent.qty} unit).`);
      return;
    }

    const remainingQty = parent.qty - splitCount;
    const unitPrice = Number(parent.unit_price || 0);

    // Update parent group
    const updatedAssets = assets.map(a => {
      if (a.id === parent.id) {
        return {
          ...a,
          qty: remainingQty,
          total_cost: remainingQty * unitPrice
        };
      }
      return a;
    });

    // Create new individual records
    const newIndividualRecords = [];
    const newLogs = [];
    const baseIdx = assets.length + 1;

    for (let i = 0; i < splitCount; i++) {
      const newInv = `AST-SPLIT-${String(baseIdx + i).padStart(4, '0')}`;
      const newIndiv = {
        id: 'ast_indiv_' + Date.now() + '_' + i,
        inv_number: newInv,
        product_code: parent.product_code,
        product_name: parent.product_name,
        category: parent.category,
        asset_type: parent.asset_type,
        model_type: 'Individual',
        brand: parent.brand || '-',
        type_name: parent.type_name || '-',
        serial_number: `SPLIT-${Date.now().toString().slice(-4)}-${i + 1}`,
        qty: 1,
        unit: parent.unit || 'Unit',
        unit_price: unitPrice,
        total_cost: unitPrice,
        acq_date: parent.acq_date,
        acq_source: `Pecah dari Kelompok ${parent.inv_number}`,
        useful_life: parent.useful_life || 4,
        salvage_value: 0,
        deprec_method: parent.deprec_method || 'Garis Lurus',
        location: parent.location,
        department: parent.department,
        pic: parent.pic,
        condition: parent.condition,
        status: parent.status,
        notes: `Hasil pemecahan mandiri dari kelompok ${parent.inv_number}`
      };
      newIndividualRecords.push(newIndiv);

      newLogs.push({
        id: 'log_split_' + Date.now() + '_' + i,
        date: new Date().toISOString().slice(0, 10),
        inv_number: newInv,
        asset_name: parent.product_name,
        action: 'Pecah Kelompok',
        notes: `Dipisahkan menjadi aset individual dari kelompok ${parent.inv_number}`,
        user: 'Administrator'
      });
    }

    saveAssets([...updatedAssets, ...newIndividualRecords]);
    saveLogs([...newLogs, ...assetLogs]);

    toast.success(`Berhasil memecah ${splitCount} unit menjadi aset Individual dengan nomor inventaris baru! Kelompok asal tersisa ${remainingQty} unit.`);
    setShowSplitModal(null);
  };

  // Filtered Assets List
  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      if (filterType !== 'all' && a.asset_type !== filterType) return false;
      if (filterModel !== 'all' && a.model_type !== filterModel) return false;
      if (filterCondition !== 'all' && a.condition !== filterCondition) return false;
      if (filterStatus !== 'all' && a.status !== filterStatus) return false;
      if (filterLocation !== 'all' && a.location !== filterLocation) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchInv = (a.inv_number || '').toLowerCase().includes(q);
        const matchName = (a.product_name || '').toLowerCase().includes(q);
        const matchCode = (a.product_code || '').toLowerCase().includes(q);
        const matchSN = (a.serial_number || '').toLowerCase().includes(q);
        const matchPIC = (a.pic || '').toLowerCase().includes(q);
        if (!matchInv && !matchName && !matchCode && !matchSN && !matchPIC) return false;
      }

      return true;
    });
  }, [assets, filterType, filterModel, filterCondition, filterStatus, filterLocation, searchQuery]);

  // Export to Excel handler
  const handleExportExcel = (exportAll = false) => {
    const sourceData = exportAll ? assets : filteredAssets;
    if (sourceData.length === 0) {
      toast.error('Tidak ada data aset untuk diekspor.');
      return;
    }

    const data = sourceData.map((a, idx) => {
      const dep = calculateDepreciation(a);
      return {
        No: idx + 1,
        'Nomor Inventaris': a.inv_number,
        'Kode Produk': a.product_code,
        'Nama Aset': a.product_name,
        Kategori: a.category,
        'Jenis Aset': a.asset_type,
        'Model Pencatatan': a.model_type,
        Merek: a.brand || '-',
        'Model/Tipe': a.type_name || '-',
        'Nomor Seri': a.serial_number || '-',
        'Tanggal Perolehan': a.acq_date,
        'Sumber Perolehan': a.acq_source,
        Kuantitas: a.qty,
        Satuan: a.unit,
        'Nilai Perolehan / Unit (IDR)': a.unit_price,
        'Total Nilai Perolehan (IDR)': a.total_cost,
        'Umur Manfaat (Thn)': a.asset_type === 'Aset Tetap' ? a.useful_life : '-',
        'Nilai Residu (IDR)': a.asset_type === 'Aset Tetap' ? a.salvage_value : '-',
        'Metode Penyusutan': a.asset_type === 'Aset Tetap' ? a.deprec_method : '-',
        'Akumulasi Penyusutan (IDR)': a.asset_type === 'Aset Tetap' ? dep.accumDeprec : '-',
        'Nilai Buku (IDR)': a.asset_type === 'Aset Tetap' ? dep.bookValue : a.total_cost,
        'Lokasi Penempatan': a.location,
        'Unit / Bagian': a.department,
        'Penanggung Jawab (PIC)': a.pic,
        'Kondisi Aset': a.condition,
        'Status Aset': a.status
      };
    });

    const yr = selectedYear || '2026';
    const filename = `Laporan_Inventarisasi_Aset_${yr}`;
    exportToExcel(data, filename, 'Inventarisasi Aset');
    toast.success(`Laporan Excel inventarisasi aset berhasil diunduh!`);
  };

  // Reset Filters
  const handleResetFilter = () => {
    setSearchQuery('');
    setFilterType('all');
    setFilterModel('all');
    setFilterCondition('all');
    setFilterStatus('all');
    setFilterLocation('all');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              INVENTARISASI ASET BUMKAM
            </span>
            <span className="text-xs text-slate-400 font-medium">SAK EMKM Terpadu</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Inventarisasi Aset Tetap &amp; Operasional
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan aset fisik individual &amp; kelompok, penyusutan garis lurus, penelusuran histori, serta integrasi Master Data
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <div className="relative group">
            <button
              onClick={() => handleExportExcel(false)}
              className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              title="Download File Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Excel
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            title="Cetak Laporan / Simpan PDF"
          >
            <Printer className="w-4 h-4 text-slate-500" /> Cetak / PDF
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#0a3a2a] hover:bg-[#06291d] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> + Tambah Aset
          </button>
        </div>
      </div>

      {/* 2. SUMMARY DASHBOARD CARDS (DOCX PARAGRAPH 849-858) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 print:hidden">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Aset Tetap</span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{summaryStats.countFixed} Unit</p>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Tersusutkan</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inventaris Operasional</span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{summaryStats.countOper} Unit</p>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Siap Digunakan</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Nilai Perolehan</span>
          <p className="text-base font-black text-emerald-700 dark:text-emerald-400 mt-1">{formatIDR(summaryStats.totalAcqCost)}</p>
          <span className="text-[10px] text-slate-400 font-medium">Harga Perolehan Awal</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Nilai Buku</span>
          <p className="text-base font-black text-teal-700 dark:text-teal-400 mt-1">{formatIDR(summaryStats.totalBookVal)}</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Setelah Penyusutan</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Aset Aktif</span>
          <p className="text-xl font-black text-emerald-600 mt-1">{summaryStats.countActive} Record</p>
          <span className="text-[10px] text-emerald-700 font-semibold">Operasional Normal</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rusak / Tidak Aktif</span>
          <p className="text-xl font-black text-rose-600 mt-1">{summaryStats.countDamaged} Record</p>
          <span className="text-[10px] text-rose-500 font-semibold">Perlu Perbaikan</span>
        </div>
      </div>

      {/* 3. TABS: DAFTAR ASET VS RIWAYAT ASET */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 print:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'list'
                ? 'bg-[#0a3a2a] text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Daftar Aset ({filteredAssets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'logs'
                ? 'bg-[#0a3a2a] text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Riwayat Aset (Audit Trail)</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          Tahun Evaluasi: <strong className="text-emerald-700 dark:text-emerald-400">{selectedYear}</strong>
        </span>
      </div>

      {/* 4. FILTER PANEL & SEARCH BAR (DOCX 1259-1273) */}
      {activeTab === 'list' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3 print:hidden">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="flex items-center gap-2 flex-1 w-full bg-slate-50 dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Nomor Inventaris, Nama Aset, Kode Produk, No Seri, atau PIC..."
                className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={handleResetFilter}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filter
            </button>
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Jenis Aset</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
              >
                <option value="all">Semua Jenis</option>
                <option value="Aset Tetap">Aset Tetap</option>
                <option value="Inventaris Operasional">Inventaris Operasional</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Model Pencatatan</label>
              <select
                value={filterModel}
                onChange={(e) => setFilterModel(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
              >
                <option value="all">Semua Model</option>
                <option value="Individual">Individual (Qty = 1)</option>
                <option value="Kelompok">Kelompok (Qty &gt; 1)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Kondisi</label>
              <select
                value={filterCondition}
                onChange={(e) => setFilterCondition(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
              >
                <option value="all">Semua Kondisi</option>
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
              >
                <option value="all">Semua Status</option>
                <option value="Aktif/Digunakan">Aktif/Digunakan</option>
                <option value="Tidak Digunakan">Tidak Digunakan</option>
                <option value="Dalam Perbaikan">Dalam Perbaikan</option>
                <option value="Hilang">Hilang</option>
                <option value="Dihentikan">Dihentikan</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Lokasi</label>
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
              >
                <option value="all">Semua Lokasi</option>
                <option value="Kantor BUMKam">Kantor BUMKam</option>
                <option value="Tempat Produksi Kandang">Tempat Produksi Kandang</option>
                <option value="Gudang Tenda & Perlengkapan">Gudang Tenda &amp; Perlengkapan</option>
                <option value="Gedung Serbaguna">Gedung Serbaguna</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 5. MAIN ASSETS TABLE (DOCX 1208-1224) */}
      {activeTab === 'list' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm print:border-none print:shadow-none">
          {/* Printable Official Header */}
          <div className="hidden print:block mb-4 pb-3 border-b-2 border-slate-900 text-center kop-surat">
            <h2 className="text-base font-black uppercase text-slate-900 tracking-wide">ARVEA &bull; BUMKAM MEKAR SARI</h2>
            <p className="text-[11px] font-semibold text-slate-700">Financial Management System &bull; Standar SAK EMKM</p>
            <p className="text-[10px] text-slate-500">Kampung Sabron Sari, Distrik Sentani Barat, Kabupaten Jayapura, Papua</p>
            <h3 className="text-xs font-black uppercase mt-2 text-slate-900 underline">LAPORAN INVENTARISASI ASET TETAP &amp; OPERASIONAL</h3>
            <p className="text-[10px] text-slate-500">Tahun Buku: {selectedYear} &bull; Total Nilai Perolehan: {formatIDR(summaryStats.totalAcqCost)} &bull; Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>

          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-[11px] border-b border-slate-200 dark:border-slate-700 print:text-[7pt]">
                <tr>
                  <th className="p-3.5 print:p-1">No</th>
                  <th className="p-3.5 print:p-1">No. Inventaris</th>
                  <th className="p-3.5 print:p-1">Nama Aset</th>
                  <th className="p-3.5 print:p-1 text-center">Jenis &amp; Model</th>
                  <th className="p-3.5 print:p-1 text-center">Qty</th>
                  <th className="p-3.5 print:p-1 text-right">Nilai / Unit</th>
                  <th className="p-3.5 print:p-1 text-right">Total Perolehan</th>
                  <th className="p-3.5 print:p-1 text-right">Nilai Buku</th>
                  <th className="p-3.5 print:p-1 text-center">Kondisi &amp; Status</th>
                  <th className="p-3.5 print:p-1">Lokasi &amp; PIC</th>
                  <th className="p-3.5 print:p-1 text-center print:hidden">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="text-center py-12 text-slate-400 print:py-4">
                      Tidak ada data inventarisasi aset yang cocok dengan filter. Klik "+ Tambah Aset" untuk mencatat aset baru.
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((ast, idx) => {
                    const dep = calculateDepreciation(ast);
                    return (
                      <tr key={ast.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="p-3.5 print:p-1 text-slate-400 font-mono print:text-[7.5pt]">{idx + 1}</td>
                        <td className="p-3.5 print:p-1 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap print:text-[7.5pt]">
                          {ast.inv_number}
                        </td>
                        <td className="p-3.5 print:p-1">
                          <p className="font-bold text-slate-900 dark:text-white leading-tight print:text-[7.5pt] print:overflow-visible print:whitespace-normal">{ast.product_name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 print:text-[6.5pt]">{ast.product_code} &bull; {ast.category}</p>
                        </td>
                        <td className="p-3.5 print:p-1 text-center whitespace-nowrap">
                          <div className="space-y-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold block print:text-[6.5pt] ${
                              ast.asset_type === 'Aset Tetap'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            }`}>
                              {ast.asset_type}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider block print:text-[6pt] ${
                              ast.model_type === 'Individual'
                                ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              {ast.model_type}
                            </span>
                          </div>
                        </td>
                        <td className="p-3.5 print:p-1 text-center font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap print:text-[7.5pt]">
                          {ast.qty} {ast.unit}
                        </td>
                        <td className="p-3.5 print:p-1 text-right font-medium whitespace-nowrap print:text-[7.5pt]">
                          {formatIDR(ast.unit_price)}
                        </td>
                        <td className="p-3.5 print:p-1 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap print:text-[7.5pt]">
                          {formatIDR(ast.total_cost)}
                        </td>
                        <td className="p-3.5 print:p-1 text-right font-black text-emerald-700 dark:text-emerald-400 whitespace-nowrap print:text-[7.5pt]">
                          {ast.asset_type === 'Aset Tetap' ? formatIDR(dep.bookValue) : formatIDR(ast.total_cost)}
                        </td>
                        <td className="p-3.5 print:p-1 text-center whitespace-nowrap">
                          <div className="space-y-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold block print:text-[6.5pt] ${
                              ast.condition === 'Baik'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              {ast.condition}
                            </span>
                            <span className="text-[10px] text-slate-500 block font-medium print:text-[6.5pt]">
                              {ast.status}
                            </span>
                          </div>
                        </td>
                        <td className="p-3.5 print:p-1 text-[11px]">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 print:text-[7.5pt] print:overflow-visible print:whitespace-normal">{ast.location}</p>
                          <p className="text-slate-400 text-[10px] print:text-[6.5pt]">PIC: {ast.pic || '-'}</p>
                        </td>
                        <td className="p-3.5 text-center whitespace-nowrap print:hidden">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setShowDetailModal(ast)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition"
                              title="Detail Lengkap Aset"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Pecah Menjadi Individual (For Kelompok Assets) */}
                            {ast.model_type === 'Kelompok' && ast.qty > 1 && (
                              <button
                                onClick={() => {
                                  setShowSplitModal(ast);
                                  setSplitQty(1);
                                }}
                                className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 transition"
                                title="Pecah Sebagian Menjadi Individual"
                              >
                                <Scissors className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => handleOpenEdit(ast)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 transition"
                              title="Edit Aset"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteAsset(ast)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-100 text-slate-600 hover:text-red-600 transition"
                              title="Hapus Aset"
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

          {/* Printable Official Signatures Block */}
          <div className="hidden print:flex justify-between items-center mt-6 pt-4 text-xs signature-block">
            <div className="text-center">
              <p className="text-[10px] text-slate-500 font-medium">Mengetahui &amp; Menyetujui,</p>
              <p className="font-bold text-slate-800">Direktur BUMKam Mekar Sari</p>
              <div className="h-12"></div>
              <p className="font-bold underline text-slate-900">{profile.director || 'Eko L Wibowo'}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-500 font-medium">Sentani Barat, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-bold text-slate-800">Bendahara / Pengelola Aset</p>
              <div className="h-12"></div>
              <p className="font-bold underline text-slate-900">{profile.treasurer || 'Rita Fanghoi'}</p>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB: RIWAYAT ASET (AUDIT TRAIL LOGS) */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Log Riwayat Perubahan &amp; Penelusuran Aset (Audit Trail)
            </h3>
            <span className="text-xs text-slate-500">Total {assetLogs.length} Aktivitas Tercatat</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-[11px] border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5">No. Inventaris</th>
                  <th className="p-3.5">Nama Aset</th>
                  <th className="p-3.5">Jenis Tindakan</th>
                  <th className="p-3.5">Keterangan Aktivitas</th>
                  <th className="p-3.5">Pengguna</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {assetLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-3.5 font-mono text-slate-500">{log.date}</td>
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">{log.inv_number}</td>
                    <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{log.asset_name}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{log.notes}</td>
                    <td className="p-3.5 text-slate-500 font-semibold">{log.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. MODAL TAMBAH / EDIT ASET (INTEGRASI 3 LANGKAH DENGAN MASTER DATA) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Boxes className="w-5 h-5 text-emerald-600" />
                {editingAssetId ? 'Edit Data Inventarisasi Aset' : 'Catat Aset Baru (Integrasi Master Data)'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveAsset} className="space-y-4 mt-4 text-xs">
              {/* STEP 1 & 2: PILIH JENIS ASET & MODEL PENCATATAN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Langkah 1 &mdash; Jenis Aset *
                  </label>
                  <div className="flex gap-2">
                    {['Aset Tetap', 'Inventaris Operasional'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleTypeChange(t)}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition border ${
                          formData.asset_type === t
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {formData.asset_type === 'Aset Tetap' ? 'Aset bernilai ekonomis panjang & disusutkan' : 'Perlengkapan operasional tanpa penyusutan'}
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Langkah 2 &mdash; Model Pencatatan *
                  </label>
                  <div className="flex gap-2">
                    {['Individual', 'Kelompok'].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleModelChange(m)}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition border ${
                          formData.model_type === m
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {formData.model_type === 'Individual' ? 'Satu unit = satu nomor inventaris (Qty = 1)' : 'Banyak unit sejenis dikelola bersama'}
                  </p>
                </div>
              </div>

              {/* STEP 3: PILIH PRODUK DARI MASTER DATA (PERLAKUAN PRODUK FILTERED) */}
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <label className="block font-bold text-emerald-900 dark:text-emerald-200 mb-1 flex items-center justify-between">
                  <span>Langkah 3 &mdash; Pilih Produk Sumber dari Master Data *</span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300">
                    Filter: Perlakuan "{formData.asset_type}"
                  </span>
                </label>
                <select
                  value={formData.product_id}
                  onChange={(e) => handleSelectProduct(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200"
                  required={!editingAssetId}
                >
                  <option value="">-- Pilih Produk Master Data --</option>
                  {availableMasterProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.name} - Kategori: {p.category} (Harga: {formatIDR(p.buy_price)})
                    </option>
                  ))}
                </select>
                {availableMasterProducts.length === 0 && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-1.5">
                    ⚠️ Belum ada produk dengan Perlakuan Produk "{formData.asset_type}" di Master Data. Silakan tambahkan atau ubah perlakuan produk di menu Master Data terlebih dahulu.
                  </p>
                )}
              </div>

              {/* IDENTITAS ASET */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor Inventaris *</label>
                  <input
                    type="text"
                    value={formData.inv_number}
                    onChange={(e) => setFormData({ ...formData, inv_number: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Produk / Aset</label>
                  <input
                    type="text"
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kode Produk</label>
                  <input
                    type="text"
                    value={formData.product_code}
                    readOnly
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono"
                  />
                </div>
              </div>

              {/* BRAND, MODEL & NOMOR SERI */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Merek</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Contoh: Lenovo / Futura"
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tipe / Model</label>
                  <input
                    type="text"
                    value={formData.type_name}
                    onChange={(e) => setFormData({ ...formData, type_name: e.target.value })}
                    placeholder="Contoh: ThinkCentre Core i5"
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor Seri (Serial Number)</label>
                  <input
                    type="text"
                    value={formData.serial_number}
                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                    placeholder="Contoh: SN-2024-9912"
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              {/* KUANTITAS & NILAI PEROLEHAN */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kuantitas {formData.model_type === 'Individual' ? '(Terkunci: 1)' : '*'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.qty}
                    onChange={(e) => {
                      const q = Math.max(1, Number(e.target.value || 1));
                      setFormData({
                        ...formData,
                        qty: q,
                        total_cost: q * Number(formData.unit_price || 0)
                      });
                    }}
                    disabled={formData.model_type === 'Individual'}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold disabled:bg-slate-100 disabled:text-slate-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nilai Perolehan / Unit (IDR)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.unit_price}
                    onChange={(e) => {
                      const p = Number(e.target.value || 0);
                      setFormData({
                        ...formData,
                        unit_price: p,
                        total_cost: Number(formData.qty || 1) * p
                      });
                    }}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Total Nilai Perolehan (Otomatis)</label>
                  <input
                    type="text"
                    value={formatIDR(formData.total_cost)}
                    readOnly
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-black font-mono"
                  />
                </div>
              </div>

              {/* PENYUSUTAN (HANYA UNTUK ASET TETAP) */}
              {formData.asset_type === 'Aset Tetap' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div>
                    <label className="block font-bold text-blue-900 dark:text-blue-200 mb-1">Umur Manfaat (Tahun) *</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={formData.useful_life}
                      onChange={(e) => setFormData({ ...formData, useful_life: Number(e.target.value || 1) })}
                      className="w-full p-2 rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-900 font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-blue-900 dark:text-blue-200 mb-1">Nilai Residu (IDR)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.salvage_value}
                      onChange={(e) => setFormData({ ...formData, salvage_value: Number(e.target.value || 0) })}
                      className="w-full p-2 rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-blue-900 dark:text-blue-200 mb-1">Metode Penyusutan</label>
                    <input
                      type="text"
                      value="Garis Lurus (Straight Line)"
                      readOnly
                      className="w-full p-2 rounded-lg border border-blue-200 dark:border-blue-700 bg-blue-100/50 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 font-bold"
                    />
                  </div>
                </div>
              )}

              {/* LOKASI, PIC, KONDISI, STATUS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lokasi Penempatan</label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="Kantor BUMKam">Kantor BUMKam</option>
                    <option value="Tempat Produksi Kandang">Tempat Produksi Kandang</option>
                    <option value="Gudang Tenda & Perlengkapan">Gudang Tenda &amp; Perlengkapan</option>
                    <option value="Gedung Serbaguna">Gedung Serbaguna</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Penanggung Jawab (PIC)</label>
                  <input
                    type="text"
                    value={formData.pic}
                    onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
                    placeholder="Contoh: Rita Fanghoi"
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kondisi</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                  >
                    <option value="Baik">🟢 Baik</option>
                    <option value="Rusak Ringan">🟡 Rusak Ringan</option>
                    <option value="Rusak Berat">🔴 Rusak Berat</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Status Penggunaan</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                  >
                    <option value="Aktif/Digunakan">Aktif/Digunakan</option>
                    <option value="Tidak Digunakan">Tidak Digunakan</option>
                    <option value="Dalam Perbaikan">Dalam Perbaikan</option>
                    <option value="Hilang">Hilang</option>
                    <option value="Dihentikan">Dihentikan</option>
                  </select>
                </div>
              </div>

              {/* TANGGAL & SUMBER PEROLEHAN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal Perolehan</label>
                  <input
                    type="date"
                    value={formData.acq_date}
                    onChange={(e) => setFormData({ ...formData, acq_date: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sumber Perolehan</label>
                  <select
                    value={formData.acq_source}
                    onChange={(e) => setFormData({ ...formData, acq_source: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="Pembelian">Pembelian Kas / Kredit</option>
                    <option value="Hibah">Hibah</option>
                    <option value="Bantuan">Bantuan Pemerintah / Lembaga</option>
                    <option value="Penyertaan Modal">Penyertaan Modal Desa / Adat</option>
                    <option value="Donasi">Donasi</option>
                    <option value="Hasil Produksi/Usaha">Hasil Usaha Sendiri</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Keterangan spesifikasi, kondisi, atau garansi..."
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0a3a2a] hover:bg-[#06291d] text-white font-bold flex items-center gap-1.5 shadow"
                >
                  <Save className="w-4 h-4 text-emerald-300" /> Simpan Data Aset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL PECAH KELOMPOK MENJADI INDIVIDUAL (DOCX 1168-1189) */}
      {showSplitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Scissors className="w-4 h-4 text-amber-600" />
                Pecah Kelompok Menjadi Individual
              </h3>
              <button onClick={() => setShowSplitModal(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleExecuteSplit} className="space-y-4 mt-4 text-xs">
              <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-xl border border-amber-200 dark:border-amber-800">
                <p className="font-bold text-amber-900 dark:text-amber-200">{showSplitModal.product_name}</p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300/90 mt-0.5">
                  Nomor Kelompok: <strong>{showSplitModal.inv_number}</strong> &bull; Total Saat Ini: <strong>{showSplitModal.qty} {showSplitModal.unit}</strong>
                </p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300/90">
                  Nilai per Unit: <strong>{formatIDR(showSplitModal.unit_price)}</strong>
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jumlah Unit yang Ingin Dipecah Menjadi Individual *
                </label>
                <input
                  type="number"
                  min="1"
                  max={showSplitModal.qty - 1}
                  value={splitQty}
                  onChange={(e) => setSplitQty(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Maksimal pecah: {showSplitModal.qty - 1} unit (agar kelompok asal tetap ada).
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 text-[11px]">
                <p className="font-semibold text-slate-700 dark:text-slate-300">Hasil Pemecahan:</p>
                <p className="text-slate-600 dark:text-slate-400">&bull; Kelompok <strong>{showSplitModal.inv_number}</strong> akan tersisa: <strong>{showSplitModal.qty - (parseInt(splitQty, 10) || 0)} unit</strong></p>
                <p className="text-slate-600 dark:text-slate-400">&bull; Akan dibuat <strong>{splitQty} record Aset Individual</strong> baru masing-masing dengan Qty = 1 dan nomor inventaris unik.</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSplitModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5 shadow"
                >
                  <Scissors className="w-4 h-4" /> Proses Pemecahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. MODAL DETAIL LENGKAP ASET (DOCX 1225-1258) */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-600" />
                Detail Lembar Inventaris: {showDetailModal.inv_number}
              </h3>
              <button onClick={() => setShowDetailModal(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 block">Nama Produk / Aset</span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{showDetailModal.product_name}</p>
                  <span className="text-[10px] text-slate-500 font-mono">{showDetailModal.product_code}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Kategori &amp; Jenis</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{showDetailModal.category}</p>
                  <span className="text-[10px] font-bold text-emerald-600">{showDetailModal.asset_type} ({showDetailModal.model_type})</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block">Merek</span>
                  <p className="font-bold">{showDetailModal.brand || '-'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Tipe / Model</span>
                  <p className="font-bold">{showDetailModal.type_name || '-'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">No. Seri</span>
                  <p className="font-mono font-bold">{showDetailModal.serial_number || '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                <div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">Kuantitas</span>
                  <p className="font-black text-sm">{showDetailModal.qty} {showDetailModal.unit}</p>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">Nilai Per Unit</span>
                  <p className="font-bold">{formatIDR(showDetailModal.unit_price)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">Total Perolehan</span>
                  <p className="font-black text-emerald-800 dark:text-emerald-300">{formatIDR(showDetailModal.total_cost)}</p>
                </div>
              </div>

              {showDetailModal.asset_type === 'Aset Tetap' && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl space-y-2">
                  <p className="font-bold text-blue-900 dark:text-blue-200">Perhitungan Akuntansi SAK EMKM:</p>
                  {(() => {
                    const d = calculateDepreciation(showDetailModal);
                    return (
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <span className="text-[10px] text-blue-700 dark:text-blue-300 block">Umur Manfaat</span>
                          <p className="font-bold">{showDetailModal.useful_life} Tahun</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-blue-700 dark:text-blue-300 block">Akumulasi Penyusutan</span>
                          <p className="font-bold text-rose-600">{formatIDR(d.accumDeprec)}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-blue-700 dark:text-blue-300 block">Nilai Buku Bersih</span>
                          <p className="font-black text-emerald-700 dark:text-emerald-300">{formatIDR(d.bookValue)}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block">Lokasi Penempatan</span>
                  <p className="font-semibold">{showDetailModal.location}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Penanggung Jawab (PIC)</span>
                  <p className="font-semibold">{showDetailModal.pic || '-'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Kondisi Fisik</span>
                  <p className="font-bold">{showDetailModal.condition}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Status Operasional</span>
                  <p className="font-bold">{showDetailModal.status}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block">Catatan / Riwayat</span>
                <p className="text-slate-600 dark:text-slate-300 italic">{showDetailModal.notes || 'Tidak ada catatan khusus.'}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowDetailModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl"
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
