import React from 'react';

interface ProgressBarProps {
  label: string;
  percent: number;
  color: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ label, percent, color }) => {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-medium text-gray-700">{Math.round(percent)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full ${color} transition-all duration-500`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
};
