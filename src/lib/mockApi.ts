import type {
  Booking,
  Customer,
  DashboardMetrics,
  OrderStatus,
  PaymentStatus,
  PickupSlot,
  PickupZone,
  Service,
  ServiceMode,
  Settings,
  SlotAvailability,
} from '../types';
import {
  calculateHaversineDistance,
  generateBookingCode,
  normalizePhone,
} from './utils';
import {
  INITIAL_BOOKINGS,
  INITIAL_CUSTOMERS,
  INITIAL_PICKUP_SLOTS,
  INITIAL_PICKUP_ZONES,
  INITIAL_SERVICES,
  INITIAL_SETTINGS,
} from './mockData';

// Storage keys
const STORAGE_KEYS = {
  BOOKINGS: 'cleancraft_bookings_v2',
  SERVICES: 'cleancraft_services_v2',
  CUSTOMERS: 'cleancraft_customers_v2',
  SLOTS: 'cleancraft_slots_v2',
  ZONES: 'cleancraft_zones_v2',
  SETTINGS: 'cleancraft_settings_v2',
  AUTH: 'cleancraft_auth_admin_v2',
};

// Helper: simulated delay for realistic feel
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

function getStorage<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    if (!val) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export const mockApi = {
  // Reset all to initial demo state
  resetAllData: async () => {
    await delay(150);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(INITIAL_PICKUP_SLOTS));
    localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(INITIAL_PICKUP_ZONES));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  },

  // ----------------------------------------------------
  // PUBLIC ENDPOINTS
  // ----------------------------------------------------

  getSettings: async (): Promise<Settings> => {
    await delay(100);
    return getStorage<Settings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  getServices: async (): Promise<Service[]> => {
    await delay(150);
    const services = getStorage<Service[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    return services.filter((s) => s.isActive);
  },

  /**
   * PRD Section 15-19: Location & Distance Validation
   */
  validateLocation: async (customerLat: number, customerLon: number) => {
    await delay(180);
    const settings = getStorage<Settings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    const zones = getStorage<PickupZone[]>(STORAGE_KEYS.ZONES, INITIAL_PICKUP_ZONES);

    const distanceKm = calculateHaversineDistance(
      settings.latitude,
      settings.longitude,
      customerLat,
      customerLon
    );

    const withinRadius = distanceKm <= settings.maximumPickupRadiusKm;

    // Find matched zone
    let matchedZone: PickupZone | null = null;
    let pickupFee = 0;

    if (withinRadius) {
      const activeZones = zones.filter((z) => z.isActive);
      matchedZone =
        activeZones.find(
          (z) => distanceKm >= z.minDistanceKm && distanceKm <= z.maxDistanceKm
        ) || null;

      if (matchedZone) {
        pickupFee = matchedZone.fee;
      } else {
        // Fallback default fee if slightly outside configured bracket but within max radius
        pickupFee = 5000;
      }
    }

    return {
      success: true,
      data: {
        outletCoordinates: { lat: settings.latitude, lon: settings.longitude },
        customerCoordinates: { lat: customerLat, lon: customerLon },
        distanceKm,
        maximumRadiusKm: settings.maximumPickupRadiusKm,
        withinRadius,
        zone: matchedZone,
        pickupFee: withinRadius ? pickupFee : 0,
      },
    };
  },

  /**
   * PRD Section 20-24: Slot Availability on specific date
   */
  getPickupSlots: async (scheduledDate: string): Promise<SlotAvailability[]> => {
    await delay(180);
    const slots = getStorage<PickupSlot[]>(STORAGE_KEYS.SLOTS, INITIAL_PICKUP_SLOTS);
    const bookings = getStorage<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const settings = getStorage<Settings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);

    const todayStr = new Date().toISOString().split('T')[0];
    const isToday = scheduledDate === todayStr;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return slots
      .filter((s) => s.isActive)
      .map((slot) => {
        // Count reservations on this date for this slot (PENDING or CONFIRMED)
        const bookedCount = bookings.filter(
          (b) =>
            b.scheduledDate === scheduledDate &&
            b.pickupSlotId === slot.id &&
            (b.status === 'PENDING' || b.status === 'CONFIRMED')
        ).length;

        const availableCount = Math.max(0, slot.capacity - bookedCount);

        // Cutoff check for same-day bookings
        let isCutoff = false;
        if (isToday) {
          const [startHour, startMin] = slot.startTime.split(':').map(Number);
          const slotStartMinutes = startHour * 60 + startMin;
          if (currentMinutes >= slotStartMinutes - settings.pickupCutoffMinutes) {
            isCutoff = true;
          }
        }

        return {
          slot,
          scheduledDate,
          bookedCount,
          availableCount,
          isAvailable: availableCount > 0 && !isCutoff,
          isCutoff,
        };
      });
  },

  /**
   * PRD Section 26-30: Create Booking
   */
  createBooking: async (payload: {
    serviceId: string;
    serviceMode: ServiceMode;
    customerName: string;
    customerPhone: string;
    estimatedQuantity?: string;
    notes?: string;
    // Pickup specifics
    scheduledDate?: string;
    pickupSlotId?: string;
    pickupAddress?: string;
    pickupLandmark?: string;
    pickupLatitude?: number;
    pickupLongitude?: number;
    idempotencyKey?: string;
  }): Promise<{ success: boolean; data: Booking; message?: string }> => {
    await delay(350);

    const services = getStorage<Service[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    const service = services.find((s) => s.id === payload.serviceId);
    if (!service) {
      throw new Error('Layanan tidak ditemukan atau tidak aktif');
    }

    const settings = getStorage<Settings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    const normPhone = normalizePhone(payload.customerPhone);
    const bookings = getStorage<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const customers = getStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const slots = getStorage<PickupSlot[]>(STORAGE_KEYS.SLOTS, INITIAL_PICKUP_SLOTS);
    const zones = getStorage<PickupZone[]>(STORAGE_KEYS.ZONES, INITIAL_PICKUP_ZONES);

    let distanceKm: number | undefined;
    let pickupFee = 0;
    let pickupZoneId: string | undefined;
    let pickupSlotName: string | undefined;
    let pickupSlotTime: string | undefined;

    if (payload.serviceMode === 'PICKUP') {
      if (!payload.pickupLatitude || !payload.pickupLongitude) {
        throw new Error('Titik koordinat pickup wajib dipilih');
      }

      // Backend calculated distance
      distanceKm = calculateHaversineDistance(
        settings.latitude,
        settings.longitude,
        payload.pickupLatitude,
        payload.pickupLongitude
      );

      if (distanceKm > settings.maximumPickupRadiusKm) {
        throw new Error(`Lokasi Anda (${distanceKm} km) melebihi batas radius maksimal ${settings.maximumPickupRadiusKm} km`);
      }

      // Pickup Zone
      const matchedZone = zones
        .filter((z) => z.isActive)
        .find((z) => distanceKm! >= z.minDistanceKm && distanceKm! <= z.maxDistanceKm);
      if (matchedZone) {
        pickupZoneId = matchedZone.id;
        pickupFee = matchedZone.fee;
      } else {
        pickupFee = 5000;
      }

      // Slot check
      if (!payload.pickupSlotId || !payload.scheduledDate) {
        throw new Error('Jadwal dan slot pickup wajib dipilih');
      }

      const slot = slots.find((s) => s.id === payload.pickupSlotId && s.isActive);
      if (!slot) {
        throw new Error('Slot pickup tidak valid');
      }

      pickupSlotName = slot.name;
      pickupSlotTime = `${slot.startTime}–${slot.endTime}`;

      // Capacity verification
      const currentReserved = bookings.filter(
        (b) =>
          b.scheduledDate === payload.scheduledDate &&
          b.pickupSlotId === slot.id &&
          (b.status === 'PENDING' || b.status === 'CONFIRMED')
      ).length;

      if (currentReserved >= slot.capacity) {
        throw new Error(`Slot ${slot.name} pada tanggal ${payload.scheduledDate} sudah penuh`);
      }
    }

    // Upsert customer
    let customer = customers.find((c) => c.phone === normPhone);
    const nowIso = new Date().toISOString();

    if (customer) {
      customer.name = payload.customerName;
      customer.totalBookings += 1;
      customer.lastBookingDate = payload.scheduledDate || nowIso.split('T')[0];
      if (payload.pickupAddress) customer.latestAddress = payload.pickupAddress;
      if (payload.pickupLatitude) customer.latestLatitude = payload.pickupLatitude;
      if (payload.pickupLongitude) customer.latestLongitude = payload.pickupLongitude;
      customer.updatedAt = nowIso;
    } else {
      customer = {
        id: `cust-${Date.now()}`,
        name: payload.customerName,
        phone: normPhone,
        latestAddress: payload.pickupAddress,
        latestLatitude: payload.pickupLatitude,
        latestLongitude: payload.pickupLongitude,
        totalBookings: 1,
        completedOrders: 0,
        lastBookingDate: payload.scheduledDate || nowIso.split('T')[0],
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      customers.push(customer);
    }
    setStorage(STORAGE_KEYS.CUSTOMERS, customers);

    // Initial subtotal before weighing is 0 (PRD: actual billing determined after outlet weighs)
    const subtotal = 0;
    const total = subtotal + pickupFee;

    const newBooking: Booking = {
      id: `book-${Date.now()}`,
      bookingCode: generateBookingCode(),
      customerId: customer.id,
      customerName: payload.customerName,
      customerPhone: normPhone,
      serviceMode: payload.serviceMode,
      serviceId: service.id,
      serviceName: service.name,
      unitPrice: service.pricePerKg,
      pickupZoneId,
      pickupSlotId: payload.pickupSlotId,
      pickupSlotName,
      pickupSlotTime,
      pickupAddress: payload.pickupAddress,
      pickupLandmark: payload.pickupLandmark,
      pickupLatitude: payload.pickupLatitude,
      pickupLongitude: payload.pickupLongitude,
      distanceKm,
      estimatedQuantity: payload.estimatedQuantity,
      scheduledDate: payload.scheduledDate,
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      notes: payload.notes,
      subtotal,
      pickupFee,
      discount: 0,
      total,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    bookings.unshift(newBooking);
    setStorage(STORAGE_KEYS.BOOKINGS, bookings);

    return {
      success: true,
      data: newBooking,
      message: 'Booking berhasil dibuat',
    };
  },

  /**
   * PRD Section 51-52: Private Tracking
   */
  trackBooking: async (bookingCode: string, phone: string): Promise<Booking | null> => {
    await delay(300);
    const bookings = getStorage<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const normPhone = normalizePhone(phone);
    const codeClean = bookingCode.trim().toUpperCase();

    const found = bookings.find(
      (b) =>
        b.bookingCode.toUpperCase() === codeClean &&
        normalizePhone(b.customerPhone) === normPhone
    );

    return found || null;
  },

  // ----------------------------------------------------
  // ADMIN ENDPOINTS
  // ----------------------------------------------------

  adminLogin: async (email: string, pass: string): Promise<{ token: string; name: string }> => {
    await delay(250);
    if (email === 'admin@cleancraft.id' && pass === 'admin123') {
      const auth = { token: 'mock-jwt-token-12345', name: 'Outlet Admin' };
      setStorage(STORAGE_KEYS.AUTH, auth);
      return auth;
    }
    // Allow any demo admin credentials for ease of testing
    if (pass.length >= 4) {
      const auth = { token: 'mock-jwt-token-' + Date.now(), name: 'Admin Outlet' };
      setStorage(STORAGE_KEYS.AUTH, auth);
      return auth;
    }
    throw new Error('Email atau password tidak sesuai (Gunakan admin@cleancraft.id / admin123)');
  },

  adminGetAuth: (): { token: string; name: string } | null => {
    return getStorage(STORAGE_KEYS.AUTH, null);
  },

  adminLogout: async () => {
    await delay(100);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  },

  adminGetDashboard: async (): Promise<DashboardMetrics> => {
    await delay(200);
    const bookings = getStorage<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const todayStr = new Date().toISOString().split('T')[0];

    const todayBookings = bookings.filter((b) => b.createdAt.startsWith(todayStr));

    const todayPaidRevenue = bookings
      .filter((b) => b.paymentStatus === 'PAID' && (b.paidAt?.startsWith(todayStr) || b.createdAt.startsWith(todayStr)))
      .reduce((sum, b) => sum + b.total, 0);

    const monthlyPaidRevenue = bookings
      .filter((b) => b.paymentStatus === 'PAID')
      .reduce((sum, b) => sum + b.total, 0);

    return {
      todayTotal: todayBookings.length,
      // Status metrics below count ALL active (non-cancelled) bookings across dates
      // because admin needs to see the operational backlog, not just today
      todayPending: bookings.filter((b) => b.status === 'PENDING').length,
      todayConfirmed: bookings.filter((b) => b.status === 'CONFIRMED').length,
      todayReceived: bookings.filter((b) => b.status === 'RECEIVED').length,
      todayProcessing: bookings.filter((b) => b.status === 'PROCESSING').length,
      todayReady: bookings.filter((b) => b.status === 'READY').length,
      todayCompleted: todayBookings.filter((b) => b.status === 'COMPLETED').length,
      todayCancelled: todayBookings.filter((b) => b.status === 'CANCELLED').length,
      todayUnpaid: bookings.filter((b) => b.paymentStatus === 'UNPAID' && b.status !== 'CANCELLED').length,
      todayPaidRevenue,
      monthlyPaidRevenue,
    };
  },

  adminGetBookings: async (filters?: {
    status?: OrderStatus | 'ALL';
    paymentStatus?: PaymentStatus | 'ALL';
    search?: string;
    mode?: ServiceMode | 'ALL';
  }): Promise<Booking[]> => {
    await delay(150);
    let bookings = getStorage<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);

    if (filters) {
      if (filters.status && filters.status !== 'ALL') {
        bookings = bookings.filter((b) => b.status === filters.status);
      }
      if (filters.paymentStatus && filters.paymentStatus !== 'ALL') {
        bookings = bookings.filter((b) => b.paymentStatus === filters.paymentStatus);
      }
      if (filters.mode && filters.mode !== 'ALL') {
        bookings = bookings.filter((b) => b.serviceMode === filters.mode);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        bookings = bookings.filter(
          (b) =>
            b.bookingCode.toLowerCase().includes(q) ||
            b.customerName.toLowerCase().includes(q) ||
            b.customerPhone.includes(q)
        );
      }
    }

    return bookings;
  },

  adminGetBookingById: async (id: string): Promise<Booking | null> => {
    await delay(100);
    const bookings = getStorage<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    return bookings.find((b) => b.id === id) || null;
  },

  /**
   * PRD Section 9: State Transition with validation
   */
  adminUpdateStatus: async (id: string, newStatus: OrderStatus): Promise<Booking> => {
    await delay(200);
    const bookings = getStorage<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const idx = bookings.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Booking tidak ditemukan');

    const booking = bookings[idx];
    const nowIso = new Date().toISOString();

    // PRD Section 9: Validate state machine transitions
    const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
      PENDING:    ['CONFIRMED', 'CANCELLED'],
      CONFIRMED:  ['RECEIVED', 'CANCELLED'],
      RECEIVED:   ['PROCESSING'],
      PROCESSING: ['READY'],
      READY:      ['COMPLETED'],
      COMPLETED:  [],
      CANCELLED:  [],
    };

    const allowed = VALID_TRANSITIONS[booking.status];
    if (!allowed.includes(newStatus)) {
      throw new Error(
        `Transisi status tidak valid: ${booking.status} → ${newStatus}. Transisi yang diizinkan: ${allowed.length > 0 ? allowed.join(', ') : 'tidak ada (status final).'}`
      );
    }

    booking.status = newStatus;
    booking.updatedAt = nowIso;

    if (newStatus === 'RECEIVED' && !booking.receivedAt) {
      booking.receivedAt = nowIso;
    }
    if (newStatus === 'COMPLETED' && !booking.completedAt) {
      booking.completedAt = nowIso;
    }

    bookings[idx] = booking;
    setStorage(STORAGE_KEYS.BOOKINGS, bookings);

    // If completed, update customer stats
    if (newStatus === 'COMPLETED') {
      const customers = getStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
      const cIdx = customers.findIndex((c) => c.id === booking.customerId);
      if (cIdx !== -1) {
        customers[cIdx].completedOrders += 1;
        setStorage(STORAGE_KEYS.CUSTOMERS, customers);
      }
    }

    return booking;
  },

  /**
   * PRD Section 39: Actual Weight & Final Billing Calculation
   */
  adminUpdateWeight: async (
    id: string,
    actualWeight: number,
    scalePhotoUrl?: string
  ): Promise<Booking> => {
    await delay(200);
    if (actualWeight <= 0) throw new Error('Berat aktual harus lebih dari 0 kg');

    const bookings = getStorage<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const idx = bookings.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Booking tidak ditemukan');

    const booking = bookings[idx];
    const subtotal = Math.round(actualWeight * booking.unitPrice);
    const total = subtotal + booking.pickupFee - booking.discount;

    booking.actualWeight = Math.round(actualWeight * 100) / 100;
    booking.subtotal = subtotal;
    booking.total = total;
    if (scalePhotoUrl) {
      booking.scalePhotoUrl = scalePhotoUrl;
    }
    booking.updatedAt = new Date().toISOString();

    bookings[idx] = booking;
    setStorage(STORAGE_KEYS.BOOKINGS, bookings);
    return booking;
  },

  /**
   * PRD Section 10: Manual Payment Status Toggle
   */
  adminUpdatePaymentStatus: async (
    id: string,
    paymentStatus: PaymentStatus
  ): Promise<Booking> => {
    await delay(180);
    const bookings = getStorage<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const idx = bookings.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Booking tidak ditemukan');

    const booking = bookings[idx];
    booking.paymentStatus = paymentStatus;
    if (paymentStatus === 'PAID') {
      booking.paidAt = new Date().toISOString();
    } else {
      booking.paidAt = undefined;
    }
    booking.updatedAt = new Date().toISOString();

    bookings[idx] = booking;
    setStorage(STORAGE_KEYS.BOOKINGS, bookings);
    return booking;
  },

  adminGetCustomers: async (): Promise<Customer[]> => {
    await delay(150);
    return getStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  },

  adminGetSlots: async (): Promise<PickupSlot[]> => {
    await delay(100);
    return getStorage<PickupSlot[]>(STORAGE_KEYS.SLOTS, INITIAL_PICKUP_SLOTS);
  },

  adminSaveSlot: async (slot: PickupSlot): Promise<PickupSlot[]> => {
    await delay(150);
    let slots = getStorage<PickupSlot[]>(STORAGE_KEYS.SLOTS, INITIAL_PICKUP_SLOTS);
    const idx = slots.findIndex((s) => s.id === slot.id);
    if (idx >= 0) {
      slots[idx] = { ...slot, updatedAt: new Date().toISOString() };
    } else {
      slots.push({ ...slot, id: `slot-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setStorage(STORAGE_KEYS.SLOTS, slots);
    return slots;
  },

  adminGetZones: async (): Promise<PickupZone[]> => {
    await delay(100);
    return getStorage<PickupZone[]>(STORAGE_KEYS.ZONES, INITIAL_PICKUP_ZONES);
  },

  adminSaveZone: async (zone: PickupZone): Promise<PickupZone[]> => {
    await delay(150);
    let zones = getStorage<PickupZone[]>(STORAGE_KEYS.ZONES, INITIAL_PICKUP_ZONES);
    const idx = zones.findIndex((z) => z.id === zone.id);
    if (idx >= 0) {
      zones[idx] = { ...zone, updatedAt: new Date().toISOString() };
    } else {
      zones.push({ ...zone, id: `zone-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setStorage(STORAGE_KEYS.ZONES, zones);
    return zones;
  },

  /**
   * Admin: Get ALL services including inactive ones
   * (Public getServices() only returns active)
   */
  adminGetAllServices: async (): Promise<Service[]> => {
    await delay(150);
    return getStorage<Service[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
  },

  adminSaveService: async (service: Service): Promise<Service[]> => {
    await delay(150);
    let services = getStorage<Service[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    const idx = services.findIndex((s) => s.id === service.id);
    if (idx >= 0) {
      services[idx] = { ...service, updatedAt: new Date().toISOString() };
    } else {
      services.push({ ...service, id: `srv-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setStorage(STORAGE_KEYS.SERVICES, services);
    return services;
  },

  adminSaveSettings: async (settings: Settings): Promise<Settings> => {
    await delay(150);
    const updated = { ...settings, updatedAt: new Date().toISOString() };
    setStorage(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },
};
