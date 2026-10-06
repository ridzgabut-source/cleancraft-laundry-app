import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  ArrowsClockwise,
  Sparkle,
  CheckFat,
  Scales,
  Package,
  WhatsappLogo,
  Copy,
  Check,
} from '@phosphor-icons/react';
import { mockApi } from '../../lib/mockApi';
import type { Booking, OrderStatus, PaymentStatus, Settings } from '../../types';
import { StatusBadge, PaymentBadge } from '../../components/common/StatusBadge';
import { formatRupiah, formatWeight, formatDateIndonesian, formatDisplayPhone } from '../../lib/utils';
import {
  buildBillingWhatsAppMessage,
  buildStatusWhatsAppMessage,
  createWhatsAppUrl,
} from '../../lib/whatsapp';

export const BookingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  // Weight form
  const [actualWeightInput, setActualWeightInput] = useState<string>('');
  const [scalePhotoUrlInput, setScalePhotoUrlInput] = useState<string>('');
  const [isUpdatingWeight, setIsUpdatingWeight] = useState(false);
  const [weightMessage, setWeightMessage] = useState<string | null>(null);
  const [weightError, setWeightError] = useState(false);

  // WhatsApp template preview modal
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [waMessageText, setWaMessageText] = useState('');
  const [copiedWA, setCopiedWA] = useState(false);

  const fetchDetail = async () => {
    if (!id) return;
    try {
      const [b, s] = await Promise.all([
        mockApi.adminGetBookingById(id),
        mockApi.getSettings(),
      ]);
      setBooking(b);
      setSettings(s);
      if (b?.actualWeight) {
        setActualWeightInput(String(b.actualWeight));
      }
      if (b?.scalePhotoUrl) {
        setScalePhotoUrlInput(b.scalePhotoUrl);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading || !booking) {
    return (
      <div className="py-16 text-center text-xs text-slate-500">
        Memuat detail pesanan...
      </div>
    );
  }

  // Handle State Machine Transitions per PRD Section 9
  const handleTransition = async (nextStatus: OrderStatus) => {
    try {
      const updated = await mockApi.adminUpdateStatus(booking.id, nextStatus);
      setBooking(updated);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal mengubah status');
    }
  };

  // Handle Payment Status Toggle per PRD Section 10
  const handleTogglePayment = async () => {
    const nextPay: PaymentStatus = booking.paymentStatus === 'PAID' ? 'UNPAID' : 'PAID';
    try {
      const updated = await mockApi.adminUpdatePaymentStatus(booking.id, nextPay);
      setBooking(updated);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal memperbarui status bayar');
    }
  };

  // Handle Actual Weight & Final Billing Calculation per PRD Section 39
  const handleSaveWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(actualWeightInput.replace(',', '.'));
    if (isNaN(weightNum) || weightNum <= 0) {
      setWeightMessage('Masukkan angka berat aktual yang valid (misal: 4.8)');
      return;
    }

    setIsUpdatingWeight(true);
    setWeightMessage(null);
    setWeightError(false);
    try {
      // Use photo url or fallback sample photo
      const photoToSave =
        scalePhotoUrlInput.trim() ||
        'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&q=80';
      const updated = await mockApi.adminUpdateWeight(booking.id, weightNum, photoToSave);
      setBooking(updated);
      setWeightError(false);
      setWeightMessage('Berat aktual dan tagihan final berhasil disimpan!');
      setTimeout(() => setWeightMessage(null), 3500);
    } catch (err: unknown) {
      setWeightError(true);
      setWeightMessage(err instanceof Error ? err.message : 'Gagal menyimpan berat');
    } finally {
      setIsUpdatingWeight(false);
    }
  };

  // Open WhatsApp template modal
  const openBillingWhatsApp = () => {
    if (!settings) return;
    const msg = buildBillingWhatsAppMessage(booking, settings);
    setWaMessageText(msg);
    setWaModalOpen(true);
  };

  const openStatusWhatsApp = (st: 'RECEIVED' | 'PROCESSING' | 'READY' | 'COMPLETED') => {
    if (!settings) return;
    const msg = buildStatusWhatsAppMessage(booking, st, settings);
    setWaMessageText(msg);
    setWaModalOpen(true);
  };

  const handleCopyWA = () => {
    navigator.clipboard.writeText(waMessageText);
    setCopiedWA(true);
    setTimeout(() => setCopiedWA(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Navigation & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/bookings"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft weight="bold" className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-mono font-bold text-slate-900">
                {booking.bookingCode}
              </h1>
              <StatusBadge status={booking.status} size="sm" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Dibuat pada {formatDateIndonesian(booking.createdAt)} • ID Pelanggan: {booking.customerId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <PaymentBadge status={booking.paymentStatus} size="md" />
          <button
            type="button"
            onClick={handleTogglePayment}
            className={`tactile-btn px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              booking.paymentStatus === 'PAID'
                ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                : 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700 shadow-sm'
            }`}
          >
            {booking.paymentStatus === 'PAID' ? 'Ubah ke Belum Bayar' : 'Tandai Lunas'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer & Order Details (Cols 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Delivery Card */}
          <div className="diffusion-card bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
              Informasi Pelanggan & Layanan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400">Nama Pelanggan</span>
                <p className="font-bold text-slate-900 text-sm">{booking.customerName}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400">Nomor WhatsApp</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-slate-900">
                    {formatDisplayPhone(booking.customerPhone)}
                  </span>
                  <a
                    href={`https://wa.me/${booking.customerPhone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded-md bg-primary-50 text-primary-700 hover:bg-primary-100"
                    title="Buka chat WhatsApp"
                  >
                    <WhatsappLogo weight="fill" className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400">Paket Layanan</span>
                <p className="font-semibold text-slate-900">
                  {booking.serviceName} ({formatRupiah(booking.unitPrice)}/kg)
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400">Metode</span>
                <p className="font-semibold text-slate-900">
                  {booking.serviceMode === 'PICKUP' ? 'Kurir Pickup ke Lokasi' : 'Antar Mandiri (Drop-off)'}
                </p>
              </div>

              {booking.serviceMode === 'PICKUP' && (
                <>
                  <div className="space-y-1 sm:col-span-2">
                    <span className="text-slate-400">Alamat Penjemputan</span>
                    <p className="text-slate-800 leading-relaxed">{booking.pickupAddress}</p>
                    {booking.pickupLandmark && (
                      <p className="text-[11px] text-slate-500 italic mt-0.5">
                        Patokan: {booking.pickupLandmark}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Jarak Antar-Jemput</span>
                    <p className="font-mono text-primary-700 font-bold">
                      {booking.distanceKm} km (Tarif: {formatRupiah(booking.pickupFee)})
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Jadwal & Slot</span>
                    <p className="text-slate-800 font-medium">
                      {booking.scheduledDate} • {booking.pickupSlotName} ({booking.pickupSlotTime})
                    </p>
                  </div>
                </>
              )}

              {booking.estimatedQuantity && (
                <div className="space-y-1">
                  <span className="text-slate-400">Estimasi Kantong</span>
                  <p className="text-slate-800">{booking.estimatedQuantity}</p>
                </div>
              )}

              {booking.notes && (
                <div className="space-y-1 sm:col-span-2">
                  <span className="text-slate-400">Catatan Khusus Pelanggan</span>
                  <p className="text-slate-800 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    "{booking.notes}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actual Weight & Scale Photo Card (PRD Section 39 & 41) */}
          <div className="diffusion-card bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Scales weight="bold" className="w-5 h-5 text-primary-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Input Berat Aktual & Foto Timbangan
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">PRD Section 3.4 (Source of Truth)</span>
            </div>

            {weightMessage && (
              <div className={`p-3 rounded-xl border text-xs font-medium ${
                weightError
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-primary-50 border-primary-200 text-primary-800'
              }`}>
                {weightMessage}
              </div>
            )}

            <form onSubmit={handleSaveWeight} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Berat Bersih Cucian (Kg) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      value={actualWeightInput}
                      onChange={(e) => setActualWeightInput(e.target.value)}
                      placeholder="Contoh: 4.8"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                    <span className="absolute right-3.5 top-3 text-xs text-slate-400 font-bold">
                      KG
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    URL Foto Timbangan (Simulasi Upload)
                  </label>
                  <input
                    type="url"
                    value={scalePhotoUrlInput}
                    onChange={(e) => setScalePhotoUrlInput(e.target.value)}
                    placeholder="https://... atau klik tombol demo di bawah"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Photo preview or sample picker */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-slate-400 text-[11px]">Gunakan contoh foto timbangan:</span>
                <button
                  type="button"
                  onClick={() =>
                    setScalePhotoUrlInput(
                      'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&q=80'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Timbangan Digital 4.8 kg
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setScalePhotoUrlInput(
                      'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&q=80'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Timbangan Keranjang 6.2 kg
                </button>
              </div>

              {scalePhotoUrlInput && (
                <div className="mt-2 w-full max-w-sm rounded-xl overflow-hidden border border-slate-200 bg-black">
                  <img
                    src={scalePhotoUrlInput}
                    alt="Preview foto timbangan"
                    className="w-full h-36 object-cover"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-500">
                  Perhitungan tagihan: Berat × {formatRupiah(booking.unitPrice)}
                </div>
                <button
                  type="submit"
                  disabled={isUpdatingWeight}
                  className="tactile-btn px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors disabled:opacity-60"
                >
                  {isUpdatingWeight ? 'Menyimpan...' : 'Hitung & Simpan Tagihan Final'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Actions, Status Machine, Billing Breakdown (Cols 1) */}
        <div className="space-y-6">
          {/* Order Lifecycle Actions (PRD Section 9) */}
          <div className="diffusion-card bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Tindakan Status Cucian
            </h3>

            <div className="space-y-2">
              {booking.status === 'PENDING' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleTransition('CONFIRMED')}
                    className="tactile-btn w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle weight="bold" className="w-4 h-4" />
                    <span>Setujui Booking (CONFIRMED)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTransition('CANCELLED')}
                    className="tactile-btn w-full py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold"
                  >
                    Batalkan Booking
                  </button>
                </>
              )}

              {booking.status === 'CONFIRMED' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleTransition('RECEIVED')}
                    className="tactile-btn w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Package weight="bold" className="w-4 h-4" />
                    <span>Cucian Diterima di Outlet (RECEIVED)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTransition('CANCELLED')}
                    className="tactile-btn w-full py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold"
                  >
                    Batalkan Booking
                  </button>
                </>
              )}

              {booking.status === 'RECEIVED' && (
                <button
                  type="button"
                  onClick={() => handleTransition('PROCESSING')}
                  className="tactile-btn w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <ArrowsClockwise weight="bold" className="w-4 h-4" />
                  <span>Mulai Proses Cuci (PROCESSING)</span>
                </button>
              )}

              {booking.status === 'PROCESSING' && (
                <button
                  type="button"
                  onClick={() => handleTransition('READY')}
                  className="tactile-btn w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Sparkle weight="bold" className="w-4 h-4" />
                  <span>Cucian Siap Diambil/Diantar (READY)</span>
                </button>
              )}

              {booking.status === 'READY' && (
                <button
                  type="button"
                  onClick={() => handleTransition('COMPLETED')}
                  className="tactile-btn w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <CheckFat weight="bold" className="w-4 h-4" />
                  <span>Serahkan Cucian (COMPLETED)</span>
                </button>
              )}

              {booking.status === 'COMPLETED' && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-medium">
                  Pesanan telah selesai secara tuntas.
                </div>
              )}

              {booking.status === 'CANCELLED' && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center text-xs text-rose-700 font-medium">
                  Pesanan ini telah dibatalkan.
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              State transitions divalidasi sesuai state machine PRD.
            </p>
          </div>

          {/* Tagihan Summary Card */}
          <div className="diffusion-card bg-white rounded-3xl p-6 border border-slate-200 space-y-3 text-xs">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Rincian Tagihan Akhir
            </h3>

            <div className="flex items-center justify-between text-slate-500">
              <span>Berat Bersih:</span>
              <span className="font-mono font-semibold text-slate-900">
                {booking.actualWeight ? formatWeight(booking.actualWeight) : 'Belum ditimbang'}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-500">
              <span>Subtotal Layanan:</span>
              <span className="font-mono text-slate-800">{formatRupiah(booking.subtotal)}</span>
            </div>

            {booking.pickupFee > 0 && (
              <div className="flex items-center justify-between text-slate-500">
                <span>Biaya Pickup:</span>
                <span className="font-mono text-slate-800">{formatRupiah(booking.pickupFee)}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-sm font-bold text-slate-900">
              <span>Total Tagihan:</span>
              <span className="font-mono text-primary-700 text-base">{formatRupiah(booking.total)}</span>
            </div>
          </div>

          {/* WhatsApp Direct Actions (PRD Section 45 & 49) */}
          <div className="diffusion-card bg-primary-50/70 rounded-3xl p-6 border border-primary-200 space-y-3">
            <div className="flex items-center gap-2 text-primary-900 font-bold text-xs">
              <WhatsappLogo weight="fill" className="w-4 h-4 text-primary-700" />
              <span>Notifikasi WhatsApp Pelanggan</span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={openBillingWhatsApp}
                className="tactile-btn w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors text-center"
              >
                Generate Tagihan WhatsApp
              </button>

              <button
                type="button"
                onClick={() => {
                  const validStatuses: Array<'RECEIVED' | 'PROCESSING' | 'READY' | 'COMPLETED'> = [
                    'RECEIVED', 'PROCESSING', 'READY', 'COMPLETED'
                  ];
                  const st = validStatuses.includes(booking.status as 'RECEIVED') 
                    ? booking.status as 'RECEIVED' | 'PROCESSING' | 'READY' | 'COMPLETED'
                    : 'RECEIVED';
                  openStatusWhatsApp(st);
                }}
                className="tactile-btn w-full py-2 bg-white hover:bg-slate-50 border border-primary-300 text-primary-900 rounded-xl text-xs font-semibold text-center"
              >
                Kirim Status Terkini ({booking.status})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Message Generator Modal */}
      {waModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <WhatsappLogo weight="fill" className="w-5 h-5 text-primary-600" />
                <h3 className="font-bold text-sm text-slate-900">Pesan WhatsApp Otomatis</h3>
              </div>
              <button
                type="button"
                onClick={() => setWaModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕ Tutup
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Preview Teks Pesan (Dapat Anda sesuaikan sebelum kirim):
              </label>
              <textarea
                rows={9}
                value={waMessageText}
                onChange={(e) => setWaMessageText(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 leading-relaxed focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyWA}
                className="tactile-btn inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {copiedWA ? <Check className="w-4 h-4 text-primary-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedWA ? 'Tersalin!' : 'Salin Pesan'}</span>
              </button>

              <a
                href={createWhatsAppUrl(booking.customerPhone, waMessageText)}
                target="_blank"
                rel="noreferrer"
                className="tactile-btn inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-600/30"
              >
                <WhatsappLogo weight="fill" className="w-4 h-4" />
                <span>Buka di WhatsApp Web / App</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
