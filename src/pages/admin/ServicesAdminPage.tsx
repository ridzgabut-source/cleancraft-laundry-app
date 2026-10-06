import React, { useEffect, useState } from 'react';
import {
  Plus,
  PencilSimple,
} from '@phosphor-icons/react';
import { mockApi } from '../../lib/mockApi';
import type { Service } from '../../types';
import { formatRupiah } from '../../lib/utils';

export const ServicesAdminPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Form modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [pricePerKg, setPricePerKg] = useState(7000);
  const [estimatedHours, setEstimatedHours] = useState(48);
  const [badge, setBadge] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await mockApi.adminGetAllServices();
      setServices(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenAdd = () => {
    setEditingService(null);
    setName('');
    setDesc('');
    setPricePerKg(8000);
    setEstimatedHours(48);
    setBadge('');
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (srv: Service) => {
    setEditingService(srv);
    setName(srv.name);
    setDesc(srv.description);
    setPricePerKg(srv.pricePerKg);
    setEstimatedHours(srv.estimatedHours);
    setBadge(srv.badge || '');
    setIsActive(srv.isActive);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: Service = {
      id: editingService ? editingService.id : `srv-${Date.now()}`,
      name: name.trim(),
      description: desc.trim(),
      pricePerKg: Number(pricePerKg),
      estimatedHours: Number(estimatedHours),
      badge: badge.trim() || undefined,
      isActive,
      createdAt: editingService ? editingService.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await mockApi.adminSaveService(payload);
    setModalOpen(false);
    fetchServices();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Master Layanan Laundry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur paket cucian kiloan, harga per kilogram, dan estimasi waktu pengerjaan.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="tactile-btn inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus weight="bold" className="w-4 h-4" />
          <span>Tambah Layanan Baru</span>
        </button>
      </div>

      <div className="diffusion-card bg-white rounded-3xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">Memuat layanan...</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {services.map((srv) => (
              <div
                key={srv.id}
                className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="space-y-1 max-w-lg">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900">{srv.name}</h3>
                    {srv.badge && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary-50 text-primary-700 border border-primary-200">
                        {srv.badge}
                      </span>
                    )}
                    {!srv.isActive && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                        Nonaktif
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{srv.description}</p>
                  <p className="text-[11px] text-slate-400">
                    Estimasi pengerjaan: {srv.estimatedHours} jam
                  </p>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 justify-between sm:justify-end">
                  <div className="text-left sm:text-right">
                    <div className="text-[11px] text-slate-400">Harga / Kg</div>
                    <div className="font-mono text-base sm:text-lg font-bold text-primary-700">
                      {formatRupiah(srv.pricePerKg)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(srv)}
                    className="tactile-btn inline-flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <PencilSimple weight="bold" className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit/Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">
                {editingService ? 'Edit Layanan' : 'Tambah Layanan Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nama Layanan</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Cuci Komplit Reguler"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Deskripsi Layanan</label>
                <textarea
                  rows={2}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Penjelasan ke pelanggan..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Harga / Kg (Rp)</label>
                  <input
                    type="number"
                    value={pricePerKg}
                    onChange={(e) => setPricePerKg(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Estimasi Jam Selesai</label>
                  <input
                    type="number"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Badge Label (Opsional)</label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="Contoh: Paling Populer, Cepat"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="isActiveToggle" className="text-slate-700 font-medium">
                  Layanan Aktif (Tampil di Website Pelanggan)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="tactile-btn px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-sm"
                >
                  Simpan Layanan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
