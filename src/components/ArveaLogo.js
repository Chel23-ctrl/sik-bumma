import React from 'react';

/**
 * Komponen Logo Resmi ARVÉA (Diamond + Sparkle + Tipografi ARVÉA)
 *
 * Props:
 * - variant: 'horizontal' | 'stacked' | 'mark'
 * - theme: 'lilac' | 'light' | 'dark'
 * - size: 'sm' | 'md' | 'lg'
 * - showTagline: boolean
 * - subtitle: string (opsional subtitle di bawah ARVÉA untuk mode horizontal)
 * - className: string
 */
export default function ArveaLogo({
  variant = 'horizontal',
  theme = 'lilac',
  size = 'md',
  showTagline = false,
  subtitle = '',
  className = ''
}) {
  const isLightOnDark = theme === 'light';

  const markSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-4xl sm:text-5xl'
  };

  const diamondFillStart = isLightOnDark ? '#FFFFFF' : '#A9B6E3';
  const diamondFillMid = isLightOnDark ? '#ECE8FA' : '#9A90CC';
  const diamondFillEnd = isLightOnDark ? '#D7CFF2' : '#7467B5';
  const facetStroke = isLightOnDark ? '#64589F' : '#FFFFFF';
  const starStroke = isLightOnDark ? '#64589F' : '#FFFFFF';

  const DiamondMark = ({ extraClass = '' }) => (
    <svg
      viewBox="0 0 120 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${markSizes[size] || markSizes.md} shrink-0 drop-shadow-xs ${extraClass}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`arveaGrad-${theme}-${size}`} x1="12" y1="18" x2="104" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={diamondFillStart} />
          <stop offset="52%" stopColor={diamondFillMid} />
          <stop offset="100%" stopColor={diamondFillEnd} />
        </linearGradient>
      </defs>
      <polygon
        points="31,32 82,32 98,51 56.5,98 15,51"
        fill={`url(#arveaGrad-${theme}-${size})`}
      />
      <path
        d="M15 51H98M31 32L41 51L56.5 98M82 32L72 51L56.5 98M31 32L56.5 51L82 32"
        stroke={facetStroke}
        strokeWidth="2.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M84 10 L88 24.5 L102 28.5 L88 32.5 L84 47 L80 32.5 L66 28.5 L80 24.5 Z"
        fill={`url(#arveaGrad-${theme}-${size})`}
        stroke={starStroke}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );

  const wordmarkStyle = isLightOnDark
    ? { fontFamily: "'Playfair Display', 'Georgia', 'Times New Roman', serif" }
    : {
        fontFamily: "'Playfair Display', 'Georgia', 'Times New Roman', serif",
        backgroundImage: 'linear-gradient(120deg, #524788 0%, #7D71B8 48%, #9A90CC 100%)'
      };

  if (variant === 'mark') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`} title="ARVÉA">
        <DiamondMark />
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={`inline-flex flex-col items-center text-center select-none ${className}`}>
        <DiamondMark extraClass="mb-1.5" />
        <span
          className={`${titleSizes[size] || titleSizes.lg} font-black tracking-[0.14em] leading-none ${
            isLightOnDark ? 'text-white' : 'bg-clip-text text-transparent'
          }`}
          style={wordmarkStyle}
        >
          ARVÉA
        </span>
        {showTagline && (
          <span
            className={`mt-2 text-[11px] sm:text-xs font-medium tracking-wide ${
              isLightOnDark ? 'text-white/85' : 'text-[#64589F]/85'
            }`}
          >
            Satu Nilai, Satu Tujuan, Bertumbuh Bersama
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <DiamondMark />
      <div className="flex flex-col leading-none">
        <span
          className={`${titleSizes[size] || titleSizes.md} font-black tracking-[0.12em] leading-none ${
            isLightOnDark ? 'text-white' : 'bg-clip-text text-transparent'
          }`}
          style={wordmarkStyle}
        >
          ARVÉA
        </span>
        {subtitle && (
          <span
            className={`text-[10px] font-semibold mt-1 leading-tight ${
              isLightOnDark ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {subtitle}
          </span>
        )}
        {!subtitle && showTagline && (
          <span
            className={`text-[10px] font-medium mt-1 leading-tight ${
              isLightOnDark ? 'text-white/80' : 'text-[#64589F]/80'
            }`}
          >
            Satu Nilai, Satu Tujuan, Bertumbuh Bersama
          </span>
        )}
      </div>
    </div>
  );
}
