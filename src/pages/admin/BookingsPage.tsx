import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlass,
  Eye,
  ArrowsClockwise,
  Truck,
  Package,
} from '@phosphor-icons/react';
import { mockApi } from '../../lib/mockApi';
import type { Booking, OrderStatus, PaymentStatus, ServiceMode } from '../../types';
import { StatusBadge, PaymentBadge } from '../../components/common/StatusBadge';
import { formatRupiah, formatWeight, formatDateIndonesian } from '../../lib/utils';

export const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'ALL'>('ALL');
  const [modeFilter, setModeFilter] = useState<ServiceMode | 'ALL'>('ALL');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await mockApi.adminGetBookings({
        search,
        status: statusFilter,
        paymentStatus: paymentFilter,
        mode: modeFilter,
      });
      setBookings(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, paymentFilter, modeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings();
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Manajemen Booking & Cucian
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola seluruh siklus pesanan mulai dari penerimaan, penimbangan berat, hingga serah terima.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchBookings}
          className="tactile-btn self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors shadow-sm"
        >
          <ArrowsClockwise weight="bold" className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="diffusion-card bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <MagnifyingGlass weight="bold" className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode booking, nama customer, atau nomor HP..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          <button
            type="submit"
            className="tactile-btn px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shrink-0"
          >
            Cari
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'ALL')}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-primary-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="PENDING">PENDING (Menunggu)</option>
              <option value="CONFIRMED">CONFIRMED (Disetujui)</option>
              <option value="RECEIVED">RECEIVED (Diterima)</option>
              <option value="PROCESSING">PROCESSING (Dicuci)</option>
              <option value="READY">READY (Selesai/Siap)</option>
              <option value="COMPLETED">COMPLETED (Selesai)</option>
              <option value="CANCELLED">CANCELLED (Batal)</option>
            </select>
          </div>

          {/* Payment Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Bayar:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as PaymentStatus | 'ALL')}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-primary-500"
            >
              <option value="ALL">Semua Pembayaran</option>
              <option value="UNPAID">Belum Lunas</option>
              <option value="PAID">Lunas</option>
            </select>
          </div>

          {/* Mode Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Metode:</span>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value as ServiceMode | 'ALL')}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-primary-500"
            >
              <option value="ALL">Semua Metode</option>
              <option value="PICKUP">Pickup (Kurir)</option>
              <option value="SELF_DROP_OFF">Antar Mandiri</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Display Container */}
      <div className="diffusion-card bg-white rounded-3xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">Memuat data booking...</div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 space-y-2">
            <p>Tidak ada booking yang sesuai kriteria pencarian.</p>
          </div>
        ) : (
          <>
            {/* MOBILE VIEW: CARDS (PRD Section 86) */}
            <div className="block md:hidden divide-y divide-slate-100 p-4 space-y-3">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  onClick={() => navigate(`/admin/bookings/${b.id}`)}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900">{b.bookingCode}</span>
                    <StatusBadge status={b.status} size="sm" />
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>{b.customerName}</span>
                      <span className="font-mono font-normal text-slate-500">{b.customerPhone}</span>
                    </div>
                    <div className="text-slate-500 flex items-center gap-1">
                      {b.serviceMode === 'PICKUP' ? (
                        <Truck className="w-3.5 h-3.5 text-primary-600" />
                      ) : (
                        <Package className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>{b.serviceName}</span>
                    </div>

                    {b.serviceMode === 'PICKUP' && b.pickupAddress && (
                      <div className="text-[11px] text-slate-400 truncate">
                        Alamat: {b.pickupAddress}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-xs">
                    <div>
                      {b.actualWeight ? (
                        <span className="font-mono font-semibold text-primary-700">
                          {formatWeight(b.actualWeight)} • {formatRupiah(b.total)}
                        </span>
                      ) : (
                        <span className="text-amber-700 italic text-[11px]">Belum Ditimbang</span>
                      )}
                    </div>
                    <PaymentBadge status={b.paymentStatus} size="sm" />
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP VIEW: TABULAR LIST */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-6">Kode Booking</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Layanan & Metode</th>
                    <th className="py-3.5 px-4">Jadwal / Tanggal</th>
                    <th className="py-3.5 px-4">Berat Aktual</th>
                    <th className="py-3.5 px-4">Total</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Bayar</th>
                    <th className="py-3.5 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-bold text-slate-900">
                        {b.bookingCode}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{b.customerName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{b.customerPhone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{b.serviceName}</div>
                        <div className="text-[11px] text-slate-500">
                          {b.serviceMode === 'PICKUP' ? 'Kurir Pickup' : 'Antar Mandiri'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {b.scheduledDate || formatDateIndonesian(b.createdAt)}
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
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
