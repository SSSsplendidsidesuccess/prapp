"use client";

import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { TalkPointContent } from '@/types/talkPoints';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TalkPointsDisplayProps {
  content: TalkPointContent;
  topic: string;
  sourcesUsed: number;
}

const SECTIONS = [
  { key: 'opening_hook', label: 'Opening Hook', icon: '🎯' },
  { key: 'problem_statement', label: 'Problem Statement', icon: '❗' },
  { key: 'solution_overview', label: 'Solution Overview', icon: '💡' },
  { key: 'key_benefits', label: 'Key Benefits', icon: '✨' },
  { key: 'proof_points', label: 'Proof Points', icon: '📊' },
  { key: 'objection_handling', label: 'Objection Handling', icon: '🛡️' },
  { key: 'call_to_action', label: 'Call to Action', icon: '🚀' },
];

export function TalkPointsDisplay({
  content,
  topic,
  sourcesUsed,
}: TalkPointsDisplayProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(SECTIONS.map(s => s.key))
  );

  const handleCopy = async (text: string, sectionKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionKey);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyAll = async () => {
    const allText = SECTIONS.map(section => {
      const text = content[section.key as keyof TalkPointContent];
      return `${section.label.toUpperCase()}\n${text}\n`;
    }).join('\n');

    try {
      await navigator.clipboard.writeText(allText);
      setCopiedSection('all');
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionKey)) {
        newSet.delete(sectionKey);
      } else {
        newSet.add(sectionKey);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-2">{topic}</h3>
          <p className="text-sm text-slate-400">
            Generated using {sourcesUsed} document{sourcesUsed !== 1 ? 's' : ''} from your knowledge base
          </p>
        </div>
        <Button
          onClick={handleCopyAll}
          variant="outline"
          size="sm"
          className="border-purple-400/30 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300"
        >
          {copiedSection === 'all' ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy All
            </>
          )}
        </Button>
      </div>

      {/* Sections */}
      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-3">
          {SECTIONS.map((section) => {
            const text = content[section.key as keyof TalkPointContent];
            const isExpanded = expandedSections.has(section.key);
            const isCopied = copiedSection === section.key;

            return (
              <div
                key={section.key}
                className="bg-slate-900/50 border border-white/10 rounded-lg overflow-hidden"
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.key)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{section.icon}</span>
                    <h4 className="text-base font-semibold text-white">
                      {section.label}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(text, section.key);
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-slate-400 hover:text-white hover:bg-slate-700"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Section Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="bg-slate-950/50 rounded-lg p-4 border border-white/5">
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {text}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer Info */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
        <p className="text-xs text-purple-200">
          <strong>Note:</strong> These talk points are generated based on your knowledge base documents.
          Review and customize them to match your specific sales situation and personal style.
        </p>
      </div>
    </div>
  );
}
