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
    : `${publicBase}/assets/images/arvea-wordmark-deep.png`;

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

  const diamondFillStart = isLightOnDark ? '#FFFFFF' : '#7E93CC';
  const diamondFillMid = isLightOnDark ? '#F8FAFC' : '#5E72AC';
  const diamondFillEnd = isLightOnDark ? '#E0E7FF' : '#4B5B96';
  const facetStroke = isLightOnDark ? '#5A4D94' : '#FFFFFF';
  const starStroke = isLightOnDark ? '#5A4D94' : '#FFFFFF';

  const DiamondMark = ({ extraClass = '' }) => (
    <svg
      viewBox="0 0 120 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${markSizes[size] || markSizes.md} shrink-0 ${
        isLightOnDark ? 'arvea-logo-glow-light' : 'arvea-logo-glow-deep'
      } ${extraClass}`}
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
        className={`${wordmarkHeights[size] || wordmarkHeights.md} w-auto object-contain select-none ${
          isLightOnDark ? 'arvea-logo-glow-light' : 'arvea-logo-glow-deep'
        }`}
      />
    ) : (
      <span
        className={`${fallbackTextSizes[size] || fallbackTextSizes.md} font-semibold tracking-[0.14em] leading-none arvea-wordmark-text ${
          isLightOnDark ? 'arvea-slogan-light' : 'arvea-slogan-deep'
        }`}
        style={{
          color: isLightOnDark ? '#FFFFFF' : '#4E4380'
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
            className={`mt-2 text-[11px] sm:text-xs font-semibold tracking-[0.05em] ${
              isLightOnDark ? 'arvea-slogan-light' : 'arvea-slogan-deep'
            }`}
          >
            Satu Nilai, Satu Tujuan, Bertumbuh Bersama
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none text-left ${className}`}>
      <DiamondMark />
      <div className="flex flex-col items-start justify-center leading-none text-left">
        <Wordmark />
        {subtitle && (
          <span
            className={`text-[10px] sm:text-[11px] font-semibold tracking-[0.03em] mt-1 leading-tight ${
              isLightOnDark ? 'arvea-slogan-light' : 'text-[#524788] dark:text-[#F8FAFC]'
            }`}
          >
            {subtitle}
          </span>
        )}
        {!subtitle && showTagline && (
          <span
            className={`text-[10px] sm:text-[11px] font-semibold tracking-[0.05em] mt-1 leading-tight ${
              isLightOnDark ? 'arvea-slogan-light' : 'arvea-slogan-deep'
            }`}
          >
            Satu Nilai, Satu Tujuan, Bertumbuh Bersama
          </span>
        )}
      </div>
    </div>
  );
}
