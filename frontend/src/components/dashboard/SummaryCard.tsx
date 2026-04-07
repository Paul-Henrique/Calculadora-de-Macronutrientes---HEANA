import React from 'react';

interface SummaryCardProps {
  title: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, current, target, unit, color }) => {
  const percent = Math.min(100, (current / target) * 100);
  const colorMap: Record<string, string> = {
    blue: 'border-blue-500 bg-blue-500',
    indigo: 'border-indigo-500 bg-indigo-500',
    emerald: 'border-emerald-500 bg-emerald-500',
    amber: 'border-amber-500 bg-amber-500',
  };

  const borderColor = colorMap[color]?.split(' ')[0] || 'border-gray-500';
  const bgColor = colorMap[color]?.split(' ')[1] || 'bg-gray-500';

  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm border-l-4 ${borderColor}`}>
      <div className="text-sm text-gray-500 mb-1">{title}</div>
      <div className="flex items-end space-x-2">
        <span className="text-2xl font-bold text-gray-900">{Math.round(current)}</span>
        <span className="text-sm text-gray-400 mb-1">/ {Math.round(target)} {unit}</span>
      </div>
      <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
        <div 
          className={`h-1.5 rounded-full ${bgColor} transition-all duration-500`} 
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
};
