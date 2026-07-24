import React, { useState } from 'react';
import { ArchitectureDiagram } from '../types';
import { ArchitectureViewer } from '../components/ArchitectureViewer';
import { EmptyState } from '../components/EmptyState';
import { Network, UploadCloud, Loader2 } from 'lucide-react';

interface ArchitecturePageProps {
  diagrams: ArchitectureDiagram[];
  onUploadDiagram: (file: File) => Promise<void>;
}

export const ArchitecturePage: React.FC<ArchitecturePageProps> = ({
  diagrams,
  onUploadDiagram,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      try {
        await onUploadDiagram(e.target.files[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-mono">
            <Network className="w-5 h-5 text-purple-400" />
            <span>Architecture Specs & System Diagrams</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Multimodal analysis of architecture diagrams to extract services, databases, and API dependency graphs
          </p>
        </div>

        <label className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md cursor-pointer transition-all self-start sm:self-auto">
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
          <span>Upload Architecture Diagram</span>
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.svg,.pdf"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Diagrams List */}
      {diagrams.length === 0 ? (
        <EmptyState
          title="No Architecture Specs Found"
          description="Upload system architecture diagrams or specs to allow DevInsights to extract microservice dependencies."
          icon={Network}
        />
      ) : (
        <div className="space-y-6">
          {diagrams.map((diag) => (
            <ArchitectureViewer key={diag.id} diagram={diag} />
          ))}
        </div>
      )}
    </div>
  );
};
