"use client";

import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { DealStage } from '@/types/sales';
import { TalkPointGenerateRequest } from '@/types/talkPoints';
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
import { Button } from '@/components/ui/button';

interface TalkPointsGeneratorProps {
  onGenerate: (data: TalkPointGenerateRequest) => Promise<void>;
}

const DEAL_STAGES = [
  { value: '', label: 'Not specified' },
  { value: DealStage.PROSPECTING, label: 'Prospecting' },
  { value: DealStage.DISCOVERY, label: 'Discovery' },
  { value: DealStage.QUALIFICATION, label: 'Qualification' },
  { value: DealStage.PROPOSAL, label: 'Proposal' },
  { value: DealStage.NEGOTIATION, label: 'Negotiation' },
  { value: DealStage.CLOSING, label: 'Closing' },
  { value: DealStage.FOLLOW_UP, label: 'Follow-up' },
];

export function TalkPointsGenerator({ onGenerate }: TalkPointsGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [customerContext, setCustomerContext] = useState('');
  const [dealStage, setDealStage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Topic is required');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const data: TalkPointGenerateRequest = {
        topic: topic.trim(),
        customer_context: customerContext.trim() || undefined,
        deal_stage: dealStage || undefined,
      };

      await onGenerate(data);

      // Clear form on success
      setTopic('');
      setCustomerContext('');
      setDealStage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate talk points');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Generate Talk Points</h3>
          <p className="text-sm text-slate-400">
            AI-powered sales talk points based on your knowledge base
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Topic */}
        <div className="space-y-2">
          <Label htmlFor="topic" className="text-slate-200">
            Topic <span className="text-purple-400">*</span>
          </Label>
          <Input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Product demo for enterprise client"
            maxLength={200}
            className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus:border-purple-400/50 focus:ring-purple-400/20"
            disabled={isGenerating}
          />
          <p className="text-xs text-slate-500">{topic.length}/200 characters</p>
        </div>

        {/* Deal Stage */}
        <div className="space-y-2">
          <Label htmlFor="deal-stage" className="text-slate-200">
            Deal Stage (Optional)
          </Label>
          <Select value={dealStage} onValueChange={setDealStage} disabled={isGenerating}>
            <SelectTrigger
              id="deal-stage"
              className="bg-slate-900/50 border-white/10 text-white focus:border-purple-400/50 focus:ring-purple-400/20"
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

        {/* Customer Context */}
        <div className="space-y-2">
          <Label htmlFor="customer-context" className="text-slate-200">
            Customer Context (Optional)
          </Label>
          <Textarea
            id="customer-context"
            value={customerContext}
            onChange={(e) => setCustomerContext(e.target.value)}
            placeholder="Describe the customer, their industry, pain points, or specific needs..."
            maxLength={500}
            rows={4}
            className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus:border-purple-400/50 focus:ring-purple-400/20 resize-none"
            disabled={isGenerating}
          />
          <p className="text-xs text-slate-500">{customerContext.length}/500 characters</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-6 text-base"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating Talk Points...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Talk Points
            </>
          )}
        </Button>

        {/* Info Box */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
          <p className="text-xs text-purple-200">
            <strong>Tip:</strong> The AI will retrieve relevant information from your knowledge base
            to create comprehensive, context-aware talk points for your sales conversation.
          </p>
        </div>
      </div>
    </div>
  );
}
