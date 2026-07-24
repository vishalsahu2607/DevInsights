import React, { useState } from 'react';
import { UploadBox } from '../components/UploadBox';
import { SourceType } from '../types';
import { Sparkles, CheckCircle2, AlertCircle, FileCode, ArrowLeft } from 'lucide-react';

interface UploadPageProps {
  activeProjectId: string;
  onUploadFile: (file: File, sourceType: SourceType, category: string) => Promise<void>;
  onPasteContent: (content: string, fileName: string, sourceType: SourceType, category: string) => Promise<void>;
  isUploading: boolean;
  onNavigateToDocs: () => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({
  activeProjectId,
  onUploadFile,
  onPasteContent,
  isUploading,
  onNavigateToDocs,
}) => {
  return (
    <div className="space-y-6 pb-12 text-olive-950">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-beige-50 border border-beige-300 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-olive-950 flex items-center gap-2">
            <span>Upload Engineering Knowledge</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-olive-100 text-olive-800 border border-olive-300 font-bold">
              RAG Ingestion
            </span>
          </h2>
          <p className="text-xs text-beige-700 font-mono mt-1">
            Add PDF guides, source files, ZIP repositories, architecture diagrams, or incident reports
          </p>
        </div>

        <button
          onClick={onNavigateToDocs}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-beige-200 hover:bg-beige-300 text-olive-950 text-xs font-mono font-medium border border-beige-300 transition-all self-start sm:self-auto"
        >
          <FileCode className="w-4 h-4 text-olive-700" />
          <span>View Indexed Documents</span>
        </button>
      </div>

      {/* Upload Zone */}
      <UploadBox
        onUploadFile={onUploadFile}
        onPasteContent={onPasteContent}
        isUploading={isUploading}
      />

      {/* Guidelines Card */}
      <div className="rounded-2xl bg-beige-50 border border-beige-300 p-6 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-olive-950 font-mono flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-olive-700" /> Ingestion & Processing Guidelines
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-olive-900">
          <div className="p-3 rounded-xl bg-beige-100 border border-beige-300 space-y-1">
            <span className="text-olive-700 font-bold">1. Text Parsing</span>
            <p className="text-beige-700 text-[11px]">
              Extracts headings, paragraphs, functions, classes, line numbers, and comments.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-beige-100 border border-beige-300 space-y-1">
            <span className="text-olive-700 font-bold">2. Chunking</span>
            <p className="text-beige-700 text-[11px]">
              Divides files into 800-character segments with 150-character boundary overlap.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-beige-100 border border-beige-300 space-y-1">
            <span className="text-olive-700 font-bold">3. Vector Indexing</span>
            <p className="text-beige-700 text-[11px]">
              Stores embeddings in ChromaDB for fast semantic similarity retrieval during chat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
