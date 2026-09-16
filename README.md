# 🏛️ SIK-BUMMA MEKAR SARI
### Sistem Informasi Keuangan Badan Usaha Milik Masyarakat Adat (BUMMA) Mekar Sari
**Wilayah Adat Mamta, Kabupaten Jayapura, Provinsi Papua**

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.19-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![SAK EP](https://img.shields.io/badge/Standar-SAK%20Entitas%20Privat-059669)](https://iaiglobal.or.id/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com/)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-emerald)]()

---

## 👥 Identitas Akademik & Pengembang
Aplikasi ini dikembangkan dan disempurnakan untuk memenuhi tugas besar mata kuliah **Teknologi Digital Akuntansi (TDA)**:
- **Kelompok**: 3C
- **Program Studi**: S1 Akuntansi
- **Fakultas**: Fakultas Ekonomi dan Bisnis (FEB)
- **Perguruan Tinggi**: Universitas Cenderawasih (UNCEN), Papua
- **Tahun Akademik**: 2026

**Pejabat Pengesahan Laporan Keuangan:**
- **Direktur BUMKam / BUMMA**: `Eko L Wibowo`
- **Bendahara BUMKam / BUMMA**: `Rita Fanghoi`

---

## 🌟 Pilar Bisnis & Unit Usaha BUMKam Mekar Sari
Aplikasi ini mendukung operasional dan akuntansi untuk 3 unit usaha inti:
1. **🥚 Unit Peternakan & Penjualan Telur Ayam Lokal**: Panen harian higienis untuk ketahanan pangan kampung adat (Tarif: Rp 70.000 / Rak).
2. **⛺ Unit Jasa Penyewaan Tenda Acara & Pesta**: Layanan sewa tenda tratak, kursi, dan kanopi acara adat/keluarga siap pasang (Tarif: Rp 1.000.000 / Hari).
3. **🏛️ Unit Jasa Penyewaan Gedung Serbaguna**: Aula pertemuan megah pusat kampung dengan kapasitas 250+ tamu, tata panggung, dan sound system (Tarif: Rp 2.000.000 / Acara).

---

## 🔑 Kredensial Akun Demo & Segregation of Duties (RBAC)
Sistem menerapkan prinsip pemisahan tugas akuntansi (*Segregation of Duties*) dengan 8 peran pengguna terverifikasi:

| Akun / Judul | Username / Email | Role | Akses Menu | Kata Sandi Resmi |
| :--- | :--- | :--- | :---: | :--- |
| **Admin BUMMA** | `admin_bumma` | Administrator | **13 Menu (Penuh)** | `BummaMekarSari2026!` atau `BUMMA123!` |
| **Akuntansi** | `accounting@bumma-demo.id` | Akuntansi | **10 Menu** | `BummaMekarSari2026!` atau `BUMMA123!` |
| **Keuangan** | `finance@bumma-demo.id` | Keuangan | **8 Menu** | `BummaMekarSari2026!` atau `BUMMA123!` |
| **Sales** | `sales@bumma-demo.id` | Sales | **5 Menu** | `BummaMekarSari2026!` atau `BUMMA123!` |
| **Pembelian** | `purchasing@bumma-demo.id` | Pembelian | **5 Menu** | `BummaMekarSari2026!` atau `BUMMA123!` |
| **Gudang** | `warehouse@bumma-demo.id` | Gudang | **4 Menu** | `BummaMekarSari2026!` atau `BUMMA123!` |
| **Manajer** | `manager@bumma-demo.id` | Manajer | **10 Menu** | `BummaMekarSari2026!` atau `BUMMA123!` |
| **Auditor** | `auditor@bumma-demo.id` | Auditor | **8 Menu** | `BummaMekarSari2026!` atau `BUMMA123!` |

> 💡 **Fitur Presentasi Sidang (Dual Mode Switcher)**:
> Tersedia tombol sakelar di baris header atas untuk beralih antara **Mode Ketat (Sesuai Role)** dan **Mode Demo (Semua Menu Terbuka)** serta dropdown ganti peran instan tanpa logout.

---

## 📊 Modul & Fitur Unggulan Sistem
- **Storefront & Landing Page Publik**: Tampilan komoditas showcase modern ala Ulambox dilengkapi animasi vektor motif adat Papua, efek Ken Burns, galeri multi-sudut pandang, dan tombol pemesanan WhatsApp langsung.
- **Master Data Terpadu**: Pengelolaan Chart of Accounts (COA 4 digit standar SAK), Daftar Produk/Jasa, Pelanggan, Pemasok, Karyawan, serta tab khusus pengelolaan konten 3 Unit Usaha Landing Page.
- **Transaksi Jual-Beli & Kas-Bank**: Pencatatan penjualan tunai/kredit, pembelian stok, kas masuk/keluar, dilengkapi fitur **Edit** dan **Hapus**.
- **Siklus Akuntansi Berpasangan (Double-Entry Bookkeeping)**: Jurnal Umum otomatis dengan saldo berjalan (*running balance*), Buku Besar per akun, dan Neraca Saldo seimbang (*balanced trial balance*).
- **5 Laporan Keuangan SAK Entitas Privat**:
  1. Laporan Laba Rugi
  2. Laporan Perubahan Ekuitas
  3. Neraca / Laporan Posisi Keuangan
  4. Laporan Arus Kas
  5. Catatan atas Laporan Keuangan (CaLK)
  *(Dilengkapi kop surat resmi dan tanda tangan digital Direktur & Bendahara)*.
- **Analisis Kinerja Tren Keuangan**: Evaluasi rasio keuangan (NPM, Current Ratio, ROA, Inventory Turnover, DAR) dengan filter kuartalan (TW 1, TW 2, TW 3, Tahunan) dan matriks tren bursa efek.
- **Modul Penggajian (Payroll)**: Perhitungan gaji pokok, cetak Slip Gaji resmi, dan tombol posting otomatis beban gaji ke Jurnal Umum SAK.
- **Tombol Scroll-to-Top Universal**: Tombol melayang pintar di seluruh halaman aplikasi.

---

## 🚀 Panduan Instalasi Lokal

### Prasyarat
- Node.js versi 18.x atau lebih baru
- npm versi 9.x atau lebih baru

### Langkah Menjalankan Aplikasi
```bash
# 1. Clone repositori
git clone https://github.com/<username-anda>/sik-bumma.git
cd sik-bumma

# 2. Masuk ke direktori frontend & pasang dependensi
cd frontend
npm install

# 3. Jalankan server pengembangan
npm start
```
Buka peramban Anda di `http://localhost:3000`.

---

## ☁️ Deployment ke Vercel (1-Click Deploy)

Repositori ini telah dikonfigurasi dengan `vercel.json` dan skrip root universal sehingga dapat dideploy secara langsung ke [Vercel](https://vercel.com):

1. **Push repositori** ke akun GitHub Anda.
2. Buka [Vercel Dashboard](https://vercel.com/dashboard) &rarr; klik **Add New...** &rarr; **Project**.
3. Pilih repositori **`sik-bumma`** dari daftar GitHub Anda.
4. Pada bagian **Root Directory**:
   - Anda dapat membiarkannya di root (`./`), atau
   - Memilih folder `frontend`.
5. Klik tombol **Deploy** dan tunggu proses build selesai (~1 menit).
6. Aplikasi SIK-BUMMA Anda kini aktif secara publik melalui tautan `https://[nama-proyek].vercel.app`!

---

## 📄 Hak Cipta & Lisensi
&copy; 2026 BUMKam Mekar Sari. Hak Cipta Dilindungi Undang-Undang.  
**Teknologi Digital Akuntansi (TDA) Kelompok 3C • • S1 Akuntansi FEB Universitas Cenderawasih**
