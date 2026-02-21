"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, User, BookOpen, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { PlaybookCreate, GeneratePlaybookRequest } from '@/types/playbooks';
import { playbooksApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

function NewPlaybookPageContent() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useAI, setUseAI] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetPersona, setTargetPersona] = useState('');
  const [industry, setIndustry] = useState('');
  const [productLine, setProductLine] = useState('');
  const [goals, setGoals] = useState('');

  const handleCreateBlank = async () => {
    if (!title.trim()) {
      setError('Please enter a playbook title');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const playbookData: PlaybookCreate = {
        title: title.trim(),
        description: description.trim() || undefined,
        target_persona: targetPersona.trim() || undefined,
        industry: industry.trim() || undefined,
        product_line: productLine.trim() || undefined,
      };

      const newPlaybook = await playbooksApi.create(playbookData);
      router.push(`/playbooks/${newPlaybook.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create playbook');
      setIsCreating(false);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!title.trim() || !targetPersona.trim() || !industry.trim() || !productLine.trim()) {
      setError('Please fill in all required fields for AI generation');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const generateRequest: GeneratePlaybookRequest = {
        target_persona: targetPersona.trim(),
        industry: industry.trim(),
        product_line: productLine.trim(),
        goals: goals.trim() ? goals.split(',').map(g => g.trim()) : undefined,
      };

      const generatedPlaybook = await playbooksApi.generate(generateRequest);
      
      // Update with user's title and description
      const updatedPlaybook = await playbooksApi.update(generatedPlaybook.id, {
        title: title.trim(),
        description: description.trim() || undefined,
      });

      router.push(`/playbooks/${updatedPlaybook.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate playbook');
      setIsGenerating(false);
    }
  };

  const isFormValid = title.trim().length > 0;
  const isAIFormValid = isFormValid && targetPersona.trim().length > 0 && 
                        industry.trim().length > 0 && productLine.trim().length > 0;

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
            onClick={() => router.push('/playbooks')}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ChevronRight size={16} className="rotate-180" />
            <span>Back to Playbooks</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-400 hidden sm:block">New Playbook</span>
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400">
            <User size={16} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <BookOpen className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-3">Create New Playbook</h1>
          <p className="text-lg text-slate-400">
            Build a sales playbook from scratch or let AI generate one for you
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

        {/* Creation Method Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex gap-4 mb-8"
        >
          <button
            onClick={() => setUseAI(false)}
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${
              !useAI
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-white/10 bg-slate-900/50 hover:border-white/20'
            }`}
          >
            <BookOpen className={`w-8 h-8 mx-auto mb-2 ${!useAI ? 'text-purple-400' : 'text-slate-500'}`} />
            <h3 className={`font-semibold mb-1 ${!useAI ? 'text-white' : 'text-slate-400'}`}>
              Start Blank
            </h3>
            <p className="text-xs text-slate-500">Build from scratch</p>
          </button>
          <button
            onClick={() => setUseAI(true)}
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${
              useAI
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-white/10 bg-slate-900/50 hover:border-white/20'
            }`}
          >
            <Sparkles className={`w-8 h-8 mx-auto mb-2 ${useAI ? 'text-purple-400' : 'text-slate-500'}`} />
            <h3 className={`font-semibold mb-1 ${useAI ? 'text-white' : 'text-slate-400'}`}>
              Generate with AI
            </h3>
            <p className="text-xs text-slate-500">AI-powered structure</p>
          </button>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-slate-900/50 border border-white/5 rounded-xl p-8 space-y-6"
        >
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-slate-300 mb-2 block">
                  Playbook Title <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Enterprise SaaS Sales Playbook"
                  className="bg-slate-800/50 border-white/10 text-slate-200"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium text-slate-300 mb-2 block">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the purpose and scope of this playbook..."
                  className="bg-slate-800/50 border-white/10 text-slate-200 min-h-[100px]"
                />
              </div>
            </div>
          </div>

          {/* Target Information */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Target Information
              {useAI && <span className="text-sm text-purple-400 ml-2">(Required for AI)</span>}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="target_persona" className="text-sm font-medium text-slate-300 mb-2 block">
                  Target Persona {useAI && <span className="text-red-400">*</span>}
                </Label>
                <Input
                  id="target_persona"
                  value={targetPersona}
                  onChange={(e) => setTargetPersona(e.target.value)}
                  placeholder="e.g., CTO, VP of Engineering"
                  className="bg-slate-800/50 border-white/10 text-slate-200"
                />
              </div>

              <div>
                <Label htmlFor="industry" className="text-sm font-medium text-slate-300 mb-2 block">
                  Industry {useAI && <span className="text-red-400">*</span>}
                </Label>
                <Input
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g., SaaS, FinTech, Healthcare"
                  className="bg-slate-800/50 border-white/10 text-slate-200"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="product_line" className="text-sm font-medium text-slate-300 mb-2 block">
                  Product Line {useAI && <span className="text-red-400">*</span>}
                </Label>
                <Input
                  id="product_line"
                  value={productLine}
                  onChange={(e) => setProductLine(e.target.value)}
                  placeholder="e.g., Enterprise Security, Cloud Infrastructure"
                  className="bg-slate-800/50 border-white/10 text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* AI-Specific Fields */}
          {useAI && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h2 className="text-xl font-semibold text-white mb-4">AI Generation Options</h2>
              <div>
                <Label htmlFor="goals" className="text-sm font-medium text-slate-300 mb-2 block">
                  Goals (comma-separated)
                </Label>
                <Textarea
                  id="goals"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="e.g., Increase adoption, Upsell premium features, Reduce churn"
                  className="bg-slate-800/50 border-white/10 text-slate-200 min-h-[80px]"
                />
                <p className="text-xs text-slate-500 mt-2">
                  AI will use these goals to generate relevant scenarios and content
                </p>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={() => router.push('/playbooks')}
              variant="outline"
              className="flex-1 border-white/10 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            {useAI ? (
              <Button
                onClick={handleGenerateWithAI}
                disabled={isGenerating || !isAIFormValid}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate with AI
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleCreateBlank}
                disabled={isCreating || !isFormValid}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Playbook
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 bg-purple-500/10 border border-purple-500/20 rounded-lg p-4"
        >
          <h3 className="text-sm font-semibold text-purple-300 mb-2">💡 Tip</h3>
          <p className="text-sm text-slate-400">
            {useAI
              ? 'AI will analyze your inputs and generate a structured playbook with relevant scenarios based on your target persona, industry, and goals. You can edit and refine the content after generation.'
              : 'Start with a blank playbook and manually add scenarios and content. You can use AI to generate content for individual scenarios later.'}
          </p>
        </motion.div>
      </main>
    </div>
  );
}

export default function NewPlaybookPage() {
  return (
    <ProtectedRoute>
      <NewPlaybookPageContent />
    </ProtectedRoute>
  );
}
