import React from 'react';
import { Menu, MessageSquare, Upload, Sparkles, Activity } from 'lucide-react';
import { ProjectSelector } from './ProjectSelector';
import { Project } from '../types';
import { NavRoute } from './Sidebar';

interface NavbarProps {
  currentRoute: NavRoute;
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onCreateProjectClick: () => void;
  onNavigate: (route: NavRoute) => void;
  onMobileMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProjectClick,
  onNavigate,
  onMobileMenuToggle,
}) => {
  const getPageTitle = (route: NavRoute) => {
    switch (route) {
      case 'landing':
        return 'Engineering Intelligence Hub';
      case 'dashboard':
        return 'System Overview & Metrics';
      case 'chat':
        return 'RAG Assistant AI Chat';
      case 'upload':
        return 'Upload Knowledge Base';
      case 'projects':
        return 'Project Workspaces';
      case 'repositories':
        return 'Code Repositories';
      case 'documents':
        return 'Technical Documentation';
      case 'architecture':
        return 'System Architecture Diagrams';
      case 'incidents':
        return 'Incident Reports & Postmortems';
      case 'settings':
        return 'RAG & System Settings';
      default:
        return 'DevInsights';
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-beige-50/90 backdrop-blur-md border-b border-beige-300/80 px-4 md:px-6 flex items-center justify-between">
      {/* Left section: mobile toggle & title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-lg bg-beige-200 border border-beige-300 text-olive-900 hover:bg-beige-300"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm md:text-base font-bold text-olive-950 flex items-center gap-2">
            <span>{getPageTitle(currentRoute)}</span>
          </h1>
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-beige-600 font-mono">
            <span>DevInsights</span>
            <span>/</span>
            <span className="text-olive-700 font-semibold capitalize">{currentRoute}</span>
          </div>
        </div>
      </div>

      {/* Right section: workspace selector & action buttons */}
      <div className="flex items-center gap-3">
        {/* Active System Health */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-beige-200/90 border border-beige-300 text-[11px] font-mono text-olive-900 font-medium">
          <Activity className="w-3.5 h-3.5 text-olive-600 animate-pulse" />
          <span>Gemma / Gemini 3.6 Flash</span>
        </div>

        {/* Workspace selector */}
        <ProjectSelector
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={onSelectProject}
          onCreateProjectClick={onCreateProjectClick}
        />

        {/* Quick actions */}
        {currentRoute !== 'chat' && (
          <button
            onClick={() => onNavigate('chat')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-olive-700 hover:bg-olive-800 text-white font-medium text-xs shadow-md shadow-olive-900/20 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        )}

        {currentRoute !== 'upload' && (
          <button
            onClick={() => onNavigate('upload')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-beige-200 hover:bg-beige-300 border border-beige-300 text-olive-900 text-xs font-medium transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-olive-700" />
            <span className="hidden sm:inline">Upload</span>
          </button>
        )}
      </div>
    </header>
  );
};
