"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, User, BookOpen, Plus, Search, Filter, RefreshCw, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { PlaybookCard } from '@/components/playbooks';
import { Playbook, PlaybookStatus } from '@/types/playbooks';
import { playbooksApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function PlaybooksPageContent() {
  const router = useRouter();
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showTemplates, setShowTemplates] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPlaybooks, setTotalPlaybooks] = useState(0);
  const playbooksPerPage = 12;

  useEffect(() => {
    loadPlaybooks();
  }, [currentPage, statusFilter, showTemplates]);

  const loadPlaybooks = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: any = {
        limit: playbooksPerPage,
        offset: (currentPage - 1) * playbooksPerPage,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (showTemplates) {
        params.is_template = true;
      }

      const response = await playbooksApi.list(params);
      setPlaybooks(response.playbooks);
      setTotalPlaybooks(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load playbooks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (playbook: Playbook) => {
    if (!confirm(`Are you sure you want to delete "${playbook.title}"?`)) {
      return;
    }

    try {
      await playbooksApi.delete(playbook.id);
      await loadPlaybooks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete playbook');
    }
  };

  const handleCreateNew = () => {
    router.push('/playbooks/new');
  };

  const filteredPlaybooks = playbooks.filter((playbook) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      playbook.title.toLowerCase().includes(query) ||
      playbook.description?.toLowerCase().includes(query) ||
      playbook.target_persona?.toLowerCase().includes(query) ||
      playbook.industry?.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(totalPlaybooks / playbooksPerPage);

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
            <span>Back to Dashboard</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-400 hidden sm:block">Playbooks</span>
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400">
            <User size={16} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">Sales Playbooks</h1>
            </div>
            <Button
              onClick={handleCreateNew}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Playbook
            </Button>
          </div>
          <p className="text-slate-400">
            Build and manage your sales playbooks with AI-powered content
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6"
          >
            <p className="text-sm text-red-400">{error}</p>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-slate-900/50 border border-white/5 rounded-xl p-4 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search playbooks..."
                className="pl-10 bg-slate-800/50 border-white/10 text-slate-200"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-slate-800/50 border-white/10 text-slate-200">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="all" className="text-slate-200">All Status</SelectItem>
                <SelectItem value={PlaybookStatus.DRAFT} className="text-slate-200">Draft</SelectItem>
                <SelectItem value={PlaybookStatus.PUBLISHED} className="text-slate-200">Published</SelectItem>
                <SelectItem value={PlaybookStatus.ARCHIVED} className="text-slate-200">Archived</SelectItem>
              </SelectContent>
            </Select>

            {/* Template Toggle */}
            <Button
              onClick={() => setShowTemplates(!showTemplates)}
              variant={showTemplates ? 'default' : 'outline'}
              className={showTemplates ? 'bg-purple-500 hover:bg-purple-600' : 'border-white/10 text-slate-300 hover:bg-slate-800'}
            >
              {showTemplates ? 'Show All' : 'Templates Only'}
            </Button>

            {/* Refresh */}
            <Button
              onClick={loadPlaybooks}
              variant="outline"
              size="icon"
              className="border-white/10 text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Playbooks Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-400">Loading playbooks...</p>
            </div>
          </div>
        ) : filteredPlaybooks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/50 border border-white/10 rounded-xl p-12 text-center"
          >
            <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery ? 'No playbooks found' : 'No playbooks yet'}
            </h3>
            <p className="text-slate-400 mb-6">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Create your first sales playbook to get started'}
            </p>
            {!searchQuery && (
              <Button
                onClick={handleCreateNew}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Playbook
              </Button>
            )}
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
            >
              {filteredPlaybooks.map((playbook, index) => (
                <motion.div
                  key={playbook.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <PlaybookCard playbook={playbook} onDelete={handleDelete} />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Showing {(currentPage - 1) * playbooksPerPage + 1} to{' '}
                  {Math.min(currentPage * playbooksPerPage, totalPlaybooks)} of {totalPlaybooks} playbooks
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="border-white/10 text-slate-300 hover:bg-slate-800"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          className={
                            currentPage === pageNum
                              ? 'bg-purple-500 hover:bg-purple-600'
                              : 'border-white/10 text-slate-300 hover:bg-slate-800'
                          }
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="border-white/10 text-slate-300 hover:bg-slate-800"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function PlaybooksPage() {
  return (
    <ProtectedRoute>
      <PlaybooksPageContent />
    </ProtectedRoute>
  );
}
