import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkle,
  Truck,
  Package,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  WarningCircle,
  Clock,
  ShieldCheck,
  Check,
} from '@phosphor-icons/react';
import { mockApi } from '../../lib/mockApi';
import type { Service, ServiceMode, SlotAvailability } from '../../types';
import { formatRupiah, normalizePhone, formatDisplayPhone } from '../../lib/utils';

export const BookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Wizard Step State (1: Layanan, 2: Metode, 3: Lokasi, 4: Slot, 5: Data Customer, 6: Review)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Master Data
  const [services, setServices] = useState<Service[]>([]);

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [serviceMode, setServiceMode] = useState<ServiceMode>('PICKUP');

  // Pickup Location State
  const [pickupAddress, setPickupAddress] = useState<string>('Jl. Bumi No. 28, Kebayoran Baru, Jakarta Selatan');
  const [pickupLandmark, setPickupLandmark] = useState<string>('Pagar abu-abu, seberang taman');
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lon: number; name: string }>({
    name: 'Kebayoran Baru (1.4 km)',
    lat: -6.2425,
    lon: 106.7925,
  });
  const [locationValidation, setLocationValidation] = useState<{
    distanceKm: number;
    withinRadius: boolean;
    pickupFee: number;
  } | null>(null);

  // Schedule State (Pickup)
  const todayStr = new Date().toISOString().split('T')[0];
  const [scheduledDate, setScheduledDate] = useState<string>(todayStr);
  const [availableSlots, setAvailableSlots] = useState<SlotAvailability[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Customer Data State
  const [customerName, setCustomerName] = useState<string>('Kinan Prameswari');
  const [customerPhone, setCustomerPhone] = useState<string>('081298421823');
  const [estimatedQuantity, setEstimatedQuantity] = useState<string>('1 kantong sedang (sekitar 4-5 kg)');
  const [notes, setNotes] = useState<string>('Pisahkan pakaian putih');

  // Simulation coordinates
  const sampleCoords = [
    { name: 'Kebayoran Baru (1.4 km - Zone 1)', lat: -6.2425, lon: 106.7925 },
    { name: 'Gandaria City (2.8 km - Zone 2)', lat: -6.244, lon: 106.783 },
    { name: 'Blok M / Melawai (3.2 km - Zone 2)', lat: -6.2445, lon: 106.798 },
    { name: 'Kemang Raya (4.6 km - Zone 2)', lat: -6.273, lon: 106.815 },
    { name: 'Tebet (7.2 km - Luar Radius)', lat: -6.228, lon: 106.855 },
  ];

  // Load Initial Data
  useEffect(() => {
    async function init() {
      try {
        const srvList = await mockApi.getServices();
        setServices(srvList);

        const srvParam = searchParams.get('service');
        if (srvParam && srvList.some((s) => s.id === srvParam)) {
          setSelectedServiceId(srvParam);
        } else if (srvList.length > 0) {
          setSelectedServiceId(srvList[0].id);
        }

        const locRes = await mockApi.validateLocation(selectedCoords.lat, selectedCoords.lon);
        setLocationValidation(locRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingInitial(false);
      }
    }
    init();
  }, [searchParams]);

  // Load Slots when scheduledDate changes
  useEffect(() => {
    async function loadSlots() {
      if (serviceMode !== 'PICKUP') return;
      setLoadingSlots(true);
      try {
        const slots = await mockApi.getPickupSlots(scheduledDate);
        setAvailableSlots(slots);
        const firstAvail = slots.find((s) => s.isAvailable);
        if (firstAvail) {
          setSelectedSlotId(firstAvail.slot.id);
        } else {
          setSelectedSlotId('');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSlots(false);
      }
    }
    loadSlots();
  }, [scheduledDate, serviceMode]);

  // Change location handler
  const handleSelectLocation = async (lat: number, lon: number, name: string) => {
    setSelectedCoords({ lat, lon, name });
    try {
      const res = await mockApi.validateLocation(lat, lon);
      setLocationValidation(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Step Navigation logic
  const handleNextStep = () => {
    setSubmitError(null);

    if (currentStep === 1) {
      if (!selectedServiceId) {
        setSubmitError('Silakan pilih salah satu layanan.');
        return;
      }
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentStep === 2) {
      if (serviceMode === 'SELF_DROP_OFF') {
        setCurrentStep(5);
      } else {
        setCurrentStep(3);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentStep === 3) {
      if (!locationValidation || !locationValidation.withinRadius) {
        setSubmitError('Lokasi berada di luar radius pickup (maksimal 5 km). Silakan pilih lokasi lain atau gunakan opsi Antar Mandiri.');
        return;
      }
      if (!pickupAddress.trim()) {
        setSubmitError('Alamat pickup wajib diisi.');
        return;
      }
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentStep === 4) {
      if (!selectedSlotId) {
        setSubmitError('Silakan pilih slot waktu pickup yang masih tersedia.');
        return;
      }
      setCurrentStep(5);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentStep === 5) {
      if (!customerName.trim()) {
        setSubmitError('Nama lengkap wajib diisi.');
        return;
      }
      if (!customerPhone.trim() || normalizePhone(customerPhone).length < 10) {
        setSubmitError('Nomor WhatsApp wajib valid (minimal 10 digit).');
        return;
      }
      setCurrentStep(6);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
  };

  const handlePrevStep = () => {
    setSubmitError(null);
    if (currentStep === 5 && serviceMode === 'SELF_DROP_OFF') {
      setCurrentStep(2);
    } else {
      setCurrentStep((prev) => Math.max(1, prev - 1));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Booking handler
  const handleSubmitBooking = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await mockApi.createBooking({
        serviceId: selectedServiceId,
        serviceMode,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        estimatedQuantity,
        notes,
        scheduledDate: serviceMode === 'PICKUP' ? scheduledDate : undefined,
        pickupSlotId: serviceMode === 'PICKUP' ? selectedSlotId : undefined,
        pickupAddress: serviceMode === 'PICKUP' ? pickupAddress.trim() : undefined,
        pickupLandmark: serviceMode === 'PICKUP' ? pickupLandmark.trim() : undefined,
        pickupLatitude: serviceMode === 'PICKUP' ? selectedCoords.lat : undefined,
        pickupLongitude: serviceMode === 'PICKUP' ? selectedCoords.lon : undefined,
      });

      if (res.success && res.data) {
        navigate(`/booking/success/${res.data.bookingCode}`, {
          state: { booking: res.data },
        });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal membuat booking. Silakan coba lagi.';
      setSubmitError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const selectedSlot = availableSlots.find((s) => s.slot.id === selectedSlotId);
  const totalSteps = serviceMode === 'SELF_DROP_OFF' ? 4 : 6;

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Pilih Layanan';
      case 2:
        return 'Metode Antar / Jemput';
      case 3:
        return 'Alamat & Radius Pickup';
      case 4:
        return 'Jadwal & Slot Waktu';
      case 5:
        return 'Data Pelanggan';
      case 6:
        return 'Review & Konfirmasi Booking';
      default:
        return '';
    }
  };

  if (loadingInitial) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 rounded-full border-3 border-primary-600 border-t-transparent animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 font-medium">Menyiapkan form booking...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 md:py-10 space-y-6 pb-40 md:pb-32">
      {/* Wizard Header & Progress */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
            <span className="text-primary-700 uppercase tracking-wider font-bold">
              Langkah {currentStep === 5 && serviceMode === 'SELF_DROP_OFF' ? '3' : currentStep === 6 && serviceMode === 'SELF_DROP_OFF' ? '4' : currentStep} dari {totalSteps}
            </span>
          </div>
          <span className="text-slate-700 font-bold">{getStepTitle()}</span>
        </div>

        {/* Dynamic Animated Progress Bar */}
        <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5">
          <motion.div
            className="h-full bg-primary-600 rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${(() => {
                const total = serviceMode === 'SELF_DROP_OFF' ? 4 : 6;
                let displayStep = currentStep;
                if (serviceMode === 'SELF_DROP_OFF') {
                  if (currentStep === 5) displayStep = 3;
                  else if (currentStep === 6) displayStep = 4;
                }
                return Math.min(100, (displayStep / total) * 100);
              })()}%`,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          />
        </div>
      </motion.div>

      {/* Error alert if any */}
      <AnimatePresence>
        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 shadow-sm"
          >
            <WarningCircle weight="bold" className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{submitError}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ANIMATED STEP CARDS */}
      <AnimatePresence mode="wait">
        {/* STEP 1: PILIH LAYANAN */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="diffusion-card bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6 shadow-sm"
          >
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-primary-700 uppercase tracking-wider">
                Langkah 1
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Pilih Layanan Cucian Kiloan
              </h2>
              <p className="text-xs text-slate-500">
                Pilih paket yang Anda butuhkan. Cucian diproses 1 mesin per 1 pelanggan (higienis & tidak dicampur).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((srv) => {
                const isSelected = selectedServiceId === srv.id;
                return (
                  <motion.div
                    key={srv.id}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => setSelectedServiceId(srv.id)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-primary-600 bg-primary-50/50 shadow-md ring-2 ring-primary-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-900">{srv.name}</h4>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-primary-600 text-white'
                              : 'border-2 border-slate-300'
                          }`}
                        >
                          {isSelected && <Check weight="bold" className="w-3 h-3" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{srv.description}</p>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Tarif Resmi:</span>
                      <span className="font-mono font-bold text-base text-primary-700">
                        {formatRupiah(srv.pricePerKg)} <span className="text-xs font-normal text-slate-500">/ kg</span>
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Direct In-Card Action Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Layanan terpilih:{' '}
                <strong className="text-primary-700">{selectedService?.name || '-'}</strong>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-600/30 transition-colors"
              >
                <span>Lanjut ke Metode Layanan</span>
                <ArrowRight weight="bold" className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: METODE LAYANAN */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="diffusion-card bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6 shadow-sm"
          >
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-primary-700 uppercase tracking-wider">
                Langkah 2
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Pilih Metode Layanan
              </h2>
              <p className="text-xs text-slate-500">
                Pilih apakah kurir menjemput cucian ke tempat Anda, atau Anda mengantar sendiri ke outlet.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* PICKUP */}
              <motion.div
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => setServiceMode('PICKUP')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
                  serviceMode === 'PICKUP'
                    ? 'border-primary-600 bg-primary-50/50 shadow-md ring-2 ring-primary-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center">
                    <Truck weight="bold" className="w-5 h-5" />
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      serviceMode === 'PICKUP' ? 'bg-primary-600 text-white' : 'border-2 border-slate-300'
                    }`}
                  >
                    {serviceMode === 'PICKUP' && <Check weight="bold" className="w-3 h-3" />}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900">Kurir Pickup (Antar-Jemput)</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Kurir kami menjemput cucian langsung ke rumah/kos Anda sesuai slot waktu yang dipilih.
                  </p>
                </div>
                <div className="text-[11px] text-primary-700 font-semibold pt-1">
                  Tersedia untuk radius maksimal 5.0 km
                </div>
              </motion.div>

              {/* SELF DROP OFF */}
              <motion.div
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => setServiceMode('SELF_DROP_OFF')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
                  serviceMode === 'SELF_DROP_OFF'
                    ? 'border-primary-600 bg-primary-50/50 shadow-md ring-2 ring-primary-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Package weight="bold" className="w-5 h-5" />
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      serviceMode === 'SELF_DROP_OFF' ? 'bg-primary-600 text-white' : 'border-2 border-slate-300'
                    }`}
                  >
                    {serviceMode === 'SELF_DROP_OFF' && <Check weight="bold" className="w-3 h-3" />}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900">Antar Mandiri (Self Drop-off)</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Anda membawa cucian langsung ke outlet CleanCraft Kebayoran Baru (08.00–20.00 WIB).
                  </p>
                </div>
                <div className="text-[11px] text-slate-500 font-semibold pt-1">
                  Gratis ongkos kirim (Rp0)
                </div>
              </motion.div>
            </div>

            {/* In-Card Next Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handlePrevStep}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ArrowLeft weight="bold" className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-600/30 transition-colors"
              >
                <span>
                  {serviceMode === 'PICKUP' ? 'Lanjut ke Alamat Pickup' : 'Lanjut ke Data Diri'}
                </span>
                <ArrowRight weight="bold" className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: LOKASI & RADIUS (PICKUP ONLY) */}
        {currentStep === 3 && serviceMode === 'PICKUP' && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="diffusion-card bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6 shadow-sm"
          >
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-primary-700 uppercase tracking-wider">
                Langkah 3
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Alamat & Cek Radius Pickup
              </h2>
              <p className="text-xs text-slate-500">
                Pilih titik simulasi lokasi untuk menghitung jarak akurat dan ongkos kirim ke outlet.
              </p>
            </div>

            {/* Quick preset locations */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Pilih Titik Lokasi Jemput:
              </label>
              <div className="flex flex-wrap gap-2">
                {sampleCoords.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleSelectLocation(c.lat, c.lon, c.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                      selectedCoords.name === c.name
                        ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Validation Box */}
            {locationValidation && (
              <div
                className={`p-4 rounded-2xl border ${
                  locationValidation.withinRadius
                    ? 'bg-primary-50/70 border-primary-200 text-primary-900'
                    : 'bg-rose-50/70 border-rose-200 text-rose-900'
                } space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-xs sm:text-sm">
                    {locationValidation.withinRadius ? (
                      <CheckCircle weight="fill" className="w-5 h-5 text-primary-600" />
                    ) : (
                      <WarningCircle weight="fill" className="w-5 h-5 text-rose-600" />
                    )}
                    <span>
                      {locationValidation.withinRadius
                        ? 'Lokasi Tersedia untuk Pickup'
                        : 'Lokasi di Luar Jangkauan Antar-Jemput'}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-base">
                    {locationValidation.distanceKm} km
                  </span>
                </div>

                <div className="text-xs text-slate-600 pt-1 border-t border-slate-200/50 flex flex-wrap items-center justify-between gap-1">
                  <span>
                    {locationValidation.withinRadius
                      ? `Tarif Pickup: ${formatRupiah(locationValidation.pickupFee)} (Maks 5 km)`
                      : 'Maksimal jangkauan pickup adalah 5.0 km dari outlet.'}
                  </span>
                  {!locationValidation.withinRadius && (
                    <button
                      type="button"
                      onClick={() => setServiceMode('SELF_DROP_OFF')}
                      className="font-bold underline text-rose-700 hover:text-rose-900"
                    >
                      Beralih ke Antar Mandiri
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Input Alamat */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Alamat Lengkap Penjemputan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Patokan Rumah (Landmark)
                </label>
                <input
                  type="text"
                  value={pickupLandmark}
                  onChange={(e) => setPickupLandmark(e.target.value)}
                  placeholder="Contoh: Pagar abu-abu, seberang taman"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
            </div>

            {/* In-Card Next Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handlePrevStep}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ArrowLeft weight="bold" className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-600/30 transition-colors"
              >
                <span>Lanjut ke Jadwal & Slot</span>
                <ArrowRight weight="bold" className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: JADWAL & SLOT PICKUP (PICKUP ONLY) */}
        {currentStep === 4 && serviceMode === 'PICKUP' && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="diffusion-card bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6 shadow-sm"
          >
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-primary-700 uppercase tracking-wider">
                Langkah 4
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Jadwal & Slot Waktu Pickup
              </h2>
              <p className="text-xs text-slate-500">
                Pilih tanggal dan slot waktu kedatangan kurir ke alamat Anda.
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Tanggal Penjemputan <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={scheduledDate}
                min={todayStr}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>

            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-slate-700">
                Pilih Slot Waktu yang Tersedia:
              </label>

              {loadingSlots ? (
                <div className="p-6 text-center text-xs text-slate-400">Memeriksa kuota slot...</div>
              ) : (
                <div className="space-y-2.5">
                  {availableSlots.map(({ slot, availableCount, isAvailable, isCutoff }) => {
                    const isSelected = selectedSlotId === slot.id;
                    return (
                      <motion.div
                        key={slot.id}
                        whileHover={isAvailable ? { scale: 1.01 } : {}}
                        whileTap={isAvailable ? { scale: 0.99 } : {}}
                        onClick={() => {
                          if (isAvailable) setSelectedSlotId(slot.id);
                        }}
                        className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                          !isAvailable
                            ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'border-primary-600 bg-primary-50/50 shadow-md ring-2 ring-primary-500/20 cursor-pointer'
                            : 'border-slate-200 hover:border-slate-300 cursor-pointer bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Clock
                            weight="bold"
                            className={`w-5 h-5 ${isSelected ? 'text-primary-700' : 'text-slate-400'}`}
                          />
                          <div>
                            <div className="font-bold text-xs sm:text-sm text-slate-900">
                              {slot.name} ({slot.startTime}–{slot.endTime} WIB)
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {isCutoff
                                ? 'Slot telah melewati batas waktu (cutoff)'
                                : availableCount > 0
                                ? `Tersisa ${availableCount} antrean hari ini`
                                : 'Kapasitas slot penuh'}
                            </div>
                          </div>
                        </div>

                        <div>
                          {isAvailable ? (
                            <span className="text-[11px] font-semibold text-primary-700 px-3 py-1 rounded-full bg-primary-100">
                              Tersedia
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-rose-700 px-3 py-1 rounded-full bg-rose-100">
                              Penuh
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* In-Card Next Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handlePrevStep}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ArrowLeft weight="bold" className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-600/30 transition-colors"
              >
                <span>Lanjut ke Data Diri</span>
                <ArrowRight weight="bold" className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* STEP 5: DATA PELANGGAN */}
        {currentStep === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="diffusion-card bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6 shadow-sm"
          >
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-primary-700 uppercase tracking-wider">
                Langkah {serviceMode === 'SELF_DROP_OFF' ? '3' : '5'}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Informasi Pelanggan
              </h2>
              <p className="text-xs text-slate-500">
                Tanpa perlu password atau registrasi akun. Foto timbangan dan notifikasi status akan kami kirimkan via WhatsApp.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Bagas Pratama"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Nomor WhatsApp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Contoh: 081298421823"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
                <p className="text-[11px] text-slate-400">
                  Otomatis terhubung ke format WhatsApp Indonesia (+62)
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Estimasi Jumlah Cucian
                </label>
                <select
                  value={estimatedQuantity}
                  onChange={(e) => setEstimatedQuantity(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-primary-500"
                >
                  <option value="1 kantong kecil (sekitar 2-3 kg)">1 kantong kecil (sekitar 2-3 kg)</option>
                  <option value="1 kantong sedang (sekitar 4-5 kg)">1 kantong sedang (sekitar 4-5 kg)</option>
                  <option value="1 kantong besar (sekitar 6-8 kg)">1 kantong besar (sekitar 6-8 kg)</option>
                  <option value="Lebih dari 2 kantong (> 8 kg)">Lebih dari 2 kantong ({'>'} 8 kg)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Catatan Khusus Cucian (Opsional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Pisahkan kemeja putih, jangan terlalu wangi"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            {/* In-Card Next Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handlePrevStep}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ArrowLeft weight="bold" className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-600/30 transition-colors"
              >
                <span>Lanjut ke Review & Konfirmasi</span>
                <ArrowRight weight="bold" className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* STEP 6: REVIEW & KONFIRMASI (THIS IS THE CONFIRMATION STEP!) */}
        {currentStep === 6 && (
          <motion.div
            key="step6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="diffusion-card bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6 shadow-sm"
          >
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-primary-700 uppercase tracking-wider">
                Langkah Terakhir
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Review & Konfirmasi Booking Anda
              </h2>
              <p className="text-xs text-slate-500">
                Silakan cek kembali seluruh data sebelum menekan tombol konfirmasi di bawah.
              </p>
            </div>

            {/* Detailed summary */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Layanan Dipilih:</span>
                <span className="font-bold text-slate-900 text-sm">{selectedService?.name}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Tarif Layanan:</span>
                <span className="font-mono font-bold text-primary-700 text-sm">
                  {formatRupiah(selectedService?.pricePerKg || 0)} / kg
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Metode Layanan:</span>
                <span className="font-semibold text-slate-800">
                  {serviceMode === 'PICKUP' ? 'Kurir Pickup ke Alamat' : 'Antar Mandiri ke Outlet'}
                </span>
              </div>

              {serviceMode === 'PICKUP' && (
                <>
                  <div className="flex items-start justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Alamat Penjemputan:</span>
                    <span className="font-medium text-slate-800 text-right max-w-xs leading-relaxed">
                      {pickupAddress}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Jarak & Ongkir Pickup:</span>
                    <span className="font-mono text-slate-800">
                      {locationValidation?.distanceKm} km •{' '}
                      <strong className="text-primary-700 font-bold">
                        {formatRupiah(locationValidation?.pickupFee || 0)}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Jadwal Penjemputan:</span>
                    <span className="font-medium text-slate-800">
                      {scheduledDate} • {selectedSlot?.slot.name} ({selectedSlot?.slot.startTime}–{selectedSlot?.slot.endTime} WIB)
                    </span>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Nama & Nomor WhatsApp:</span>
                <span className="font-semibold text-slate-900">
                  {customerName} ({formatDisplayPhone(customerPhone)})
                </span>
              </div>

              {notes && (
                <div className="flex items-start justify-between">
                  <span className="text-slate-500 font-medium">Catatan Khusus:</span>
                  <span className="text-slate-700 italic text-right">"{notes}"</span>
                </div>
              )}
            </div>

            {/* PRD Transparency Banner */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck weight="bold" className="w-4 h-4 text-amber-700" />
                <span>Transparansi Penimbangan Cucian</span>
              </div>
              <p className="leading-relaxed text-amber-800">
                Tagihan final dihitung berdasarkan berat aktual setelah cucian ditimbang di outlet CleanCraft. Foto angka timbangan digital akan dikirimkan langsung ke WhatsApp Anda sebelum proses cuci dimulai.
              </p>
            </div>

            {/* BIG CONFIRMATION BUTTON DIRECTLY INSIDE CARD */}
            <div className="pt-2 space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleSubmitBooking}
                disabled={isSubmitting}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-primary-600/30 transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 cursor-pointer"
              >
                <Sparkle weight="bold" className={`w-5 h-5 ${isSubmitting ? 'animate-spin' : ''}`} />
                <span>{isSubmitting ? 'Memproses Booking...' : 'Konfirmasi & Buat Booking Sekarang'}</span>
              </motion.button>

              <button
                type="button"
                onClick={handlePrevStep}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                ← Ubah Data Pemesanan
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PERMANENT STICKY BOTTOM ACTION BAR (Never obscured by bottom nav) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3 sm:p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={handlePrevStep}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 bg-white transition-colors"
            >
              <ArrowLeft weight="bold" className="w-4 h-4" />
              <span className="hidden sm:inline">Kembali</span>
            </motion.button>
          ) : (
            <div className="text-[11px] text-slate-500 hidden sm:block">
              Pilih layanan untuk melanjutkan
            </div>
          )}

          {currentStep < 6 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-primary-600/30 transition-colors flex-1 sm:flex-initial"
            >
              <span>Lanjut Langkah Berikutnya</span>
              <ArrowRight weight="bold" className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleSubmitBooking}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-primary-600/30 transition-colors flex-1 sm:flex-initial disabled:opacity-60"
            >
              <Sparkle weight="bold" className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>{isSubmitting ? 'Memproses...' : 'Konfirmasi & Buat Booking'}</span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};
