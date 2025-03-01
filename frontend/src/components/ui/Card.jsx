// Card.js
import React from 'react';

export const Card = ({ children, className }) => {
  return (
    <div className={`flex flex-col items-center shadow-lg p-6 rounded-lg bg-white ${className}`}>
      {children}
    </div>
  );
};
