import React from 'react';
import type { OrderStatus, PaymentStatus } from '../../types';
import { 
  Clock, 
  CheckCircle, 
  Package, 
  ArrowsClockwise, 
  Sparkle, 
  CheckFat, 
  XCircle,
  CreditCard
} from '@phosphor-icons/react';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const configs: Record<
    OrderStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    PENDING: {
      label: 'Menunggu Konfirmasi',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      icon: <Clock weight="bold" className="shrink-0" />,
    },
    CONFIRMED: {
      label: 'Dikonfirmasi',
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      icon: <CheckCircle weight="bold" className="shrink-0" />,
    },
    RECEIVED: {
      label: 'Cucian Diterima',
      bg: 'bg-primary-50',
      text: 'text-primary-800',
      border: 'border-primary-200',
      icon: <Package weight="bold" className="shrink-0" />,
    },
    PROCESSING: {
      label: 'Sedang Dicuci',
      bg: 'bg-primary-50',
      text: 'text-primary-800',
      border: 'border-primary-200',
      icon: <ArrowsClockwise weight="bold" className="shrink-0 animate-spin" />,
    },
    READY: {
      label: 'Selesai & Siap',
      bg: 'bg-primary-50',
      text: 'text-primary-800',
      border: 'border-primary-200',
      icon: <Sparkle weight="bold" className="shrink-0" />,
    },
    COMPLETED: {
      label: 'Selesai',
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
      icon: <CheckFat weight="bold" className="shrink-0" />,
    },
    CANCELLED: {
      label: 'Dibatalkan',
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
      icon: <XCircle weight="bold" className="shrink-0" />,
    },
  };

  const c = configs[status] || configs.PENDING;
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-xs md:text-sm px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${c.bg} ${c.text} ${c.border} ${sizeClasses}`}
    >
      {c.icon}
      <span>{c.label}</span>
    </span>
  );
};

export const PaymentBadge: React.FC<{ status: PaymentStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  const isPaid = status === 'PAID';
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeClasses} ${
        isPaid
          ? 'bg-primary-50 text-primary-800 border-primary-200'
          : 'bg-amber-50 text-amber-800 border-amber-200'
      }`}
    >
      <CreditCard weight="bold" className="shrink-0" />
      <span>{isPaid ? 'Lunas' : 'Belum Bayar'}</span>
    </span>
  );
};
