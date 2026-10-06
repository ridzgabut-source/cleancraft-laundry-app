import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  CheckCircle,
  WhatsappLogo,
  MagnifyingGlass,
  Copy,
  Check,
  House,
} from '@phosphor-icons/react';
import { mockApi } from '../../lib/mockApi';
import type { Booking, Settings } from '../../types';
import { buildBookingWhatsAppMessage, createWhatsAppUrl } from '../../lib/whatsapp';

export const BookingSuccessPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const location = useLocation();

  const [booking, setBooking] = useState<Booking | null>(
    (location.state as { booking?: Booking })?.booking || null
  );
  const [settings, setSettings] = useState<Settings | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(!booking);

  useEffect(() => {
    async function load() {
      try {
        const setList = await mockApi.getSettings();
        setSettings(setList);

        if (!booking && code) {
          // Attempt to find booking from mock storage
          const all = await mockApi.adminGetBookings();
          const found = all.find((b) => b.bookingCode.toUpperCase() === code.toUpperCase());
          if (found) setBooking(found);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [booking, code]);

  const handleCopyCode = () => {
    if (!booking) return;
    navigator.clipboard.writeText(booking.bookingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        Memuat detail konfirmasi booking...
      </div>
    );
  }

  const bookingCode = booking?.bookingCode || code || 'LDR-SUCCESS';
  const waUrl =
    booking && settings
      ? createWhatsAppUrl(settings.whatsapp, buildBookingWhatsAppMessage(booking, settings))
      : `https://wa.me/6281298421823?text=Halo%20CleanCraft,%20saya%20sudah%20booking%20dengan%20kode%20${bookingCode}`;

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 md:py-16 space-y-6">
      {/* Success Card */}
      <div className="diffusion-card bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle weight="fill" className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Booking Berhasil Tersimpan
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight pt-2">
            Pesanan Anda Diterima
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Terima kasih! Data booking Anda sudah tercatat di sistem kami dengan status{' '}
            <strong className="text-amber-700">PENDING</strong>.
          </p>
        </div>

        {/* Booking Reference Box per PRD Section 30 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Kode Referensi Booking Anda
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="font-mono text-xl sm:text-2xl font-bold text-slate-900 tracking-wide">
              {bookingCode}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
              title="Salin kode booking"
            >
              {copied ? (
                <Check weight="bold" className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy weight="bold" className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Simpan kode ini untuk melakukan pengecekan status laundry kapan saja.
          </p>
        </div>

        {/* WhatsApp Direct Action (PRD Section 47) */}
        <div className="space-y-3 pt-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="tactile-btn w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 text-center"
          >
            <WhatsappLogo weight="fill" className="w-5 h-5" />
            <span>Chat Laundry via WhatsApp Sekarang</span>
          </a>

          <p className="text-[11px] text-slate-500 leading-relaxed px-4">
            Klik tombol di atas untuk mengirimkan rincian booking otomatis ke WhatsApp outlet agar segera dikonfirmasi oleh admin.
          </p>
        </div>

        {/* Secondary Navigation */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={`/tracking?code=${bookingCode}`}
            className="tactile-btn w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5"
          >
            <MagnifyingGlass weight="bold" className="w-4 h-4 text-slate-500" />
            <span>Lacak Status Pesanan Ini</span>
          </Link>

          <Link
            to="/"
            className="tactile-btn w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5"
          >
            <House weight="bold" className="w-4 h-4 text-slate-500" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
