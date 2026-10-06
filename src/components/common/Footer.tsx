import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, WhatsappLogo, ShieldCheck, Sparkle, Phone } from '@phosphor-icons/react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-16 pb-20 md:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                <Sparkle weight="fill" className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white tracking-tight">
                CleanCraft Laundry
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Layanan laundry kiloan profesional & higienis untuk wilayah Jakarta Selatan. Dilengkapi smart pickup radius, penimbangan transparan, dan notifikasi WhatsApp terstruktur.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck weight="bold" className="w-4 h-4 text-emerald-400" />
              <span>Satu Mesin Satu Pelanggan (Higienis)</span>
            </div>
          </div>

          {/* Operational Hours & Location */}
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-white text-sm tracking-wide">
              Outlet & Jam Operasional
            </h4>
            <div className="flex items-start gap-2.5 text-xs text-slate-400">
              <MapPin weight="fill" className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Jl. Gandaria Tengah II No. 14, Kramat Pela, Kebayoran Baru, Jakarta Selatan
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <Clock weight="fill" className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Setiap Hari: 08.00 – 20.00 WIB</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <Phone weight="fill" className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>+62 812-9842-1823</span>
            </div>
          </div>

          {/* Navigasi Cepat */}
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-white text-sm tracking-wide">
              Navigasi Cepat
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Daftar Layanan & Harga
                </Link>
              </li>
              <li>
                <Link to="/booking" className="hover:text-white transition-colors">
                  Booking Pickup & Drop-Off
                </Link>
              </li>
              <li>
                <Link to="/tracking" className="hover:text-white transition-colors">
                  Lacak Status Cucian (Tracking)
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-white transition-colors text-slate-500">
                  Portal Login Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* WhatsApp Direct */}
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-white text-sm tracking-wide">
              Bantuan Cepat
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ada pertanyaan khusus atau butuh jemput kilat? Hubungi admin outlet langsung via WhatsApp.
            </p>
            <a
              href="https://wa.me/6281298421823"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              <WhatsappLogo weight="fill" className="w-4 h-4" />
              <span>Chat WhatsApp Outlet</span>
            </a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 CleanCraft Laundry Studio. Sistem Booking Laundry PRD v2.1.0.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Radius Pickup Maksimal 5.0 KM</span>
            <span>•</span>
            <span>Berat Aktual Sumber Tagihan</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
