"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronRight, User, Save, ArrowLeft, Plus, Loader2, BookOpen, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ScenarioEditor, StatusBadge } from '@/components/playbooks';
import { Playbook, PlaybookStatus, Scenario, DealStage, ContentSection } from '@/types/playbooks';
import { playbooksApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function PlaybookEditorContent() {
  const router = useRouter();
  const params = useParams();
  const playbookId = params.id as string;

  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    loadPlaybook();
  }, [playbookId]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadPlaybook = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await playbooksApi.get(playbookId);
      setPlaybook(data);
      if (data.scenarios.length > 0 && !activeScenarioId) {
        setActiveScenarioId(data.scenarios[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load playbook');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!playbook) return;

    setIsSaving(true);
    setError(null);

    try {
      const { id, user_id, created_at, updated_at, is_template, scenarios, ...updateData } = playbook;
      await playbooksApi.update(playbookId, updateData);
      
      setSuccessMessage('Playbook saved successfully');
      setHasUnsavedChanges(false);
      await loadPlaybook();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save playbook');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlaybookChange = (updates: Partial<Playbook>) => {
    if (!playbook) return;
    setPlaybook({ ...playbook, ...updates });
    setHasUnsavedChanges(true);
  };

  const handleAddScenario = async () => {
    if (!playbook) return;

    try {
      const newScenario = await playbooksApi.addScenario(playbookId, {
        title: 'New Scenario',
        deal_stage: DealStage.DISCOVERY,
      });

      setPlaybook({
        ...playbook,
        scenarios: [...playbook.scenarios, newScenario],
      });
      setActiveScenarioId(newScenario.id);
      setSuccessMessage('Scenario added successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add scenario');
    }
  };

  const handleScenarioChange = (updatedScenario: Scenario) => {
    if (!playbook) return;

    const updatedScenarios = playbook.scenarios.map((s) =>
      s.id === updatedScenario.id ? updatedScenario : s
    );

    setPlaybook({ ...playbook, scenarios: updatedScenarios });
    setHasUnsavedChanges(true);
  };

  const handleSaveScenario = async (scenario: Scenario) => {
    try {
      const { id, ...updateData } = scenario;
      await playbooksApi.updateScenario(playbookId, scenario.id, updateData);
      setSuccessMessage('Scenario saved successfully');
      setHasUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save scenario');
    }
  };

  const handleDeleteScenario = async (scenarioId: string) => {
    if (!playbook) return;
    
    const scenario = playbook.scenarios.find(s => s.id === scenarioId);
    if (!confirm(`Are you sure you want to delete "${scenario?.title}"?`)) {
      return;
    }

    try {
      await playbooksApi.deleteScenario(playbookId, scenarioId);
      
      const updatedScenarios = playbook.scenarios.filter((s) => s.id !== scenarioId);
      setPlaybook({ ...playbook, scenarios: updatedScenarios });
      
      if (activeScenarioId === scenarioId) {
        setActiveScenarioId(updatedScenarios.length > 0 ? updatedScenarios[0].id : null);
      }
      
      setSuccessMessage('Scenario deleted successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete scenario');
    }
  };

  const handleGenerateScenarioContent = async (scenarioId: string) => {
    setIsGenerating(scenarioId);
    setError(null);

    try {
      const response = await playbooksApi.generateScenarioContent(playbookId, scenarioId, {
        additional_context: playbook?.description,
      });

      if (playbook) {
        const updatedScenarios = playbook.scenarios.map((s) =>
          s.id === scenarioId ? { ...s, content: response.content } : s
        );
        setPlaybook({ ...playbook, scenarios: updatedScenarios });
        setHasUnsavedChanges(true);
      }

      setSuccessMessage('Content generated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content');
    } finally {
      setIsGenerating(null);
    }
  };

  const activeScenario = playbook?.scenarios.find((s) => s.id === activeScenarioId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading playbook...</p>
        </div>
      </div>
    );
  }

  if (error && !playbook) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Failed to load playbook</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <Button onClick={() => router.push('/playbooks')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Playbooks
          </Button>
        </div>
      </div>
    );
  }

  if (!playbook) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between">
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
            <StatusBadge status={playbook.status} />
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400">
              <User size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-57px)]">
        {/* Left Sidebar - Scenarios List */}
        <div className="w-80 border-r border-white/5 bg-slate-900/30 overflow-y-auto">
          <div className="p-4 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Scenarios
              </h2>
              <div className="space-y-2">
                {playbook.scenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => {
                      if (hasUnsavedChanges && activeScenario) {
                        handleSaveScenario(activeScenario);
                      }
                      setActiveScenarioId(scenario.id);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      activeScenarioId === scenario.id
                        ? 'bg-purple-500/20 border border-purple-500/30 text-white'
                        : 'bg-slate-800/50 border border-white/5 text-slate-300 hover:bg-slate-800 hover:border-white/10'
                    }`}
                  >
                    <div className="font-medium mb-1">{scenario.title}</div>
                    <div className="text-xs text-slate-500">{scenario.deal_stage}</div>
                  </button>
                ))}
              </div>
              <Button
                onClick={handleAddScenario}
                variant="outline"
                className="w-full mt-3 border-white/10 text-slate-300 hover:bg-slate-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Scenario
              </Button>
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
            {/* Success Message */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6 flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <p className="text-sm text-green-400">{successMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 flex items-center gap-2"
              >
                <XCircle className="w-5 h-5 text-red-400" />
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}

            {/* Playbook Metadata */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 border border-white/5 rounded-xl p-6 mb-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Playbook Details</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium text-slate-300 mb-2 block">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={playbook.title}
                    onChange={(e) => handlePlaybookChange({ title: e.target.value })}
                    className="bg-slate-800/50 border-white/10 text-slate-200"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-slate-300 mb-2 block">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={playbook.description || ''}
                    onChange={(e) => handlePlaybookChange({ description: e.target.value })}
                    placeholder="Describe this playbook..."
                    className="bg-slate-800/50 border-white/10 text-slate-200 min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="target_persona" className="text-sm font-medium text-slate-300 mb-2 block">
                      Target Persona
                    </Label>
                    <Input
                      id="target_persona"
                      value={playbook.target_persona || ''}
                      onChange={(e) => handlePlaybookChange({ target_persona: e.target.value })}
                      placeholder="e.g., CTO"
                      className="bg-slate-800/50 border-white/10 text-slate-200"
                    />
                  </div>

                  <div>
                    <Label htmlFor="industry" className="text-sm font-medium text-slate-300 mb-2 block">
                      Industry
                    </Label>
                    <Input
                      id="industry"
                      value={playbook.industry || ''}
                      onChange={(e) => handlePlaybookChange({ industry: e.target.value })}
                      placeholder="e.g., SaaS"
                      className="bg-slate-800/50 border-white/10 text-slate-200"
                    />
                  </div>

                  <div>
                    <Label htmlFor="product_line" className="text-sm font-medium text-slate-300 mb-2 block">
                      Product Line
                    </Label>
                    <Input
                      id="product_line"
                      value={playbook.product_line || ''}
                      onChange={(e) => handlePlaybookChange({ product_line: e.target.value })}
                      placeholder="e.g., Enterprise Security"
                      className="bg-slate-800/50 border-white/10 text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status" className="text-sm font-medium text-slate-300 mb-2 block">
                    Status
                  </Label>
                  <Select
                    value={playbook.status}
                    onValueChange={(value) => handlePlaybookChange({ status: value as PlaybookStatus })}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-white/10 text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/10">
                      <SelectItem value={PlaybookStatus.DRAFT} className="text-slate-200">Draft</SelectItem>
                      <SelectItem value={PlaybookStatus.PUBLISHED} className="text-slate-200">Published</SelectItem>
                      <SelectItem value={PlaybookStatus.ARCHIVED} className="text-slate-200">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>

            {/* Active Scenario Editor */}
            {activeScenario ? (
              <motion.div
                key={activeScenario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/50 border border-white/5 rounded-xl p-6"
              >
                <ScenarioEditor
                  scenario={activeScenario}
                  onChange={handleScenarioChange}
                  onDelete={() => handleDeleteScenario(activeScenario.id)}
                  onGenerateContent={() => handleGenerateScenarioContent(activeScenario.id)}
                  isGenerating={isGenerating === activeScenario.id}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900/50 border border-white/10 rounded-xl p-12 text-center"
              >
                <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No scenarios yet</h3>
                <p className="text-slate-400 mb-6">Add your first scenario to start building your playbook</p>
                <Button
                  onClick={handleAddScenario}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Scenario
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlaybookEditorPage() {
  return (
    <ProtectedRoute>
      <PlaybookEditorContent />
    </ProtectedRoute>
  );
}
