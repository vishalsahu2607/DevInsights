import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <AlertTriangle className="w-5 h-5 text-rose-400" />,
    info: <Info className="w-5 h-5 text-cyan-400" />,
  };

  const borderColors = {
    success: 'border-emerald-500/40 bg-slate-900',
    error: 'border-rose-500/40 bg-slate-900',
    info: 'border-cyan-500/40 bg-slate-900',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full p-4 rounded-2xl border shadow-2xl transition-all animate-bounce-subtle flex items-start justify-between gap-3 bg-slate-900 border-slate-700">
      <div className="flex items-start gap-3">
        {icons[toast.type]}
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-slate-100">{toast.title}</h4>
          {toast.message && <p className="text-[11px] text-slate-400 font-mono">{toast.message}</p>}
        </div>
      </div>
      <button onClick={onClose} className="text-slate-400 hover:text-white p-0.5">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
