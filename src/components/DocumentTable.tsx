import React, { useState } from 'react';
import { Resource } from '../types';
import { FileText, Search, RefreshCw, Trash2, CheckCircle2, FileCode2, AlertTriangle, Network } from 'lucide-react';

interface DocumentTableProps {
  resources: Resource[];
  onReindex?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({ resources, onReindex, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filtered = resources.filter((res) => {
    const matchesSearch =
      res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.file_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (res.category && res.category.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterType === 'all') return matchesSearch;
    return matchesSearch && res.source_type === filterType;
  });

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'code':
      case 'repo':
        return <FileCode2 className="w-4 h-4 text-olive-700" />;
      case 'incident':
        return <AlertTriangle className="w-4 h-4 text-amber-700" />;
      case 'diagram':
        return <Network className="w-4 h-4 text-olive-800" />;
      default:
        return <FileText className="w-4 h-4 text-olive-700" />;
    }
  };

  return (
    <div className="rounded-2xl bg-beige-50 border border-beige-300 shadow-sm overflow-hidden space-y-4 p-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between border-b border-beige-200 pb-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-beige-600" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search documents by name or path..."
            className="w-full bg-beige-100 border border-beige-300 rounded-xl pl-9 pr-3 py-2 text-xs text-olive-950 focus:outline-none focus:border-olive-600 font-mono"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
          {['all', 'markdown', 'pdf', 'code', 'incident'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono capitalize transition-all ${
                filterType === t
                  ? 'bg-olive-700 text-white font-bold shadow-sm'
                  : 'bg-beige-100 text-beige-800 hover:text-olive-950 border border-beige-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-beige-100 text-olive-900 uppercase text-[10px] font-bold tracking-wider border-b border-beige-300">
            <tr>
              <th className="px-4 py-3">Document Name</th>
              <th className="px-4 py-3">File Path</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Chunks</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-beige-200 text-olive-950">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-beige-600">
                  No matching engineering documents found.
                </td>
              </tr>
            ) : (
              filtered.map((res) => (
                <tr key={res.id} className="hover:bg-beige-100/80 transition-colors">
                  <td className="px-4 py-3 font-semibold text-olive-950 flex items-center gap-2">
                    {getSourceIcon(res.source_type)}
                    <span>{res.name}</span>
                  </td>
                  <td className="px-4 py-3 text-beige-700 truncate max-w-xs">{res.file_path}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-beige-200 text-olive-900 text-[10px] font-medium border border-beige-300">
                      {res.category || 'General'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-olive-800">{res.chunk_count}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-olive-100 text-olive-800 border border-olive-300 font-semibold">
                      <CheckCircle2 className="w-3 h-3 text-olive-700" />
                      Indexed
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onReindex && (
                        <button
                          onClick={() => onReindex(res.id)}
                          className="p-1 bg-beige-100 text-beige-800 hover:text-olive-950 rounded border border-beige-300"
                          title="Re-index"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(res.id)}
                          className="p-1 bg-beige-100 text-beige-800 hover:text-rose-700 rounded border border-beige-300"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
