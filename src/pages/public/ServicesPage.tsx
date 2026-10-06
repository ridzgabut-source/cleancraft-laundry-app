import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkle,
  Clock,
  Check,
  ArrowRight,
  Scales,
} from '@phosphor-icons/react';
import { mockApi } from '../../lib/mockApi';
import type { Service } from '../../types';
import { formatRupiah } from '../../lib/utils';

export const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    async function fetch() {
      const res = await mockApi.getServices();
      setServices(res);
    }
    fetch();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-14 space-y-12">
      {/* Header */}
      <div className="space-y-3 max-w-2xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          <Sparkle weight="bold" className="w-3.5 h-3.5" />
          <span>Katalog Tarif Resmi CleanCraft</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Layanan & Tarif Laundry Kiloan
        </h1>
        <p className="text-slate-600 text-sm md:text-base leading-relaxed">
          Semua cucian dicuci terpisah (1 mesin untuk 1 pelanggan). Tagihan akhir dihitung transparan berdasarkan berat riil setelah ditimbang di outlet.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="diffusion-card bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-lg transition-all"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  {service.badge && (
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
                      {service.badge}
                    </span>
                  )}
                  <h3 className="font-display font-bold text-xl text-slate-900">
                    {service.name}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {service.description}
              </p>

              {/* What's included checklist */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Check weight="bold" className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Satu mesin per pelanggan (tidak dicampur)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check weight="bold" className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Deterjen ramah serat & pelembut harum tahan lama</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check weight="bold" className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Foto timbangan dikirim sebelum proses</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6 space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500">Harga Layanan:</span>
                <div className="font-mono text-2xl font-bold text-emerald-700">
                  {formatRupiah(service.pricePerKg)}
                  <span className="text-xs font-normal text-slate-500 font-sans"> / kg</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock weight="fill" className="w-4 h-4 text-slate-400" />
                <span>Waktu Pengerjaan: ~{service.estimatedHours} Jam</span>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/booking?service=${service.id}`)}
                className="tactile-btn w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>Pilih Layanan & Booking</span>
                <ArrowRight weight="bold" className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Transparency Guarantee Banner per PRD Section 3.4 & 38 */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-slate-200 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <Scales weight="fill" className="w-4 h-4" />
          <span>Prinsip Kejujuran Berat Bersih (Actual Weight)</span>
        </div>
        <h3 className="font-display font-bold text-xl text-white">
          Estimasi di Website Bukan Tagihan Final
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-3xl">
          Ketika Anda melakukan booking, Anda hanya memilih estimasi kantong cucian. Tagihan final yang wajib dibayar dihitung murni berdasarkan berat timbangan digital sesaat setelah cucian tiba di outlet kami. Anda akan menerima foto timbangan asli melalui WhatsApp sebelum cucian mulai dicuci.
        </p>
      </div>
    </div>
  );
};
