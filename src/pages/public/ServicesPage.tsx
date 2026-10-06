import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Clock, Scales, Check } from "@phosphor-icons/react";
import { mockApi } from "../../lib/mockApi";
import type { Service } from "../../types";
import { formatRupiah } from "../../lib/utils";
import { LaundryVisual } from "../../components/common/LaundryVisual";
import { Reveal } from "../../components/common/Reveal";
const kinds = ["washer", "shirt", "towels", "bedding"] as const;
export function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    mockApi
      .getServices()
      .then((data) => {
        if (active) setServices(data);
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
  }, []);
  return (
    <div className="site-container space-y-9">
      <Reveal className="catalog-heading">
        <div>
          <span className="eyebrow">A LITTLE CARE FOR EVERY WEAR</span>
          <h1 className="text-4xl sm:text-5xl mt-4 leading-tight">
            Cucian berbeda.
            <br />
            Perhatian yang sama.
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-lg mt-5">
            Dari pakaian sehari-hari sampai selimut kesayangan. Pilih perawatan
            yang pas, dengan harga yang jelas per kilogram.
          </p>
        </div>
        <LaundryVisual kind="towels" />
      </Reveal>
      {error ? (
        <p role="alert">
          Layanan belum dapat dimuat.{" "}
          <button
            className="text-link"
            onClick={() => window.location.reload()}
          >
            Coba lagi
          </button>
        </p>
      ) : (
        <div className="catalog-grid">
          {loading ? (
            [0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-96" />)
          ) : services.length === 0 ? (
            <p className="empty-message">
              Belum ada layanan aktif. Hubungi studio untuk informasi lebih
              lanjut.
            </p>
          ) : (
            services.map((service, i) => (
              <Reveal
                key={service.id}
                delay={i * 0.06}
                className="catalog-card"
              >
                <LaundryVisual kind={kinds[i % 4]} />
                <div className="catalog-content">
                  <span className="eyebrow">
                    {service.badge || "DIRAWAT SEPENUH HATI"}
                  </span>
                  <h2>{service.name}</h2>
                  <p>{service.description}</p>
                  <div className="flex gap-2 text-[11px] text-primary-600 items-center">
                    <Clock size={15} /> Estimasi {service.estimatedHours} jam
                  </div>
                  <div className="flex gap-2 text-[11px] text-slate-400 items-center mt-3">
                    <Check size={15} /> Satu pelanggan, satu mesin
                  </div>
                  <div className="catalog-price">
                    <div>
                      <strong>{formatRupiah(service.pricePerKg)}</strong>
                      <small> / kg</small>
                    </div>
                    <Link
                      to={`/booking?service=${service.id}`}
                      className="button button-primary"
                    >
                      Pilih layanan <ArrowUpRight size={15} />
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))
          )}
        </div>
      )}
      <Reveal className="catalog-guarantee">
        <Scales size={36} weight="duotone" />
        <div>
          <span className="eyebrow">JELAS DARI AWAL</span>
          <h2>Berat asli. Harga yang pasti.</h2>
          <p>
            Tagihan akhir dihitung dari berat cucian setelah ditimbang di
            studio. Kamu menerima foto timbangan sebelum cucian diproses.
            Estimasi kantong saat booking membantu kami menyiapkan penjemputan.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
