import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  ArrowsClockwise,
  CurrencyDollar,
  Truck,
  ArrowRight,
  Eye,
} from '@phosphor-icons/react';
import { mockApi } from '../../lib/mockApi';
import type { Booking, DashboardMetrics, SlotAvailability } from '../../types';
import { StatusBadge, PaymentBadge } from '../../components/common/StatusBadge';
import { formatRupiah, formatWeight } from '../../lib/utils';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [todaySlots, setTodaySlots] = useState<SlotAvailability[]>([]);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    async function load() {
      try {
        const [m, b, s] = await Promise.all([
          mockApi.adminGetDashboard(),
          mockApi.adminGetBookings(),
          mockApi.getPickupSlots(todayStr),
        ]);
        setMetrics(m);
        setRecentBookings(b.slice(0, 6));
        setTodaySlots(s);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [todayStr]);

  if (loading || !metrics) {
    return (
      <div className="py-12 text-center text-xs text-slate-500">
        Memuat dashboard operasional...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Operasional Outlet
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau booking masuk, proses timbangan, dan kas harian laundry secara langsung.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/bookings"
            className="tactile-btn inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <span>Semua Booking ({recentBookings.length})</span>
            <ArrowRight weight="bold" className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Revenue Hari Ini (PRD Section 55: SUM total WHERE payment_status = PAID) */}
        <div className="diffusion-card bg-white p-5 rounded-2xl border border-slate-200 space-y-2 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Kas Masuk Hari Ini</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CurrencyDollar weight="bold" className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-emerald-700">
            {formatRupiah(metrics.todayPaidRevenue)}
          </div>
          <p className="text-[11px] text-slate-400">
            Total lunas bulan ini: {formatRupiah(metrics.monthlyPaidRevenue)}
          </p>
        </div>

        {/* Pending Approval */}
        <div className="diffusion-card bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Perlu Konfirmasi</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock weight="bold" className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-amber-700">
            {metrics.todayPending}
          </div>
          <p className="text-[11px] text-amber-800 font-medium">
            Booking baru dari pelanggan
          </p>
        </div>

        {/* Sedang Dicuci / Processing */}
        <div className="diffusion-card bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Sedang Dicuci</span>
            <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <ArrowsClockwise weight="bold" className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-teal-700">
            {metrics.todayProcessing}
          </div>
          <p className="text-[11px] text-slate-400">
            Cucian di mesin / setrika
          </p>
        </div>

        {/* Belum Bayar */}
        <div className="diffusion-card bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Tagihan Belum Lunas</span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <Clock weight="bold" className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-rose-700">
            {metrics.todayUnpaid}
          </div>
          <p className="text-[11px] text-slate-400">
            Menunggu pembayaran customer
          </p>
        </div>
      </div>

      {/* Today's Pickup Slot Capacity Monitor per PRD Section 21 & 54 */}
      <div className="diffusion-card bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck weight="bold" className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Kapasitas Slot Pickup Hari Ini ({todayStr})
            </h3>
          </div>
          <Link
            to="/admin/pickup"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Kelola Slot
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {todaySlots.map(({ slot, bookedCount, availableCount, isCutoff }) => (
            <div
              key={slot.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">{slot.name}</span>
                <span className="font-mono text-slate-500">{slot.startTime}–{slot.endTime}</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    bookedCount >= slot.capacity ? 'bg-rose-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.min(100, (bookedCount / slot.capacity) * 100)}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Terisi: {bookedCount} / {slot.capacity}</span>
                <span className={`font-semibold ${isCutoff ? 'text-slate-400' : 'text-emerald-700'}`}>
                  {isCutoff ? 'Cutoff Lewat' : `Sisa ${availableCount}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Bookings List (Mobile Cards & Desktop Table) */}
      <div className="diffusion-card bg-white rounded-3xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">Booking & Cucian Terbaru</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Klik booking untuk input berat aktual, upload foto timbangan, dan ubah status.
            </p>
          </div>
          <Link
            to="/admin/bookings"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Lihat Semua</span>
            <ArrowRight weight="bold" className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile View: Cards (PRD Section 86) */}
        <div className="block md:hidden divide-y divide-slate-100 p-4 space-y-3">
          {recentBookings.map((b) => (
            <div
              key={b.id}
              onClick={() => navigate(`/admin/bookings/${b.id}`)}
              className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3 cursor-pointer hover:bg-slate-100/70 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-900">{b.bookingCode}</span>
                <StatusBadge status={b.status} size="sm" />
              </div>

              <div className="space-y-1 text-xs">
                <div className="font-bold text-slate-900">{b.customerName}</div>
                <div className="text-slate-500">{b.serviceName} • {b.serviceMode === 'PICKUP' ? 'Pickup' : 'Drop-off'}</div>
                {b.actualWeight ? (
                  <div className="text-emerald-700 font-mono font-semibold">
                    Berat: {formatWeight(b.actualWeight)} • {formatRupiah(b.total)}
                  </div>
                ) : (
                  <div className="text-amber-700 italic">Belum ditimbang di outlet</div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                <PaymentBadge status={b.paymentStatus} size="sm" />
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  Detail <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Clean Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">Kode Booking</th>
                <th className="py-3.5 px-4">Pelanggan</th>
                <th className="py-3.5 px-4">Layanan & Metode</th>
                <th className="py-3.5 px-4">Berat Aktual</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Bayar</th>
                <th className="py-3.5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-6 font-mono font-bold text-slate-900">
                    {b.bookingCode}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{b.customerName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{b.customerPhone}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium">{b.serviceName}</div>
                    <span className="text-[11px] text-slate-500">
                      {b.serviceMode === 'PICKUP' ? 'Kurir Pickup' : 'Drop-off'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold">
                    {b.actualWeight ? formatWeight(b.actualWeight) : <span className="text-slate-400">-</span>}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {formatRupiah(b.total)}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={b.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4">
                    <PaymentBadge status={b.paymentStatus} size="sm" />
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/bookings/${b.id}`)}
                      className="tactile-btn inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Buka</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
