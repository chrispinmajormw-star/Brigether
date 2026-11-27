import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'gold';
  children: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  className = '',
  children,
  ...rest
}) => {
  const base = 'rounded px-4 py-2 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
  const variants: Record<string, string> = {
    primary: 'bg-teal text-white hover:bg-teal/90',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    gold: 'bg-gold text-white hover:bg-gold/90',
  };
  const classes = `${base} ${variants[variant]} ${className}`;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
};
