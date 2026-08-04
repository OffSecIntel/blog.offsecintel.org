import React, { useState } from 'react';
import { PORTAL_CONFIG } from '../../config';
import OffSecIntelLogoSvg from '../../assets/logo/drawing_NoText.svg';

export function OffSecIntelShieldSVG() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full text-[#970000] fill-current"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#cc0000" />
          <stop offset="100%" stopColor="#800000" />
        </linearGradient>
      </defs>
      <path
        d="M50 8 L85 22 V52 C85 73 70 89 50 95 C30 89 15 72 15 52 V22 L50 8 Z"
        fill="none"
        stroke="url(#shieldGrad)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="51" r="23" fill="none" stroke="#970000" strokeWidth="1.5" strokeDasharray="4 4" className="animate-[spin_20s_linear_infinite]" />
      <path d="M50 16 V86 M16 51 H84" stroke="#970000" strokeWidth="0.75" opacity="0.3" />
      <text x="50" y="59" fontSize="23" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" fill="url(#shieldGrad)" letterSpacing="-1">
        OSI
      </text>
    </svg>
  );
}

export function OffSecIntelLogoIcon({ className = "w-9 h-9 p-1" }: { className?: string }) {
  const [useFallback, setUseFallback] = useState(false);
  const logoUrl = OffSecIntelLogoSvg;

  return (
    <div className={`rounded-lg bg-[#970000]/10 border border-[#970000]/20 overflow-hidden flex items-center justify-center shrink-0 ${className}`}>
      {!useFallback ? (
        <img
          src={logoUrl}
          alt="OffSecIntel Logo"
          className="w-full h-full object-contain"
          onError={() => setUseFallback(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <OffSecIntelShieldSVG />
      )}
    </div>
  );
}

export function OffSecIntelLogo() {
  return (
    <div className="flex items-center gap-2.5 select-none group">
      <a
        href="https://offsecintel.org"
        target="_blank"
        rel="noopener noreferrer"
        className="cursor-pointer flex items-center"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <OffSecIntelLogoIcon className="w-9 h-9 p-1 group-hover:scale-105 transition-transform" />
      </a>
      <div className="cursor-pointer">
        <span className="font-sans font-bold tracking-tight text-slate-900 dark:text-white text-sm md:text-base leading-none">
          Off<span className="text-[#970000] dark:text-[#ff4b4b]">Sec</span>Intel
        </span>
        <p className="text-[8px] uppercase tracking-wider font-mono text-slate-400 dark:text-slate-500 font-bold leading-none mt-0.5">
          {PORTAL_CONFIG.logoText}
        </p>
      </div>
    </div>
  );
}
