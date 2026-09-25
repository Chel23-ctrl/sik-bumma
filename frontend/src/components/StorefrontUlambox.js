import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Store, 
  ChevronRight, 
  ChevronLeft,
  Phone, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Award, 
  HeartHandshake, 
  TrendingUp, 
  MessageCircle, 
  CheckCircle,
  LogIn,
  Maximize2,
  X,
  ArrowUp
} from 'lucide-react';
import { formatIDR } from './Transaksi';
import SectorBackground from './SectorBackground';
import ScrollToTopButton from './ScrollToTopButton';

// 3 Official Core Services & Products with Multiple High-Res Images
export const DEFAULT_CORE_PRODUCTS = [
  {
    id: 'core_1',
    title: 'Peternakan & Penjualan Telur Ayam Lokal',
    category: 'Unit Usaha Perdagangan & Peternakan',
    badge: 'Panen Segar Harian',
    price: 'Rp 70.000',
    unit: 'Per Rak (30 Butir)',
    images: [
      {
        url: '/images/products/telur_segar_1.jpg',
        caption: 'Telur Ayam Ras Segar Pilihan - Disortir Bersih Setiap Pagi'
      },
      {
        url: '/images/products/kandang_ayam_2.jpg',
        caption: 'Kandang Peternakan Modern & Sehat Binaan Masyarakat Adat'
      },
      {
        url: '/images/products/rak_telur_30_3.jpg',
        caption: 'Rak Telur Karton Isi 30 Butir Pilihan - Panen Segar Harian'
      }
    ],
    description: 'Produksi telur ayam ras & kampung berkualitas prima dari peternakan binaan masyarakat adat BUMKam Mekar Sari. Dijamin selalu segar panen setiap pagi, bebas bahan pengawet, higienis, dan kaya nutrisi untuk kebutuhan konsumsi keluarga, warung, maupun katering.',
    features: [
      'Panen segar setiap hari langsung dari kandang lokal',
      'Penyortiran higienis ukuran standar & bersih',
      'Harga stabil dan terjangkau bagi warga kampung',
      'Mendukung kemandirian pangan masyarakat adat'
    ],
    whatsappMsg: 'Halo BUMKam Mekar Sari, saya ingin informasi pemesanan Telur Ayam Lokal',
    floatingBadge: '🥚 60+ Rak Telur Baru Dipanen Pagi Ini'
  },
  {
    id: 'core_2',
    title: 'Penyewaan Tenda Acara & Pesta',
    category: 'Unit Usaha Jasa Penyewaan',
    badge: 'Layanan Siap Pasang',
    price: 'Rp 1.000.000',
    unit: 'Per Hari / Paket',
    images: [
      {
        url: '/images/products/tenda_marquee_1.jpg',
        caption: 'Tenda Kanopi & Marquee Acara Pesta Luar Ruangan Bersih & Megah'
      },
      {
        url: '/images/products/tenda_kerucut_2.jpg',
        caption: 'Tenda Tratak Kerucut & Rangka Baja Kokoh Tahan Angin & Cuaca Hujan'
      },
      {
        url: '/images/products/tenda_tratak_3.jpg',
        caption: 'Tenda Pesta Kapasitas Besar Lengkap Meja & Kursi Acara Adat'
      }
    ],
    description: 'Layanan persewaan tenda tratak, kanopi pesta, dan tenda upacara adat untuk berbagai kegiatan keluarga, syukuran, pernikahan, ibadah gereja, maupun acara duka cita warga kampung. Dilengkapi tim pemuda adat yang terampil untuk pemasangan dan pembongkaran cepat.',
    features: [
      'Rangka besi kokoh, aman, dan terawat bersih',
      'Kain terpal kanopi tahan cuaca hujan dan panas',
      'Termasuk tenaga pemasangan dan pembongkaran',
      'Dapat dikombinasikan dengan meja & kursi acara'
    ],
    whatsappMsg: 'Halo BUMKam Mekar Sari, saya ingin konsultasi jadwal Penyewaan Tenda Acara',
    floatingBadge: '⛺ Tim Siap Antar & Pasang di Lokasi'
  },
  {
    id: 'core_3',
    title: 'Penyewaan Gedung Serbaguna',
    category: 'Unit Usaha Jasa Penyewaan',
    badge: 'Kapasitas 250+ Tamu',
    price: 'Rp 2.000.000',
    unit: 'Per Acara / Hari',
    images: [
      {
        url: '/images/products/gedung_aula_1.jpg',
        caption: 'Aula Pertemuan Serbaguna Modern Representatif di Pusat Kampung'
      },
      {
        url: '/images/products/gedung_resepsi_2.jpg',
        caption: 'Tata Ruang Resepsi Pernikahan Megah & Meja Perjamuan Mewah'
      },
      {
        url: '/images/products/gedung_seminar_3.jpg',
        caption: 'Panggung Kehormatan, Tata Lampu & Sound System Acara Akbar'
      }
    ],
    description: 'Gedung pertemuan serbaguna BUMKam Mekar Sari yang representatif, nyaman, dan strategis di pusat kampung. Sangat ideal untuk resepsi pernikahan adat, seminar, rapat koordinasi distrik, musyawarah kampung, ibadah perayaan, serta festival budaya.',
    features: [
      'Ruang utama luas berkapasitas 200 s/d 300 tamu',
      'Dilengkapi panggung kehormatan dan fasilitas sound system dasar',
      'Area parkir kendaraan roda 2 dan roda 4 yang memadai',
      'Kebersihan dan keamanan gedung terjaga oleh pengurus'
    ],
    whatsappMsg: 'Halo BUMKam Mekar Sari, saya ingin cek ketersediaan Gedung Serbaguna',
    floatingBadge: '🏛️ Fasilitas Sound System & Panggung Lengkap'
  }
];

