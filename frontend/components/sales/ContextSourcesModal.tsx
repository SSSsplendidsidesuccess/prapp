"use client";

import React, { useEffect, useState } from 'react';
import { Document } from '@/types/documents';
import { documentsApi } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, ExternalLink } from 'lucide-react';

interface ContextSourcesModalProps {
  documentIds: string[];
  onClose: () => void;
}

export function ContextSourcesModal({
  documentIds,
  onClose,
}: ContextSourcesModalProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const fetchedDocs = await Promise.all(
          documentIds.map(id => documentsApi.get(id))
        );
        setDocuments(fetchedDocs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load documents');
      } finally {
        setLoading(false);
      }
    };

    if (documentIds.length > 0) {
      fetchDocuments();
    }
  }, [documentIds]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            Knowledge Base Sources
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            The AI used information from these documents to generate the response
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
              <span className="ml-2 text-slate-400">Loading documents...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && documents.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              No documents found
            </div>
          )}

          {!loading && !error && documents.length > 0 && (
            <div className="space-y-3">
              {documents.map((doc, index) => (
                <div
                  key={doc.id}
                  className="bg-slate-800/50 border border-white/10 rounded-lg p-4 hover:border-amber-400/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <h4 className="font-medium text-white truncate">
                          {doc.filename}
                        </h4>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <Badge 
                          variant="outline" 
                          className="border-amber-400/30 text-amber-400"
                        >
                          {doc.file_type.toUpperCase()}
                        </Badge>
                        <span>•</span>
                        <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                        <span>•</span>
                        <span>{doc.chunk_count} chunks</span>
                      </div>

                      {doc.metadata && Object.keys(doc.metadata).length > 0 && (
                        <div className="mt-2 text-xs text-slate-500">
                          {doc.metadata.page_count && (
                            <span>{doc.metadata.page_count} pages</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      <button
                        onClick={() => {
                          // Navigate to knowledge base with this document highlighted
                          window.location.href = `/knowledge-base?highlight=${doc.id}`;
                        }}
                        className="text-amber-400 hover:text-amber-300 transition-colors"
                        title="View in Knowledge Base"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg p-3 mt-4">
          <p className="text-xs text-amber-200">
            <strong>Note:</strong> The AI retrieved relevant sections from these documents 
            to provide context-aware responses during your sales simulation.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
