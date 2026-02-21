import React from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Calendar, Trash2, Users } from 'lucide-react';
import { Playbook } from '@/types/playbooks';
import StatusBadge from './StatusBadge';
import { Button } from '@/components/ui/button';

interface PlaybookCardProps {
  playbook: Playbook;
  onDelete?: (playbook: Playbook) => void;
}

export default function PlaybookCard({ playbook, onDelete }: PlaybookCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/playbooks/${playbook.id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(playbook);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div
      onClick={handleClick}
      className="bg-slate-900/50 border border-white/5 rounded-xl p-5 hover:border-purple-500/30 hover:bg-slate-900/70 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/30 transition-colors">
            <FileText className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-1 truncate group-hover:text-purple-300 transition-colors">
              {playbook.title}
            </h3>
            {playbook.description && (
              <p className="text-sm text-slate-400 line-clamp-2">
                {playbook.description}
              </p>
            )}
          </div>
        </div>
        <StatusBadge status={playbook.status} />
      </div>

      <div className="space-y-2 mb-4">
        {playbook.target_persona && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Users className="w-4 h-4" />
            <span>{playbook.target_persona}</span>
            {playbook.industry && (
              <span className="text-slate-600">•</span>
            )}
            {playbook.industry && (
              <span>{playbook.industry}</span>
            )}
          </div>
        )}
        {playbook.product_line && (
          <div className="text-sm text-slate-400">
            Product: {playbook.product_line}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span>{playbook.scenarios.length} scenario{playbook.scenarios.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Updated {formatDate(playbook.updated_at)}</span>
          </div>
        </div>
        {onDelete && (
          <Button
            onClick={handleDelete}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
