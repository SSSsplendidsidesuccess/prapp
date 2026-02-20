"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, User, BookOpen, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import {
  DocumentUploadZone,
  DocumentTable,
  DocumentViewerModal,
} from '@/components/documents';
import { Document } from '@/types/documents';
import { documentsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';

function KnowledgeBasePageContent() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const documentsPerPage = 20;

  useEffect(() => {
    loadDocuments();
  }, [currentPage]);

  const loadDocuments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await documentsApi.list({
        limit: documentsPerPage,
        skip: (currentPage - 1) * documentsPerPage,
      });

      setDocuments(response.documents);
      setTotalDocuments(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (files: File[]) => {
    setError(null);

    try {
      // Upload files sequentially
      for (const file of files) {
        await documentsApi.upload(file);
      }

      // Reload documents after upload
      await loadDocuments();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const handleView = (document: Document) => {
    setSelectedDocument(document);
  };

  const handleDelete = async (document: Document) => {
    try {
      await documentsApi.delete(document.id);
      await loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
    }
  };

  const totalPages = Math.ceil(totalDocuments / documentsPerPage);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-amber-400 rounded-sm flex items-center justify-center">
              <div className="w-4 h-4 bg-slate-950 rounded-sm" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">prapp</span>
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ChevronRight size={16} className="rotate-180" />
            <span>Back to Profile</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-400 hidden sm:block">Knowledge Base</span>
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400">
            <User size={16} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-amber-400" />
              <h1 className="text-3xl font-bold text-white">Knowledge Base</h1>
            </div>
            <Button
              onClick={loadDocuments}
              variant="outline"
              size="sm"
              className="border-white/10 text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
          <p className="text-slate-400">
            Upload and manage documents for AI-powered sales simulations
          </p>
          {totalDocuments > 0 && (
            <p className="text-sm text-slate-500 mt-2">
              {totalDocuments} document{totalDocuments !== 1 ? 's' : ''} total
            </p>
          )}
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
          >
            <p className="text-sm text-red-400">{error}</p>
          </motion.div>
        )}

        {/* Upload Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-slate-900/50 border border-white/5 rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Upload Documents</h2>
          <DocumentUploadZone onUpload={handleUpload} />
        </motion.div>

        {/* Documents Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-slate-900/50 border border-white/5 rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Your Documents</h2>
          <DocumentTable
            documents={documents}
            onView={handleView}
            onDelete={handleDelete}
            isLoading={isLoading}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-slate-400">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="border-white/10 text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="border-white/10 text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
        >
          <h3 className="text-sm font-semibold text-blue-400 mb-2">How it works</h3>
          <ul className="text-sm text-blue-300 space-y-1">
            <li>• Upload product docs, case studies, and sales materials</li>
            <li>• Documents are automatically processed and indexed</li>
            <li>• AI uses this knowledge during sales simulations</li>
            <li>• Generate talk points based on your documents</li>
          </ul>
        </motion.div>
      </main>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <DocumentViewerModal
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
}

export default function KnowledgeBasePage() {
  return (
    <ProtectedRoute>
      <KnowledgeBasePageContent />
    </ProtectedRoute>
  );
}
