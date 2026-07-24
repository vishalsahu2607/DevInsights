import React from 'react';
import {
  LayoutDashboard,
  MessageSquareCode,
  Upload,
  FolderKanban,
  GitFork,
  FileCode2,
  Network,
  AlertTriangle,
  Settings,
  Compass,
  X,
  DatabaseZap,
} from 'lucide-react';
import { Logo } from './Logo';

export type NavRoute =
  | 'landing'
  | 'dashboard'
  | 'chat'
  | 'upload'
  | 'projects'
  | 'repositories'
  | 'documents'
  | 'architecture'
  | 'incidents'
  | 'settings';

interface SidebarProps {
  currentRoute: NavRoute;
  onNavigate: (route: NavRoute) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  indexedChunksCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  isMobileOpen = false,
  onMobileClose,
  indexedChunksCount = 30,
}) => {
  const navItems: { route: NavRoute; label: string; icon: React.ElementType; badge?: string }[] = [
    { route: 'landing', label: 'Explore Hub', icon: Compass },
    { route: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { route: 'chat', label: 'AI Chat', icon: MessageSquareCode, badge: 'RAG' },
    { route: 'upload', label: 'Upload Knowledge', icon: Upload },
    { route: 'projects', label: 'Projects', icon: FolderKanban },
    { route: 'repositories', label: 'Repositories', icon: GitFork },
    { route: 'documents', label: 'Documents', icon: FileCode2 },
    { route: 'architecture', label: 'Architecture', icon: Network },
    { route: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { route: 'settings', label: 'Settings', icon: Settings },
  ];

  const content = (
    <div className="flex flex-col h-full bg-olive-950 border-r border-olive-900/80 w-64 p-4 text-beige-200 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 mb-2 border-b border-olive-900/60">
        <div className="cursor-pointer" onClick={() => onNavigate('landing')}>
          <Logo size="md" />
        </div>
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="md:hidden text-beige-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 space-y-1 overflow-y-auto pr-1">
        <div className="px-3 py-1.5 text-[10px] font-semibold text-olive-300/80 uppercase tracking-widest font-mono">
          Engineering Hub
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.route;
          return (
            <button
              key={item.route}
              onClick={() => {
                onNavigate(item.route);
                if (onMobileClose) onMobileClose();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-olive-800 text-beige-50 border border-olive-600/50 shadow-md shadow-olive-950/40 font-semibold'
                  : 'text-beige-300 hover:text-white hover:bg-olive-900/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-olive-300' : 'text-beige-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-olive-700/40 text-olive-200 border border-olive-600/40">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Vector Store Status Box */}
      <div className="mt-auto pt-4 border-t border-olive-900/60">
        <div className="rounded-xl bg-olive-900/80 border border-olive-800 p-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-beige-200 font-medium">
            <div className="flex items-center gap-2">
              <DatabaseZap className="w-4 h-4 text-olive-300 animate-pulse" />
              <span>Chroma VectorDB</span>
            </div>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-olive-800 text-olive-200 border border-olive-600/40">
              Active
            </span>
          </div>
          <div className="flex justify-between text-[11px] text-beige-400 font-mono">
            <span>Indexed Chunks</span>
            <span className="text-olive-200 font-bold">{indexedChunksCount}</span>
          </div>
          <div className="w-full bg-olive-950 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-olive-500 to-olive-300 h-full w-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-screen sticky top-0 shrink-0 z-30">{content}</div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onMobileClose} />
          <div className="relative flex-1 max-w-xs w-full">{content}</div>
        </div>
      )}
    </>
  );
};
