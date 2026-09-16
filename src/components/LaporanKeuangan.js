import React, { useState } from 'react';
import { Printer } from 'lucide-react';
import { formatIDR } from './Transaksi';

export default function LaporanKeuangan({ journals, accounts, transactions, profile, selectedYear }) {
  const [activeReport, setActiveReport] = useState('laba_rugi');

  const accBal = (code) => {
    const lines = journals.filter(j => j.account_code === code);
    const d = lines.reduce((s, x) => s + Number(x.debit || 0), 0);
    const k = lines.reduce((s, x) => s + Number(x.credit || 0), 0);
    const acc = accounts.find(a => a.code === code);
    if (acc?.normal === 'Debit') return d - k;
    return k - d;
  };

  const revTrading = accBal('4001');
  const revServices = accBal('4002');
  const totalRevenue = revTrading + revServices;

  const hpp = accBal('5001');
  const grossProfit = totalRevenue - hpp;

  const expSalary = accBal('5101');
  const expElectricity = accBal('5102');
  const expTransport = accBal('5103');
  const expMaintenance = accBal('5104');
  const expOthers = accBal('5199');
  const totalExpenses = expSalary + expElectricity + expTransport + expMaintenance + expOthers;

  const netIncome = grossProfit - totalExpenses;

  const cashVal = accBal('1001');
  const bankVal = accBal('1002');
  const receivableVal = accBal('1101');
  const inventoryVal = accBal('1201');
  const suppliesVal = accBal('1301');
  const totalCurrentAssets = cashVal + bankVal + receivableVal + inventoryVal + suppliesVal;

  const fixedAssets = accBal('1501');
  const accumDepreciation = accBal('1591');
  const totalNonCurrentAssets = fixedAssets - accumDepreciation;
  const totalAssets = totalCurrentAssets + totalNonCurrentAssets;

  const tradePayables = accBal('2001');
  const otherPayables = accBal('2101');
  const totalLiabilities = tradePayables + otherPayables;

  const initialCapital = accBal('3001');
  const retainedEarnings = accBal('3101') + netIncome;
  const totalEquity = initialCapital + retainedEarnings;

  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  const reportDateFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header & Report Switcher (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Laporan Keuangan Standar SAK</h1>
          <p className="text-xs text-slate-500 mt-0.5">Disusun sesuai ketentuan Standar Akuntansi Keuangan Entitas Privat (SAK EP)</p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-[#0a3a2a] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow hover:bg-[#06291d] transition flex items-center gap-2 self-start"
        >
          <Printer className="w-4 h-4" /> Cetak Laporan Resmi (PDF)
        </button>
      </div>

      {/* 5 Tabs SAK (Hidden in Print) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto print:hidden">
        {[
          { id: 'laba_rugi', label: '1. Laporan Laba Rugi' },
          { id: 'perubahan_ekuitas', label: '2. Laporan Perubahan Ekuitas' },
          { id: 'neraca', label: '3. Posisi Keuangan (Neraca)' },
          { id: 'arus_kas', label: '4. Laporan Arus Kas' },
          { id: 'calk', label: '5. CaLK' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id)}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeReport === tab.id
                ? 'bg-[#0a3a2a] text-white shadow'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OFFICIAL REPORT CONTAINER (PRINTABLE WITH KOP SURAT & SIGNATURE) */}
      <div className="bg-white text-slate-900 p-8 md:p-12 rounded-2xl border border-slate-200 shadow-md">
        {/* KOP SURAT RESMI (SESUAI CATATAN DOCX BUTIR 17) */}
        <div className="text-center border-b-4 border-double border-slate-900 pb-4 mb-6">
          <h2 className="text-lg md:text-xl font-extrabold tracking-wide uppercase text-slate-900">
            {profile.legalName || 'BADAN USAHA MILIK MASYARAKAT ADAT (BUMMA) MEKAR SARI'}
          </h2>
          <p className="text-xs font-bold uppercase text-slate-700 tracking-wider">
            {profile.region} &mdash; {profile.location}
          </p>
          <p className="text-[11px] text-slate-600 mt-0.5">
            {profile.address} | Telp: {profile.phone} | Email: {profile.email}
          </p>
        </div>

        {/* 1. LAPORAN LABA RUGI */}
        {activeReport === 'laba_rugi' && (
          <div>
            <div className="text-center mb-6">
              <h3 className="text-base font-extrabold uppercase tracking-wider text-slate-900">LAPORAN LABA RUGI</h3>
              <p className="text-xs text-slate-600 font-medium">
                Untuk Periode yang Berakhir pada 31 Desember {selectedYear === 'all' ? '2026' : selectedYear} (Dalam Rupiah)
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-bold border-b border-slate-200 pb-1 text-slate-800">
                  <span>PENDAPATAN USAHA</span>
                </div>
                <div className="space-y-1.5 pt-2 pl-4">
                  <div className="flex justify-between">
                    <span>Pendapatan Penjualan Perdagangan &amp; Peternakan</span>
                    <span className="font-medium">{formatIDR(revTrading)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pendapatan Jasa Penyewaan (Tenda &amp; Gedung)</span>
                    <span className="font-medium">{formatIDR(revServices)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-slate-200 pt-1 text-slate-900">
                    <span>TOTAL PENDAPATAN</span>
                    <span>{formatIDR(totalRevenue)}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold border-b border-slate-200 pb-1 text-slate-800">
                  <span>BEBAN POKOK PENJUALAN</span>
                </div>
                <div className="space-y-1.5 pt-2 pl-4">
                  <div className="flex justify-between">
                    <span>Harga Pokok Penjualan (HPP)</span>
                    <span className="font-medium">{formatIDR(hpp)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-slate-200 pt-1 text-slate-900">
                    <span>LABA KOTOR (GROSS PROFIT)</span>
                    <span className="text-emerald-700">{formatIDR(grossProfit)}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold border-b border-slate-200 pb-1 text-slate-800">
                  <span>BEBAN OPERASIONAL</span>
                </div>
                <div className="space-y-1.5 pt-2 pl-4">
                  <div className="flex justify-between">
                    <span>Beban Gaji Karyawan &amp; Pengurus</span>
                    <span className="font-medium">{formatIDR(expSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Beban Listrik, Air &amp; Utilitas</span>
                    <span className="font-medium">{formatIDR(expElectricity)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Beban Transportasi &amp; Logistik</span>
                    <span className="font-medium">{formatIDR(expTransport)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Beban Pemeliharaan &amp; Perlengkapan</span>
                    <span className="font-medium">{formatIDR(expMaintenance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Beban Operasional Lainnya</span>
                    <span className="font-medium">{formatIDR(expOthers)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-slate-200 pt-1 text-slate-900">
                    <span>TOTAL BEBAN OPERASIONAL</span>
                    <span>{formatIDR(totalExpenses)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-100 p-3 rounded-lg flex justify-between items-center text-sm font-extrabold border-2 border-slate-900">
                <span className="uppercase">LABA / (RUGI) BERSIH PERIODE BERJALAN</span>
                <span className={netIncome >= 0 ? 'text-emerald-800' : 'text-rose-800'}>
                  {formatIDR(netIncome)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2. LAPORAN PERUBAHAN EKUITAS */}
        {activeReport === 'perubahan_ekuitas' && (
          <div>
            <div className="text-center mb-6">
              <h3 className="text-base font-extrabold uppercase tracking-wider text-slate-900">LAPORAN PERUBAHAN EKUITAS</h3>
              <p className="text-xs text-slate-600 font-medium">
                Untuk Periode yang Berakhir pada 31 Desember {selectedYear === 'all' ? '2026' : selectedYear} (Dalam Rupiah)
              </p>
            </div>

            <div className="space-y-3 text-xs pl-2">
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="font-semibold">Modal Awal BUMMA (1 Januari)</span>
                <span className="font-bold">{formatIDR(initialCapital)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="font-semibold">Laba / (Rugi) Bersih Periode Berjalan</span>
                <span className={`font-bold ${netIncome >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{formatIDR(netIncome)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="font-semibold">Penarikan Prive / Bagi Hasil Usaha Masyarakat</span>
                <span className="font-bold">{formatIDR(0)}</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-b-2 border-slate-900 text-sm font-extrabold bg-slate-50 px-2">
                <span className="uppercase">MODAL AKHIR BUMMA (31 DESEMBER)</span>
                <span className="text-emerald-800">{formatIDR(initialCapital + netIncome)}</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. LAPORAN POSISI KEUANGAN (NERACA) */}
        {activeReport === 'neraca' && (
          <div>
            <div className="text-center mb-6">
              <h3 className="text-base font-extrabold uppercase tracking-wider text-slate-900">LAPORAN POSISI KEUANGAN (NERACA)</h3>
              <p className="text-xs text-slate-600 font-medium">
                Per 31 Desember {selectedYear === 'all' ? '2026' : selectedYear} (Standar SAK EP - Dalam Rupiah)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
              <div className="space-y-4">
                <h4 className="font-extrabold text-sm border-b-2 border-slate-900 pb-1 text-slate-900">ASET</h4>
                <div>
                  <p className="font-bold text-slate-800 mb-1">Aset Lancar:</p>
                  <div className="space-y-1.5 pl-3">
                    <div className="flex justify-between"><span>Kas di Tangan</span><span>{formatIDR(cashVal)}</span></div>
                    <div className="flex justify-between"><span>Bank Papua</span><span>{formatIDR(bankVal)}</span></div>
                    <div className="flex justify-between"><span>Piutang Usaha</span><span>{formatIDR(receivableVal)}</span></div>
                    <div className="flex justify-between"><span>Persediaan Barang Dagang</span><span>{formatIDR(inventoryVal)}</span></div>
                    <div className="flex justify-between"><span>Perlengkapan Usaha</span><span>{formatIDR(suppliesVal)}</span></div>
                    <div className="flex justify-between font-bold border-t border-slate-200 pt-1">
                      <span>Total Aset Lancar</span><span>{formatIDR(totalCurrentAssets)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-slate-800 mb-1">Aset Tidak Lancar / Tetap:</p>
                  <div className="space-y-1.5 pl-3">
                    <div className="flex justify-between"><span>Peralatan &amp; Aset Tetap</span><span>{formatIDR(fixedAssets)}</span></div>
                    <div className="flex justify-between"><span>Akumulasi Penyusutan</span><span>({formatIDR(accumDepreciation)})</span></div>
                    <div className="flex justify-between font-bold border-t border-slate-200 pt-1">
                      <span>Total Aset Tetap</span><span>{formatIDR(totalNonCurrentAssets)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between font-extrabold text-sm border-t-2 border-b-2 border-slate-900 py-2 bg-emerald-50/50 px-2">
                  <span>TOTAL ASET</span>
                  <span className="text-emerald-800">{formatIDR(totalAssets)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-extrabold text-sm border-b-2 border-slate-900 pb-1 text-slate-900">LIABILITAS &amp; EKUITAS</h4>
                <div>
                  <p className="font-bold text-slate-800 mb-1">Liabilitas Jangka Pendek:</p>
                  <div className="space-y-1.5 pl-3">
                    <div className="flex justify-between"><span>Utang Usaha</span><span>{formatIDR(tradePayables)}</span></div>
                    <div className="flex justify-between"><span>Utang Lainnya</span><span>{formatIDR(otherPayables)}</span></div>
                    <div className="flex justify-between font-bold border-t border-slate-200 pt-1">
                      <span>Total Liabilitas</span><span>{formatIDR(totalLiabilities)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-slate-800 mb-1">Ekuitas:</p>
                  <div className="space-y-1.5 pl-3">
                    <div className="flex justify-between"><span>Modal Disetor BUMMA</span><span>{formatIDR(initialCapital)}</span></div>
                    <div className="flex justify-between"><span>Saldo Laba Periode Berjalan</span><span>{formatIDR(retainedEarnings)}</span></div>
                    <div className="flex justify-between font-bold border-t border-slate-200 pt-1">
                      <span>Total Ekuitas</span><span>{formatIDR(totalEquity)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between font-extrabold text-sm border-t-2 border-b-2 border-slate-900 py-2 bg-emerald-50/50 px-2">
                  <span>TOTAL LIABILITAS &amp; EKUITAS</span>
                  <span className="text-emerald-800">{formatIDR(totalLiabilitiesAndEquity)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. LAPORAN ARUS KAS */}
        {activeReport === 'arus_kas' && (
          <div>
            <div className="text-center mb-6">
              <h3 className="text-base font-extrabold uppercase tracking-wider text-slate-900">LAPORAN ARUS KAS</h3>
              <p className="text-xs text-slate-600 font-medium">
                Untuk Periode yang Berakhir pada 31 Desember {selectedYear === 'all' ? '2026' : selectedYear} (Metode Langsung - Dalam Rupiah)
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold border-b border-slate-200 pb-1">ARUS KAS DARI AKTIVITAS OPERASI</h4>
                <div className="space-y-1.5 pt-2 pl-4">
                  <div className="flex justify-between"><span>Penerimaan Kas dari Penjualan &amp; Jasa</span><span>{formatIDR(totalRevenue)}</span></div>
                  <div className="flex justify-between"><span>Pembayaran Kas kepada Pemasok Barang Dagang</span><span>({formatIDR(hpp)})</span></div>
                  <div className="flex justify-between"><span>Pembayaran Kas untuk Beban Operasional &amp; Gaji</span><span>({formatIDR(totalExpenses)})</span></div>
                  <div className="flex justify-between font-bold border-t border-slate-200 pt-1">
                    <span>Arus Kas Bersih dari Aktivitas Operasi</span>
                    <span className="text-emerald-700">{formatIDR(netIncome)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold border-b border-slate-200 pb-1">ARUS KAS DARI AKTIVITAS INVESTASI</h4>
                <div className="space-y-1.5 pt-2 pl-4">
                  <div className="flex justify-between"><span>Pembelian Aset Tetap &amp; Peralatan Tenda</span><span>({formatIDR(0)})</span></div>
                  <div className="flex justify-between font-bold border-t border-slate-200 pt-1">
                    <span>Arus Kas Bersih dari Aktivitas Investasi</span><span>{formatIDR(0)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold border-b border-slate-200 pb-1">ARUS KAS DARI AKTIVITAS PENDANAAN</h4>
                <div className="space-y-1.5 pt-2 pl-4">
                  <div className="flex justify-between"><span>Penerimaan Setoran Modal Awal BUMMA</span><span>{formatIDR(initialCapital)}</span></div>
                  <div className="flex justify-between font-bold border-t border-slate-200 pt-1">
                    <span>Arus Kas Bersih dari Aktivitas Pendanaan</span><span>{formatIDR(initialCapital)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-100 p-3 rounded-lg flex justify-between items-center text-sm font-extrabold border-2 border-slate-900">
                <span>SALDO KAS DAN BANK AKHIR PERIODE</span>
                <span className="text-emerald-800">{formatIDR(cashVal + bankVal)}</span>
              </div>
            </div>
          </div>
        )}

        {/* 5. CATATAN ATAS LAPORAN KEUANGAN (CaLK) */}
        {activeReport === 'calk' && (
          <div>
            <div className="text-center mb-6">
              <h3 className="text-base font-extrabold uppercase tracking-wider text-slate-900">CATATAN ATAS LAPORAN KEUANGAN (CaLK)</h3>
              <p className="text-xs text-slate-600 font-medium">Tahun Buku {selectedYear === 'all' ? '2026' : selectedYear}</p>
            </div>

            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div>
                <h4 className="font-bold text-slate-900">1. Gambaran Umum &amp; Dasar Hukum</h4>
                <p className="mt-1">
                  Badan Usaha Milik Masyarakat Adat (BUMMA) Mekar Sari didirikan di wilayah adat Mamta, Kabupaten Jayapura, Papua untuk memberdayakan potensi ekonomi warga adat melalui unit perdagangan peternakan dan jasa penyewaan.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900">2. Dasar Penyusunan Laporan Keuangan</h4>
                <p className="mt-1">
                  Laporan keuangan disusun berdasarkan Standar Akuntansi Keuangan Entitas Privat (SAK EP) dengan sistem pembukuan berpasangan (double-entry). Mata uang pelaporan adalah Rupiah (IDR).
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900">3. Kebijakan Akuntansi Signifikan</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li><strong>Kas dan Setara Kas:</strong> Terdiri dari kas di bendahara dan rekening giro Bank Papua yang bebas dari pembatasan penggunaan.</li>
                  <li><strong>Persediaan:</strong> Dinilai berdasarkan biaya perolehan menggunakan metode FIFO pada komoditas telur dan bahan pokok.</li>
                  <li><strong>Pengakuan Pendapatan:</strong> Pendapatan diakui saat penyerahan barang komoditas atau penyelesaian sewa tenda/gedung.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900">4. Peristiwa Setelah Tanggal Neraca</h4>
                <p className="mt-1">
                  Tidak ada peristiwa luar biasa setelah tanggal neraca yang membutuhkan pengungkapan khusus dalam laporan keuangan ini.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* KOLOM TANDA TANGAN RESMI DIREKTUR (KIRI) & BENDAHARA (KANAN) - BUTIR 17 DOCX */}
        <div className="mt-12 pt-8 border-t border-slate-300">
          <p className="text-right text-xs text-slate-600 mb-6">
            {profile.location ? profile.location.split(',')[0] : 'Jayapura'}, {reportDateFormatted}
          </p>

          <div className="grid grid-cols-2 gap-8 text-center text-xs">
            <div className="space-y-16">
              <div>
                <p className="font-semibold text-slate-700">Mengetahui,</p>
                <p className="font-extrabold uppercase text-slate-900">Direktur BUMKam / BUMMA</p>
              </div>
              <div>
                <p className="font-bold underline text-slate-900 text-sm">{profile.director || 'Eko L Wibowo'}</p>
                <p className="text-[11px] text-slate-500">NIP / Reg: BUMMA-DIR-001</p>
              </div>
            </div>

            <div className="space-y-16">
              <div>
                <p className="font-semibold text-slate-700">Dibuat Oleh,</p>
                <p className="font-extrabold uppercase text-slate-900">Bendahara BUMKam / BUMMA</p>
              </div>
              <div>
                <p className="font-bold underline text-slate-900 text-sm">{profile.treasurer || 'Rita Fanghoi'}</p>
                <p className="text-[11px] text-slate-500">NIP / Reg: BUMMA-BEN-002</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
