import React from 'react';
import { motion } from 'framer-motion';

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { default: 1, sm: 2, lg: 3 },
  gap = 'md',
  className = ''
}) => {
  const getGridClasses = () => {
    const baseClasses = 'grid';
    
    // Column classes
    const colClasses = [
      cols.default ? `grid-cols-${cols.default}` : 'grid-cols-1',
      cols.sm ? `sm:grid-cols-${cols.sm}` : '',
      cols.md ? `md:grid-cols-${cols.md}` : '',
      cols.lg ? `lg:grid-cols-${cols.lg}` : '',
      cols.xl ? `xl:grid-cols-${cols.xl}` : ''
    ].filter(Boolean).join(' ');
    
    // Gap classes
    const gapClasses = {
      sm: 'gap-2 sm:gap-3',
      md: 'gap-3 sm:gap-4',
      lg: 'gap-4 sm:gap-6'
    }[gap];
    
    return `${baseClasses} ${colClasses} ${gapClasses} ${className}`.trim();
  };

  return (
    <div className={getGridClasses()}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;