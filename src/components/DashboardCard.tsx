import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  subtitle?: string;
  badge?: string;
  color?: 'cyan' | 'purple' | 'blue' | 'emerald' | 'amber';
  onClick?: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  badge,
  color = 'cyan',
  onClick,
}) => {
  const colorMap = {
    cyan: 'bg-olive-100 text-olive-800 border-olive-300',
    purple: 'bg-beige-200 text-olive-900 border-beige-300',
    blue: 'bg-olive-200 text-olive-900 border-olive-300',
    emerald: 'bg-olive-100 text-olive-800 border-olive-300',
    amber: 'bg-amber-100/80 text-amber-900 border-amber-300',
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-beige-50 border border-beige-300 p-5 shadow-sm hover:border-olive-400 hover:shadow-md transition-all ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-beige-700 uppercase tracking-wider">{title}</p>
          <div className="text-2xl lg:text-3xl font-extrabold text-olive-950 tracking-tight font-mono">
            {value}
          </div>
          {subtitle && <p className="text-xs text-beige-600 font-normal">{subtitle}</p>}
        </div>

        <div className={`p-3 rounded-xl ${colorMap[color]} border shadow-inner`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {badge && (
        <div className="mt-4 pt-3 border-t border-beige-200 flex items-center justify-between text-[11px] font-mono">
          <span className="text-beige-600">Indexed Engine</span>
          <span className="px-2 py-0.5 rounded bg-beige-200 text-olive-800 font-semibold border border-beige-300">
            {badge}
          </span>
        </div>
      )}
    </div>
  );
};
