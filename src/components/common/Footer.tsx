import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  WhatsappLogo,
  MapPin,
  Clock,
} from "@phosphor-icons/react";
import { Brand } from "./Navbar";
export function Footer() {
  const [year] = useState(() => new Date().getFullYear());
  return (
    <footer className="site-footer">
      <div className="site-container">
        <div className="footer-grid">
          <div>
            <Brand />
            <p>
              Pakaian terawat.
              <br />
              Hari-hari terasa lebih ringan.
            </p>
            <a
              className="footer-whatsapp"
              href="https://wa.me/6281298421823"
              target="_blank"
              rel="noreferrer"
            >
              <WhatsappLogo size={20} /> Ngobrol dengan kami{" "}
              <ArrowUpRight size={15} />
            </a>
          </div>
          <div>
            <h3>Untuk cucianmu</h3>
            <Link to="/services">Layanan & harga</Link>
            <Link to="/booking">Jadwalkan pickup</Link>
            <Link to="/tracking">Lacak pesanan</Link>
          </div>
          <div>
            <h3>Kenali CleanCraft</h3>
            <a href="/#cara-kerja">Cara kerja</a>
            <a href="/#journal">Catatan perawatan</a>
            <Link to="/admin/login">Portal admin</Link>
          </div>
          <div>
            <h3>Mampir ke studio</h3>
            <p className="footer-detail">
              <MapPin size={18} /> Jl. Gandaria Tengah II No. 14,
              <br />
              Kebayoran Baru, Jakarta Selatan
            </p>
            <p className="footer-detail">
              <Clock size={18} /> Setiap hari, 08.00–20.00 WIB
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {year} CleanCraft Laundry Studio</span>
          <span>Dibersihkan dengan teliti. Dirawat sepenuh hati.</span>
          <a href="#top">Kembali ke atas ↑</a>
        </div>
      </div>
    </footer>
  );
}
