import React, { useEffect, useState } from 'react';
import { MagnifyingGlass, WhatsappLogo } from '@phosphor-icons/react';
import { mockApi } from '../../lib/mockApi';
import type { Customer } from '../../types';
import { formatDisplayPhone } from '../../lib/utils';

export const CustomersAdminPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetch() {
      try {
        const data = await mockApi.adminGetCustomers();
        setCustomers(data);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.latestAddress && c.latestAddress.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Database Pelanggan Outlet
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Data pelanggan otomatis tersimpan dan diperbarui saat booking baru masuk.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <MagnifyingGlass weight="bold" className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari pelanggan berdasarkan nama, HP, atau alamat..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 shadow-sm"
        />
      </div>

      {/* Customers List */}
      <div className="diffusion-card bg-white rounded-3xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">Memuat data pelanggan...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">Tidak ada pelanggan ditemukan.</div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="block md:hidden divide-y divide-slate-100 p-4 space-y-3">
              {filtered.map((c) => (
                <div key={c.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                    <a
                      href={`https://wa.me/${c.phone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded-md bg-primary-50 text-primary-700 hover:bg-primary-100"
                    >
                      <WhatsappLogo weight="fill" className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="text-xs space-y-1 text-slate-600">
                    <p className="font-mono text-slate-800">{formatDisplayPhone(c.phone)}</p>
                    {c.latestAddress && <p className="text-slate-500 line-clamp-2">Alamat: {c.latestAddress}</p>}
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Total Booking: <strong className="text-slate-800">{c.totalBookings}</strong></span>
                    <span>Selesai: <strong className="text-primary-700">{c.completedOrders}</strong></span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-6">Nama Pelanggan</th>
                    <th className="py-3.5 px-4">Nomor WhatsApp</th>
                    <th className="py-3.5 px-4">Alamat Terakhir</th>
                    <th className="py-3.5 px-4">Total Booking</th>
                    <th className="py-3.5 px-4">Order Selesai</th>
                    <th className="py-3.5 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-slate-900">{c.name}</td>
                      <td className="py-3.5 px-4 font-mono">{formatDisplayPhone(c.phone)}</td>
                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                        {c.latestAddress || '-'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                        {c.totalBookings} kali
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-primary-700">
                        {c.completedOrders} selesai
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <a
                          href={`https://wa.me/${c.phone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="tactile-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-800 text-xs font-semibold"
                        >
                          <WhatsappLogo weight="fill" className="w-3.5 h-3.5 text-primary-600" />
                          <span>Chat WA</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
