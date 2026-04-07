import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface AlertProps {
  message: string;
  type: 'warning' | 'success' | 'info';
}

export const Alert: React.FC<AlertProps> = ({ message, type }) => {
  const styles = {
    warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
    success: "bg-green-50 text-green-800 border-green-200",
    info: "bg-blue-50 text-blue-800 border-blue-200"
  };
  
  const icons = {
    warning: <AlertTriangle className="w-5 h-5 mr-2" />,
    success: <CheckCircle className="w-5 h-5 mr-2" />,
    info: <div className="w-5 h-5 mr-2 text-blue-500 font-bold">i</div>
  };

  return (
    <div className={`flex items-start p-3 rounded-md border ${styles[type]}`}>
      {icons[type]}
      <span className="text-sm">{message}</span>
    </div>
  );
};
