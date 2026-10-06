import { Navigate, Outlet, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { AdminNav } from "../components/admin/AdminNav";
import { mockApi } from "../lib/mockApi";
export function AdminLayout() {
  const { pathname } = useLocation();
  const reduced = useReducedMotion();
  if (!mockApi.adminGetAuth()) return <Navigate to="/admin/login" replace />;
  const section = pathname.split("/")[2];
  const titles: Record<string, string> = {
    dashboard: "Ringkasan",
    bookings: "Pesanan",
    services: "Layanan",
    customers: "Pelanggan",
    pickup: "Pickup",
    settings: "Pengaturan",
  };
  return (
    <div className="admin-shell">
      <AdminNav />
      <div className="admin-workspace">
        <header className="admin-topbar">
          <span>
            Workspace <span className="mx-3">/</span>{" "}
            <strong>{titles[section] || "Studio"}</strong>
          </span>
          <div className="admin-profile">
            <span>CleanCraft · Kebayoran Baru</span>
            <span className="avatar">CC</span>
          </div>
        </header>
        <main className="admin-content">
          <motion.div
            key={pathname}
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
