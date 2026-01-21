import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <circle cx="50" cy="50" r="45" className="fill-emerald-600" />
    <path d="M20 50 L50 20 L80 50" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="35" y="45" width="30" height="35" rx="4" fill="white" />
    <circle cx="50" cy="65" r="8" className="fill-emerald-600" />
    <path d="M15 70 Q50 90 85 70" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
  </svg>
);
