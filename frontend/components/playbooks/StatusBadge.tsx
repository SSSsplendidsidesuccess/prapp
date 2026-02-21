import React from 'react';
import { PlaybookStatus } from '@/types/playbooks';

interface StatusBadgeProps {
  status: PlaybookStatus;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case PlaybookStatus.DRAFT:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
      case PlaybookStatus.PUBLISHED:
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case PlaybookStatus.ARCHIVED:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case PlaybookStatus.DRAFT:
        return 'Draft';
      case PlaybookStatus.PUBLISHED:
        return 'Published';
      case PlaybookStatus.ARCHIVED:
        return 'Archived';
      default:
        return status;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles()} ${className}`}
    >
      {getStatusLabel()}
    </span>
  );
}
