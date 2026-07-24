import React, { useState, useEffect } from 'react';
import { RAGSettings } from '../types';
import { fetchSettings, updateSettings, resetDemoDataset } from '../services/api';
import { Settings, Sliders, Database, RefreshCw, Check, Sparkles } from 'lucide-react';

interface SettingsPageProps {
  onSettingsUpdated?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onSettingsUpdated }) => {
  const [settings, setSettings] = useState<RAGSettings | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    fetchSettings().then(setSettings).catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await updateSettings(settings);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      if (onSettingsUpdated) onSettingsUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetDemo = async () => {
    if (!confirm('Are you sure you want to reset and re-seed the hackathon sample engineering dataset?')) return;
    setIsResetting(true);
    try {
      await resetDemoDataset();
      alert('Demo dataset successfully reset and re-seeded!');
      if (onSettingsUpdated) onSettingsUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  if (!settings) return null;

  return (
    <div className="space-y-6 pb-12 text-slate-200 max-w-3xl">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-mono">
          <Settings className="w-5 h-5 text-cyan-400" />
          <span>RAG Engine & System Configuration</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Configure chunking parameters, vector similarity top_k, model selection, and dataset seeding
        </p>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-xl text-xs font-mono">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" /> AI Generation Model
          </h3>

          <div>
            <label className="block text-slate-400 mb-1">LLM Synthesis Engine</label>
            <select
              value={settings.model_name}
              onChange={(e) => setSettings({ ...settings, model_name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-cyan-500/50 font-mono"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended Default - Fast & Accurate)</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Code Analysis & Reasoning)</option>
            </select>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" /> Vector Chunking & Retrieval
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">Chunk Size (chars)</label>
              <input
                type="number"
                value={settings.chunk_size}
                onChange={(e) => setSettings({ ...settings, chunk_size: parseInt(e.target.value) || 800 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Chunk Overlap (chars)</label>
              <input
                type="number"
                value={settings.chunk_overlap}
                onChange={(e) => setSettings({ ...settings, chunk_overlap: parseInt(e.target.value) || 150 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Top-K Retrieval Contexts</label>
              <input
                type="number"
                value={settings.top_k}
                onChange={(e) => setSettings({ ...settings, top_k: parseInt(e.target.value) || 5 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {isSaved && (
            <span className="text-emerald-400 flex items-center gap-1 font-bold">
              <Check className="w-4 h-4" /> Settings updated successfully
            </span>
          )}

          <button
            type="submit"
            className="ml-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-md transition-all"
          >
            Save Settings
          </button>
        </div>
      </form>

      {/* Demo Reset Danger Zone */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-3 shadow-xl text-xs font-mono">
        <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
          <Database className="w-4 h-4" /> Hackathon Demo Dataset Reset
        </h3>
        <p className="text-slate-400 leading-relaxed">
          Reset all vector databases and re-seed sample repositories (Payment Gateway, Auth System), incident postmortems, and technical docs for presentation testing.
        </p>

        <button
          onClick={handleResetDemo}
          disabled={isResetting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-950 hover:bg-amber-900 border border-amber-500/30 text-amber-300 font-bold transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
          <span>Reset & Re-Seed Sample Engineering Dataset</span>
        </button>
      </div>
    </div>
  );
};
