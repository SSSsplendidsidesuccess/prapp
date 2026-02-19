"use client";

import React from 'react';
import { DealStage } from '@/types/sales';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SalesSessionSetupProps {
  customerName: string;
  customerPersona: string;
  dealStage: DealStage;
  onChange: (field: string, value: string) => void;
}

const DEAL_STAGES = [
  { value: DealStage.PROSPECTING, label: "Prospecting" },
  { value: DealStage.DISCOVERY, label: "Discovery" },
  { value: DealStage.QUALIFICATION, label: "Qualification" },
  { value: DealStage.PROPOSAL, label: "Proposal" },
  { value: DealStage.NEGOTIATION, label: "Negotiation" },
  { value: DealStage.CLOSING, label: "Closing" },
  { value: DealStage.FOLLOW_UP, label: "Follow-up" },
];

export function SalesSessionSetup({
  customerName,
  customerPersona,
  dealStage,
  onChange,
}: SalesSessionSetupProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="customer-name" className="text-slate-200">
          Customer Name <span className="text-amber-400">*</span>
        </Label>
        <Input
          id="customer-name"
          type="text"
          value={customerName}
          onChange={(e) => onChange('customerName', e.target.value)}
          placeholder="e.g., Acme Corp"
          maxLength={100}
          className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-400/50 focus:ring-amber-400/20"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="deal-stage" className="text-slate-200">
          Deal Stage <span className="text-amber-400">*</span>
        </Label>
        <Select value={dealStage} onValueChange={(value) => onChange('dealStage', value)}>
          <SelectTrigger 
            id="deal-stage"
            className="bg-slate-900/50 border-white/10 text-white focus:border-amber-400/50 focus:ring-amber-400/20"
          >
            <SelectValue placeholder="Select deal stage" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-white/10">
            {DEAL_STAGES.map((stage) => (
              <SelectItem 
                key={stage.value} 
                value={stage.value}
                className="text-white hover:bg-slate-800 focus:bg-slate-800"
              >
                {stage.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer-persona" className="text-slate-200">
          Customer Persona <span className="text-amber-400">*</span>
        </Label>
        <Textarea
          id="customer-persona"
          value={customerPersona}
          onChange={(e) => onChange('customerPersona', e.target.value)}
          placeholder="Describe the customer's role, pain points, and priorities... e.g., 'Skeptical CFO focused on ROI and cost reduction'"
          maxLength={500}
          rows={4}
          className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-400/50 focus:ring-amber-400/20 resize-none"
          required
        />
        <p className="text-xs text-slate-400">
          {customerPersona.length}/500 characters
        </p>
      </div>

      <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg p-3">
        <p className="text-xs text-amber-200">
          <strong>Tip:</strong> The AI will simulate this customer persona during your practice session. 
          Be specific about their concerns and priorities for a more realistic experience.
        </p>
      </div>
    </div>
  );
}
