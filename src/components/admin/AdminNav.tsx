import { useState } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import {
  ChartPieSlice,
  ListBullets,
  TShirt,
  Users,
  MapPinLine,
  GearSix,
  SignOut,
  House,
  List,
  X,
} from "@phosphor-icons/react";
import { mockApi } from "../../lib/mockApi";
import { Brand } from "../common/Navbar";
import { LaundryVisual } from "../common/LaundryVisual";
const navLinks = [
  { label: "Ringkasan", path: "/admin/dashboard", icon: ChartPieSlice },
  { label: "Pesanan laundry", path: "/admin/bookings", icon: ListBullets },
  { label: "Layanan & harga", path: "/admin/services", icon: TShirt },
  { label: "Pelanggan", path: "/admin/customers", icon: Users },
  { label: "Jadwal & area pickup", path: "/admin/pickup", icon: MapPinLine },
  { label: "Pengaturan studio", path: "/admin/settings", icon: GearSix },
];
export function AdminNav() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuPath, setMenuPath] = useState(pathname);
  const visible = open && menuPath === pathname;
  return (
    <>
      <div className="admin-mobile-bar">
        <Brand />
        <button
          className="icon-button"
          aria-label={visible ? "Tutup navigasi admin" : "Buka navigasi admin"}
          aria-expanded={visible}
          aria-controls="admin-sidebar"
          onClick={() => {
            setMenuPath(pathname);
            setOpen(!visible);
          }}
        >
          {visible ? <X size={23} /> : <List size={23} />}
        </button>
      </div>
      {visible && (
        <button
          className="drawer-backdrop"
          aria-label="Tutup navigasi"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        id="admin-sidebar"
        className={`admin-sidebar ${visible ? "is-open" : ""}`}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      >
        <Brand />
        <span className="sidebar-caption">WORKSPACE STUDIO</span>
        <nav className="admin-nav" aria-label="Navigasi admin">
          {navLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
            >
              <item.icon size={19} weight="duotone" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-note">
          <LaundryVisual kind="washer" />
          <p>Selamat merawat hari pelanggan.</p>
        </div>
        <div className="admin-sidebar-bottom">
          <Link to="/">
            <House size={17} /> Lihat website pelanggan
          </Link>
          <button
            onClick={async () => {
              await mockApi.adminLogout();
              navigate("/admin/login");
            }}
          >
            <SignOut size={17} /> Keluar dari akun
          </button>
        </div>
      </aside>
    </>
  );
}
