"use client";

import { Play, ChevronRight } from "lucide-react";
import { Session } from "@/hooks/useProfile";

interface SessionListProps {
  sessions: Session[];
  onSessionClick: (session: Session) => void;
  onViewAll?: () => void;
}

export default function SessionList({ sessions, onSessionClick, onViewAll }: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-xl font-bold text-white">Recent sessions</h2>
        </div>
        <div className="bg-slate-900/30 border border-white/5 rounded-xl p-8 text-center">
          <p className="text-slate-400 text-sm">No sessions yet. Start your first practice session!</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-xl font-bold text-white">Recent sessions</h2>
        {onViewAll && (
          <button 
            onClick={onViewAll}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            View all
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        {sessions.map((session) => (
          <div 
            key={session.id} 
            onClick={() => onSessionClick(session)}
            className="group bg-slate-900/30 border border-white/5 hover:border-white/10 rounded-xl p-4 flex items-center justify-between transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                <Play size={18} />
              </div>
              <div>
                <div className="font-medium text-white text-sm">
                  {session.type}{session.subtype ? ` · ${session.subtype}` : ''}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span>{session.date}</span>
                  <span className={`capitalize ${
                    session.status === 'completed' ? 'text-green-400' : 'text-slate-500'
                  }`}>
                    {session.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {session.focus && (
                <span className="text-[10px] font-medium text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded border border-white/5">
                  {session.focus}
                </span>
              )}
              {session.score && (
                <span className="text-lg font-bold text-green-400">{session.score}</span>
              )}
              <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
