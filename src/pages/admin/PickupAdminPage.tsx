import React, { useEffect, useState } from 'react';
import {
  MapPinLine,
  Clock,
  Plus,
} from '@phosphor-icons/react';
import { mockApi } from '../../lib/mockApi';
import type { PickupSlot, PickupZone } from '../../types';
import { formatRupiah } from '../../lib/utils';

export const PickupAdminPage: React.FC = () => {
  const [slots, setSlots] = useState<PickupSlot[]>([]);
  const [zones, setZones] = useState<PickupZone[]>([]);

  // Edit slot modal
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<PickupSlot | null>(null);
  const [slotName, setSlotName] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [capacity, setCapacity] = useState(5);
  const [isSlotActive, setIsSlotActive] = useState(true);

  // Edit zone modal
  const [zoneModalOpen, setZoneModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<PickupZone | null>(null);
  const [minDist, setMinDist] = useState(0);
  const [maxDist, setMaxDist] = useState(2);
  const [fee, setFee] = useState(3000);
  const [isZoneActive, setIsZoneActive] = useState(true);

  const fetchPickupConfig = async () => {
    const [s, z] = await Promise.all([
      mockApi.adminGetSlots(),
      mockApi.adminGetZones(),
    ]);
    setSlots(s);
    setZones(z);
  };

  useEffect(() => {
    fetchPickupConfig();
  }, []);

  const handleOpenEditSlot = (slot: PickupSlot) => {
    setEditingSlot(slot);
    setSlotName(slot.name);
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    setCapacity(slot.capacity);
    setIsSlotActive(slot.isActive);
    setSlotModalOpen(true);
  };

  const handleOpenAddSlot = () => {
    setEditingSlot(null);
    setSlotName('Slot Malam');
    setStartTime('19:00');
    setEndTime('21:00');
    setCapacity(4);
    setIsSlotActive(true);
    setSlotModalOpen(true);
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: PickupSlot = {
      id: editingSlot ? editingSlot.id : `slot-${Date.now()}`,
      name: slotName.trim(),
      startTime,
      endTime,
      capacity: Number(capacity),
      isActive: isSlotActive,
      createdAt: editingSlot ? editingSlot.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await mockApi.adminSaveSlot(payload);
    setSlotModalOpen(false);
    fetchPickupConfig();
  };

  const handleOpenAddZone = () => {
    setEditingZone(null);
    setMinDist(0);
    setMaxDist(2);
    setFee(3000);
    setIsZoneActive(true);
    setZoneModalOpen(true);
  };

  const handleOpenEditZone = (zone: PickupZone) => {
    setEditingZone(zone);
    setMinDist(zone.minDistanceKm);
    setMaxDist(zone.maxDistanceKm);
    setFee(zone.fee);
    setIsZoneActive(zone.isActive);
    setZoneModalOpen(true);
  };

  const handleSaveZone = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: PickupZone = {
      id: editingZone ? editingZone.id : `zone-${Date.now()}`,
      minDistanceKm: Number(minDist),
      maxDistanceKm: Number(maxDist),
      fee: Number(fee),
      isActive: isZoneActive,
      createdAt: editingZone ? editingZone.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await mockApi.adminSaveZone(payload);
    setZoneModalOpen(false);
    fetchPickupConfig();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Slot & Zona Penjemputan (Pickup)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Atur kapasitas kurir harian dan batas tarif ongkos kirim berdasarkan zona jarak kilometer (PRD Section 18-20).
        </p>
      </div>

      {/* SECTION 1: PICKUP SLOTS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock weight="bold" className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-base text-slate-900">
              Template Slot Jadwal Pickup Harian
            </h2>
          </div>
          <button
            type="button"
            onClick={handleOpenAddSlot}
            className="tactile-btn inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm"
          >
            <Plus weight="bold" className="w-3.5 h-3.5" />
            <span>Tambah Slot</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {slots.map((s) => (
            <div
              key={s.id}
              className="diffusion-card bg-white p-5 rounded-2xl border border-slate-200 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">{s.name}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    s.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {s.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Waktu Pickup:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {s.startTime} – {s.endTime} WIB
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Kapasitas Maksimal:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {s.capacity} Pesanan / Hari
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenEditSlot(s)}
                className="tactile-btn w-full py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold"
              >
                Ubah Slot
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: PICKUP ZONES & TARIF */}
      <div className="space-y-4 pt-4 border-t border-slate-200/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPinLine weight="bold" className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-base text-slate-900">
              Zona Jarak & Biaya Ongkos Kirim (Pickup Zones)
            </h2>
          </div>
          <button
            type="button"
            onClick={handleOpenAddZone}
            className="tactile-btn inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm"
          >
            <Plus weight="bold" className="w-3.5 h-3.5" />
            <span>Tambah Zona</span>
          </button>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {zones.map((z) => (
            <div
              key={z.id}
              className="diffusion-card bg-white p-5 rounded-2xl border border-slate-200 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-slate-900">
                  {z.minDistanceKm} – {z.maxDistanceKm} KM
                </span>
                <span className="font-mono font-bold text-base text-emerald-700">
                  {formatRupiah(z.fee)}
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Otomatis diterapkan saat jarak titik koordinat customer berada dalam rentang ini.
              </p>

              <button
                type="button"
                onClick={() => handleOpenEditZone(z)}
                className="tactile-btn w-full py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold"
              >
                Ubah Tarif Zona
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Slot Modal */}
      {slotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900">
              {editingSlot ? 'Edit Slot Pickup' : 'Tambah Slot Pickup'}
            </h3>
            <form onSubmit={handleSaveSlot} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Slot</label>
                <input
                  type="text"
                  value={slotName}
                  onChange={(e) => setSlotName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kapasitas Slot</label>
                <input
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl font-mono"
                  required
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="slotActive"
                  checked={isSlotActive}
                  onChange={(e) => setIsSlotActive(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="slotActive">Slot Aktif</label>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setSlotModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Zone Modal */}
      {zoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900">
              {editingZone ? 'Ubah Tarif Zona Pickup' : 'Tambah Zona Pickup'}
            </h3>
            <form onSubmit={handleSaveZone} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Min (KM)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={minDist}
                    onChange={(e) => setMinDist(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Maks (KM)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={maxDist}
                    onChange={(e) => setMaxDist(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tarif Ongkir (Rp)</label>
                <input
                  type="number"
                  value={fee}
                  onChange={(e) => setFee(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl font-mono font-bold"
                  required
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="zoneActive"
                  checked={isZoneActive}
                  onChange={(e) => setIsZoneActive(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="zoneActive">Zona Aktif</label>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setZoneModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
