import React from 'react';
import { DashboardStatistics } from '../types';
import { DashboardCard } from '../components/DashboardCard';
import { NavRoute } from '../components/Sidebar';
import {
  FileCode2,
  GitFork,
  BookOpen,
  MessageSquareCode,
  Upload,
  Plus,
  Clock,
  CheckCircle2,
  ArrowRight,
  Database,
  Sparkles,
} from 'lucide-react';

interface DashboardPageProps {
  stats: DashboardStatistics | null;
  onNavigate: (route: NavRoute) => void;
  onSelectSession: (sessionId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  onNavigate,
  onSelectSession,
}) => {
  return (
    <div className="space-y-8 pb-8 text-olive-950">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-beige-50 border border-beige-300 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-olive-950 flex items-center gap-2">
            <span>Engineering Metrics & Status</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-olive-100 text-olive-800 border border-olive-300">
              System Online
            </span>
          </h2>
          <p className="text-xs text-beige-700 font-mono mt-1">
            Chroma Vector database and Gemma / Gemini 3.6 Flash engine are ready
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('upload')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-olive-700 hover:bg-olive-800 text-white font-semibold text-xs shadow-md shadow-olive-900/20 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Resource</span>
          </button>
          <button
            onClick={() => onNavigate('chat')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-beige-200 hover:bg-beige-300 text-olive-950 font-semibold text-xs border border-beige-300 transition-all"
          >
            <MessageSquareCode className="w-4 h-4 text-olive-700" />
            <span>Open AI Chat</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <DashboardCard
          title="Total Resources"
          value={stats ? stats.total_resources : 7}
          icon={FileCode2}
          subtitle="Indexed knowledge items"
          badge="ChromaDB"
          color="cyan"
          onClick={() => onNavigate('documents')}
        />

        <DashboardCard
          title="Repositories"
          value={stats ? stats.total_repositories : 2}
          icon={GitFork}
          subtitle="GitHub repos & ZIP archives"
          badge="AST Parsed"
          color="purple"
          onClick={() => onNavigate('repositories')}
        />

        <DashboardCard
          title="Documents"
          value={stats ? stats.total_documents : 5}
          icon={BookOpen}
          subtitle="PDF, DOCX, MD, Guides"
          badge="Text Chunked"
          color="blue"
          onClick={() => onNavigate('documents')}
        />

        <DashboardCard
          title="Chat Queries"
          value={stats ? stats.total_questions : 12}
          icon={MessageSquareCode}
          subtitle="RAG questions answered"
          badge="Gemma 3.6 Flash"
          color="emerald"
          onClick={() => onNavigate('chat')}
        />
      </div>

      {/* Two-Column Layout: Recent Resources & Conversations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Uploaded Sources */}
        <div className="rounded-2xl bg-beige-50 border border-beige-300 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-beige-200 pb-3">
            <h3 className="text-sm font-bold text-olive-950 flex items-center gap-2 font-mono">
              <Clock className="w-4 h-4 text-olive-700" /> Recent Indexed Sources
            </h3>
            <button
              onClick={() => onNavigate('documents')}
              className="text-xs text-olive-700 hover:text-olive-900 font-mono flex items-center gap-1 font-semibold"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {stats && stats.recent_sources && stats.recent_sources.length > 0 ? (
              stats.recent_sources.map((src) => (
                <div
                  key={src.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-beige-100 border border-beige-300 hover:border-olive-400 transition-colors text-xs font-mono"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="p-2 rounded-lg bg-beige-200 text-olive-700 border border-beige-300">
                      <FileCode2 className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-olive-950 truncate">{src.name}</div>
                      <div className="text-[10px] text-beige-700 truncate">{src.file_path}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-olive-800 font-bold">{src.chunk_count} chunks</span>
                    <div className="text-[10px] text-beige-600">
                      {new Date(src.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-beige-600 py-4 text-center">No resources indexed yet.</p>
            )}
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="rounded-2xl bg-beige-50 border border-beige-300 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-beige-200 pb-3">
            <h3 className="text-sm font-bold text-olive-950 flex items-center gap-2 font-mono">
              <MessageSquareCode className="w-4 h-4 text-olive-700" /> Recent Chat Conversations
            </h3>
            <button
              onClick={() => onNavigate('chat')}
              className="text-xs text-olive-700 hover:text-olive-900 font-mono flex items-center gap-1 font-semibold"
            >
              <span>Go to Chat</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {stats && stats.recent_chats && stats.recent_chats.length > 0 ? (
              stats.recent_chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => {
                    onSelectSession(chat.id);
                    onNavigate('chat');
                  }}
                  className="flex items-center justify-between p-3 rounded-xl bg-beige-100 border border-beige-300 hover:border-olive-400 transition-colors text-xs cursor-pointer font-mono"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <MessageSquareCode className="w-4 h-4 text-olive-700 shrink-0" />
                    <span className="font-medium text-olive-950 truncate">{chat.title}</span>
                  </div>
                  <span className="text-[10px] text-beige-600 shrink-0">
                    {new Date(chat.updated_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-beige-600 py-4 text-center">No chat sessions created yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
