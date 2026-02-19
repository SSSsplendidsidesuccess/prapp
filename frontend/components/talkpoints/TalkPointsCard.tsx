"use client";

import React from 'react';
import { TalkPoint } from '@/types/talkPoints';
import { Eye, Trash2, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TalkPointsCardProps {
  talkPoint: TalkPoint;
  onView: (talkPoint: TalkPoint) => void;
  onDelete: (talkPoint: TalkPoint) => void;
}

export function TalkPointsCard({
  talkPoint,
  onView,
  onDelete,
}: TalkPointsCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPreview = () => {
    const firstSection = talkPoint.content.opening_hook;
    return firstSection.length > 150
      ? firstSection.substring(0, 150) + '...'
      : firstSection;
  };

  return (
    <div className="bg-slate-900/50 border border-white/10 rounded-lg p-5 hover:border-purple-400/30 transition-all group">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white mb-2 truncate">
            {talkPoint.topic}
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(talkPoint.created_at)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>{talkPoint.sources_used} source{talkPoint.sources_used !== 1 ? 's' : ''}</span>
            </div>
            {talkPoint.deal_stage && (
              <div className="px-2 py-0.5 bg-amber-400/10 text-amber-400 rounded text-xs font-medium">
                {talkPoint.deal_stage}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            onClick={() => onView(talkPoint)}
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Eye className="w-4 h-4 mr-1.5" />
            View
          </Button>
          <Button
            onClick={() => onDelete(talkPoint)}
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-slate-950/50 rounded-lg p-3 border border-white/5">
        <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
          {getPreview()}
        </p>
      </div>

      {/* Customer Context (if available) */}
      {talkPoint.customer_context && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <p className="text-xs text-slate-500">
            <span className="font-medium">Context:</span> {talkPoint.customer_context.substring(0, 100)}
            {talkPoint.customer_context.length > 100 && '...'}
          </p>
        </div>
      )}
    </div>
  );
}
