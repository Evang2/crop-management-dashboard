// Input.js (UI Component)
import React from 'react';

export const Input = ({ value, onChange, className, placeholder }) => {
  return (
    <input
      value={value}
      onChange={onChange}
      className={`p-3 bg-white text-black border-2 rounded-lg ${className}`}
      placeholder={placeholder}
    />
  );
};
