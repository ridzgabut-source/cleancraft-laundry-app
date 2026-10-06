import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  Sparkle,
} from '@phosphor-icons/react';
import { mockApi } from '../../lib/mockApi';

export const AdminNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: ChartPieSlice },
    { label: 'Kelola Booking', path: '/admin/bookings', icon: ListBullets },
    { label: 'Master Layanan', path: '/admin/services', icon: TShirt },
    { label: 'Database Customer', path: '/admin/customers', icon: Users },
    { label: 'Slot & Zona Pickup', path: '/admin/pickup', icon: MapPinLine },
    { label: 'Pengaturan Outlet', path: '/admin/settings', icon: GearSix },
  ];

  const handleLogout = async () => {
    await mockApi.adminLogout();
    navigate('/admin/login');
  };

  return (
    <>
      {/* Mobile Top Header for Admin */}
      <div className="md:hidden sticky top-0 z-40 bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
            <Sparkle weight="fill" className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-sm block leading-none">CleanCraft</span>
            <span className="text-[10px] text-emerald-400 font-semibold tracking-wider">ADMIN PORTAL</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="p-1.5 text-slate-400 hover:text-white rounded-md bg-slate-800"
            title="Ke Website Publik"
          >
            <House weight="bold" className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-300 hover:text-white rounded-md bg-slate-800"
          >
            {mobileMenuOpen ? <X weight="bold" className="w-5 h-5" /> : <List weight="bold" className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[53px] z-50 bg-slate-900/95 backdrop-blur-sm p-4 space-y-2 flex flex-col">
          <div className="flex-1 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = currentPath === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon weight={active ? 'fill' : 'regular'} className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-white"
            >
              <House className="w-5 h-5" />
              <span>Kembali ke Website Pelanggan</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-950/40 transition-colors"
            >
              <SignOut className="w-5 h-5" />
              <span>Keluar (Logout)</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 min-h-[100dvh]">
        {/* Brand */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-slate-950 shadow-md shadow-emerald-500/20">
              <Sparkle weight="fill" className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-white text-base block leading-none">
                CleanCraft
              </span>
              <span className="text-[10px] text-emerald-400 uppercase font-semibold tracking-wider">
                Admin Panel v2.1
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = currentPath === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  active
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon weight={active ? 'fill' : 'regular'} className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-white rounded-lg transition-colors hover:bg-slate-800"
          >
            <House className="w-4 h-4" />
            <span>Lihat Website Pelanggan</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors"
          >
            <SignOut className="w-4 h-4" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>
    </>
  );
};
