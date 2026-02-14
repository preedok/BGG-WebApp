import React from 'react';
import { CardPadding } from '../../types';

interface CardProps {
  children: React.ReactNode;
  padding?: CardPadding;
  hover?: boolean;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  hover = false,
  className = ''
}) => {
  const baseStyles = 'bg-white rounded-2xl border border-slate-200 transition-all duration-300';
  
  const paddingStyles: Record<CardPadding, string> = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const hoverStyles = hover ? 'hover:shadow-xl hover:-translate-y-1' : 'shadow-sm';

  return (
    <div className={`${baseStyles} ${paddingStyles[padding]} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
};

export default Card;