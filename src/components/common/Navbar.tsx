import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { List, X, ArrowUpRight, WashingMachine } from "@phosphor-icons/react";
export function Brand() {
  return (
    <Link to="/" className="brand" aria-label="CleanCraft, beranda">
      <span className="brand-mark">
        <WashingMachine size={26} weight="duotone" />
      </span>
      <span>
        cleancraft<span className="brand-dot">.</span>
        <small>LAUNDRY STUDIO</small>
      </span>
    </Link>
  );
}
export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const [menuPath, setMenuPath] = useState(location.pathname);
  const visible = open && menuPath === location.pathname;
  return (
    <header className="site-header">
      <div className="site-container nav-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Navigasi utama">
          <NavLink to="/" end>
            Beranda
          </NavLink>
          <NavLink to="/services">Layanan & harga</NavLink>
          <a href="/#cara-kerja">Cara kerja</a>
          <NavLink to="/tracking">Lacak cucian</NavLink>
        </nav>
        <div className="nav-actions">
          <Link className="nav-admin" to="/admin/dashboard">
            Admin
          </Link>
          <Link className="button button-primary nav-book" to="/booking">
            Jadwalkan pickup <ArrowUpRight size={16} />
          </Link>
          <button
            className="icon-button mobile-toggle"
            aria-label={visible ? "Tutup menu" : "Buka menu"}
            aria-expanded={visible}
            aria-controls="mobile-menu"
            onClick={() => {
              setMenuPath(location.pathname);
              setOpen(!visible);
            }}
          >
            {visible ? <X size={23} /> : <List size={23} />}
          </button>
        </div>
      </div>
      {visible && (
        <nav
          id="mobile-menu"
          className="mobile-menu"
          aria-label="Navigasi mobile"
          onClick={() => setOpen(false)}
        >
          <NavLink to="/">Beranda</NavLink>
          <NavLink to="/services">Layanan & harga</NavLink>
          <a href="/#cara-kerja">Cara kerja</a>
          <NavLink to="/tracking">Lacak cucian</NavLink>
          <NavLink to="/booking">Jadwalkan pickup</NavLink>
          <NavLink to="/admin/dashboard">Dashboard admin</NavLink>
        </nav>
      )}
    </header>
  );
}
