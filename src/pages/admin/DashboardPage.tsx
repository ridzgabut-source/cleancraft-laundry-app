import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Wallet,
  Clock,
  WashingMachine,
  Receipt,
  Truck,
} from "@phosphor-icons/react";
import { mockApi } from "../../lib/mockApi";
import type { Booking, DashboardMetrics, SlotAvailability } from "../../types";
import { StatusBadge, PaymentBadge } from "../../components/common/StatusBadge";
import { formatRupiah } from "../../lib/utils";
import { DashboardCharts } from "../../components/admin/DashboardCharts";
import { jakartaDay } from "../../lib/date";
import { Reveal } from "../../components/common/Reveal";
export function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [slots, setSlots] = useState<SlotAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);
  const reduced = useReducedMotion();
  const [now] = useState(() => new Date());
  const today = jakartaDay(now);
  useEffect(() => {
    let active = true;
    Promise.all([
      mockApi.adminGetDashboard(),
      mockApi.adminGetBookings(),
      mockApi.getPickupSlots(today),
    ])
      .then(([m, b, s]) => {
        if (active) {
          setMetrics(m);
          setBookings(b);
          setSlots(s);
        }
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [today, reload]);
  if (loading)
    return (
      <div
        className="dashboard-skeleton"
        aria-label="Memuat ringkasan studio"
        aria-busy="true"
      >
        <div className="skeleton" style={{ height: 60 }} />
        <div className="metric-grid">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 135 }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: 320 }} />
      </div>
    );
  if (error || !metrics)
    return (
      <div className="dashboard-error" role="alert">
        <p>Ringkasan studio belum dapat dimuat.</p>
        <button
          className="button button-primary"
          onClick={() => {
            setLoading(true);
            setError(false);
            setReload((n) => n + 1);
          }}
        >
          Coba lagi
        </button>
      </div>
    );
  const cards = [
    {
      label: "Pendapatan hari ini",
      value: formatRupiah(
        bookings
          .filter(
            (b) =>
              b.paymentStatus === "PAID" &&
              jakartaDay(b.paidAt || b.createdAt) === today,
          )
          .reduce((sum, b) => sum + b.total, 0),
      ),
      note: "Dari pembayaran yang sudah lunas",
      icon: Wallet,
    },
    {
      label: "Menunggu konfirmasi",
      value: String(metrics.todayPending),
      note: "Semua pesanan yang perlu ditinjau",
      icon: Clock,
    },
    {
      label: "Sedang dirawat",
      value: String(metrics.todayProcessing),
      note: "Semua cucian yang sedang diproses",
      icon: WashingMachine,
    },
    {
      label: "Belum dibayar",
      value: String(metrics.todayUnpaid),
      note: "Semua pesanan aktif yang belum lunas",
      icon: Receipt,
    },
  ];
  return (
    <div>
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">A FRESH DAY AT THE STUDIO</span>
          <h1>Selamat datang, Admin.</h1>
          <p>Ini kabar cucian dan aktivitas studio hari ini.</p>
        </div>
        <Link className="button button-primary" to="/admin/bookings">
          Kelola pesanan <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="metric-grid">
        {cards.map((card, i) => (
          <Reveal className="metric-card" key={card.label} delay={i * 0.07}>
            <div className="metric-label">
              <span>{card.label}</span>
              <card.icon size={20} weight="duotone" />
            </div>
            <div className="metric-value">{card.value}</div>
            <p>{card.note}</p>
          </Reveal>
        ))}
      </div>
      <DashboardCharts bookings={bookings} today={today} />
      <section className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h2 className="flex items-center gap-2">
              <Truck size={21} weight="duotone" /> Jadwal penjemputan
            </h2>
            <p>
              {new Intl.DateTimeFormat("id-ID", {
                timeZone: "Asia/Jakarta",
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(now)}{" "}
              · Kapasitas pickup hari ini
            </p>
          </div>
          <Link className="text-link" to="/admin/pickup">
            Kelola jadwal <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="pickup-list">
          {slots.length === 0 ? (
            <p className="empty-message">
              Belum ada slot pickup. Tambahkan melalui Kelola jadwal.
            </p>
          ) : (
            slots.map(({ slot, bookedCount, availableCount, isCutoff }) => (
              <div className="pickup-slot" key={slot.id}>
                <div>
                  <strong>{slot.name}</strong>
                  <span>
                    {slot.startTime}–{slot.endTime}
                  </span>
                </div>
                <div
                  className="pickup-bar"
                  role="progressbar"
                  aria-label={slot.name}
                  aria-valuenow={bookedCount}
                  aria-valuemin={0}
                  aria-valuemax={Math.max(slot.capacity, bookedCount)}
                >
                  <motion.span
                    initial={reduced ? false : { scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.85 }}
                    style={{
                      width: `${Math.min(100, slot.capacity > 0 ? (bookedCount / slot.capacity) * 100 : 0)}%`,
                    }}
                  />
                </div>
                <p>
                  {bookedCount} dari {slot.capacity} terisi ·{" "}
                  {isCutoff
                    ? "Jadwal sudah ditutup"
                    : availableCount > 0
                      ? `${availableCount} slot tersedia`
                      : "Slot penuh"}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
      <section className="dashboard-panel booking-table-panel">
        <div className="panel-heading">
          <div>
            <h2>Pesanan terbaru</h2>
            <p>Setiap cucian punya cerita. Pantau perjalanannya di sini.</p>
          </div>
          <Link to="/admin/bookings" className="text-link">
            Lihat semua ({bookings.length}) <ArrowUpRight size={14} />
          </Link>
        </div>
        {bookings.length === 0 ? (
          <p className="empty-message">
            Belum ada pesanan masuk. Pesanan pelanggan akan muncul di sini.
          </p>
        ) : (
          <>
            <div className="dashboard-booking-mobile">
              {bookings.slice(0, 6).map((b) => (
                <div className="mobile-booking-row" key={b.id}>
                  <div>
                    <span>
                      <strong>{b.customerName}</strong>
                      <small>{b.bookingCode}</small>
                    </span>
                    <Link
                      className="text-link"
                      to={`/admin/bookings/${b.id}`}
                      aria-label={`Detail pesanan ${b.bookingCode}`}
                    >
                      Detail <ArrowUpRight size={14} />
                    </Link>
                  </div>
                  <p>{b.serviceName}</p>
                  <div>
                    <StatusBadge status={b.status} size="sm" />
                    <span className="font-mono">
                      {b.actualWeight
                        ? formatRupiah(b.total)
                        : "Belum ditimbang"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="booking-table-wrap">
              <table className="booking-table">
                <thead>
                  <tr>
                    <th>Pelanggan</th>
                    <th>Layanan</th>
                    <th>Status cucian</th>
                    <th>Total</th>
                    <th>Pembayaran</th>
                    <th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 6).map((b) => (
                    <tr key={b.id}>
                      <td>
                        {b.customerName}
                        <small className="block mt-1 text-[8px] font-normal text-slate-400">
                          {b.bookingCode}
                        </small>
                      </td>
                      <td>
                        {b.serviceName}
                        <small className="block mt-1 text-[8px] text-slate-400">
                          {b.serviceMode === "PICKUP"
                            ? "Jemput di rumah"
                            : "Antar ke studio"}
                        </small>
                      </td>
                      <td>
                        <StatusBadge status={b.status} size="sm" />
                      </td>
                      <td>
                        {b.actualWeight
                          ? formatRupiah(b.total)
                          : "Menunggu timbangan"}
                      </td>
                      <td>
                        <PaymentBadge status={b.paymentStatus} size="sm" />
                      </td>
                      <td>
                        <Link
                          to={`/admin/bookings/${b.id}`}
                          aria-label={`Detail pesanan ${b.bookingCode}`}
                        >
                          Buka <ArrowUpRight className="inline" size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
