import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadgeStyle = (status) => {
    switch (status) {
      case 'CONFIRMED':
      case 'PAYMENT_SUCCESS':
      case 'SUCCESS':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'PAYMENT_PENDING':
      case 'CREATED':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'PAYMENT_SERVICE_UNAVAILABLE':
        return 'bg-purple-100 text-purple-800 border-purple-300 animate-pulse';
      case 'PAYMENT_FAILED':
      case 'FAILED':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle(status)}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
