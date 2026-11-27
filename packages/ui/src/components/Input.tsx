import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...rest }) => {
  const id = rest.id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const base = 'block w-full rounded border-gray-300 focus:border-teal focus:ring-teal';
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input id={id} className={`${base} ${error ? 'border-red-500' : ''}`} {...rest} />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
