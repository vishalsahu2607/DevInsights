import React from 'react';
import { Resource } from '../types';
import { DocumentTable } from '../components/DocumentTable';
import { FileCode2, Upload, BookOpen } from 'lucide-react';

interface DocumentsPageProps {
  resources: Resource[];
  onReindex: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onNavigateToUpload: () => void;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({
  resources,
  onReindex,
  onDelete,
  onNavigateToUpload,
}) => {
  return (
    <div className="space-y-6 pb-12 text-olive-950">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-beige-50 border border-beige-300 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-olive-950 flex items-center gap-2 font-mono">
            <BookOpen className="w-5 h-5 text-olive-700" />
            <span>Technical Documentation & Knowledge Chunks</span>
          </h2>
          <p className="text-xs text-beige-700 font-mono mt-1">
            Browse all indexed technical resources, PDF manuals, markdown guides, and code chunks
          </p>
        </div>

        <button
          onClick={onNavigateToUpload}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-olive-700 hover:bg-olive-800 text-white font-semibold text-xs shadow-md shadow-olive-900/20 transition-all self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Document Table */}
      <DocumentTable resources={resources} onReindex={onReindex} onDelete={onDelete} />
    </div>
  );
};
