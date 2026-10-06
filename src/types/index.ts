export type ServiceMode = 'SELF_DROP_OFF' | 'PICKUP';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'RECEIVED'
  | 'PROCESSING'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentStatus = 'UNPAID' | 'PAID';

export interface Service {
  id: string;
  name: string;
  description: string;
  pricePerKg: number;
  estimatedHours: number;
  badge?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PickupZone {
  id: string;
  minDistanceKm: number;
  maxDistanceKm: number;
  fee: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PickupSlot {
  id: string;
  name: string;
  startTime: string; // "10:00"
  endTime: string;   // "11:00"
  capacity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SlotAvailability {
  slot: PickupSlot;
  scheduledDate: string;
  bookedCount: number;
  availableCount: number;
  isAvailable: boolean;
  isCutoff: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string; // Normalized Indonesian phone: 628...
  email?: string;
  latestAddress?: string;
  latestLatitude?: number;
  latestLongitude?: number;
  totalBookings: number;
  completedOrders: number;
  lastBookingDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingItem {
  id: string;
  bookingId: string;
  serviceId: string;
  serviceName: string;
  unitPrice: number;
  subtotal: number;
  createdAt: string;
}

export interface Booking {
  id: string;
  bookingCode: string; // LDR-YYYYMMDD-XXXX
  customerId: string;
  customerName: string;
  customerPhone: string;
  
  serviceMode: ServiceMode;
  serviceId: string;
  serviceName: string;
  unitPrice: number;
  
  pickupZoneId?: string;
  pickupSlotId?: string;
  pickupSlotName?: string;
  pickupSlotTime?: string;
  pickupAddress?: string;
  pickupLandmark?: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  distanceKm?: number;
  
  estimatedQuantity?: string;
  scheduledDate?: string; // YYYY-MM-DD
  
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  
  subtotal: number;
  pickupFee: number;
  discount: number;
  total: number;
  
  actualWeight?: number; // DECIMAL(8,2)
  scalePhotoUrl?: string;
  
  receivedAt?: string;
  paidAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  id: string;
  laundryName: string;
  phone: string;
  whatsapp: string;
  address: string;
  latitude: number;
  longitude: number;
  openingTime: string;
  closingTime: string;
  maximumPickupRadiusKm: number;
  maximumBookingDaysAhead: number;
  pickupCutoffMinutes: number;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  qrisImageUrl?: string;
  cashEnabled: boolean;
  maximumScalePhotoMb: number;
  updatedAt: string;
}

export interface DashboardMetrics {
  todayTotal: number;
  todayPending: number;
  todayConfirmed: number;
  todayReceived: number;
  todayProcessing: number;
  todayReady: number;
  todayCompleted: number;
  todayCancelled: number;
  todayUnpaid: number;
  todayPaidRevenue: number;
  monthlyPaidRevenue: number;
}
