"use client";

import React, { useState } from 'react';
import { CompanyProfile } from '@/types/sales';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Building2 } from 'lucide-react';

interface CompanyProfileFormProps {
  profile: CompanyProfile;
  onChange: (profile: CompanyProfile) => void;
  onSave: () => Promise<void>;
}

export function CompanyProfileForm({
  profile,
  onChange,
  onSave,
}: CompanyProfileFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      await onSave();
      setSaveMessage({ type: 'success', text: 'Company profile saved successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save company profile' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof CompanyProfile, value: string) => {
    onChange({ ...profile, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5 text-amber-400" />
        <h3 className="text-lg font-semibold text-white">Company Profile</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company-name" className="text-slate-200">
          Company Name
        </Label>
        <Input
          id="company-name"
          type="text"
          value={profile.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="e.g., TechCorp Solutions"
          className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-400/50 focus:ring-amber-400/20"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company-industry" className="text-slate-200">
          Industry
        </Label>
        <Input
          id="company-industry"
          type="text"
          value={profile.industry}
          onChange={(e) => updateField('industry', e.target.value)}
          placeholder="e.g., SaaS, Healthcare, Finance"
          className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-400/50 focus:ring-amber-400/20"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company-description" className="text-slate-200">
          Company Description
        </Label>
        <Textarea
          id="company-description"
          value={profile.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Brief description of your company and what you do..."
          rows={3}
          className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-400/50 focus:ring-amber-400/20 resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="value-proposition" className="text-slate-200">
          Value Proposition
        </Label>
        <Textarea
          id="value-proposition"
          value={profile.value_proposition}
          onChange={(e) => updateField('value_proposition', e.target.value)}
          placeholder="What unique value does your company provide to customers?"
          rows={3}
          className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-400/50 focus:ring-amber-400/20 resize-none"
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex-1">
          {saveMessage && (
            <p className={`text-sm ${
              saveMessage.type === 'success' ? 'text-green-400' : 'text-red-400'
            }`}>
              {saveMessage.text}
            </p>
          )}
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-medium"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </>
          )}
        </Button>
      </div>

      <div className="bg-blue-400/10 border border-blue-400/20 rounded-lg p-3">
        <p className="text-xs text-blue-200">
          <strong>Why this matters:</strong> Your company profile helps the AI understand your 
          product/service context during sales simulations and when generating talk points.
        </p>
      </div>
    </div>
  );
}
