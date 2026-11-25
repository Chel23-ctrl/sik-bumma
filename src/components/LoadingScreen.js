import React, { useEffect, useState } from 'react';
import ArveaLogo from './ArveaLogo';

/**
 * Fullscreen Splash / Loading Screen bergaya CoreTaxify dengan identitas visual Lilac (#9A90CC) ARVÉA.
 */
export default function LoadingScreen({
  isLoading,
  show,
  message = ''
}) {
  const active = Boolean(isLoading ?? show);
  const [shouldRender, setShouldRender] = useState(active);
  const [visible, setVisible] = useState(active);

  useEffect(() => {
    let rafId;
    let timerId;

    if (active) {
      setShouldRender(true);
      rafId = requestAnimationFrame(() => {
        rafId = requestAnimationFrame(() => {
          setVisible(true);
        });
      });
    } else {
      setVisible(false);
      timerId = setTimeout(() => {
        setShouldRender(false);
      }, 450);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (timerId) clearTimeout(timerId);
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [active]);

  if (!shouldRender) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={active}
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden select-none print:hidden transition-opacity duration-500 ease-out ${
        visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      style={{
        background:
          'linear-gradient(135deg, #E8E3F6 0%, #F5F2FB 46%, #FBF9FE 68%, #E4DDF4 100%)'
      }}
    >
      {/* Sculpted Minimalist Architectural Curves in Soft Lilac (#9A90CC) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="arveaLeftSlopeLilac" x1="0%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#D7CEEE" stopOpacity="0.85" />
            <stop offset="55%" stopColor="#EAE4F8" stopOpacity="0.68" />
            <stop offset="100%" stopColor="#F5F2FB" stopOpacity="0.35" />
          </linearGradient>

          <linearGradient id="arveaRidgeLightLilac" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#DDD6F0" stopOpacity="0.25" />
          </linearGradient>

          <linearGradient id="arveaBottomArcLilac" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9A90CC" stopOpacity="0.28" />
            <stop offset="50%" stopColor="#7C6FB8" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.65" />
          </linearGradient>

          <filter id="arveaSoftShadowLilac" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="6" dy="10" stdDeviation="14" floodColor="#4E4380" floodOpacity="0.1" />
          </filter>
        </defs>

        <path
          d="M 0,0 L 145,0 C 375,245 555,580 1070,900 L 0,900 Z"
          fill="url(#arveaLeftSlopeLilac)"
        />
        <path
          d="M 145,0 C 375,245 555,580 1070,900"
          fill="none"
          stroke="url(#arveaRidgeLightLilac)"
          strokeWidth="4"
          filter="url(#arveaSoftShadowLilac)"
        />
        <path
          d="M 149,0 C 379,245 559,580 1074,900"
          fill="none"
          stroke="#4E4380"
          strokeOpacity="0.06"
          strokeWidth="2"
        />

        <path
          d="M 1035,900 C 1105,745 1265,670 1440,665 L 1440,900 Z"
          fill="url(#arveaBottomArcLilac)"
        />
        <path
          d="M 1035,900 C 1105,745 1265,670 1440,665"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.88"
          strokeWidth="3"
        />
        <path
          d="M 1068,900 C 1132,768 1278,702 1440,698"
          fill="none"
          stroke="#64589F"
          strokeOpacity="0.12"
          strokeWidth="2"
        />
      </svg>

      {/* Embossed Circular Watermark on the Right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 sm:-right-20 md:-right-16 top-1/2 -translate-y-[58%] w-[320px] h-[320px] sm:w-[440px] sm:h-[440px] md:w-[540px] md:h-[540px] rounded-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(145deg, #F8F6FD 0%, #EAE4F7 100%)',
          boxShadow:
            '-14px -14px 32px rgba(255, 255, 255, 0.92), 18px 22px 42px rgba(78, 67, 128, 0.1), inset 6px 6px 14px rgba(255, 255, 255, 0.85)'
        }}
      >
        <div
          className="w-[82%] h-[82%] rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(145deg, #EFEBF9 0%, #FAF8FE 100%)',
            boxShadow:
              'inset 10px 12px 24px rgba(78, 67, 128, 0.08), inset -10px -10px 24px rgba(255, 255, 255, 0.92)'
          }}
        >
          <span
            className="font-black tracking-tighter text-[120px] sm:text-[165px] md:text-[210px] leading-none pr-6"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              color: '#EEEAF9',
              textShadow:
                '-4px -4px 10px rgba(255, 255, 255, 0.96), 6px 8px 16px rgba(78, 67, 128, 0.12)'
            }}
          >
            AR
          </span>
        </div>
      </div>

      {/* Subtle Ambient Lilac Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute w-72 h-72 rounded-full blur-3xl opacity-45"
        style={{
          background:
            'radial-gradient(circle, rgba(154, 144, 204, 0.24) 0%, rgba(124, 111, 184, 0.1) 55%, transparent 75%)'
        }}
      />

      {/* Hero Center: New ARVÉA Diamond Logo + Thin Indeterminate Lilac Shimmer Progress Bar */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center animate-arvea-logo">
        <ArveaLogo variant="stacked" theme="lilac" size="lg" />

        {/* Thin Indeterminate Lilac Loading Bar */}
        <div className="mt-4 w-48 sm:w-56 h-[3px] rounded-full bg-[#64589F]/15 overflow-hidden relative">
          <div
            className="absolute inset-y-0 left-0 w-1/2 rounded-full animate-arvea-progress"
            style={{
              backgroundImage:
                'linear-gradient(90deg, transparent 0%, #524788 22%, #9A90CC 55%, #C4B9E5 82%, transparent 100%)'
            }}
          />
        </div>

        {/* Optional Status Message */}
        {message && (
          <p className="mt-3.5 text-[11px] sm:text-xs font-semibold tracking-wide text-[#4E4380]/75 transition-opacity duration-300">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
