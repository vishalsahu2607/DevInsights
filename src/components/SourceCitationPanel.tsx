import React, { useState } from 'react';
import { SourceCitation } from '../types';
import { FileCode2, BookOpen, AlertTriangle, Network, ExternalLink, X, Percent, Check, Copy } from 'lucide-react';

interface SourceCitationPanelProps {
  sources: SourceCitation[];
  onClose?: () => void;
}

export const SourceCitationPanel: React.FC<SourceCitationPanelProps> = ({ sources, onClose }) => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'code':
      case 'repo':
        return <FileCode2 className="w-4 h-4 text-olive-700" />;
      case 'incident':
        return <AlertTriangle className="w-4 h-4 text-amber-700" />;
      case 'diagram':
        return <Network className="w-4 h-4 text-olive-800" />;
      default:
        return <BookOpen className="w-4 h-4 text-olive-700" />;
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-beige-50 border-l border-beige-300 w-full lg:w-80 shrink-0 p-4 font-sans select-none">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-beige-200">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-olive-950 font-mono">
          <BookOpen className="w-4 h-4 text-olive-700" />
          <span>Cited Knowledge Sources ({sources.length})</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-beige-700 hover:text-olive-950 p-1">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {sources.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-beige-600 text-xs">
          <BookOpen className="w-8 h-8 mb-2 opacity-40 text-beige-700" />
          <p>No explicit source citations retrieved for this message.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {sources.map((src, idx) => {
            const scorePercent = Math.round((src.relevance_score || 0.85) * 100);
            return (
              <div
                key={idx}
                className="rounded-xl bg-beige-100 border border-beige-300 p-3 hover:border-olive-400 transition-all text-xs space-y-2 group shadow-sm"
              >
                {/* Header line */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-mono text-olive-900 font-semibold truncate">
                    {getSourceIcon(src.source_type)}
                    <span className="truncate">{src.file_name}</span>
                  </div>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-olive-100 text-olive-800 border border-olive-300 text-[10px] font-mono shrink-0">
                    <Percent className="w-2.5 h-2.5" />
                    <span>{scorePercent}%</span>
                  </div>
                </div>

                {/* File path */}
                <div className="text-[11px] font-mono text-beige-800 truncate bg-beige-200/80 px-2 py-1 rounded border border-beige-300">
                  {src.file_path}
                  {src.line_number && <span className="text-olive-700 font-bold">#L{src.line_number}</span>}
                </div>

                {/* Section / Function */}
                {src.section_heading && (
                  <div className="text-[11px] text-olive-900 font-medium">
                    <span className="text-beige-700">Section:</span> {src.section_heading}
                  </div>
                )}

                {/* Snippet Preview */}
                <div className="relative font-mono text-[11px] text-beige-950 bg-beige-200/60 p-2 rounded border border-beige-300 leading-relaxed overflow-x-auto max-h-28">
                  {src.content_preview}
                  <button
                    onClick={() => handleCopy(src.content_preview, idx)}
                    className="absolute top-1 right-1 p-1 bg-beige-300 hover:bg-beige-400 text-olive-900 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copy snippet"
                  >
                    {copiedIdx === idx ? (
                      <Check className="w-3 h-3 text-olive-700" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
