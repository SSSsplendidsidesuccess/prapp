"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, User, Lightbulb, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import {
  TalkPointsGenerator,
  TalkPointsDisplay,
  TalkPointsCard,
} from '@/components/talkpoints';
import { TalkPoint, TalkPointGenerateRequest } from '@/types/talkPoints';
import { talkPointsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';

function TalkPointsPageContent() {
  const router = useRouter();
  const [talkPoints, setTalkPoints] = useState<TalkPoint[]>([]);
  const [selectedTalkPoint, setSelectedTalkPoint] = useState<TalkPoint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTalkPoints, setTotalTalkPoints] = useState(0);
  const [showGenerator, setShowGenerator] = useState(true);
  const talkPointsPerPage = 10;

  useEffect(() => {
    loadTalkPoints();
  }, [currentPage]);

  const loadTalkPoints = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await talkPointsApi.list({
        limit: talkPointsPerPage,
        skip: (currentPage - 1) * talkPointsPerPage,
      });

      setTalkPoints(response.talk_points);
      setTotalTalkPoints(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load talk points');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (data: TalkPointGenerateRequest) => {
    try {
      const response = await talkPointsApi.generate(data);
      
      // Fetch the full talk point details
      const fullTalkPoint = await talkPointsApi.get(response.id);
      
      // Show the generated talk point
      setSelectedTalkPoint(fullTalkPoint);
      setShowGenerator(false);
      
      // Reload the list
      await loadTalkPoints();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to generate talk points');
    }
  };

  const handleView = (talkPoint: TalkPoint) => {
    setSelectedTalkPoint(talkPoint);
    setShowGenerator(false);
  };

  const handleDelete = async (talkPoint: TalkPoint) => {
    try {
      await talkPointsApi.delete(talkPoint.id);
      
      // If viewing the deleted talk point, clear selection
      if (selectedTalkPoint?.id === talkPoint.id) {
        setSelectedTalkPoint(null);
        setShowGenerator(true);
      }
      
      await loadTalkPoints();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete talk point');
    }
  };

  const handleNewGeneration = () => {
    setSelectedTalkPoint(null);
    setShowGenerator(true);
  };

  const totalPages = Math.ceil(totalTalkPoints / talkPointsPerPage);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/profile')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-amber-400 rounded-sm flex items-center justify-center">
              <div className="w-4 h-4 bg-slate-950 rounded-sm" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">prapp</span>
          </button>
          <button
            onClick={() => router.push('/profile')}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ChevronRight size={16} className="rotate-180" />
            <span>Back to Profile</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-400 hidden sm:block">Talk Points</span>
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400">
            <User size={16} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Generator or Display */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Lightbulb className="w-8 h-8 text-purple-400" />
                  <h1 className="text-3xl font-bold text-white">Talk Points</h1>
                </div>
                {selectedTalkPoint && (
                  <Button
                    onClick={handleNewGeneration}
                    variant="outline"
                    size="sm"
                    className="border-purple-400/30 text-purple-400 hover:bg-purple-500/10"
                  >
                    Generate New
                  </Button>
                )}
              </div>
              <p className="text-slate-400">
                AI-powered sales talk points based on your knowledge base
              </p>
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

            {/* Generator or Display */}
            <AnimatePresence mode="wait">
              {showGenerator && !selectedTalkPoint ? (
                <motion.div
                  key="generator"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-slate-900/50 border border-white/5 rounded-xl p-6"
                >
                  <TalkPointsGenerator onGenerate={handleGenerate} />
                </motion.div>
              ) : selectedTalkPoint ? (
                <motion.div
                  key="display"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-slate-900/50 border border-white/5 rounded-xl p-6"
                >
                  <TalkPointsDisplay
                    content={selectedTalkPoint.content}
                    topic={selectedTalkPoint.topic}
                    sourcesUsed={selectedTalkPoint.sources_used}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Right Column - History */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">History</h2>
                <Button
                  onClick={loadTalkPoints}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-slate-400">Loading...</p>
                  </div>
                </div>
              ) : talkPoints.length === 0 ? (
                <div className="bg-slate-900/50 border border-white/10 rounded-lg p-8 text-center">
                  <Lightbulb className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">
                    No talk points yet. Generate your first one!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {talkPoints.map((tp) => (
                    <TalkPointsCard
                      key={tp.id}
                      talkPoint={tp}
                      onView={handleView}
                      onDelete={handleDelete}
                    />
                  ))}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4">
                      <p className="text-xs text-slate-500">
                        Page {currentPage} of {totalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          variant="outline"
                          size="sm"
                          className="h-8 border-white/10 text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                          Prev
                        </Button>
                        <Button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          variant="outline"
                          size="sm"
                          className="h-8 border-white/10 text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function TalkPointsPage() {
  return (
    <ProtectedRoute>
      <TalkPointsPageContent />
    </ProtectedRoute>
  );
}
