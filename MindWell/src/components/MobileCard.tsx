import React from 'react';
import { motion } from 'framer-motion';

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  onClick?: () => void;
  disabled?: boolean;
}

const MobileCard: React.FC<MobileCardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  rounded = 'xl',
  onClick,
  disabled = false
}) => {
  const getPaddingClasses = () => {
    switch (padding) {
      case 'sm': return 'p-3 sm:p-4';
      case 'md': return 'p-4 sm:p-6';
      case 'lg': return 'p-6 sm:p-8';
      default: return 'p-4 sm:p-6';
    }
  };

  const getShadowClasses = () => {
    switch (shadow) {
      case 'sm': return 'shadow-sm';
      case 'md': return 'shadow-md';
      case 'lg': return 'shadow-lg';
      default: return 'shadow-md';
    }
  };

  const getRoundedClasses = () => {
    switch (rounded) {
      case 'sm': return 'rounded-sm';
      case 'md': return 'rounded-md';
      case 'lg': return 'rounded-lg';
      case 'xl': return 'rounded-xl';
      case '2xl': return 'rounded-2xl';
      default: return 'rounded-xl';
    }
  };

  const baseClasses = `
    bg-white border border-gray-100
    ${getPaddingClasses()}
    ${getShadowClasses()}
    ${getRoundedClasses()}
    ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow duration-200' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `.trim();

  const CardComponent = onClick ? motion.div : 'div';

  const cardProps = onClick ? {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    onClick: disabled ? undefined : onClick,
    className: baseClasses
  } : {
    className: baseClasses
  };

  return (
    <CardComponent {...cardProps}>
      {children}
    </CardComponent>
  );
};

export default MobileCard;
