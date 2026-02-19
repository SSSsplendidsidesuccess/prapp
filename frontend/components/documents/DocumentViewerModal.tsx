"use client";

import React from 'react';
import { Document } from '@/types/documents';
import { DocumentStatusBadge } from './DocumentStatusBadge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Calendar, Database, Package } from 'lucide-react';

interface DocumentViewerModalProps {
  document: Document;
  onClose: () => void;
}

export function DocumentViewerModal({
  document,
  onClose,
}: DocumentViewerModalProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            Document Details
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            View information about this document
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[500px] pr-4">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                Basic Information
              </h3>
              <div className="bg-slate-800/50 border border-white/10 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Filename</label>
                  <p className="text-sm text-white font-medium break-all">
                    {document.filename}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">File Type</label>
                    <p className="text-sm text-white uppercase">{document.file_type}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">File Size</label>
                    <p className="text-sm text-white">{formatFileSize(document.file_size)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Status</label>
                  <DocumentStatusBadge status={document.status} size="md" />
                </div>
              </div>
            </div>

            {/* Processing Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                Processing Information
              </h3>
              <div className="bg-slate-800/50 border border-white/10 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-blue-400" />
                  <div className="flex-1">
                    <label className="text-xs text-slate-400 block">Chunks Created</label>
                    <p className="text-sm text-white font-medium">
                      {document.chunk_count} chunks
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-green-400" />
                  <div className="flex-1">
                    <label className="text-xs text-slate-400 block">Source</label>
                    <p className="text-sm text-white font-medium capitalize">
                      {document.source.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                Timestamps
              </h3>
              <div className="bg-slate-800/50 border border-white/10 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  <div className="flex-1">
                    <label className="text-xs text-slate-400 block">Uploaded At</label>
                    <p className="text-sm text-white">
                      {formatDate(document.uploaded_at)}
                    </p>
                  </div>
                </div>
                {document.indexed_at && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-green-400" />
                    <div className="flex-1">
                      <label className="text-xs text-slate-400 block">Indexed At</label>
                      <p className="text-sm text-white">
                        {formatDate(document.indexed_at)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata */}
            {document.metadata && Object.keys(document.metadata).length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  Metadata
                </h3>
                <div className="bg-slate-800/50 border border-white/10 rounded-lg p-4">
                  <div className="space-y-2">
                    {Object.entries(document.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 capitalize">
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <span className="text-sm text-white font-medium">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Status Information */}
            {document.status === 'indexed' && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <p className="text-sm text-green-400">
                  ✓ This document has been successfully indexed and is available for use in sales simulations and talk points generation.
                </p>
              </div>
            )}

            {document.status === 'processing' && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-sm text-blue-400">
                  ⏳ This document is currently being processed. It will be available shortly.
                </p>
              </div>
            )}

            {document.status === 'failed' && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-sm text-red-400">
                  ✗ This document failed to process. Please try uploading it again or contact support if the issue persists.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
