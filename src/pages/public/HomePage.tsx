import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock,
  Truck,
  ShieldCheck,
  Scales,
  Sparkle,
  CaretDown,
  MapPin,
  TShirt,
  WashingMachine,
  Package,
} from "@phosphor-icons/react";
import { mockApi } from "../../lib/mockApi";
import type { Service } from "../../types";
import { formatRupiah } from "../../lib/utils";
import { LaundryVisual, Bubbles } from "../../components/common/LaundryVisual";
import { Reveal } from "../../components/common/Reveal";

const kinds = ["washer", "shirt", "towels", "bedding"] as const;
const guides = [
  {
    title: "Pakaian kesayangan, umurnya lebih panjang.",
    category: "CATATAN PERAWATAN",
    text: "Sedikit perhatian sebelum mencuci bisa membuat banyak perbedaan.",
    body: "Baca label perawatan, kosongkan kantong, dan tutup ritsleting sebelum mencuci. Pisahkan pakaian menurut warna dan jenis bahan. Hindari deterjen berlebih agar serat tetap nyaman.",
    kind: "shirt" as const,
  },
  {
    title: "Putih tetap putih, tanpa drama.",
    category: "TIPS MENCUCI",
    text: "Mulai dari memisahkan warna.",
    body: "Cuci pakaian putih terpisah dari warna gelap. Tangani noda sesegera mungkin sesuai petunjuk label, dan jangan mengeringkan dengan panas sebelum noda benar-benar hilang.",
    kind: "towels" as const,
  },
  {
    title: "Handuk lembut setelah berkali-kali dicuci.",
    category: "RUMAH YANG NYAMAN",
    text: "Kuncinya ada di cara mengeringkan.",
    body: "Jangan memenuhi tabung mesin terlalu padat. Gunakan deterjen secukupnya dan keringkan handuk sampai tuntas sebelum dilipat. Simpan di tempat kering dengan sirkulasi udara yang baik.",
    kind: "washer" as const,
  },
  {
    title: "Kapan terakhir kali mencuci bedcover?",
    category: "KEBIASAAN BAIK",
    text: "Beri tempat istirahatmu perhatian.",
    body: "Periksa label bedcover sebelum mencuci. Gunakan mesin dengan kapasitas yang cukup dan pastikan bagian dalam benar-benar kering sebelum disimpan. Cuci lebih sering jika terasa lembap atau kotor.",
    kind: "bedding" as const,
  },
];

