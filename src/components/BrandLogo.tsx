import React from 'react';

interface BrandLogoProps {
  compact?: boolean;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ compact = false, onClick }) => {
  const content = (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 select-none">
      <svg
        width="32"
        height="32"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="nvLogoGrad" x1="2" y1="2" x2="34" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="52%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
        <rect
          x="1.5"
          y="1.5"
          width="33"
          height="33"
          rx="9"
          fill="#101629"
          stroke="url(#nvLogoGrad)"
          strokeWidth="1.5"
        />
        {/* Stylised bilateral hemispheres + axial scan aperture */}
        <path
          d="M17 9.5C13.2 9.5 10.5 12.1 10.5 15.6C10.5 17.3 11.2 18.8 12.2 19.8C11.1 21 10.8 22.8 11.7 24.4C12.6 25.9 14.5 26.7 17 26.5V9.5Z"
          stroke="url(#nvLogoGrad)"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M19 9.5C22.8 9.5 25.5 12.1 25.5 15.6C25.5 17.3 24.8 18.8 23.8 19.8C24.9 21 25.2 22.8 24.3 24.4C23.4 25.9 21.5 26.7 19 26.5V9.5Z"
          stroke="url(#nvLogoGrad)"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <line x1="8" y1="18" x2="28" y2="18" stroke="#22D3EE" strokeWidth="1.2" strokeOpacity="0.65" />
        <circle cx="14" cy="14.5" r="1.4" fill="#A855F7" />
        <circle cx="22" cy="14.5" r="1.4" fill="#22D3EE" />
        <circle cx="14.5" cy="22" r="1.2" fill="#3B82F6" />
        <circle cx="21.5" cy="22" r="1.2" fill="#A855F7" />
      </svg>
      {!compact && (
        <span className="font-display text-lg font-bold tracking-tight text-[#F8FAFC]">
          NeuroVision{' '}
          <span className="bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#22D3EE] bg-clip-text text-transparent">
            AI
          </span>
        </span>
      )}
    </span>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] rounded-lg"
        aria-label="NeuroVision AI Home"
      >
        {content}
      </button>
    );
  }
  return content;
};
