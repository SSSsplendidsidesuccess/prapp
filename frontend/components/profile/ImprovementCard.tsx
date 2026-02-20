"use client";

interface ImprovementCardProps {
  title: string;
  text: string;
  tags: string[];
  onPractice: () => void;
  onExample: () => void;
}

export default function ImprovementCard({
  title,
  text,
  tags,
  onPractice,
  onExample
}: ImprovementCardProps) {
  return (
    <div className="bg-slate-900/30 border border-white/5 hover:border-white/10 rounded-xl p-4 flex gap-4 transition-all group">
      <div className="w-1 self-stretch bg-amber-400/50 rounded-full" />
      <div className="flex-1">
        <h4 className="font-bold text-white text-sm mb-1">{title}</h4>
        <p className="text-xs text-slate-300 mb-3 leading-relaxed font-medium">
          Why it matters: <span className="text-slate-400 font-normal">{text}</span>
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map(tag => (
            <span 
              key={tag} 
              className="text-[10px] font-medium text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded border border-white/5"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onPractice}
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 px-4 py-1.5 rounded-md text-xs font-bold transition-colors shadow-lg shadow-amber-400/10"
          >
            Practice now
          </button>
          <button 
            onClick={onExample}
            className="text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors"
          >
            See example
          </button>
        </div>
      </div>
    </div>
  );
}
