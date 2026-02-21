import React, { useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { Scenario, DealStage, ContentSection } from '@/types/playbooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ContentSectionEditor from './ContentSectionEditor';
import GenerateButton from './GenerateButton';

interface ScenarioEditorProps {
  scenario: Scenario;
  onChange: (scenario: Scenario) => void;
  onDelete?: () => void;
  onGenerateContent?: () => void;
  isGenerating?: boolean;
}

export default function ScenarioEditor({
  scenario,
  onChange,
  onDelete,
  onGenerateContent,
  isGenerating = false,
}: ScenarioEditorProps) {
  const [newPainPoint, setNewPainPoint] = useState('');
  const [newCompetitor, setNewCompetitor] = useState('');

  const addPainPoint = () => {
    if (!newPainPoint.trim()) return;
    onChange({
      ...scenario,
      customer_pain_points: [...scenario.customer_pain_points, newPainPoint.trim()],
    });
    setNewPainPoint('');
  };

  const removePainPoint = (index: number) => {
    onChange({
      ...scenario,
      customer_pain_points: scenario.customer_pain_points.filter((_, i) => i !== index),
    });
  };

  const addCompetitor = () => {
    if (!newCompetitor.trim()) return;
    onChange({
      ...scenario,
      competitors: [...scenario.competitors, newCompetitor.trim()],
    });
    setNewCompetitor('');
  };

  const removeCompetitor = (index: number) => {
    onChange({
      ...scenario,
      competitors: scenario.competitors.filter((_, i) => i !== index),
    });
  };

  const handleContentChange = (content: ContentSection) => {
    onChange({ ...scenario, content });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Label htmlFor="scenario_title" className="text-sm font-medium text-slate-300 mb-2 block">
            Scenario Title
          </Label>
          <Input
            id="scenario_title"
            value={scenario.title}
            onChange={(e) => onChange({ ...scenario, title: e.target.value })}
            placeholder="e.g., Discovery Call, Demo Presentation"
            className="bg-slate-800/50 border-white/10 text-slate-200 text-lg font-semibold"
          />
        </div>
        {onDelete && (
          <Button
            onClick={onDelete}
            variant="ghost"
            size="sm"
            className="ml-4 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Scenario
          </Button>
        )}
      </div>

      {/* Deal Stage */}
      <div>
        <Label htmlFor="deal_stage" className="text-sm font-medium text-slate-300 mb-2 block">
          Deal Stage
        </Label>
        <Select
          value={scenario.deal_stage}
          onValueChange={(value) => onChange({ ...scenario, deal_stage: value as DealStage })}
        >
          <SelectTrigger className="bg-slate-800/50 border-white/10 text-slate-200">
            <SelectValue placeholder="Select deal stage" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/10">
            {Object.values(DealStage).map((stage) => (
              <SelectItem key={stage} value={stage} className="text-slate-200">
                {stage}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Meeting Context */}
      <div>
        <Label htmlFor="meeting_context" className="text-sm font-medium text-slate-300 mb-2 block">
          Meeting Context
        </Label>
        <Textarea
          id="meeting_context"
          value={scenario.meeting_context || ''}
          onChange={(e) => onChange({ ...scenario, meeting_context: e.target.value })}
          placeholder="Describe the context of this meeting..."
          className="bg-slate-800/50 border-white/10 text-slate-200 min-h-[80px]"
        />
      </div>

      {/* Customer Pain Points */}
      <div>
        <Label className="text-sm font-medium text-slate-300 mb-2 block">
          Customer Pain Points
        </Label>
        <div className="space-y-2">
          {scenario.customer_pain_points.map((point, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                value={point}
                onChange={(e) => {
                  const updated = [...scenario.customer_pain_points];
                  updated[idx] = e.target.value;
                  onChange({ ...scenario, customer_pain_points: updated });
                }}
                className="bg-slate-800/50 border-white/10 text-slate-200"
              />
              <Button
                onClick={() => removePainPoint(idx)}
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-slate-500 hover:text-red-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <Input
              value={newPainPoint}
              onChange={(e) => setNewPainPoint(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addPainPoint()}
              placeholder="Add a pain point..."
              className="bg-slate-800/50 border-white/10 text-slate-200"
            />
            <Button
              onClick={addPainPoint}
              variant="outline"
              size="sm"
              className="h-9 border-white/10 text-slate-300 hover:bg-slate-800"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Competitors */}
      <div>
        <Label className="text-sm font-medium text-slate-300 mb-2 block">
          Competitors to Address
        </Label>
        <div className="space-y-2">
          {scenario.competitors.map((comp, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                value={comp}
                onChange={(e) => {
                  const updated = [...scenario.competitors];
                  updated[idx] = e.target.value;
                  onChange({ ...scenario, competitors: updated });
                }}
                className="bg-slate-800/50 border-white/10 text-slate-200"
              />
              <Button
                onClick={() => removeCompetitor(idx)}
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-slate-500 hover:text-red-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <Input
              value={newCompetitor}
              onChange={(e) => setNewCompetitor(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCompetitor()}
              placeholder="Add a competitor..."
              className="bg-slate-800/50 border-white/10 text-slate-200"
            />
            <Button
              onClick={addCompetitor}
              variant="outline"
              size="sm"
              className="h-9 border-white/10 text-slate-300 hover:bg-slate-800"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Generate Content Button */}
      {onGenerateContent && (
        <div className="flex items-center justify-between py-4 border-y border-white/10">
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-1">Content Sections</h3>
            <p className="text-xs text-slate-500">
              Generate AI-powered content based on your knowledge base or edit manually
            </p>
          </div>
          <GenerateButton
            onClick={onGenerateContent}
            isGenerating={isGenerating}
            label="Generate Content"
          />
        </div>
      )}

      {/* Content Section Editor */}
      <div className="bg-slate-800/30 border border-white/5 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Content Sections</h3>
        <ContentSectionEditor content={scenario.content} onChange={handleContentChange} />
      </div>
    </div>
  );
}
