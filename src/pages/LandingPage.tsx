import React from 'react';
import { NavRoute } from '../components/Sidebar';
import {
  MessageSquareCode,
  Upload,
  Search,
  BookOpen,
  GitFork,
  AlertTriangle,
  Network,
  Cpu,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (route: NavRoute) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 pb-12 text-olive-950">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-beige-200/80 via-beige-50 to-beige-50 border border-beige-300 p-8 md:p-14 text-center space-y-6 shadow-sm">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-olive-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-olive-100 border border-olive-300 text-olive-800 text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-olive-700" />
          <span>AI-Powered Engineering Intelligence Hub</span>
        </div>

        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-olive-950 max-w-4xl mx-auto leading-tight">
          Ask. Understand. <span className="text-olive-700">Build Faster.</span>
        </h1>

        <p className="text-sm md:text-base text-beige-800 max-w-2xl mx-auto font-sans leading-relaxed">
          Stop searching through fragmented GitHub repos, PDF guides, architecture diagrams, and incident reports. DevInsights unifies your technical knowledge into an intelligent RAG assistant with precise source citations.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => onNavigate('chat')}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-olive-700 hover:bg-olive-800 text-white font-bold text-sm shadow-md shadow-olive-950/20 transition-all hover:scale-105"
          >
            <MessageSquareCode className="w-4 h-4" />
            <span>Start Asking Questions</span>
          </button>
          <button
            onClick={() => onNavigate('upload')}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-beige-200 hover:bg-beige-300 border border-beige-300 text-olive-950 font-semibold text-sm shadow-sm transition-all"
          >
            <Upload className="w-4 h-4 text-olive-700" />
            <span>Upload Knowledge</span>
          </button>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-olive-950">Unified Knowledge Search & Citation</h2>
          <p className="text-xs text-beige-700 font-mono">
            Empowering developers, leads, and incident teams with real-time vector retrieval
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-beige-50 border border-beige-300 p-6 space-y-3 hover:border-olive-400 transition-all shadow-sm">
            <div className="p-3 rounded-xl bg-olive-100 text-olive-800 w-fit border border-olive-300">
              <GitFork className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-olive-950 font-mono">Code Repositories</h3>
            <p className="text-xs text-beige-700 leading-relaxed">
              Index GitHub repositories and ZIP archives. Automatically parse TypeScript, Python, Go, and configuration files.
            </p>
          </div>

          <div className="rounded-2xl bg-beige-50 border border-beige-300 p-6 space-y-3 hover:border-olive-400 transition-all shadow-sm">
            <div className="p-3 rounded-xl bg-beige-200 text-olive-900 w-fit border border-beige-300">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-olive-950 font-mono">PDF & DOCX Guides</h3>
            <p className="text-xs text-beige-700 leading-relaxed">
              Chunk markdown, onboarding documentation, API specs, and technical runbooks into vector search segments.
            </p>
          </div>

          <div className="rounded-2xl bg-beige-50 border border-beige-300 p-6 space-y-3 hover:border-olive-400 transition-all shadow-sm">
            <div className="p-3 rounded-xl bg-amber-100 text-amber-900 w-fit border border-amber-300">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-olive-950 font-mono">Incident Postmortems</h3>
            <p className="text-xs text-beige-700 leading-relaxed">
              Search past outages, root cause analysis, symptoms, and resolution guardrails to prevent recurring failures.
            </p>
          </div>
        </div>
      </section>

      {/* RAG Workflow Pipeline */}
      <section className="rounded-3xl bg-beige-50 border border-beige-300 p-8 space-y-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-beige-200 pb-6">
          <div>
            <h2 className="text-xl font-bold text-olive-950 flex items-center gap-2">
              <Zap className="w-5 h-5 text-olive-700" /> RAG Architecture Workflow
            </h2>
            <p className="text-xs text-beige-700 font-mono mt-1">
              How DevInsights converts engineering knowledge into accurate answers with file citations
            </p>
          </div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-1.5 text-xs text-olive-700 hover:text-olive-900 font-mono font-bold"
          >
            <span>View Dashboard Metrics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          <div className="bg-beige-100 p-4 rounded-2xl border border-beige-300 space-y-2">
            <span className="text-olive-700 font-bold">01. Ingestion</span>
            <h4 className="font-bold text-olive-950">Parse Documents & Code</h4>
            <p className="text-beige-700 text-[11px]">
              Extract text from PDFs, DOCX, Markdown, Python AST, TypeScript files, and repo ZIPs.
            </p>
          </div>

          <div className="bg-beige-100 p-4 rounded-2xl border border-beige-300 space-y-2">
            <span className="text-olive-700 font-bold">02. Chunking</span>
            <h4 className="font-bold text-olive-950">Overlap Segmentation</h4>
            <p className="text-beige-700 text-[11px]">
              Segment content into 800-character chunks with 150-character overlap preserving function blocks.
            </p>
          </div>

          <div className="bg-beige-100 p-4 rounded-2xl border border-beige-300 space-y-2">
            <span className="text-olive-700 font-bold">03. Retrieval</span>
            <h4 className="font-bold text-olive-950">ChromaDB Vector Search</h4>
            <p className="text-beige-700 text-[11px]">
              Perform cosine semantic similarity & keyword matching to rank the top_k relevant context chunks.
            </p>
          </div>

          <div className="bg-beige-100 p-4 rounded-2xl border border-beige-300 space-y-2">
            <span className="text-olive-700 font-bold">04. Generation</span>
            <h4 className="font-bold text-olive-950">Gemma / Gemini 3.6 Flash</h4>
            <p className="text-beige-700 text-[11px]">
              Synthesize concise, grounded answers referencing exact code paths, file names, and line numbers.
            </p>
          </div>
        </div>
      </section>

      {/* Team Footer */}
      <footer className="pt-8 border-t border-beige-300 flex flex-col sm:flex-row items-center justify-between text-xs text-beige-700 font-mono gap-4">
        <div>
          DevInsights • Built for Hackathon by <span className="text-olive-800 font-bold">Code Vikings</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => onNavigate('chat')} className="hover:text-olive-950">
            AI Chat
          </button>
          <button onClick={() => onNavigate('repositories')} className="hover:text-olive-950">
            Repositories
          </button>
          <button onClick={() => onNavigate('settings')} className="hover:text-olive-950">
            Settings
          </button>
        </div>
      </footer>
    </div>
  );
};