export function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState("Semua");
  const [article, setArticle] = useState<number | null>(null);
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
  const shown = services.filter(
    (s) =>
      filter === "Semua" ||
      (filter === "Express"
        ? s.estimatedHours <= 24
        : filter === "Hemat"
          ? s.pricePerKg <= 7000
          : s.estimatedHours > 48),
  );
  return (
    <>
      <section className="site-container home-hero">
        <Reveal className="hero-copy">
          <span className="eyebrow">
            <span className="small-dot" /> A LITTLE CARE. A LOT OF FRESH.
          </span>
          <h1>
            Cucian beres.
            <br />
            Lebih banyak waktu
            <br />
            <span>untuk dirimu.</span>
          </h1>
          <p>
            Dari tumpukan cucian jadi tumpukan kebahagiaan.
            <br className="desktop-break" /> Kami jemput, cuci, dan rawat
            pakaianmu.
            <br className="desktop-break" /> Kamu? Nikmati harimu.
          </p>
          <div className="hero-buttons">
            <Link className="button button-primary" to="/booking">
              Jadwalkan pickup <ArrowUpRight size={18} />
            </Link>
            <Link className="text-link" to="/services">
              Lihat layanan <ArrowRight size={17} />
            </Link>
          </div>
          <div className="hero-reassurance">
            <span>
              <Check size={15} /> Tanpa perlu akun
            </span>
            <span>
              <Check size={15} /> Timbangan transparan
            </span>
          </div>
        </Reveal>
        <Reveal className="hero-collage" delay={0.12}>
          <Bubbles />
          <div className="collage-tall">
            <LaundryVisual kind="washer" />
            <span className="image-caption">
              <span className="small-dot" /> A fresh start, every day.
            </span>
          </div>
          <div className="collage-small">
            <LaundryVisual kind="towels" />
          </div>
          <div className="collage-bottom">
            <LaundryVisual kind="shirt" />
          </div>
          <div className="floating-label">
            <span className="label-icon">
              <Truck size={24} weight="duotone" />
            </span>
            <span>
              Dari rumah, untukmu.<small>Pickup jadi lebih mudah</small>
            </span>
            <ArrowUpRight size={16} />
          </div>
          <div className="collage-spark">
            <Sparkle size={33} weight="duotone" />
          </div>
        </Reveal>
      </section>
      <div className="care-strip site-container">
        <span>
          <WashingMachine size={20} /> Satu pelanggan, satu mesin
        </span>
        <span>
          <Scales size={20} /> Bayar sesuai berat aktual
        </span>
        <span>
          <ShieldCheck size={20} /> Dirawat dengan teliti
        </span>
        <span>
          <Truck size={20} /> Pickup sampai depan rumah
        </span>
      </div>
      <section className="site-container home-section" id="layanan">
        <Reveal>
          <div className="section-heading">
            <div>
              <span className="eyebrow">PILIH YANG KAMU BUTUHKAN</span>
              <h2>Setiap cucian, ada perawatannya.</h2>
            </div>
            <Link to="/services" className="button button-outline">
              Semua layanan <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="service-filter" aria-label="Filter layanan">
            {["Semua", "Express", "Hemat", "Perawatan ekstra"].map((item) => (
              <button
                key={item}
                aria-pressed={filter === item}
                className={filter === item ? "selected" : ""}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
            <span>Segar, rapi, siap dipakai kembali.</span>
          </div>
        </Reveal>
        <div className="service-gallery">
          {loading ? (
            Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="service-skeleton skeleton" />
            ))
          ) : error ? (
            <p role="alert">
              Layanan belum bisa dimuat.{" "}
              <button
                className="text-link"
                onClick={() => window.location.reload()}
              >
                Coba lagi
              </button>
            </p>
          ) : shown.length === 0 ? (
            <p className="empty-message">
              Belum ada layanan dalam kategori ini. Coba pilih Semua.
            </p>
          ) : (
            shown.map((service, i) => (
              <Reveal key={service.id} delay={i * 0.06}>
                <Link
                  to={`/booking?service=${service.id}`}
                  className="service-tile"
                >
                  <div className="service-art">
                    <LaundryVisual
                      kind={kinds[services.indexOf(service) % 4]}
                    />
                    {service.badge && (
                      <span className="service-tag">{service.badge}</span>
                    )}
                    <span className="round-arrow">
                      <ArrowUpRight size={20} />
                    </span>
                  </div>
                  <h3>{service.name}</h3>
                  <div className="service-meta">
                    <span>
                      {formatRupiah(service.pricePerKg)} <small>/ kg</small>
                    </span>
                    <span>
                      <Clock size={13} /> {service.estimatedHours} jam
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))
          )}
        </div>
      </section>
      <section id="cara-kerja" className="how-section">
        <div className="site-container how-grid">
          <Reveal>
            <span className="eyebrow">TINGGAL TITIP, KAMI YANG URUS</span>
            <h2>
              Hari yang ringan,
              <br />
              dimulai dari sini.
            </h2>
            <p>
              Tak perlu menyisihkan akhir pekan untuk mencuci. Tiga langkah
              kecil, lalu serahkan pada kami.
            </p>
            <Link to="/booking" className="text-link">
              Yuk, mulai sekarang <ArrowUpRight size={18} />
            </Link>
            <div className="wash-note">
              <WashingMachine size={32} weight="duotone" />
              <span>
                Putaran mesin untuk cucianmu.
                <br />
                <strong>Waktu luang untuk dirimu.</strong>
              </span>
            </div>
          </Reveal>
          <div className="process-list">
            {[
              {
                icon: TShirt,
                title: "Pilih perawatan favoritmu",
                text: "Tentukan layanan yang pas, lalu isi detail cucian dan kontakmu.",
              },
              {
                icon: Truck,
                title: "Kami jemput, atau kamu antar",
                text: "Pilih jadwal pickup yang tersedia. Mau mampir langsung? Boleh juga.",
              },
              {
                icon: Package,
                title: "Tinggal tunggu kabar segarnya",
                text: "Cek berat aktual, pantau proses, dan ambil pakaian yang sudah rapi.",
              },
            ].map((step, i) => (
              <Reveal key={step.title} delay={i * 0.1} className="process-step">
                <span className="step-number">0{i + 1}</span>
                <div>
                  <step.icon size={27} weight="duotone" />
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
                <ArrowDownDecor />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="site-container home-section" id="journal">
        <Reveal>
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE FRESH JOURNAL</span>
              <h2>Sedikit cerita. Banyak manfaat.</h2>
            </div>
            <span className="section-aside">
              Untuk pakaian dan hari yang lebih baik.
            </span>
          </div>
        </Reveal>
        <div className="journal-grid">
          <Reveal>
            <button
              className="journal-feature"
              onClick={() => setArticle(article === 0 ? null : 0)}
              aria-expanded={article === 0}
            >
              <div className="journal-feature-art">
                <LaundryVisual kind="shirt" />
                <span className="journal-stamp">
                  wear.
                  <br />
                  care.
                  <br />
                  repeat.
                </span>
                <span className="round-arrow">
                  <ArrowUpRight size={21} />
                </span>
              </div>
              <span className="eyebrow">{guides[0].category}</span>
              <h3>{guides[0].title}</h3>
              <p>{guides[0].text}</p>
            </button>
          </Reveal>
          <div className="journal-list">
            {guides.slice(1).map((guide, i) => (
              <Reveal key={guide.title} delay={i * 0.07}>
                <button
                  className="journal-item"
                  onClick={() => setArticle(article === i + 1 ? null : i + 1)}
                  aria-expanded={article === i + 1}
                >
                  <LaundryVisual kind={guide.kind} />
                  <div>
                    <span className="eyebrow">{guide.category}</span>
                    <h3>{guide.title}</h3>
                    <p>{guide.text}</p>
                  </div>
                  <ArrowUpRight size={18} />
                </button>
              </Reveal>
            ))}
          </div>
        </div>
        {article !== null && (
          <div
            className="article-content"
            role="region"
            aria-label={guides[article].title}
          >
            <div>
              <span className="eyebrow">{guides[article].category}</span>
              <h3>{guides[article].title}</h3>
              <p>{guides[article].body}</p>
            </div>
            <button
              className="button button-outline"
              onClick={() => setArticle(null)}
            >
              Tutup <CaretDown size={16} />
            </button>
          </div>
        )}
      </section>
      <section className="site-container home-section studio-section">
        <Reveal className="studio-copy">
          <span className="eyebrow">BUKAN SEKADAR BERSIH</span>
          <h2>
            Pakaianmu punya cerita.
            <br />
            Kami bantu menjaganya.
          </h2>
          <p>
            Kemeja untuk hari penting. Selimut favorit di rumah. Atau kaus yang
            paling nyaman. Setiap helai pantas mendapatkan perhatian yang sama.
          </p>
          <div className="studio-points">
            <span>
              <Check size={17} /> Cucian tidak dicampur pelanggan lain
            </span>
            <span>
              <Check size={17} /> Foto timbangan sebelum diproses
            </span>
            <span>
              <Check size={17} /> Harga jelas dari awal
            </span>
          </div>
          <a
            href="https://wa.me/6281298421823"
            className="text-link"
            target="_blank"
            rel="noreferrer"
          >
            Kenalan dengan kami <ArrowUpRight size={17} />
          </a>
        </Reveal>
        <Reveal className="studio-art">
          <LaundryVisual kind="bedding" />
          <div className="studio-location">
            <MapPin size={21} />
            <span>
              Dari studio kecil kami
              <small>Kebayoran Baru, Jakarta Selatan</small>
            </span>
          </div>
        </Reveal>
      </section>
      <section className="fresh-cta">
        <Bubbles />
        <Reveal className="site-container cta-inner">
          <div>
            <span className="eyebrow">LESS LAUNDRY. MORE LIVING.</span>
            <h2>
              Cucian untuk kami.
              <br />
              Waktu luang untuk kamu.
            </h2>
            <p>Mulai dari satu kantong. Biar kami yang urus sisanya.</p>
          </div>
          <div>
            <Link to="/booking" className="button button-white">
              Jadwalkan pickup pertamamu <ArrowUpRight size={18} />
            </Link>
            <span className="cta-note">
              <MapPin size={14} /> Melayani sekitar Kebayoran Baru
            </span>
          </div>
        </Reveal>
      </section>
    </>
  );
}
function ArrowDownDecor() {
  return <span className="step-line" aria-hidden="true" />;
}
