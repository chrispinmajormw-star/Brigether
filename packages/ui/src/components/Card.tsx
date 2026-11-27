import React from 'react';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
};

export const Card: React.FC<CardProps> = ({ children, className = '', ...rest }) => {
  const base = 'rounded-lg border border-gray-200 bg-white shadow-sm p-4';
  return (
    <div className={`${base} ${className}`} {...rest}>
      {children}
    </div>
  );
};
