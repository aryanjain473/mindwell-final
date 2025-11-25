import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatItem {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  color?: string;
  bgColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

interface MobileStatsProps {
  stats: StatItem[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

const MobileStats: React.FC<MobileStatsProps> = ({
  stats,
  columns = 2,
  className = ''
}) => {
  const getGridClasses = () => {
    const baseClasses = 'grid gap-3 sm:gap-4';
    
    switch (columns) {
      case 1: return `${baseClasses} grid-cols-1`;
      case 2: return `${baseClasses} grid-cols-2`;
      case 3: return `${baseClasses} grid-cols-1 sm:grid-cols-3`;
      case 4: return `${baseClasses} grid-cols-2 sm:grid-cols-4`;
      default: return `${baseClasses} grid-cols-2`;
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      case 'neutral': return '→';
      default: return '';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={`${getGridClasses()} ${className}`}>
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between mb-2">
            {stat.icon && (
              <div className={`p-2 rounded-lg ${stat.bgColor || 'bg-gray-100'}`}>
                <stat.icon className={`h-4 w-4 ${stat.color || 'text-gray-600'}`} />
              </div>
            )}
            {stat.trend && (
              <div className={`text-xs font-medium ${getTrendColor(stat.trend)}`}>
                {getTrendIcon(stat.trend)} {stat.trendValue}
              </div>
            )}
          </div>
          
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stat.value}
          </div>
          
          <div className="text-sm text-gray-600">
            {stat.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MobileStats;
