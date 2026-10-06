import React, { useEffect, useState } from 'react';
import {
  Check,
  MapPin,
  Clock,
  CreditCard,
  Building,
} from '@phosphor-icons/react';
import { mockApi } from '../../lib/mockApi';
import type { Settings } from '../../types';

export const SettingsAdminPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const s = await mockApi.getSettings();
        setSettings(s);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    await mockApi.adminSaveSettings(settings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (loading || !settings) {
    return (
      <div className="py-16 text-center text-xs text-slate-500">
        Memuat pengaturan outlet...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Pengaturan Outlet Laundry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi profil fisik outlet, koordinat Haversine, batasan radius, dan rekening pembayaran.
          </p>
        </div>

        {saveSuccess && (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 animate-fadeIn">
            <Check weight="bold" className="w-3.5 h-3.5" />
            <span>Pengaturan Berhasil Disimpan!</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: PROFIL OUTLET */}
        <div className="diffusion-card bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building weight="bold" className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">Identitas & Alamat Fisik Outlet</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Nama Laundry</label>
              <input
                type="text"
                value={settings.laundryName}
                onChange={(e) => setSettings({ ...settings, laundryName: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Nomor WhatsApp Resmi</label>
              <input
                type="text"
                value={settings.whatsapp}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl font-mono"
                required
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-slate-700">Alamat Lengkap Outlet</label>
              <textarea
                rows={2}
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
                required
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: KOORDINAT & RADIUS HAVERSINE */}
        <div className="diffusion-card bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin weight="bold" className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Koordinat Outlet & Batas Radius (Haversine Formula)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Latitude Outlet</label>
              <input
                type="number"
                step="0.0001"
                value={settings.latitude}
                onChange={(e) => setSettings({ ...settings, latitude: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-xl font-mono"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Longitude Outlet</label>
              <input
                type="number"
                step="0.0001"
                value={settings.longitude}
                onChange={(e) => setSettings({ ...settings, longitude: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-xl font-mono"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Maksimal Radius Pickup (KM)</label>
              <input
                type="number"
                step="0.1"
                value={settings.maximumPickupRadiusKm}
                onChange={(e) =>
                  setSettings({ ...settings, maximumPickupRadiusKm: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border rounded-xl font-mono font-bold text-emerald-700"
                required
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: OPERASIONAL & CUTOFF */}
        <div className="diffusion-card bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock weight="bold" className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">Aturan Jam & Batas Waktu Booking (Cutoff)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Jam Buka Outlet</label>
              <input
                type="time"
                value={settings.openingTime}
                onChange={(e) => setSettings({ ...settings, openingTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Jam Tutup Outlet</label>
              <input
                type="time"
                value={settings.closingTime}
                onChange={(e) => setSettings({ ...settings, closingTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Cutoff Menit Sebelum Slot</label>
              <input
                type="number"
                value={settings.pickupCutoffMinutes}
                onChange={(e) =>
                  setSettings({ ...settings, pickupCutoffMinutes: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border rounded-xl font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Maks Booking Kedepan (Hari)</label>
              <input
                type="number"
                value={settings.maximumBookingDaysAhead}
                onChange={(e) =>
                  setSettings({ ...settings, maximumBookingDaysAhead: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border rounded-xl font-mono"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: INFORMASI PEMBAYARAN MANUAL */}
        <div className="diffusion-card bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <CreditCard weight="bold" className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Instruksi Rekening & Pembayaran Manual (PRD Section 44)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Nama Bank</label>
              <input
                type="text"
                value={settings.bankName || ''}
                onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                placeholder="BCA / Mandiri / BNI"
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Nomor Rekening</label>
              <input
                type="text"
                value={settings.bankAccountNumber || ''}
                onChange={(e) => setSettings({ ...settings, bankAccountNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Atas Nama Rekening</label>
              <input
                type="text"
                value={settings.bankAccountName || ''}
                onChange={(e) => setSettings({ ...settings, bankAccountName: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="tactile-btn px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/30 transition-colors"
          >
            Simpan Seluruh Pengaturan
          </button>
        </div>
      </form>
    </div>
  );
};
