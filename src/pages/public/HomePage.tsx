import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkle,
  Truck,
  WhatsappLogo,
  CheckCircle,
  Clock,
  ArrowRight,
  MapPin,
  MagnifyingGlass,
  Check,
  WarningCircle,
} from '@phosphor-icons/react';
import { mockApi } from '../../lib/mockApi';
import type { Service } from '../../types';
import { formatRupiah } from '../../lib/utils';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);

  // Quick radius test coordinates state
  const [testLocation, setTestLocation] = useState({
    name: 'Gandaria (Dekat Outlet)',
    lat: -6.2425,
    lon: 106.7925,
  });
  const [validationResult, setValidationResult] = useState<{
    distanceKm: number;
    withinRadius: boolean;
    pickupFee: number;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const srvList = await mockApi.getServices();
        setServices(srvList);
        
        const res = await mockApi.validateLocation(testLocation.lat, testLocation.lon);
        setValidationResult(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const handleTestRadius = async (lat: number, lon: number, name: string) => {
    setTestLocation({ name, lat, lon });
    try {
      const res = await mockApi.validateLocation(lat, lon);
      setValidationResult(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const sampleLocations = [
    { name: 'Kebayoran Baru (1.4 km)', lat: -6.2425, lon: 106.7925 },
    { name: 'Gandaria City (2.8 km)', lat: -6.244, lon: 106.783 },
    { name: 'Blok M Plaza (3.2 km)', lat: -6.2445, lon: 106.798 },
    { name: 'Kemang Raya (4.6 km)', lat: -6.273, lon: 106.815 },
    { name: 'Tebet (Di Luar Radius 7.2 km)', lat: -6.228, lon: 106.855 },
  ];

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="relative pt-6 md:pt-14 pb-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 space-y-6"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Smart Laundry Booking v2.1 • WhatsApp First</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.08]">
                Laundry Kiloan Bersih, Rapi &{' '}
                <span className="text-emerald-600 underline decoration-emerald-300 decoration-wavy decoration-2">
                  Transparan.
                </span>
              </h1>

              {/* Body */}
              <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-[58ch]">
                Tidak perlu install aplikasi atau bikin akun. Pilih layanan, cek radius pickup secara cerdas, dan terima foto timbangan aktual langsung via WhatsApp.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/booking"
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition-all text-center w-full"
                  >
                    <Sparkle weight="bold" className="w-4 h-4" />
                    <span>Booking Laundry Sekarang</span>
                    <ArrowRight weight="bold" className="w-4 h-4 ml-1" />
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/tracking"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl border border-slate-200 shadow-sm transition-all text-center w-full"
                  >
                    <MagnifyingGlass weight="bold" className="w-4 h-4 text-slate-500" />
                    <span>Lacak Pesanan Anda</span>
                  </Link>
                </motion.div>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 grid grid-cols-3 gap-3 border-t border-slate-200/80 max-w-lg">
                <div className="space-y-0.5">
                  <div className="font-mono text-emerald-700 font-bold text-lg">5.0 KM</div>
                  <div className="text-[11px] text-slate-500 font-medium">Maks. Radius Pickup</div>
                </div>
                <div className="space-y-0.5">
                  <div className="font-mono text-emerald-700 font-bold text-lg">Rp7.000</div>
                  <div className="text-[11px] text-slate-500 font-medium">Mulai / Kg Reguler</div>
                </div>
                <div className="space-y-0.5">
                  <div className="font-mono text-emerald-700 font-bold text-lg">100%</div>
                  <div className="text-[11px] text-slate-500 font-medium">Timbang Transparan</div>
                </div>
              </div>
            </motion.div>

            {/* Right Visual Bento */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="lg:col-span-5 space-y-4"
            >
              <div className="diffusion-card p-6 rounded-3xl border border-slate-200 bg-white relative overflow-hidden shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Truck weight="bold" className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900">Outlet CleanCraft</h3>
                      <p className="text-[11px] text-slate-500">Kebayoran Baru, Jakarta Selatan</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    Buka Hari Ini
                  </span>
                </div>

                <div className="py-4 space-y-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Status Operasional</span>
                      <span className="font-semibold text-emerald-700 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Menerima Cucian
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Jam Kerja</span>
                      <span className="font-mono text-slate-800 font-medium">08.00 – 20.00 WIB</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Slot Pickup Hari Ini</span>
                      <span className="font-mono text-emerald-700 font-bold">Tersedia (Pagi/Sore)</span>
                    </div>
                  </div>

                  {/* Flow Highlight */}
                  <div className="space-y-2 pt-1 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle weight="fill" className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Tanpa Akun & Password — Langsung booking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle weight="fill" className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Tagihan final dihitung dari berat timbangan asli</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle weight="fill" className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Foto timbangan cucian dikirimkan via WhatsApp</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Link
                      to="/booking"
                      className="w-full block py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl text-center transition-colors"
                    >
                      Mulai Booking Online Sekarang
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Smart Radius & Distance Checker Widget */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-xl relative overflow-hidden"
        >
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <MapPin weight="bold" className="w-3.5 h-3.5" />
              <span>Simulasi Cek Radius Layanan (Haversine Formula)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Cek Jarak Antar-Jemput ke Rumah Anda
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
              Sistem kami secara otomatis menghitung jarak lurus ke outlet. Layanan pickup tersedia hingga radius <strong className="text-emerald-400">5.0 km</strong>.
            </p>

            {/* Quick Location Pills */}
            <div className="pt-2">
              <p className="text-xs text-slate-400 mb-2 font-medium">Uji coba simulasi titik lokasi:</p>
              <div className="flex flex-wrap gap-2">
                {sampleLocations.map((loc) => (
                  <motion.button
                    key={loc.name}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => handleTestRadius(loc.lat, loc.lon, loc.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                      testLocation.name === loc.name
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    {loc.name}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Live Result Feedback Card */}
            {validationResult && (
              <motion.div
                key={testLocation.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700 text-slate-200 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {validationResult.withinRadius ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <Check weight="bold" className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                          <WarningCircle weight="bold" className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <span className="font-semibold text-sm text-white">
                        {validationResult.withinRadius
                          ? 'Lokasi Tersedia untuk Pickup'
                          : 'Lokasi di Luar Jangkauan Pickup'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Titik uji: <span className="text-slate-200 font-medium">{testLocation.name}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">Jarak dari Outlet</div>
                    <div className="font-mono text-xl font-bold text-emerald-400">
                      {validationResult.distanceKm} km
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                  <div>
                    {validationResult.withinRadius ? (
                      <span className="text-emerald-300">
                        Tarif Pickup: <strong>{formatRupiah(validationResult.pickupFee)}</strong> (Maks 5 km)
                      </span>
                    ) : (
                      <span className="text-rose-300">
                        Melebihi batas maksimal 5 km. Anda tetap dapat menggunakan opsi <strong>Antar Mandiri (Self Drop-off)</strong>.
                      </span>
                    )}
                  </div>

                  <Link
                    to="/booking"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs self-start sm:self-auto shadow-sm"
                  >
                    <span>Lanjut Booking</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* Services Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="space-y-4 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            <Sparkle weight="bold" className="w-3.5 h-3.5" />
            <span>Pilihan Layanan Kiloan</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Tarif Transparan Tanpa Biaya Tersembunyi
              </h2>
              <p className="text-slate-600 text-sm mt-1 max-w-xl">
                Dihitung berdasarkan berat aktual setelah ditimbang di outlet menggunakan timbangan digital terkalibrasi.
              </p>
            </div>
            <Link
              to="/services"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Lihat Detail Semua Layanan</span>
              <ArrowRight weight="bold" className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Services Grid with Motion */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              whileHover={{ y: -4 }}
              className="diffusion-card rounded-2xl p-6 flex flex-col justify-between border border-slate-200/90 hover:border-emerald-500/50 hover:shadow-lg transition-all group bg-white"
            >
              <div className="space-y-3">
                {service.badge && (
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {service.badge}
                  </span>
                )}
                <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {service.name}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed min-h-[3rem]">
                  {service.description}
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-4 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500">Harga / Kg:</span>
                  <div className="font-mono text-xl font-bold text-emerald-700">
                    {formatRupiah(service.pricePerKg)}
                    <span className="text-xs font-normal text-slate-500 font-sans"> / kg</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock weight="fill" className="w-3.5 h-3.5 text-slate-400" />
                  <span>Estimasi selesai ~{service.estimatedHours} jam</span>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => navigate(`/booking?service=${service.id}`)}
                  className="w-full py-2.5 bg-slate-900 group-hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Pilih Layanan Ini</span>
                  <ArrowRight weight="bold" className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4-Step Operational Flow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-100/70 border border-slate-200/80 rounded-3xl p-6 sm:p-10 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Alur Mudah Tanpa Repot
            </h2>
            <p className="text-slate-600 text-sm">
              Dirancang ringkas agar Anda bisa memesan laundry dalam hitungan menit lewat HP.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <span className="font-mono text-3xl font-black text-emerald-600/30">01</span>
              <h4 className="font-bold text-slate-900 text-sm">Pilih Layanan & Metode</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tentukan layanan kiloan dan pilih apakah kurir menjemput (Pickup) atau Anda antar sendiri (Self Drop-off).
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <span className="font-mono text-3xl font-black text-emerald-600/30">02</span>
              <h4 className="font-bold text-slate-900 text-sm">Pilih Slot & Booking</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pilih slot jadwal pickup yang tersedia. Sistem langsung membuat Kode Booking unik untuk Anda.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <span className="font-mono text-3xl font-black text-emerald-600/30">03</span>
              <h4 className="font-bold text-slate-900 text-sm">Timbang & Foto WhatsApp</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Outlet menimbang cucian dan mengirimkan foto angka timbangan digital langsung ke WhatsApp Anda.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <span className="font-mono text-3xl font-black text-emerald-600/30">04</span>
              <h4 className="font-bold text-slate-900 text-sm">Bayar & Terima Cucian</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bayar tagihan final via QRIS, Transfer Bank, atau Cash. Pantau status cucian hingga wangi dan selesai.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Outlet Location Info Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-6">
        <div className="diffusion-card rounded-3xl p-6 sm:p-8 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 bg-white">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <MapPin weight="fill" className="w-4 h-4 text-emerald-600" />
              <span>LOKASI OUTLET FISIK KAMI</span>
            </div>
            <h3 className="font-display font-bold text-xl text-slate-900">
              CleanCraft Laundry Studio — Gandaria
            </h3>
            <p className="text-xs text-slate-600 max-w-xl">
              Jl. Gandaria Tengah II No. 14, Kramat Pela, Kebayoran Baru, Jakarta Selatan. Dekat RS Gandaria dan Pasar Santa.
            </p>
            <p className="text-xs text-slate-500 font-mono">
              Koordinat: -6.2528, 106.7935 • Radius Layanan Aktif: 5.0 KM
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href="https://wa.me/6281298421823"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
            >
              <WhatsappLogo weight="fill" className="w-4 h-4" />
              <span>Hubungi Outlet via WA</span>
            </motion.a>
          </div>
        </div>
      </section>
    </div>
  );
};
