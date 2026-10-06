import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in Indonesian Rupiah
 * PRD: All money in integer rupiah, e.g. Rp38.600
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount)) return 'Rp0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format weight in kilogram with 1-2 decimal places
 */
export function formatWeight(weight?: number | null): string {
  if (weight === undefined || weight === null) return '-';
  return `${Number(weight).toFixed(1).replace('.', ',')} kg`;
}

/**
 * PRD Section 31: Customer Phone Normalization
 * Standardizes Indonesian phone numbers into canonical format: 628...
 */
export function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('+62')) {
    cleaned = cleaned.slice(1);
  } else if (!cleaned.startsWith('62') && cleaned.length > 8) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

/**
 * Formatted phone for UI display: +62 812-3456-789
 */
export function formatDisplayPhone(phone: string): string {
  const norm = normalizePhone(phone);
  if (norm.startsWith('62') && norm.length >= 10) {
    const main = norm.slice(2);
    const p1 = main.slice(0, 3);
    const p2 = main.slice(3, 7);
    const p3 = main.slice(7);
    return `+62 ${p1}-${p2}${p3 ? '-' + p3 : ''}`;
  }
  return phone;
}

/**
 * PRD Section 15: Haversine Formula Distance Calculation
 * Returns straight-line distance in kilometers, rounded to 1 decimal place.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
}

/**
 * PRD Section 30: Booking Reference Generator
 * Format: LDR-YYYYMMDD-XXXX
 */
export function generateBookingCode(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LDR-${year}${month}${day}-${randomSuffix}`;
}

/**
 * Format date string to Indonesian locale
 */
export function formatDateIndonesian(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

/**
 * Format relative time
 */
export function formatTimeOnly(timeStr: string): string {
  return timeStr.replace(':', '.');
}
