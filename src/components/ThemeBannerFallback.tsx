import React from 'react';
import { getThemeColorClasses } from '../theme';

interface ThemeBannerFallbackProps {
  themeColor?: string;
  category?: string;
  title?: string;
  isDark?: boolean;
  className?: string;
}

export function ThemeBannerFallback({
  themeColor = 'crimson',
  category = 'all',
  title = '',
  isDark = true,
  className = ''
}: ThemeBannerFallbackProps) {
  const theme = getThemeColorClasses(themeColor, isDark);
  
  // Choose pattern details based on category
  const renderCategoryPattern = () => {
    const primaryColor = theme.accentHex || '#f43f5e';
    const secondaryColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
    const textColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.45)';

    switch (category.toLowerCase()) {
      case 'malwarere':
        return (
          <g>
            {/* Hexagonal Node Mesh */}
            <path
              d="M 150,100 L 250,70 L 350,100 L 350,200 L 250,230 L 150,200 Z"
              fill="none"
              stroke={primaryColor}
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.3"
            />
            <path
              d="M 250,70 L 250,230"
              fill="none"
              stroke={primaryColor}
              strokeWidth="1"
              opacity="0.2"
            />
            <path
              d="M 150,100 L 350,200"
              fill="none"
              stroke={primaryColor}
              strokeWidth="1"
              opacity="0.2"
            />
            <path
              d="M 350,100 L 150,200"
              fill="none"
              stroke={primaryColor}
              strokeWidth="1"
              opacity="0.2"
            />

            {/* Inner Hexagon */}
            <path
              d="M 200,125 L 250,110 L 300,125 L 300,175 L 250,190 L 200,175 Z"
              fill={`${primaryColor}10`}
              stroke={primaryColor}
              strokeWidth="2"
              opacity="0.7"
            />

            {/* Mesh Nodes with pulsers */}
            <circle cx="250" cy="70" r="5" fill={primaryColor} />
            <circle cx="250" cy="70" r="10" fill="none" stroke={primaryColor} strokeWidth="1" opacity="0.4" className="animate-ping" style={{ animationDuration: '3s' }} />
            
            <circle cx="150" cy="100" r="4" fill={primaryColor} />
            <circle cx="350" cy="100" r="4" fill={primaryColor} />
            <circle cx="350" cy="200" r="4" fill={primaryColor} />
            <circle cx="150" cy="200" r="4" fill={primaryColor} />
            
            <circle cx="250" cy="230" r="5" fill={primaryColor} />
            <circle cx="250" cy="230" r="10" fill="none" stroke={primaryColor} strokeWidth="1" opacity="0.4" className="animate-ping" style={{ animationDuration: '4.5s' }} />

            {/* Core Node */}
            <circle cx="250" cy="150" r="7" fill={primaryColor} />
            <circle cx="250" cy="150" r="15" fill="none" stroke={primaryColor} strokeWidth="1.5" opacity="0.5" />

            {/* Cyber Assembly Data Feed Lines */}
            <g className="font-mono text-[9px]" fill={textColor} opacity="0.8">
              <text x="30" y="50">0x1009700  LDP  X20, X19, [SP, #0x10]</text>
              <text x="30" y="70">0x1009704  LDR  X8, [X20, #0x28]</text>
              <text x="30" y="90" fill={primaryColor}>0x100970C  LDR  X1, [X1, #0xAC8] // StringLiteral_13741</text>
              <text x="30" y="110">0x1009710  BL   onConversionDataSuccess</text>
              
              <text x="500" y="190">0x102C6A4  LDR  X0, [X20, #0xD8]</text>
              <text x="500" y="210" fill={primaryColor}>0x102C6AC  LDR  X1, [X1, #0x98] // "aes"</text>
              <text x="500" y="230">0x102C714  LDRSW X0, [X0, #0xBF8]</text>
            </g>

            {/* Binary Stream Border */}
            <g className="font-mono text-[8px]" fill={textColor} opacity="0.15">
              <text x="20" y="270">10100101 11010110 01101101 11100101 00101010 11001101 01101101 11100101</text>
              <text x="450" y="50">SECURE_RE_ENVIRONMENT // AGENT_ACTIVE // VERIFIED_NODE</text>
            </g>
          </g>
        );

      case 'research':
        return (
          <g>
            {/* Elegant Mathematical Post-Quantum Waves */}
            <path
              d="M 50,150 Q 200,300 350,150 T 650,150"
              fill="none"
              stroke={primaryColor}
              strokeWidth="2.5"
              opacity="0.8"
            />
            <path
              d="M 50,150 Q 200,0 350,150 T 650,150"
              fill="none"
              stroke={primaryColor}
              strokeWidth="1.5"
              strokeDasharray="5 3"
              opacity="0.4"
            />
            <path
              d="M 50,180 Q 200,80 350,180 T 650,180"
              fill="none"
              stroke={primaryColor}
              strokeWidth="1"
              opacity="0.3"
            />

            {/* Dynamic Orbit Rings */}
            <circle cx="350" cy="150" r="80" fill="none" stroke={primaryColor} strokeWidth="1" strokeDasharray="3 6" opacity="0.4" />
            <circle cx="350" cy="150" r="40" fill="none" stroke={primaryColor} strokeWidth="1.5" opacity="0.6" />
            <circle cx="350" cy="150" r="100" fill="none" stroke={secondaryColor} strokeWidth="0.75" opacity="0.2" />

            {/* Orbiting Quantum Particles */}
            <circle cx="270" cy="150" r="4" fill={primaryColor} className="animate-pulse" />
            <circle cx="350" cy="70" r="3" fill={primaryColor} />
            <circle cx="430" cy="150" r="4.5" fill={primaryColor} />
            
            {/* Geometric Axis lines */}
            <line x1="350" y1="20" x2="350" y2="280" stroke={secondaryColor} strokeWidth="0.5" strokeDasharray="5 5" opacity="0.3" />
            <line x1="50" y1="150" x2="650" y2="150" stroke={secondaryColor} strokeWidth="0.5" strokeDasharray="5 5" opacity="0.3" />

            {/* Mathematical Labels */}
            <g className="font-mono text-[9px]" fill={textColor} opacity="0.8">
              <text x="360" y="40">f(x) = ∑ (a_n cos(nx) + b_n sin(nx))</text>
              <text x="360" y="260">ψ(x, t) = A e^(i(kx - ωt))</text>
              <text x="60" y="140">|0⟩ + |1⟩</text>
              <text x="60" y="240">KYBER-1024-ENCLAVE // ACTIVE_STATE</text>
            </g>
          </g>
        );

      case 'security':
        return (
          <g>
            {/* Interlocking Secure Enclave Concentric Rings */}
            <circle cx="350" cy="150" r="110" fill="none" stroke={primaryColor} strokeWidth="1" strokeDasharray="8 8" opacity="0.25" />
            <circle cx="350" cy="150" r="90" fill="none" stroke={primaryColor} strokeWidth="1.5" opacity="0.4" />
            <circle cx="350" cy="150" r="70" fill={`${primaryColor}05`} stroke={primaryColor} strokeWidth="2" opacity="0.6" />
            <circle cx="350" cy="150" r="45" fill={`${primaryColor}10`} stroke={primaryColor} strokeWidth="3" opacity="0.8" />
            
            {/* Center Core Node */}
            <rect x="342" y="142" width="16" height="16" rx="3" fill={primaryColor} />
            <circle cx="350" cy="150" r="22" fill="none" stroke={primaryColor} strokeWidth="1" strokeDasharray="2 2" className="animate-spin" style={{ animationDuration: '12s' }} />

            {/* Crosshairs & Compass markers */}
            <line x1="350" y1="15" x2="350" y2="285" stroke={primaryColor} strokeWidth="1" opacity="0.2" />
            <line x1="215" y1="150" x2="485" y2="150" stroke={primaryColor} strokeWidth="1" opacity="0.2" />
            
            {/* Hexagonal Target Markers */}
            <polygon points="350,30 360,40 340,40" fill={primaryColor} opacity="0.7" />
            <polygon points="350,270 360,260 340,260" fill={primaryColor} opacity="0.7" />

            {/* Security Metrics and Labels */}
            <g className="font-mono text-[9px]" fill={textColor} opacity="0.8">
              <text x="60" y="50">RING_0 // KERNEL_SPACE</text>
              <text x="60" y="70" fill={primaryColor}>ENCLAVE_ISOLATION: VERIFIED</text>
              <text x="60" y="90">HYPERVISOR_ACTIVE: OK</text>
              
              <text x="490" y="210">MEM_SHIELD: FFFE_0000</text>
              <text x="490" y="230" fill={primaryColor}>INTEGRITY_CHECK: 100%</text>
              <text x="490" y="250">SYSCALL_FILTER: BPF_SECCOMP</text>
            </g>

            {/* Tech Grid details */}
            <rect x="520" y="40" width="100" height="40" rx="4" fill="none" stroke={primaryColor} strokeWidth="1" opacity="0.25" />
            <line x1="530" y1="50" x2="610" y2="50" stroke={primaryColor} strokeWidth="2" opacity="0.4" />
            <line x1="530" y1="60" x2="590" y2="60" stroke={primaryColor} strokeWidth="1" opacity="0.3" />
            <line x1="530" y1="70" x2="570" y2="70" stroke={primaryColor} strokeWidth="1" opacity="0.3" />
          </g>
        );

      default:
        return (
          <g>
            {/* High-tech Coordinate Grid / Compass scanning */}
            <circle cx="350" cy="150" r="100" fill="none" stroke={primaryColor} strokeWidth="1.5" opacity="0.4" />
            <circle cx="350" cy="150" r="105" fill="none" stroke={primaryColor} strokeWidth="0.5" strokeDasharray="3 3" opacity="0.5" />
            <circle cx="350" cy="150" r="50" fill="none" stroke={primaryColor} strokeWidth="1" opacity="0.2" />
            
            <line x1="150" y1="150" x2="550" y2="150" stroke={primaryColor} strokeWidth="1" opacity="0.3" />
            <line x1="350" y1="30" x2="350" y2="270" stroke={primaryColor} strokeWidth="1" opacity="0.3" />

            {/* Sweep radar lines */}
            <line x1="350" y1="150" x2="430" y2="90" stroke={primaryColor} strokeWidth="2" opacity="0.75" />
            
            {/* Diagonal Grid Nodes */}
            <circle cx="430" cy="90" r="4" fill={primaryColor} />
            <circle cx="430" cy="90" r="8" fill="none" stroke={primaryColor} strokeWidth="1" opacity="0.4" className="animate-ping" style={{ animationDuration: '2s' }} />

            {/* Tech details */}
            <g className="font-mono text-[9px]" fill={textColor} opacity="0.8">
              <text x="60" y="60">PORTAL_NODE: Active</text>
              <text x="60" y="80">CTI_FEED: OK</text>
              <text x="500" y="220" fill={primaryColor}>COORDINATES: 45.109, -122.680</text>
              <text x="500" y="240">STATUS: FULL_OPERATIONAL</text>
            </g>
          </g>
        );
    }
  };

  return (
    <div 
      className={`relative w-full overflow-hidden select-none flex flex-col justify-between p-6 ${theme.bgCard} border border-slate-200 dark:border-slate-800 shadow-sm ${className}`}
      style={{ minHeight: '180px' }}
    >
      {/* Background Tech Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.11]">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke={theme.accentHex || '#f43f5e'} strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Decorative Corner Brackets (Cyberpunk/Aero tech theme) */}
      <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 opacity-30" style={{ borderColor: theme.accentHex }} />
      <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 opacity-30" style={{ borderColor: theme.accentHex }} />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 opacity-30" style={{ borderColor: theme.accentHex }} />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 opacity-30" style={{ borderColor: theme.accentHex }} />

      {/* Main Dynamic Graphic Layout Container */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg viewBox="0 0 700 300" className="w-full h-full max-h-[300px] opacity-80">
          {renderCategoryPattern()}
        </svg>
      </div>

      {/* Subtle overlay gradient to blend sides smoothly */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white dark:from-[#0d1321] dark:via-transparent dark:to-[#0d1321] opacity-75 pointer-events-none" />

      {/* Content overlay (Watermark metadata) */}
      <div className="relative z-10 flex flex-col justify-between h-full pointer-events-none opacity-40">
        <div className="flex justify-between items-start">
          <div className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
            {category} // feed
          </div>
          <div className="font-mono text-[9px] text-slate-400">
            REV: 2026.07
          </div>
        </div>
        
        <div className="flex justify-between items-end mt-auto pt-16">
          <div className="font-sans text-[11px] font-bold tracking-tight text-slate-400 max-w-[280px] truncate">
            {title}
          </div>
          <div className="font-mono text-[8px] text-slate-400 text-right">
            [OFFSECINTEL_SECURE_PUBLICATION]
          </div>
        </div>
      </div>
    </div>
  );
}
