import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MagnifyingGlass,
  CheckFat,
  XCircle,
  WarningCircle,
  Scales,
  WhatsappLogo,
} from '@phosphor-icons/react';
import { mockApi } from '../../lib/mockApi';
import type { Booking, OrderStatus } from '../../types';
import { StatusBadge, PaymentBadge } from '../../components/common/StatusBadge';
import { formatRupiah, formatWeight, formatDateIndonesian } from '../../lib/utils';

export const TrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [bookingCode, setBookingCode] = useState(searchParams.get('code') || '');
  const [phone, setPhone] = useState('081298421823');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-search if code in URL and default phone exists
  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) {
      setBookingCode(codeParam);
      // Auto trigger search
      doTrack(codeParam, phone);
    }
  }, [searchParams]);

  const doTrack = async (codeToSearch: string, phoneToSearch: string) => {
    if (!codeToSearch.trim() || !phoneToSearch.trim()) {
      setErrorMessage('Masukkan kode booking dan nomor WhatsApp Anda.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await mockApi.trackBooking(codeToSearch, phoneToSearch);
      if (res) {
        setBooking(res);
      } else {
        setBooking(null);
        setErrorMessage(
          'Pesanan tidak ditemukan. Pastikan Kode Booking dan Nomor WhatsApp sesuai dengan data saat pemesanan.'
        );
      }
    } catch {
      setErrorMessage('Terjadi kendala saat melacak pesanan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doTrack(bookingCode, phone);
  };

  // Timeline Step Helper
  const timelineSteps: { status: OrderStatus; label: string; desc: string }[] = [
    { status: 'PENDING', label: 'Booking Dibuat', desc: 'Menunggu konfirmasi admin' },
    { status: 'CONFIRMED', label: 'Dikonfirmasi', desc: 'Jadwal & kapasitas pickup disetujui' },
    { status: 'RECEIVED', label: 'Cucian Diterima', desc: 'Cucian tiba di outlet & ditimbang' },
    { status: 'PROCESSING', label: 'Sedang Diproses', desc: 'Pencucian, pengeringan & setrika' },
    { status: 'READY', label: 'Siap Diambil/Diantar', desc: 'Cucian wangi, rapi & bersih' },
    { status: 'COMPLETED', label: 'Selesai', desc: 'Pesanan diserahkan ke pelanggan' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'RECEIVED':
        return 2;
      case 'PROCESSING':
        return 3;
      case 'READY':
        return 4;
      case 'COMPLETED':
        return 5;
      case 'CANCELLED':
        return -1;
      default:
        return 0;
    }
  };

  const currentStepIdx = booking ? getStepIndex(booking.status) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-14 space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center max-w-lg mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          <MagnifyingGlass weight="bold" className="w-3.5 h-3.5" />
          <span>Lacak Status Cucian Real-Time</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Cek Progres Laundry Anda
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Masukkan Kode Booking dan Nomor WhatsApp yang digunakan saat mendaftar.
        </p>
      </div>

      {/* Tracking Form Card */}
      <div className="diffusion-card bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Kode Referensi Booking <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={bookingCode}
                onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                placeholder="Contoh: LDR-20261006-A7F2"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono tracking-wide uppercase"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Nomor WhatsApp <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 081298421823"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-[11px] text-slate-400">
              Contoh uji demo: <button type="button" onClick={() => { setBookingCode('LDR-20261006-A7F2'); setPhone('081298421823'); }} className="text-emerald-700 underline font-mono">LDR-20261006-A7F2</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="tactile-btn inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all disabled:opacity-60"
            >
              <MagnifyingGlass weight="bold" className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Mencari...' : 'Lacak Cucian'}</span>
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <WarningCircle weight="bold" className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">{errorMessage}</p>
          </div>
        )}
      </div>

      {/* Search Result Details */}
      {booking && (
        <div className="diffusion-card bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-8 animate-fadeIn">
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-bold text-slate-900">
                  {booking.bookingCode}
                </span>
                <StatusBadge status={booking.status} size="sm" />
              </div>
              <p className="text-xs text-slate-500">
                Layanan: <strong className="text-slate-800">{booking.serviceName}</strong> • {formatDateIndonesian(booking.createdAt)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <PaymentBadge status={booking.paymentStatus} size="sm" />
            </div>
          </div>

          {/* Stepper Timeline per PRD Section 53 */}
          {booking.status === 'CANCELLED' ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
              <XCircle weight="fill" className="w-6 h-6 text-rose-600 shrink-0" />
              <div>
                <strong className="block font-bold">Booking Dibatalkan</strong>
                <span>Pesanan ini telah dibatalkan oleh admin outlet.</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tahapan Pengerjaan Cucian
              </h3>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {timelineSteps.map((step, idx) => {
                  const isDone = currentStepIdx > idx;
                  const isCurrent = currentStepIdx === idx;

                  return (
                    <div key={step.status} className="relative flex items-start gap-4">
                      {/* Dot icon */}
                      <div
                        className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-600 ring-4 ring-emerald-100'
                            : 'bg-white border-slate-300 text-slate-300'
                        }`}
                      >
                        {isDone ? (
                          <CheckFat weight="bold" className="w-2.5 h-2.5" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div
                          className={`text-xs font-bold ${
                            isCurrent
                              ? 'text-emerald-700'
                              : isDone
                              ? 'text-slate-900'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </div>
                        <div className="text-[11px] text-slate-500">{step.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actual Weight & Scale Photo Box (PRD Section 41 & 53) */}
          {booking.actualWeight && (
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <Scales weight="fill" className="w-4 h-4 text-emerald-700" />
                  <span>Hasil Penimbangan Aktual di Outlet</span>
                </div>
                <span className="font-mono text-base font-bold text-emerald-800">
                  {formatWeight(booking.actualWeight)}
                </span>
              </div>

              {booking.scalePhotoUrl && (
                <div className="pt-2 border-t border-emerald-200/60 space-y-2">
                  <span className="text-[11px] font-semibold text-emerald-800 block">
                    Foto Timbangan Digital:
                  </span>
                  <div className="w-full max-w-sm rounded-xl overflow-hidden border border-emerald-300 shadow-sm bg-black">
                    <img
                      src={booking.scalePhotoUrl}
                      alt="Foto timbangan cucian"
                      className="w-full h-44 object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Billing & Order Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-500 pb-1">
              <span>Metode Layanan:</span>
              <span className="font-semibold text-slate-800">
                {booking.serviceMode === 'PICKUP' ? 'Kurir Pickup' : 'Antar Mandiri'}
              </span>
            </div>

            {booking.serviceMode === 'PICKUP' && booking.pickupSlotTime && (
              <div className="flex items-center justify-between text-slate-500 pb-1">
                <span>Jadwal Penjemputan:</span>
                <span className="font-medium text-slate-800">
                  {booking.scheduledDate} ({booking.pickupSlotTime})
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-slate-500 pb-1">
              <span>Subtotal Layanan:</span>
              <span className="font-mono text-slate-800">{formatRupiah(booking.subtotal)}</span>
            </div>

            {booking.pickupFee > 0 && (
              <div className="flex items-center justify-between text-slate-500 pb-1">
                <span>Biaya Antar-Jemput:</span>
                <span className="font-mono text-slate-800">{formatRupiah(booking.pickupFee)}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
              <span>Total Tagihan:</span>
              <span className="font-mono text-emerald-700">{formatRupiah(booking.total)}</span>
            </div>
          </div>

          {/* Direct Support WhatsApp */}
          <div className="pt-2 text-center">
            <a
              href={`https://wa.me/6281298421823?text=Halo%20CleanCraft,%20saya%20mau%20tanya%20progres%20cucian%20kode%20${booking.bookingCode}`}
              target="_blank"
              rel="noreferrer"
              className="tactile-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <WhatsappLogo weight="fill" className="w-4 h-4 text-emerald-600" />
              <span>Tanyakan Order Ini ke Admin WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
