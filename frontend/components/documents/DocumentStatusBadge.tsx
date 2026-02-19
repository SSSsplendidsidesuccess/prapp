"use client";

import React from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { DocumentStatus } from '@/types/documents';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function DocumentStatusBadge({ status, size = 'md' }: DocumentStatusBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const getStatusConfig = () => {
    switch (status) {
      case DocumentStatus.PROCESSING:
        return {
          label: 'Processing',
          icon: Loader2,
          className: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          iconClassName: 'animate-spin',
        };
      case DocumentStatus.INDEXED:
        return {
          label: 'Indexed',
          icon: CheckCircle2,
          className: 'bg-green-500/10 text-green-400 border-green-500/30',
          iconClassName: '',
        };
      case DocumentStatus.FAILED:
        return {
          label: 'Failed',
          icon: XCircle,
          className: 'bg-red-500/10 text-red-400 border-red-500/30',
          iconClassName: '',
        };
      default:
        return {
          label: 'Unknown',
          icon: XCircle,
          className: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
          iconClassName: '',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        'flex items-center gap-1.5 font-medium',
        sizeClasses[size],
        config.className
      )}
    >
      <Icon className={cn(iconSizes[size], config.iconClassName)} />
      <span>{config.label}</span>
    </Badge>
  );
}
