import React from 'react';
import { Incident } from '../types';
import { AlertTriangle, Calendar, Server, ShieldCheck, Trash2 } from 'lucide-react';

interface IncidentCardProps {
  incident: Incident;
  onDelete?: (id: string) => void;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onDelete }) => {
  const severityColors = {
    low: 'bg-blue-950 text-blue-400 border-blue-500/30',
    medium: 'bg-amber-950 text-amber-400 border-amber-500/30',
    high: 'bg-orange-950 text-orange-400 border-orange-500/30',
    critical: 'bg-rose-950 text-rose-400 border-rose-500/30 animate-pulse',
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4 hover:border-slate-700 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold border ${
                severityColors[incident.severity]
              }`}
            >
              {incident.severity} SEVERITY
            </span>
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-cyan-400" />
              {incident.incident_date}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{incident.title}</span>
          </h3>
          <p className="text-xs font-mono text-cyan-400 flex items-center gap-1">
            <Server className="w-3 h-3" /> Affected Service: {incident.service}
          </p>
        </div>

        {onDelete && (
          <button
            onClick={() => onDelete(incident.id)}
            className="p-1.5 rounded-lg bg-slate-950 text-slate-500 hover:text-rose-400 border border-slate-800"
            title="Delete Incident"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans pt-2 border-t border-slate-800/80">
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
          <p className="font-mono text-[11px] font-semibold text-rose-400 uppercase">Symptoms & Behavior</p>
          <p className="text-slate-300 leading-relaxed">{incident.symptoms}</p>
        </div>

        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
          <p className="font-mono text-[11px] font-semibold text-amber-400 uppercase">Root Cause Analysis</p>
          <p className="text-slate-300 leading-relaxed">{incident.root_cause}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans pt-2 border-t border-slate-800/80">
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
          <p className="font-mono text-[11px] font-semibold text-emerald-400 uppercase">Immediate Resolution</p>
          <p className="text-slate-300 leading-relaxed">{incident.resolution}</p>
        </div>

        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
          <p className="font-mono text-[11px] font-semibold text-cyan-400 uppercase flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Prevention & Guardrails
          </p>
          <p className="text-slate-300 leading-relaxed">{incident.prevention}</p>
        </div>
      </div>
    </div>
  );
};
