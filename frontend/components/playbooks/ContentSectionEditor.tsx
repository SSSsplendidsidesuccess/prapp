import React, { useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { ContentSection, ObjectionResponse, CompetitiveBattleCard } from '@/types/playbooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ContentSectionEditorProps {
  content: ContentSection;
  onChange: (content: ContentSection) => void;
}

export default function ContentSectionEditor({ content, onChange }: ContentSectionEditorProps) {
  const [newKeyMessage, setNewKeyMessage] = useState('');
  const [newValueProp, setNewValueProp] = useState('');
  const [newProofPoint, setNewProofPoint] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newNextStep, setNewNextStep] = useState('');

  const addItem = (field: keyof ContentSection, value: string, setter: (val: string) => void) => {
    if (!value.trim()) return;
    
    const currentArray = content[field] as string[];
    onChange({
      ...content,
      [field]: [...currentArray, value.trim()],
    });
    setter('');
  };

  const removeItem = (field: keyof ContentSection, index: number) => {
    const currentArray = content[field] as string[];
    onChange({
      ...content,
      [field]: currentArray.filter((_, i) => i !== index),
    });
  };

  const addObjection = () => {
    onChange({
      ...content,
      objection_handling: [
        ...content.objection_handling,
        { objection: '', response: '' },
      ],
    });
  };

  const updateObjection = (index: number, field: keyof ObjectionResponse, value: string) => {
    const updated = [...content.objection_handling];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...content, objection_handling: updated });
  };

  const removeObjection = (index: number) => {
    onChange({
      ...content,
      objection_handling: content.objection_handling.filter((_, i) => i !== index),
    });
  };

  const addBattleCard = () => {
    onChange({
      ...content,
      competitive_battle_cards: [
        ...content.competitive_battle_cards,
        { competitor_name: '', our_advantage: '', their_weakness: '', key_differentiator: '' },
      ],
    });
  };

  const updateBattleCard = (index: number, field: keyof CompetitiveBattleCard, value: string) => {
    const updated = [...content.competitive_battle_cards];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...content, competitive_battle_cards: updated });
  };

  const removeBattleCard = (index: number) => {
    onChange({
      ...content,
      competitive_battle_cards: content.competitive_battle_cards.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Opening Strategy */}
      <div>
        <Label htmlFor="opening_strategy" className="text-sm font-medium text-slate-300 mb-2 block">
          Opening Strategy
        </Label>
        <Textarea
          id="opening_strategy"
          value={content.opening_strategy || ''}
          onChange={(e) => onChange({ ...content, opening_strategy: e.target.value })}
          placeholder="How to start the conversation..."
          className="bg-slate-800/50 border-white/10 text-slate-200 min-h-[100px]"
        />
      </div>

      {/* Key Messages */}
      <div>
        <Label className="text-sm font-medium text-slate-300 mb-2 block">
          Key Messages
        </Label>
        <div className="space-y-2">
          {content.key_messages.map((msg, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                value={msg}
                onChange={(e) => {
                  const updated = [...content.key_messages];
                  updated[idx] = e.target.value;
                  onChange({ ...content, key_messages: updated });
                }}
                className="bg-slate-800/50 border-white/10 text-slate-200"
              />
              <Button
                onClick={() => removeItem('key_messages', idx)}
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
              value={newKeyMessage}
              onChange={(e) => setNewKeyMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem('key_messages', newKeyMessage, setNewKeyMessage)}
              placeholder="Add a key message..."
              className="bg-slate-800/50 border-white/10 text-slate-200"
            />
            <Button
              onClick={() => addItem('key_messages', newKeyMessage, setNewKeyMessage)}
              variant="outline"
              size="sm"
              className="h-9 border-white/10 text-slate-300 hover:bg-slate-800"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Value Propositions */}
      <div>
        <Label className="text-sm font-medium text-slate-300 mb-2 block">
          Value Propositions
        </Label>
        <div className="space-y-2">
          {content.value_propositions.map((vp, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                value={vp}
                onChange={(e) => {
                  const updated = [...content.value_propositions];
                  updated[idx] = e.target.value;
                  onChange({ ...content, value_propositions: updated });
                }}
                className="bg-slate-800/50 border-white/10 text-slate-200"
              />
              <Button
                onClick={() => removeItem('value_propositions', idx)}
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
              value={newValueProp}
              onChange={(e) => setNewValueProp(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem('value_propositions', newValueProp, setNewValueProp)}
              placeholder="Add a value proposition..."
              className="bg-slate-800/50 border-white/10 text-slate-200"
            />
            <Button
              onClick={() => addItem('value_propositions', newValueProp, setNewValueProp)}
              variant="outline"
              size="sm"
              className="h-9 border-white/10 text-slate-300 hover:bg-slate-800"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Proof Points */}
      <div>
        <Label className="text-sm font-medium text-slate-300 mb-2 block">
          Proof Points
        </Label>
        <div className="space-y-2">
          {content.proof_points.map((pp, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                value={pp}
                onChange={(e) => {
                  const updated = [...content.proof_points];
                  updated[idx] = e.target.value;
                  onChange({ ...content, proof_points: updated });
                }}
                className="bg-slate-800/50 border-white/10 text-slate-200"
              />
              <Button
                onClick={() => removeItem('proof_points', idx)}
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
              value={newProofPoint}
              onChange={(e) => setNewProofPoint(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem('proof_points', newProofPoint, setNewProofPoint)}
              placeholder="Add a proof point..."
              className="bg-slate-800/50 border-white/10 text-slate-200"
            />
            <Button
              onClick={() => addItem('proof_points', newProofPoint, setNewProofPoint)}
              variant="outline"
              size="sm"
              className="h-9 border-white/10 text-slate-300 hover:bg-slate-800"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Discovery Questions */}
      <div>
        <Label className="text-sm font-medium text-slate-300 mb-2 block">
          Discovery Questions
        </Label>
        <div className="space-y-2">
          {content.discovery_questions.map((q, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                value={q}
                onChange={(e) => {
                  const updated = [...content.discovery_questions];
                  updated[idx] = e.target.value;
                  onChange({ ...content, discovery_questions: updated });
                }}
                className="bg-slate-800/50 border-white/10 text-slate-200"
              />
              <Button
                onClick={() => removeItem('discovery_questions', idx)}
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
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem('discovery_questions', newQuestion, setNewQuestion)}
              placeholder="Add a discovery question..."
              className="bg-slate-800/50 border-white/10 text-slate-200"
            />
            <Button
              onClick={() => addItem('discovery_questions', newQuestion, setNewQuestion)}
              variant="outline"
              size="sm"
              className="h-9 border-white/10 text-slate-300 hover:bg-slate-800"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Objection Handling */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium text-slate-300">
            Objection Handling
          </Label>
          <Button
            onClick={addObjection}
            variant="outline"
            size="sm"
            className="h-8 border-white/10 text-slate-300 hover:bg-slate-800"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Objection
          </Button>
        </div>
        <div className="space-y-3">
          {content.objection_handling.map((obj, idx) => (
            <div key={idx} className="bg-slate-800/30 border border-white/5 rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-3">
                  <Input
                    value={obj.objection}
                    onChange={(e) => updateObjection(idx, 'objection', e.target.value)}
                    placeholder="Objection..."
                    className="bg-slate-800/50 border-white/10 text-slate-200"
                  />
                  <Textarea
                    value={obj.response}
                    onChange={(e) => updateObjection(idx, 'response', e.target.value)}
                    placeholder="Response strategy..."
                    className="bg-slate-800/50 border-white/10 text-slate-200 min-h-[80px]"
                  />
                </div>
                <Button
                  onClick={() => removeObjection(idx)}
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 text-slate-500 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Competitive Battle Cards */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium text-slate-300">
            Competitive Battle Cards
          </Label>
          <Button
            onClick={addBattleCard}
            variant="outline"
            size="sm"
            className="h-8 border-white/10 text-slate-300 hover:bg-slate-800"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Battle Card
          </Button>
        </div>
        <div className="space-y-3">
          {content.competitive_battle_cards.map((card, idx) => (
            <div key={idx} className="bg-slate-800/30 border border-white/5 rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-3">
                  <Input
                    value={card.competitor_name}
                    onChange={(e) => updateBattleCard(idx, 'competitor_name', e.target.value)}
                    placeholder="Competitor name..."
                    className="bg-slate-800/50 border-white/10 text-slate-200"
                  />
                  <Input
                    value={card.our_advantage}
                    onChange={(e) => updateBattleCard(idx, 'our_advantage', e.target.value)}
                    placeholder="Our advantage..."
                    className="bg-slate-800/50 border-white/10 text-slate-200"
                  />
                  <Input
                    value={card.their_weakness}
                    onChange={(e) => updateBattleCard(idx, 'their_weakness', e.target.value)}
                    placeholder="Their weakness..."
                    className="bg-slate-800/50 border-white/10 text-slate-200"
                  />
                  <Input
                    value={card.key_differentiator}
                    onChange={(e) => updateBattleCard(idx, 'key_differentiator', e.target.value)}
                    placeholder="Key differentiator..."
                    className="bg-slate-800/50 border-white/10 text-slate-200"
                  />
                </div>
                <Button
                  onClick={() => removeBattleCard(idx)}
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 text-slate-500 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div>
        <Label className="text-sm font-medium text-slate-300 mb-2 block">
          Next Steps
        </Label>
        <div className="space-y-2">
          {content.next_steps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                value={step}
                onChange={(e) => {
                  const updated = [...content.next_steps];
                  updated[idx] = e.target.value;
                  onChange({ ...content, next_steps: updated });
                }}
                className="bg-slate-800/50 border-white/10 text-slate-200"
              />
              <Button
                onClick={() => removeItem('next_steps', idx)}
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
              value={newNextStep}
              onChange={(e) => setNewNextStep(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem('next_steps', newNextStep, setNewNextStep)}
              placeholder="Add a next step..."
              className="bg-slate-800/50 border-white/10 text-slate-200"
            />
            <Button
              onClick={() => addItem('next_steps', newNextStep, setNewNextStep)}
              variant="outline"
              size="sm"
              className="h-9 border-white/10 text-slate-300 hover:bg-slate-800"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
