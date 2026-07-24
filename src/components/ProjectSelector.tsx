import React, { useState } from 'react';
import { FolderGit2, ChevronDown, Plus, Check } from 'lucide-react';
import { Project } from '../types';

interface ProjectSelectorProps {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onCreateProjectClick: () => void;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProjectClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-beige-200/90 hover:bg-beige-300 border border-beige-300 text-olive-950 text-sm font-medium transition-colors shadow-sm"
      >
        <FolderGit2 className="w-4 h-4 text-olive-700" />
        <span className="max-w-[140px] truncate font-medium">
          {activeProject ? activeProject.name : 'Select Workspace'}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-beige-700 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 rounded-xl bg-beige-50 border border-beige-300 shadow-xl z-30 p-1.5 divide-y divide-beige-200">
            <div className="px-2 py-1.5 text-[11px] font-semibold text-olive-800 uppercase tracking-wider">
              Project Workspaces
            </div>
            <div className="py-1 max-h-56 overflow-y-auto space-y-0.5">
              {projects.map((proj) => {
                const isSelected = proj.id === activeProjectId;
                return (
                  <button
                    key={proj.id}
                    onClick={() => {
                      onSelectProject(proj.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-left transition-colors ${
                      isSelected
                        ? 'bg-olive-100 text-olive-900 font-semibold border border-olive-300'
                        : 'text-olive-900 hover:bg-beige-200'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="truncate">{proj.name}</div>
                      <div className="text-[10px] text-beige-700 truncate font-normal">
                        {proj.description || 'No description'}
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-olive-700 shrink-0" />}
                  </button>
                );
              })}
            </div>
            <div className="pt-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onCreateProjectClick();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-olive-700 hover:bg-olive-100 hover:text-olive-900 font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Workspace</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
