import React from 'react';
import { ArchitectureDiagram } from '../types';
import { Network, Database, Cpu, Globe, ArrowRight, Layers } from 'lucide-react';

interface ArchitectureViewerProps {
  diagram: ArchitectureDiagram;
}

export const ArchitectureViewer: React.FC<ArchitectureViewerProps> = ({ diagram }) => {
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-950 border border-purple-500/30 text-purple-400">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 font-mono">{diagram.file_name}</h3>
            <p className="text-xs text-slate-400 font-mono">
              Indexed Architecture Spec • {new Date(diagram.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
        <h4 className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4" /> AI Generated System Synthesis
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">{diagram.generated_summary}</p>
      </div>

      {/* Detected Components Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        {/* Services */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <Cpu className="w-4 h-4" /> Services & Microservices
          </div>
          <ul className="space-y-1 text-slate-300">
            {diagram.detected_services.map((svc, idx) => (
              <li key={idx} className="bg-slate-900 px-2 py-1 rounded border border-slate-800">
                {svc}
              </li>
            ))}
          </ul>
        </div>

        {/* Databases */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <Database className="w-4 h-4" /> Databases & Caches
          </div>
          <ul className="space-y-1 text-slate-300">
            {diagram.detected_databases.map((db, idx) => (
              <li key={idx} className="bg-slate-900 px-2 py-1 rounded border border-slate-800">
                {db}
              </li>
            ))}
          </ul>
        </div>

        {/* External APIs */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Globe className="w-4 h-4" /> External APIs
          </div>
          <ul className="space-y-1 text-slate-300">
            {diagram.detected_apis.map((api, idx) => (
              <li key={idx} className="bg-slate-900 px-2 py-1 rounded border border-slate-800">
                {api}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Dependency Flow Relationships */}
      {diagram.relationships && diagram.relationships.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">
            Inferred System Dependencies & Connections
          </h4>
          <div className="space-y-1">
            {diagram.relationships.map((rel, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 text-xs font-mono text-slate-300 border border-slate-800"
              >
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{rel}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