export default function StorefrontUlambox({ onOpenBackoffice, profile = {}, coreProducts = DEFAULT_CORE_PRODUCTS }) {
  const displayProducts = (coreProducts && coreProducts.length > 0) ? coreProducts : DEFAULT_CORE_PRODUCTS;

  // Active image index for each card [prodIndex: imgIndex]
  const [activeImgIndexes, setActiveImgIndexes] = useState({ 0: 0, 1: 0, 2: 0 });
  const [lightboxImg, setLightboxImg] = useState(null);

  // Auto-slide images softly every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveImgIndexes(prev => {
        const next = { ...prev };
        displayProducts.forEach((prod, pIdx) => {
          const len = prod.images && prod.images.length > 0 ? prod.images.length : 1;
          next[pIdx] = ((prev[pIdx] || 0) + 1) % len;
        });
        return next;
      });
    }, 6000);
    return () => clearInterval(timer);
  }, [displayProducts]);

  // Floating Scroll to Top Visibility Listener
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 250);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleNextImg = (prodIdx, e) => {
    e.stopPropagation();
    const len = displayProducts[prodIdx]?.images?.length || 1;
    setActiveImgIndexes(prev => ({
      ...prev,
      [prodIdx]: ((prev[prodIdx] || 0) + 1) % len
    }));
  };

  const handlePrevImg = (prodIdx, e) => {
    e.stopPropagation();
    const len = displayProducts[prodIdx]?.images?.length || 1;
    setActiveImgIndexes(prev => ({
      ...prev,
      [prodIdx]: ((prev[prodIdx] || 0) - 1 + len) % len
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-[#0a3a2a] text-white text-[11px] font-semibold py-2 px-4 text-center flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>ARVEA &bull; Financial Management System BUMKam Mekar Sari Kampung Sabron Sari &bull; &ldquo;Satu Nilai, Satu Tujuan, Bertumbuh Bersama&rdquo; &bull; Standar SAK EMKM</span>
      </div>

      {/* 2. MAIN HEADER & NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0a3a2a] to-emerald-700 text-white flex items-center justify-center font-black text-sm shadow-md transition transform hover:scale-105">
              AR
            </div>
            <div>
              <span className="text-xs font-black tracking-widest text-[#0a3a2a] uppercase block leading-none">
                ARVEA &bull; BUMKAM MEKAR SARI
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Kampung Sabron Sari &bull; Sentani Barat
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
            <a href="#beranda" className="hover:text-emerald-700 transition">Beranda</a>
            <a href="#komoditas" className="hover:text-emerald-700 transition">Komoditas &amp; Layanan</a>
            <a href="#impact" className="hover:text-emerald-700 transition">BUMKam Impact</a>
            <a href="#kontak" className="hover:text-emerald-700 transition">Kontak Kami</a>
          </nav>

          {/* Switcher to ARVEA (Internal Accounting Portal) */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenBackoffice}
              className="px-4 py-2 rounded-xl bg-[#0a3a2a] hover:bg-[#06291d] text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm transform hover:-translate-y-0.5"
              title="Masuk ke Sistem Informasi Keuangan BUMKam (ARVEA)"
            >
              <Store className="w-4 h-4 text-emerald-300" />
              <span>Portal Keuangan (ARVEA)</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO BANNER WITH ANIMATED VISUAL CENTERPIECE */}
      <section id="beranda" className="bg-gradient-to-r from-[#0a3a2a] via-[#0c4a36] to-emerald-800 text-white relative overflow-hidden py-14 md:py-24 px-4 sm:px-6 lg:px-8">
        {/* Animated Glow Blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        {/* Transparent Sector Background Animations */}
        <SectorBackground variant="dark" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          
          {/* Left Hero Text (7 Cols) */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-extrabold uppercase tracking-wider mb-4">
              <Award className="w-3.5 h-3.5 text-amber-400" /> Badan Usaha Milik Kampung Adat
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-5">
              Komoditas Peternakan &amp; Layanan Mandiri BUMKam Mekar Sari.
            </h1>
            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed mb-7 font-normal max-w-2xl">
              Menggerakkan ekonomi lokal masyarakat adat Jayapura melalui peternakan telur ayam berkualitas, penyediaan sarana tenda pesta representatif, dan fasilitas gedung serbaguna terpadu.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5">
              <a
                href="#komoditas"
                className="px-6 py-3.5 rounded-xl bg-white text-[#0a3a2a] font-extrabold text-xs shadow-xl hover:bg-emerald-50 transition transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                Lihat Komoditas &amp; Layanan <ChevronRight className="w-4 h-4 text-emerald-700" />
              </a>
              <a
                href="#kontak"
                className="px-5 py-3.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-950/90 border border-emerald-500/30 text-emerald-200 font-bold text-xs transition"
              >
                Hubungi Pengurus BUMKam
              </a>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-8 mt-8 border-t border-emerald-800/60 max-w-lg mx-auto lg:mx-0">
              <div>
                <p className="text-2xl md:text-3xl font-black text-amber-300">100%</p>
                <p className="text-[11px] text-emerald-100/80 font-medium mt-0.5">Segar &amp; Higienis</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-black text-white">24+</p>
                <p className="text-[11px] text-emerald-100/80 font-medium mt-0.5">Mitra Peternak Adat</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-black text-emerald-300">SAK EMKM</p>
                <p className="text-[11px] text-emerald-100/80 font-medium mt-0.5">Tata Kelola Standar</p>
              </div>
            </div>
          </div>

          {/* Right Hero Animated Showcase Visual (5 Cols) */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="w-full max-w-md relative">
              
              {/* Main Animated Photo Frame with Ken Burns Effect */}
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 relative h-80 shimmer-gleam group">
                <img
                  src="/images/products/telur_segar_1.jpg"
                  alt="Peternakan BUMKam Mekar Sari"
                  className="w-full h-full object-cover animate-kenburns"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                <div className="absolute bottom-4 left-4 right-4 text-white pointer-events-none">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300">
                      SENTANI &bull; JAYAPURA
                    </span>
                  </div>
                  <p className="text-sm font-bold leading-tight">
                    Komoditas Asli Tanah Adat Mamta
                  </p>
                </div>
              </div>

              {/* Floating Animated Badge 1 (Top Right) */}
              <div className="absolute -top-4 -right-3 sm:-right-4 bg-white text-slate-900 px-3.5 py-2.5 rounded-2xl shadow-xl border border-emerald-100 flex items-center gap-2.5 animate-float z-20">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  ⭐
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase leading-none">Rating Pelayanan</p>
                  <p className="text-xs font-black text-slate-900 leading-tight">4.9 / 5.0 (Puas)</p>
                </div>
              </div>

              {/* Floating Animated Badge 2 (Bottom Left) */}
              <div className="absolute -bottom-5 -left-3 sm:-left-5 bg-[#0a3a2a] text-white px-3.5 py-2.5 rounded-2xl shadow-xl border border-emerald-500/30 flex items-center gap-2.5 animate-float-delayed z-20">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                  🥚
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-extrabold text-emerald-300 uppercase leading-none">Stok Hari Ini</p>
                  <p className="text-xs font-black text-white leading-tight">60+ Rak Siap Kirim</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 4. SECTION BUMKAM IMPACT (ADOPTING ULAM IMPACT) */}
      <section id="impact" className="py-12 bg-emerald-50/70 border-b border-emerald-100 relative overflow-hidden">
        {/* Transparent Sector Background Animations */}
        <SectorBackground variant="light" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-200/60 px-3 py-1 rounded-full inline-block mb-1.5">
              BUMKAM IMPACT
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Dampak Nyata Untuk Kesejahteraan Kampung Adat
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Seluruh perputaran hasil usaha peternakan dan persewaan dialokasikan untuk dividen kas kampung, peremajaan kandang, dan kemakmuran warga.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs hover:shadow-md transition flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Pemberdayaan Peternak</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Membina 24 kelompok peternak lokal dengan jaminan pasar dan pakan teratur.</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs hover:shadow-md transition flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Kualitas Terjamin</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Telur disortir harian, bebas retak, bersih, dan dipasok dalam kondisi segar.</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs hover:shadow-md transition flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Perputaran Kas Kampung</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Dana bergulir di kampung dan dikelola akuntabel melalui laporan keuangan SAK.</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs hover:shadow-md transition flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Pelayanan Cepat</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Kemudahan sewa tenda, gedung, dan pesanan telur via kontak pengurus resmi.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 3 CORE COMMODITIES & SERVICES SHOWCASE WITH MULTI-PHOTO ANIMATION */}
      <section id="komoditas" className="py-16 relative overflow-hidden flex-1 bg-white">
        {/* Transparent Sector Background Animations */}
        <SectorBackground variant="light" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            KOMODITAS &amp; LAYANAN UNGGULAN
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            3 Unit Usaha Utama BUMKam Mekar Sari
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Klik foto atau panah navigasi untuk melihat galeri visual komoditas dan fasilitas kami
          </p>
        </div>

        {/* 3 Showcase Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {displayProducts.map((prod, pIdx) => {
            const currentImgIdx = activeImgIndexes[pIdx] || 0;
            const currentImage = prod.images[currentImgIdx];

            return (
              <div
                key={prod.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl hover:border-emerald-500 transition-all duration-500 flex flex-col justify-between group transform hover:-translate-y-2"
              >
                <div>
                  
                  {/* Photo Frame with Carousel, Zoom, and Shimmer Animation */}
                  <div className="h-64 overflow-hidden relative bg-slate-900 shimmer-gleam select-none">
                    
                    {/* Active Image with Smooth Transition */}
                    <img
                      key={currentImage.url}
                      src={currentImage.url}
                      alt={prod.title}
                      onClick={() => setLightboxImg(currentImage)}
                      className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 cursor-pointer"
                    />

                    {/* Gradient Overlay for Text Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-[#0a3a2a]/90 backdrop-blur text-white shadow-md border border-white/20">
                        #{pIdx + 1} &bull; {prod.category}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxImg(currentImage);
                        }}
                        className="pointer-events-auto w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur text-white flex items-center justify-center transition"
                        title="Perbesar Foto"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Image Caption & Floating Badge */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between pointer-events-none">
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-white/90 backdrop-blur text-emerald-900 shadow-sm">
                        {prod.badge}
                      </span>
                      <span className="text-[9px] font-semibold text-white/90 bg-black/40 backdrop-blur px-2 py-0.5 rounded-md">
                        {currentImgIdx + 1} / {prod.images.length}
                      </span>
                    </div>

                    {/* Left/Right Photo Carousel Arrows */}
                    <button
                      onClick={(e) => handlePrevImg(pIdx, e)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                      title="Foto Sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleNextImg(pIdx, e)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                      title="Foto Selanjutnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                  </div>

                  {/* Thumbnail Strip Switcher */}
                  <div className="px-5 pt-3 pb-1 flex items-center gap-2 border-b border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Galeri:</span>
                    <div className="flex items-center gap-1.5">
                      {prod.images.map((img, imgIdx) => (
                        <button
                          key={imgIdx}
                          onClick={() => setActiveImgIndexes(prev => ({ ...prev, [pIdx]: imgIdx }))}
                          className={`w-10 h-7 rounded-lg overflow-hidden border transition ${
                            currentImgIdx === imgIdx 
                              ? 'border-emerald-600 ring-2 ring-emerald-500/40 scale-105' 
                              : 'border-slate-200 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-800 transition leading-snug mb-2">
                      {prod.title}
                    </h3>

                    <div className="mb-4 inline-flex items-baseline gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <span className="text-base font-black text-emerald-800">{prod.price}</span>
                      <span className="text-xs font-medium text-slate-500">/ {prod.unit}</span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-5">
                      {prod.description}
                    </p>

                    {/* Features List */}
                    <div className="space-y-2 border-t border-slate-100 pt-4">
                      <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">Keunggulan &amp; Fasilitas:</p>
                      {prod.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Direct WhatsApp Action Button */}
                <div className="p-6 pt-0 mt-2">
                  <a
                    href={`https://wa.me/6281240001122?text=${encodeURIComponent(prod.whatsappMsg)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 rounded-xl bg-[#0a3a2a] hover:bg-[#06291d] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm transform hover:scale-[1.02]"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    Hubungi Layanan &amp; Pemesanan
                  </a>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </section>

      {/* 6. LIGHTBOX MODAL FOR FULL-SIZE IMAGE PREVIEW */}
      {lightboxImg && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="h-96 md:h-[480px] w-full bg-slate-900">
              <img
                src={lightboxImg.url}
                alt={lightboxImg.caption}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-5 bg-white flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-900">{lightboxImg.caption}</p>
                <p className="text-xs text-slate-400 mt-0.5">Foto resmi komoditas &amp; layanan BUMKam Mekar Sari</p>
              </div>
              <button
                onClick={() => setLightboxImg(null)}
                className="px-4 py-2 bg-[#0a3a2a] text-white font-bold text-xs rounded-xl hover:bg-[#06291d]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. SECTION KONTAK & LOKASI */}
      <section id="kontak" className="py-12 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-emerald-900 text-white rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            {/* Transparent Sector Background Animations */}
            <SectorBackground variant="dark" />

            <div className="max-w-xl space-y-2 text-center md:text-left relative z-10">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 bg-emerald-800/80 px-3 py-1 rounded-full inline-block">
                LAYANAN MASYARAKAT ADAT
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">
                Butuh Telur Segar, Sewa Tenda, atau Reservasi Gedung?
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
                Pengurus BUMKam Mekar Sari siap melayani kebutuhan harian keluarga dan kegiatan acara kampung dengan ramah, cepat, dan transparan.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto relative z-10">
              <a
                href="https://wa.me/6281240001122?text=Halo%20Pengurus%20BUMKam%20Mekar%20Sari,%20saya%20ingin%20bertanya%20layanan"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1ebd59] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition transform hover:scale-105"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp: 0812-4000-1122
              </a>
              <button
                onClick={onOpenBackoffice}
                className="px-6 py-3.5 rounded-xl bg-white text-[#0a3a2a] font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-emerald-50 transition transform hover:scale-105"
              >
                <Store className="w-4 h-4 text-emerald-700" />
                Portal ARVEA
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FOOTER RESMI */}
      <footer className="bg-slate-900 text-white pt-12 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black">
                AR
              </div>
              <span className="font-bold text-sm tracking-wide uppercase">ARVEA &bull; BUMKAM MEKAR SARI</span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-md">
              Badan Usaha Milik Kampung (BUMKam) Mekar Sari Kampung Sabron Sari. Mengelola peternakan telur ayam lokal, persewaan tenda acara, dan persewaan gedung serbaguna berstandar SAK EMKM.
            </p>
            <p className="text-emerald-400 font-medium">
              Kampung Sabron Sari &bull; Distrik Sentani Barat &bull; Kabupaten Jayapura, Papua
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Kontak &amp; Operasional</p>
            <ul className="space-y-1.5 text-slate-400">
              <li className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp: 0812-4000-1122</li>
              <li className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-emerald-400" /> Buka: Senin - Sabtu (08:00 - 17:00 WIT)</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-400" /> Sentani, Kab. Jayapura</li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Portal Pengurus BUMKam</p>
            <p className="text-slate-400 leading-relaxed">
              Khusus pengurus, bendahara, direktur, dan pengawas BUMKam untuk pembukuan jurnal dan laporan SAK EMKM.
            </p>
            <button
              onClick={onOpenBackoffice}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-[11px]"
            >
              <LogIn className="w-3.5 h-3.5" /> Masuk Portal ARVEA
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-slate-800 text-center text-slate-400 text-[11px] flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 BUMKam Mekar Sari. Hak Cipta Dilindungi Undang-Undang.</span>
          <span>Teknologi Digital Akuntansi (TDA) Kelompok 3C &bull; &bull; S1 Akuntansi FEB Uncen</span>
        </div>
      </footer>

      {/* 9. TOMBOL UJUNG KANAN BAWAH UNTUK KE HALAMAN PALING ATAS (SELALU AKTIF DI SEMUA HALAMAN) */}
      <ScrollToTopButton />
    </div>
  );
}
