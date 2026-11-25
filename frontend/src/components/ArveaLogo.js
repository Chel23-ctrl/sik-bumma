import React, { useState } from 'react';

/**
 * Komponen Logo Resmi ARVÉA (Diamond Emblem + Exact Precision Wordmark "ARVÉA" #9DB5DC)
 *
 * Menggunakan potongan wordmark PNG transparan resolusi tinggi dari acuan asli ARVÉA
 * (dengan fallback otomatis ke Google Font 'Bodoni Moda' editorial serif #9DB5DC).
 *
 * Props:
 * - variant: 'horizontal' | 'stacked' | 'mark' | 'wordmark'
 * - theme: 'lilac' | 'periwinkle' | 'light' | 'dark'
 * - size: 'sm' | 'md' | 'lg'
 * - showTagline: boolean
 * - subtitle: string
 * - className: string
 */
export default function ArveaLogo({
  variant = 'horizontal',
  theme = 'periwinkle',
  size = 'md',
  showTagline = false,
  subtitle = '',
  className = ''
}) {
  const [imgError, setImgError] = useState(false);
  const isLightOnDark = theme === 'light';
  const publicBase = process.env.PUBLIC_URL || '';

  const wordmarkSrc = isLightOnDark
    ? `${publicBase}/assets/images/arvea-wordmark-white.png`
    : `${publicBase}/assets/images/arvea-wordmark.png`;

  const markSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-16 h-16'
  };

  const wordmarkHeights = {
    sm: 'h-5 sm:h-[22px]',
    md: 'h-7 sm:h-8',
    lg: 'h-12 sm:h-14'
  };

  const fallbackTextSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl sm:text-5xl'
  };

  const diamondFillStart = isLightOnDark ? '#FFFFFF' : '#A9C2EB';
  const diamondFillMid = isLightOnDark ? '#F1F5FC' : '#9DB5DC';
  const diamondFillEnd = isLightOnDark ? '#DCE6F7' : '#859FCE';
  const facetStroke = isLightOnDark ? '#64589F' : '#FFFFFF';
  const starStroke = isLightOnDark ? '#64589F' : '#FFFFFF';

  const DiamondMark = ({ extraClass = '' }) => (
    <svg
      viewBox="0 0 120 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${markSizes[size] || markSizes.md} shrink-0 ${extraClass}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`arveaDiamond-${theme}-${size}`}
          x1="12"
          y1="18"
          x2="104"
          y2="100"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={diamondFillStart} />
          <stop offset="52%" stopColor={diamondFillMid} />
          <stop offset="100%" stopColor={diamondFillEnd} />
        </linearGradient>
      </defs>
      <polygon
        points="31,32 82,32 98,51 56.5,98 15,51"
        fill={`url(#arveaDiamond-${theme}-${size})`}
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
        fill={`url(#arveaDiamond-${theme}-${size})`}
        stroke={starStroke}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );

  const Wordmark = () =>
    !imgError ? (
      <img
        src={wordmarkSrc}
        alt="ARVÉA"
        onError={() => setImgError(true)}
        draggable={false}
        className={`${wordmarkHeights[size] || wordmarkHeights.md} w-auto object-contain select-none`}
      />
    ) : (
      <span
        className={`${fallbackTextSizes[size] || fallbackTextSizes.md} font-semibold tracking-[0.14em] leading-none arvea-wordmark-text`}
        style={{
          color: isLightOnDark ? '#FFFFFF' : '#9DB5DC'
        }}
      >
        ARVÉA
      </span>
    );

  if (variant === 'mark') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`} title="ARVÉA">
        <DiamondMark />
      </div>
    );
  }

  if (variant === 'wordmark') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <Wordmark />
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={`inline-flex flex-col items-center text-center select-none ${className}`}>
        <DiamondMark extraClass="mb-2" />
        <Wordmark />
        {showTagline && (
          <span
            className={`mt-2 text-[11px] sm:text-xs font-medium tracking-wide ${
              isLightOnDark ? 'text-white/90' : 'text-[#849BC7]'
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
      <div className="flex flex-col justify-center leading-none">
        <Wordmark />
        {subtitle && (
          <span
            className={`text-[10px] font-semibold mt-1 leading-tight ${
              isLightOnDark ? 'text-white/85' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {subtitle}
          </span>
        )}
        {!subtitle && showTagline && (
          <span
            className={`text-[10px] font-medium mt-1 leading-tight ${
              isLightOnDark ? 'text-white/85' : 'text-[#849BC7]'
            }`}
          >
            Satu Nilai, Satu Tujuan, Bertumbuh Bersama
          </span>
        )}
      </div>
    </div>
  );
}
