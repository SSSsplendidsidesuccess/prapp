"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, User, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { SalesSessionSetup, CompanyProfileForm } from '@/components/sales';
import { DealStage, CompanyProfile } from '@/types/sales';
import { sessionApi, userApi, authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';

function SalesSetupPageContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Company Profile State
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    name: '',
    description: '',
    value_proposition: '',
    industry: '',
  });

  // Sales Session State
  const [customerName, setCustomerName] = useState('');
  const [customerPersona, setCustomerPersona] = useState('');
  const [dealStage, setDealStage] = useState<DealStage>(DealStage.DISCOVERY);
  const [agenda, setAgenda] = useState('');
  const [tone, setTone] = useState('professional');
  const [backgroundContext, setBackgroundContext] = useState('');

  // Load user profile on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const user = await authApi.getCurrentUser();
        if (user.company_profile) {
          setCompanyProfile(user.company_profile);
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
      }
    };

    loadUserProfile();
  }, []);

  const handleSalesFieldChange = (field: string, value: string) => {
    switch (field) {
      case 'customerName':
        setCustomerName(value);
        break;
      case 'customerPersona':
        setCustomerPersona(value);
        break;
      case 'dealStage':
        setDealStage(value as DealStage);
        break;
    }
  };

  const handleSaveCompanyProfile = async () => {
    try {
      await userApi.updateProfileWithCompany({ company_profile: companyProfile });
    } catch (err) {
      throw new Error('Failed to save company profile');
    }
  };

  const handleStartSession = async () => {
    // Validation
    if (!customerName.trim()) {
      setError('Customer name is required');
      return;
    }
    if (!customerPersona.trim()) {
      setError('Customer persona is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const sessionData = {
        preparation_type: 'Sales' as const,
        setup: {
          customer_name: customerName,
          customer_persona: customerPersona,
          deal_stage: dealStage,
          agenda: agenda || undefined,
          tone: tone || undefined,
          background_context: backgroundContext || undefined,
        },
      };

      const session = await sessionApi.createSession(sessionData);
      router.push(`/session/${session.session_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
      setIsLoading(false);
    }
  };

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
          <span className="text-sm font-medium text-slate-400 hidden sm:block">Sales Call Setup</span>
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400">
            <User size={16} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Sales Call Preparation</h1>
          <p className="text-slate-400">
            Set up your company profile and configure your sales practice session
          </p>
        </motion.div>

        {/* Company Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-slate-900/50 border border-white/5 rounded-xl p-6"
        >
          <CompanyProfileForm
            profile={companyProfile}
            onChange={setCompanyProfile}
            onSave={handleSaveCompanyProfile}
          />
        </motion.div>

        {/* Sales Session Setup Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-slate-900/50 border border-white/5 rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Session Configuration</h2>
          
          <SalesSessionSetup
            customerName={customerName}
            customerPersona={customerPersona}
            dealStage={dealStage}
            onChange={handleSalesFieldChange}
          />

          {/* Optional Fields */}
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Meeting Agenda (Optional)
              </label>
              <textarea
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                placeholder="What topics do you want to cover in this call?"
                rows={3}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Tone (Optional)
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
                <option value="friendly">Friendly</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Background Context (Optional)
              </label>
              <textarea
                value={backgroundContext}
                onChange={(e) => setBackgroundContext(e.target.value)}
                placeholder="Any additional context about this sales opportunity..."
                rows={3}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 resize-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
          >
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Start Session Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-end"
        >
          <Button
            onClick={handleStartSession}
            disabled={isLoading || !customerName || !customerPersona}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-8 py-6 text-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Starting Session...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Start Sales Practice
              </>
            )}
          </Button>
        </motion.div>
      </main>
    </div>
  );
}

export default function SalesSetupPage() {
  return (
    <ProtectedRoute>
      <SalesSetupPageContent />
    </ProtectedRoute>
  );
}
