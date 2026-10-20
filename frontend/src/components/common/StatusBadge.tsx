import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'severity' | 'status' | 'default';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'default' }) => {
  const s = status.toUpperCase();

  if (type === 'severity') {
    switch (s) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            🚨 CRITICAL (Priority 4)
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            ⚠️ HIGH (Priority 3)
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            ℹ️ MEDIUM (Priority 2)
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            ✅ LOW (Routine)
          </span>
        );
    }
  }

  // Generic status styling
  if (['COMPLETED', 'DISPENSED', 'AVAILABLE'].includes(s)) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
        {status}
      </span>
    );
  }

  if (['WAITING', 'REQUESTED', 'BOOKED', 'PENDING'].includes(s)) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800 border border-sky-200">
        {status}
      </span>
    );
  }

  if (['IN_PROGRESS', 'IN_CONSULTATION', 'CALLED'].includes(s)) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
        {status}
      </span>
    );
  }

  if (['CANCELLED'].includes(s)) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
        {status}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
      {status}
    </span>
  );
};
