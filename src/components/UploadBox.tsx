import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Code2, AlertTriangle, Network, CheckCircle2, Loader2, FileArchive } from 'lucide-react';
import { SourceType } from '../types';

interface UploadBoxProps {
  onUploadFile: (file: File, sourceType: SourceType, category: string) => Promise<void>;
  onPasteContent?: (content: string, fileName: string, sourceType: SourceType, category: string) => Promise<void>;
  isUploading: boolean;
}

export const UploadBox: React.FC<UploadBoxProps> = ({ onUploadFile, onPasteContent, isUploading }) => {
  const [selectedType, setSelectedType] = useState<SourceType>('pdf');
  const [category, setCategory] = useState('General');
  const [dragActive, setDragActive] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteFileName, setPasteFileName] = useState('custom_guide.md');
  const [pasteText, setPasteText] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await triggerUpload(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await triggerUpload(file);
    }
  };

  const triggerUpload = async (file: File) => {
    setUploadSuccess(null);
    try {
      await onUploadFile(file, selectedType, category);
      setUploadSuccess(`Successfully indexed "${file.name}" into Chroma Vector store!`);
      setTimeout(() => setUploadSuccess(null), 4000);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteText.trim() || !onPasteContent) return;
    setUploadSuccess(null);
    try {
      await onPasteContent(pasteText, pasteFileName, selectedType, category);
      setPasteText('');
      setUploadSuccess(`Successfully processed raw snippet as "${pasteFileName}"!`);
      setTimeout(() => setUploadSuccess(null), 4000);
    } catch (err: any) {
      console.error(err);
    }
  };

  const sourceTypes: { type: SourceType; label: string; icon: React.ElementType }[] = [
    { type: 'pdf', label: 'PDF / DOCX', icon: FileText },
    { type: 'code', label: 'Source Code', icon: Code2 },
    { type: 'repo', label: 'Repo ZIP', icon: FileArchive },
    { type: 'diagram', label: 'Diagram', icon: Network },
    { type: 'incident', label: 'Incident Report', icon: AlertTriangle },
  ];

  return (
    <div className="rounded-2xl bg-beige-50 border border-beige-300 p-6 shadow-sm space-y-6">
      {/* Type Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-beige-200">
        <span className="text-xs font-mono text-beige-700 mr-2 uppercase font-semibold">Knowledge Category:</span>
        {sourceTypes.map((item) => {
          const Icon = item.icon;
          const isSel = selectedType === item.type;
          return (
            <button
              key={item.type}
              type="button"
              onClick={() => setSelectedType(item.type)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isSel
                  ? 'bg-olive-100 text-olive-900 border border-olive-300 font-semibold shadow-sm'
                  : 'bg-beige-100 text-beige-700 hover:text-olive-950 border border-beige-300'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSel ? 'text-olive-700' : 'text-beige-600'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Category input */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-1/2">
          <label className="block text-xs font-mono text-beige-700 mb-1 font-semibold">
            Category Tag / Module Name
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Authentication, Payments, Core API"
            className="w-full bg-beige-100 border border-beige-300 rounded-xl px-3 py-2 text-xs text-olive-950 focus:outline-none focus:border-olive-600 font-mono"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPasteMode(false)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              !pasteMode ? 'bg-olive-700 text-white font-bold' : 'bg-beige-200 text-beige-800'
            }`}
          >
            File Upload
          </button>
          <button
            type="button"
            onClick={() => setPasteMode(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              pasteMode ? 'bg-olive-700 text-white font-bold' : 'bg-beige-200 text-beige-800'
            }`}
          >
            Raw Code / Text Paste
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {uploadSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-olive-100 border border-olive-300 text-olive-900 text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 text-olive-700 shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Upload Zone */}
      {!pasteMode ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
            dragActive
              ? 'border-olive-600 bg-olive-50'
              : 'border-beige-300 hover:border-olive-400 bg-beige-100/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.docx,.txt,.md,.ts,.js,.py,.go,.json,.zip,.png,.jpg"
          />

          <div className="p-4 rounded-full bg-beige-200 border border-beige-300 text-olive-700 shadow-inner">
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-olive-950">
              {isUploading ? 'Parsing & Indexing Vectors...' : 'Click to upload or drag & drop files'}
            </p>
            <p className="text-xs text-beige-700 mt-1 font-mono">
              Supported: PDF, DOCX, TXT, Markdown, Source Code (.ts, .py, .go), ZIP repos, Architecture Diagrams
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handlePasteSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-mono text-beige-700 mb-1 font-semibold">
              Virtual File Name
            </label>
            <input
              type="text"
              value={pasteFileName}
              onChange={(e) => setPasteFileName(e.target.value)}
              className="w-full bg-beige-100 border border-beige-300 rounded-xl px-3 py-2 text-xs text-olive-950 focus:outline-none focus:border-olive-600 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-beige-700 mb-1 font-semibold">
              Raw Content
            </label>
            <textarea
              rows={6}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste code snippet, troubleshooting notes, or markdown guide..."
              className="w-full bg-beige-100 border border-beige-300 rounded-xl p-3 text-xs text-olive-950 font-mono focus:outline-none focus:border-olive-600"
            />
          </div>
          <button
            type="submit"
            disabled={!pasteText.trim() || isUploading}
            className="px-4 py-2 rounded-xl bg-olive-700 hover:bg-olive-800 text-white font-medium text-xs shadow-md shadow-olive-900/20 disabled:opacity-50"
          >
            {isUploading ? 'Chunking & Indexing...' : 'Index Text Snippet'}
          </button>
        </form>
      )}
    </div>
  );
};
