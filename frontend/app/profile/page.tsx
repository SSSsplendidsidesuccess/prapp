"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import TopBar from '@/components/profile/TopBar';
import Card from '@/components/profile/Card';

// Sales persona options
const ROLES = [
  { value: 'ae', label: 'Account Executive (AE)' },
  { value: 'sdr', label: 'Sales Development Rep (SDR)' },
  { value: 'csm', label: 'Customer Success Manager (CSM)' },
  { value: 'sales_manager', label: 'Sales Manager' },
];

const INDUSTRIES = [
  { value: 'saas', label: 'SaaS' },
  { value: 'pharma', label: 'Pharma' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'financial_services', label: 'Financial Services' },
];

const METHODOLOGIES = [
  { value: 'meddic', label: 'MEDDIC' },
  { value: 'spin', label: 'SPIN' },
  { value: 'challenger', label: 'Challenger' },
  { value: 'sandler', label: 'Sandler' },
];

function ProfileSettingsContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState('ae');
  const [industry, setIndustry] = useState('saas');
  const [methodology, setMethodology] = useState('meddic');

  // Show loading state
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMessage(null);
    
    try {
      // TODO: Implement API call to save settings
      // For now, just simulate a save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-32">
      <TopBar userName={user.name} userEmail={user.email} />

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">Manage your account and sales persona configuration</p>
        </div>

        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-green-400 text-sm">
            {successMessage}
          </div>
        )}

        {/* Account Details Section */}
        <Card>
          <h2 className="text-xl font-bold text-white mb-4">Account Details</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                placeholder="Your name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <button
                onClick={() => router.push('/forgot-password')}
                className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
              >
                Reset password →
              </button>
            </div>
          </div>
        </Card>

        {/* Sales Persona Config Section */}
        <Card>
          <h2 className="text-xl font-bold text-white mb-4">Sales Persona Configuration</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-2">
                My Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-slate-300 mb-2">
                My Industry
              </label>
              <select
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              >
                {INDUSTRIES.map((i) => (
                  <option key={i.value} value={i.value}>
                    {i.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="methodology" className="block text-sm font-medium text-slate-300 mb-2">
                Default Methodology
              </label>
              <select
                id="methodology"
                value={methodology}
                onChange={(e) => setMethodology(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              >
                {METHODOLOGIES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}

export default function ProfileSettingsPage() {
  return (
    <ProtectedRoute>
      <ProfileSettingsContent />
    </ProtectedRoute>
  );
}
