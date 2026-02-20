"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface ActivatedSummaryStripProps {
  sessionsThisWeek: number;
  sessionGoal: number;
  avgScore: number;
  scoreChange: number;
  trendScores: number[];
  currentFocus?: string;
  onFocusClick: (focus: string) => void;
}

const FOCUS_OPTIONS = [
  "Openings",
  "Structure (STAR)",
  "Objections",
  "Clarity",
  "Conciseness"
];

export default function ActivatedSummaryStrip({
  sessionsThisWeek,
  sessionGoal,
  avgScore,
  scoreChange,
  trendScores,
  currentFocus,
  onFocusClick
}: ActivatedSummaryStripProps) {
  const [showFocusMenu, setShowFocusMenu] = useState(false);
  const progressPercentage = (sessionsThisWeek / sessionGoal) * 100;

  return (
    <div className="grid grid-cols-3 gap-2 mb-8">
      {/* Progress Tile */}
      <div className="bg-slate-900/30 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="text-2xl font-bold text-white">{sessionsThisWeek} sessions</div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">
          This week
        </div>
        <div className="text-[11px] text-slate-400 mt-1 font-medium">
          Goal: {sessionGoal} sessions
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
          <div 
            className="h-full bg-amber-400 transition-all duration-300" 
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Avg Score Tile */}
      <div className="bg-slate-900/30 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center relative">
        <div className="flex items-baseline gap-1">
          <div className="text-2xl font-bold text-white">{avgScore}</div>
          <div className={`text-[10px] font-bold ${scoreChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {scoreChange >= 0 ? '+' : ''}{scoreChange} pts
          </div>
        </div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">
          Avg Score
        </div>
        
        {/* Trend Dots */}
        <div className="flex gap-1.5 mt-2 items-end h-3">
          {trendScores.map((score, i) => (
            <div 
              key={i} 
              className="w-1.5 bg-slate-600 rounded-full"
              style={{ 
                height: `${(score - 50) / 4}px`, 
                opacity: 0.4 + (i * 0.15) 
              }}
            />
          ))}
        </div>
      </div>

      {/* Training Focus Tile */}
      <div className="bg-slate-900/30 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center relative">
        <div className="text-lg font-bold text-white leading-tight mb-1">
          {currentFocus || "Handle objections"}
        </div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">
          Training focus
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowFocusMenu(!showFocusMenu)}
            className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors bg-amber-400/10 px-2 py-1 rounded-full"
          >
            Change focus
            <ChevronDown size={10} />
          </button>
          
          {showFocusMenu && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-32 bg-slate-900 border border-white/10 rounded-lg shadow-xl z-50 py-1">
              {FOCUS_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => {
                    onFocusClick(opt);
                    setShowFocusMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
