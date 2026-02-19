"use client";

import React from 'react';
import { SalesEvaluation } from '@/types/sales';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Target, 
  Shield, 
  MessageSquare, 
  HelpCircle, 
  Zap,
  BookOpen,
  Users,
  Sparkles
} from 'lucide-react';

interface SalesEvaluationDisplayProps {
  evaluation: SalesEvaluation;
}

const DIMENSION_CONFIG = [
  { 
    key: 'product_knowledge', 
    label: 'Product Knowledge', 
    icon: BookOpen,
    description: 'Understanding of product features and capabilities'
  },
  { 
    key: 'customer_understanding', 
    label: 'Customer Understanding', 
    icon: Users,
    description: 'Grasp of customer needs and pain points'
  },
  { 
    key: 'objection_handling', 
    label: 'Objection Handling', 
    icon: Shield,
    description: 'Ability to address concerns and objections'
  },
  { 
    key: 'value_communication', 
    label: 'Value Communication', 
    icon: TrendingUp,
    description: 'Articulation of value proposition'
  },
  { 
    key: 'question_quality', 
    label: 'Question Quality', 
    icon: HelpCircle,
    description: 'Quality and relevance of questions asked'
  },
  { 
    key: 'confidence_delivery', 
    label: 'Confidence & Delivery', 
    icon: Zap,
    description: 'Confidence and communication style'
  },
];

export function SalesEvaluationDisplay({ evaluation }: SalesEvaluationDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-amber-400';
    return 'text-red-400';
  };

  const getProgressColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-8">
      {/* Overall Score */}
      <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-400/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Overall Score</h3>
            <p className="text-sm text-amber-200">Sales Performance Evaluation</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-amber-400">
              {evaluation.overall_score}
              <span className="text-2xl text-amber-400/60">/10</span>
            </div>
          </div>
        </div>
        <Progress 
          value={evaluation.overall_score * 10} 
          className="h-3 bg-slate-800"
        />
      </div>

      {/* Dimension Scores */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-400" />
          Performance Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DIMENSION_CONFIG.map((dimension) => {
            const score = evaluation.dimension_scores[dimension.key as keyof typeof evaluation.dimension_scores];
            const Icon = dimension.icon;
            
            return (
              <div
                key={dimension.key}
                className="bg-slate-900/50 border border-white/10 rounded-lg p-4 hover:border-amber-400/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-400/10 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {dimension.label}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {dimension.description}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${getScoreColor(score)} border-current`}
                  >
                    {score}/10
                  </Badge>
                </div>
                <Progress 
                  value={score * 10} 
                  className="h-2 bg-slate-800"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Sales-Specific Insights */}
      {evaluation.sales_specific && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Sales-Specific Insights
          </h3>
          <div className="space-y-3">
            <div className="bg-slate-900/50 border border-white/10 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Knowledge Base Usage
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {evaluation.sales_specific.knowledge_base_usage}
              </p>
            </div>

            <div className="bg-slate-900/50 border border-white/10 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Stage Appropriateness
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {evaluation.sales_specific.stage_appropriateness}
              </p>
            </div>

            <div className="bg-slate-900/50 border border-white/10 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Personalization
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {evaluation.sales_specific.personalization}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Strengths */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          Strengths
        </h3>
        <div className="space-y-2">
          {evaluation.strengths.map((strength, index) => (
            <div
              key={index}
              className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-start gap-3"
            >
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-green-400">✓</span>
              </div>
              <p className="text-sm text-green-100 leading-relaxed flex-1">
                {strength}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Improvement Areas */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-amber-400" />
          Areas for Improvement
        </h3>
        <div className="space-y-2">
          {evaluation.improvement_areas.map((area, index) => (
            <div
              key={index}
              className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-3"
            >
              <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-amber-400">!</span>
              </div>
              <p className="text-sm text-amber-100 leading-relaxed flex-1">
                {area}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
