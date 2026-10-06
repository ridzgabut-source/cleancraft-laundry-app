import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Booking } from "../../types";
import { formatRupiah } from "../../lib/utils";

import { jakartaDay } from "../../lib/date";

export function DashboardCharts({
  bookings,
  today,
}: {
  bookings: Booking[];
  today: string;
}) {
  const reduced = useReducedMotion();
  const [days, setDays] = useState(7);
  const [hovered, setHovered] = useState<number | null>(null);
  const series = useMemo(() => {
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(today + "T12:00:00+07:00");
      date.setUTCDate(date.getUTCDate() - days + 1 + i);
      const key = jakartaDay(date);
      const value = bookings
        .filter(
          (b) =>
            b.paymentStatus === "PAID" &&
            jakartaDay(b.paidAt || b.createdAt) === key,
        )
        .reduce((sum, b) => sum + b.total, 0);
      return {
        key,
        value,
        label: new Intl.DateTimeFormat("id-ID", {
          timeZone: "Asia/Jakarta",
          day: "numeric",
          month: "short",
        }).format(date),
      };
    });
  }, [bookings, days, today]);
  const max = Math.max(...series.map((p) => p.value), 10000);
  const points = series.map((p, i) => ({
    ...p,
    x: 48 + (i / (days - 1)) * 490,
    y: 166 - (p.value / max) * 122,
  }));
  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");
  const total = series.reduce((sum, p) => sum + p.value, 0);
  const groups = [
    {
      label: "Menunggu",
      color: "#b9d2e5",
      count: bookings.filter((b) =>
        ["PENDING", "CONFIRMED", "RECEIVED"].includes(b.status),
      ).length,
    },
    {
      label: "Diproses",
      color: "#6194bd",
      count: bookings.filter((b) => b.status === "PROCESSING").length,
    },
    {
      label: "Siap / selesai",
      color: "#315f83",
      count: bookings.filter((b) => ["READY", "COMPLETED"].includes(b.status))
        .length,
    },
    {
      label: "Dibatalkan",
      color: "#d5e1eb",
      count: bookings.filter((b) => b.status === "CANCELLED").length,
    },
  ];
  const circumference = 2 * Math.PI * 62;
  let offset = 0;
  return (
    <div className="dashboard-charts">
      <section className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h2>Pendapatan studio</h2>
            <p>Pembayaran lunas · waktu Jakarta</p>
          </div>
          <div className="period-switch" aria-label="Periode grafik">
            {[7, 30].map((period) => (
              <button
                key={period}
                aria-pressed={days === period}
                onClick={() => {
                  setDays(period);
                  setHovered(null);
                }}
              >
                {period} hari
              </button>
            ))}
          </div>
        </div>
        <div className="revenue-number">{formatRupiah(total)}</div>
        <div className="chart-wrap">
          <svg
            className="revenue-chart"
            viewBox="0 0 560 200"
            role="img"
            aria-label={`Grafik pendapatan ${days} hari. Total ${formatRupiah(total)}`}
          >
            {[0, 0.5, 1].map((fraction) => (
              <g key={fraction}>
                <line
                  x1="48"
                  x2="538"
                  y1={166 - fraction * 122}
                  y2={166 - fraction * 122}
                  stroke="#e9eff5"
                  strokeDasharray="3 5"
                />
                <text
                  x="0"
                  y={170 - fraction * 122}
                  fill="#9eafbd"
                  fontSize="9"
                >
                  {Math.round((max * fraction) / 1000)} rb
                </text>
              </g>
            ))}
            <motion.path
              key={`fill-${days}`}
              d={`${line} L538,166 L48,166 Z`}
              fill="#e4eff9"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 0.8 }}
            />
            <motion.path
              key={days}
              d={line}
              fill="none"
              stroke="#6194bd"
              strokeWidth="2.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduced ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.35, ease: "easeInOut" }}
            />
            {points.map((p, i) => (
              <g
                key={p.key}
                className="chart-point"
                tabIndex={0}
                role="button"
                aria-label={`${p.label}: ${formatRupiah(p.value)}`}
                onFocus={() => setHovered(i)}
                onMouseEnter={() => setHovered(i)}
                onClick={() => setHovered(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setHovered(i);
                  }
                }}
              >
                <circle cx={p.x} cy={p.y} r="10" fill="transparent" />
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r={hovered === i ? 5 : days === 7 ? 3.5 : 2}
                  fill="#6194bd"
                  stroke="white"
                  strokeWidth="2"
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: reduced ? 0 : i * 0.015 + 0.4 }}
                />
                <title>
                  {p.label}: {formatRupiah(p.value)}
                </title>
                {(days === 7 || (i % 7 === 0 && i < days - 3) || i === days - 1) && (
                  <text
                    x={p.x}
                    y="190"
                    textAnchor="middle"
                    fontSize="9"
                    fill="#91a4b4"
                  >
                    {p.label}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>
        <div className="chart-tooltip" aria-live="polite">
          {hovered !== null
            ? `${points[hovered].label} · ${formatRupiah(points[hovered].value)}`
            : total === 0
              ? "Belum ada pembayaran lunas pada periode ini."
              : "Sentuh titik grafik untuk melihat pendapatan harian."}
        </div>
      </section>
      <section className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h2>Perjalanan cucian</h2>
            <p>Status seluruh pesanan di studio</p>
          </div>
        </div>
        <div className="donut-wrap">
          <svg
            viewBox="0 0 170 170"
            role="img"
            aria-label={`Distribusi status ${bookings.length} pesanan`}
          >
            <circle
              cx="85"
              cy="85"
              r="62"
              stroke="#edf3f8"
              strokeWidth="17"
              fill="none"
            />
            {groups.map((group) => {
              const length = bookings.length
                ? (group.count / bookings.length) * circumference
                : 0;
              const start = offset;
              offset += length;
              return (
                <motion.circle
                  key={group.label}
                  cx="85"
                  cy="85"
                  r="62"
                  fill="none"
                  stroke={group.color}
                  strokeWidth="17"
                  strokeDasharray={`${Math.max(0, length - 3)} ${circumference - Math.max(0, length - 3)}`}
                  strokeDashoffset={-start}
                  initial={
                    reduced
                      ? false
                      : { opacity: 0, strokeDasharray: `0 ${circumference}` }
                  }
                  animate={{
                    opacity: 1,
                    strokeDasharray: `${Math.max(0, length - 3)} ${circumference - Math.max(0, length - 3)}`,
                  }}
                  transition={{ duration: 1.1, delay: reduced ? 0 : 0.15 }}
                >
                  <title>
                    {group.label}: {group.count}
                  </title>
                </motion.circle>
              );
            })}
          </svg>
          <div className="donut-label">
            <strong>{bookings.length}</strong>pesanan
          </div>
        </div>
        <div className="donut-legend">
          {groups.map((group) => (
            <span key={group.label}>
              <i style={{ background: group.color }} />
              {group.label}
              <strong>{group.count}</strong>
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
