import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  House,
  TShirt,
  CalendarPlus,
  MagnifyingGlass,
  UserGear,
  WhatsappLogo,
  Sparkle,
} from '@phosphor-icons/react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const isBookingPage = currentPath.startsWith('/booking');

  const navItems = [
    { label: 'Beranda', path: '/', icon: House },
    { label: 'Layanan', path: '/services', icon: TShirt },
    { label: 'Booking', path: '/booking', icon: CalendarPlus, highlight: true },
    { label: 'Lacak', path: '/tracking', icon: MagnifyingGlass },
    { label: 'Admin', path: '/admin/dashboard', icon: UserGear },
  ];

  return (
    <>
      {/* Top Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-xs"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20"
            >
              <Sparkle weight="fill" className="w-5 h-5" />
            </motion.div>
            <div>
              <span className="font-display font-bold text-lg text-slate-900 tracking-tight block leading-tight">
                CleanCraft
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-600 block">
                Laundry Studio
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                currentPath === '/'
                  ? 'text-emerald-700 bg-emerald-50/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Beranda
            </Link>
            <Link
              to="/services"
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                currentPath === '/services'
                  ? 'text-emerald-700 bg-emerald-50/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Layanan & Tarif
            </Link>
            <Link
              to="/tracking"
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                currentPath.startsWith('/tracking')
                  ? 'text-emerald-700 bg-emerald-50/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Lacak Pesanan
            </Link>
          </nav>

          {/* Action CTAs Desktop */}
          <div className="flex items-center gap-2.5">
            <Link
              to="/admin/dashboard"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              title="Akses Portal Admin Laundry"
            >
              <UserGear weight="bold" className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </Link>

            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="https://wa.me/6281298421823"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
            >
              <WhatsappLogo weight="fill" className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">WhatsApp</span>
            </motion.a>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/booking"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs md:text-sm font-semibold rounded-lg shadow-sm shadow-emerald-600/30 transition-colors"
              >
                <CalendarPlus weight="bold" className="w-4 h-4" />
                <span>Booking Laundry</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Bottom Navigation Bar (Hidden on Booking page to never block wizard buttons) */}
      {!isBookingPage && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-3 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-around max-w-md mx-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/'
                  ? currentPath === '/'
                  : currentPath.startsWith(item.path);

              if (item.highlight) {
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex flex-col items-center justify-center -mt-5 group"
                  >
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 border-2 border-white"
                    >
                      <Icon weight="bold" className="w-6 h-6" />
                    </motion.div>
                    <span className="text-[10px] font-bold text-emerald-700 mt-1">
                      {item.label}
                    </span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors ${
                    isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon weight={isActive ? 'fill' : 'regular'} className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px]">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
