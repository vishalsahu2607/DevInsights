import React, { useState } from 'react';
import { Repository } from '../types';
import { RepositoryCard } from '../components/RepositoryCard';
import { EmptyState } from '../components/EmptyState';
import { GitFork, Plus, Github, FileArchive, Loader2, RefreshCw } from 'lucide-react';

interface RepositoriesPageProps {
  repositories: Repository[];
  onAddGithubRepo: (url: string, name?: string, branch?: string) => Promise<void>;
  onUploadZipRepo: (file: File) => Promise<void>;
  onDeleteRepo: (id: string) => Promise<void>;
}

export const RepositoriesPage: React.FC<RepositoriesPageProps> = ({
  repositories,
  onAddGithubRepo,
  onUploadZipRepo,
  onDeleteRepo,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [repoName, setRepoName] = useState('');
  const [branch, setBranch] = useState('main');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitGithub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl.trim()) return;
    setIsLoading(true);
    try {
      await onAddGithubRepo(githubUrl.trim(), repoName.trim() || undefined, branch.trim() || 'main');
      setGithubUrl('');
      setRepoName('');
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleZipChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsLoading(true);
      try {
        await onUploadZipRepo(e.target.files[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-mono">
            <GitFork className="w-5 h-5 text-cyan-400" />
            <span>Code Repositories</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Connect GitHub repositories or upload source code ZIP archives for vector indexing
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium border border-slate-700 cursor-pointer transition-all">
            <FileArchive className="w-4 h-4 text-cyan-400" />
            <span>Upload ZIP</span>
            <input type="file" accept=".zip" onChange={handleZipChange} className="hidden" />
          </label>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-md transition-all"
          >
            <Github className="w-4 h-4" />
            <span>Add GitHub Repo</span>
          </button>
        </div>
      </div>

      {/* Repositories Grid */}
      {repositories.length === 0 ? (
        <EmptyState
          title="No Repositories Indexed"
          description="Connect a GitHub repository or upload a ZIP archive to index your codebase into the vector store."
          icon={GitFork}
          actionLabel="Add GitHub Repository"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {repositories.map((repo) => (
            <RepositoryCard
              key={repo.id}
              repository={repo}
              onDelete={onDeleteRepo}
              onReindex={(id) => alert(`Re-indexing repository ${id}...`)}
            />
          ))}
        </div>
      )}

      {/* GitHub Repo Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 font-mono">
                <Github className="w-5 h-5 text-cyan-400" /> Index GitHub Repository
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitGithub} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">GitHub Repository URL *</label>
                <input
                  type="text"
                  required
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/org/repo.git"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Custom Display Name</label>
                  <input
                    type="text"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    placeholder="e.g. backend-api"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Branch</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="main"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 bg-slate-950 hover:bg-slate-800 border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold flex items-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Index Repository'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
