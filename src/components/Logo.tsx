import React from 'react';
import { Cpu, Sparkles } from 'lucide-react';

interface LogoProps {
  collapsed?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ collapsed = false, size = 'md' }) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative flex items-center justify-center">
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-olive-600 via-olive-500 to-beige-400 blur-sm opacity-60 animate-pulse" />
        <div className={`relative flex items-center justify-center ${iconSizes[size]} rounded-xl bg-olive-950 border border-olive-500/40 text-olive-300 shadow-inner`}>
          <Cpu className="w-1/2 h-1/2" />
          <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-beige-300 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
      </div>
      {!collapsed && (
        <div className="flex flex-col">
          <div className={`font-extrabold tracking-tight ${textSizes[size]} text-olive-950`}>
            DEV<span className="text-olive-700">INSIGHTS</span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-beige-700 font-mono -mt-1">
            RAG Engineering Hub
          </span>
        </div>
      )}
    </div>
  );
};
