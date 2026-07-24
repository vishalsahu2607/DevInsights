import React from 'react';
import { Repository } from '../types';
import { GitFork, GitBranch, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react';

interface RepositoryCardProps {
  repository: Repository;
  onReindex?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const RepositoryCard: React.FC<RepositoryCardProps> = ({ repository, onReindex, onDelete }) => {
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg hover:border-slate-700 transition-all space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-400">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 font-mono">{repository.name}</h3>
            {repository.repository_url && (
              <p className="text-xs text-slate-400 font-mono truncate max-w-xs">
                {repository.repository_url}
              </p>
            )}
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3" />
          Indexed
        </span>
      </div>

      <div className="flex flex-wrap gap-2 text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800">
          <GitBranch className="w-3 h-3 text-cyan-400" />
          <span>Branch: {repository.branch || 'main'}</span>
        </div>
        <div className="bg-slate-950 px-2 py-1 rounded border border-slate-800">
          Indexed Files: <span className="text-slate-200 font-semibold">{repository.indexed_file_count}</span>
        </div>
      </div>

      {repository.languages && repository.languages.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {repository.languages.map((lang, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono"
            >
              {lang}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs font-mono">
        <span className="text-slate-500">
          Indexed: {new Date(repository.updated_at).toLocaleDateString()}
        </span>
        <div className="flex items-center gap-2">
          {onReindex && (
            <button
              onClick={() => onReindex(repository.id)}
              className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 border border-slate-800 transition-colors"
              title="Re-index repository"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(repository.id)}
              className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-rose-400 hover:bg-slate-800 border border-slate-800 transition-colors"
              title="Delete repository"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
