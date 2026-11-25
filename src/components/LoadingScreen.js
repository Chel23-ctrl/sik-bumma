import React, { useEffect, useState } from 'react';

/**
 * Fullscreen Splash / Loading Screen bergaya CoreTaxify dengan identitas visual ARVEA.
 *
 * Props:
 * - isLoading (boolean): Mengontrol visibilitas loading screen.
 * - show (boolean): Alias opsional untuk isLoading.
 * - message (string): Teks status kecil opsional di bawah progress bar (mis. "Memuat data...").
 * - brandName (string): Nama brand utama di tengah layar (default: "ARVEA").
 */
export default function LoadingScreen({
  isLoading,
  show,
  message = '',
  brandName = 'ARVEA'
}) {
  const active = Boolean(isLoading ?? show);
  const [shouldRender, setShouldRender] = useState(active);
  const [visible, setVisible] = useState(active);

  useEffect(() => {
    let rafId;
    let timerId;

    if (active) {
      setShouldRender(true);
      // Trigger smooth fade-in on next animation frame
      rafId = requestAnimationFrame(() => {
        rafId = requestAnimationFrame(() => {
          setVisible(true);
        });
      });
    } else {
      setVisible(false);
      // Wait for opacity transition before unmounting
      timerId = setTimeout(() => {
        setShouldRender(false);
      }, 450);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (timerId) clearTimeout(timerId);
    };
  }, [active]);

  // Prevent background scrolling while overlay is active
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
          'linear-gradient(135deg, #e7f1ec 0%, #f5faf7 46%, #fbfdfb 68%, #e9f3ee 100%)'
      }}
    >
      {/* Sculpted Minimalist Architectural Curves (CoreTaxify-inspired in soft green off-white) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          {/* Left sculpted panel gradient */}
          <linearGradient id="arveaLeftSlope" x1="0%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#d7e8df" stopOpacity="0.82" />
            <stop offset="55%" stopColor="#e8f3ed" stopOpacity="0.68" />
            <stop offset="100%" stopColor="#f3f9f6" stopOpacity="0.35" />
          </linearGradient>

          {/* Subtle ridge highlight */}
          <linearGradient id="arveaRidgeLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#d1fae5" stopOpacity="0.2" />
          </linearGradient>

          {/* Bottom-right translucent curved ribbon */}
          <linearGradient id="arveaBottomArc" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0a3a2a" stopOpacity="0.14" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.65" />
          </linearGradient>

          {/* Soft shadow filter for architectural depth */}
          <filter id="arveaSoftShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="6" dy="10" stdDeviation="14" floodColor="#0a3a2a" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Sweeping left-to-bottom diagonal curve */}
        <path
          d="M 0,0 L 145,0 C 375,245 555,580 1070,900 L 0,900 Z"
          fill="url(#arveaLeftSlope)"
        />

        {/* Raised ridge highlight along the curve */}
        <path
          d="M 145,0 C 375,245 555,580 1070,900"
          fill="none"
          stroke="url(#arveaRidgeLight)"
          strokeWidth="4"
          filter="url(#arveaSoftShadow)"
        />
        <path
          d="M 149,0 C 379,245 559,580 1074,900"
          fill="none"
          stroke="#0a3a2a"
          strokeOpacity="0.045"
          strokeWidth="2"
        />

        {/* Bottom-right glossy curved accent */}
        <path
          d="M 1035,900 C 1105,745 1265,670 1440,665 L 1440,900 Z"
          fill="url(#arveaBottomArc)"
        />
        <path
          d="M 1035,900 C 1105,745 1265,670 1440,665"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.85"
          strokeWidth="3"
        />
        <path
          d="M 1068,900 C 1132,768 1278,702 1440,698"
          fill="none"
          stroke="#0f766e"
          strokeOpacity="0.09"
          strokeWidth="2"
        />
      </svg>

      {/* Embossed Circular "AR" Watermark on the Right (CoreTaxify-style architectural relief) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 sm:-right-20 md:-right-16 top-1/2 -translate-y-[58%] w-[320px] h-[320px] sm:w-[440px] sm:h-[440px] md:w-[540px] md:h-[540px] rounded-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(145deg, #f8fcf9 0%, #eaf3ee 100%)',
          boxShadow:
            '-14px -14px 32px rgba(255, 255, 255, 0.9), 18px 22px 42px rgba(10, 58, 42, 0.085), inset 6px 6px 14px rgba(255, 255, 255, 0.85)'
        }}
      >
        <div
          className="w-[82%] h-[82%] rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(145deg, #eef6f1 0%, #f9fcfa 100%)',
            boxShadow:
              'inset 10px 12px 24px rgba(10, 58, 42, 0.065), inset -10px -10px 24px rgba(255, 255, 255, 0.92)'
          }}
        >
          <span
            className="font-black tracking-tighter text-[120px] sm:text-[165px] md:text-[210px] leading-none pr-6"
            style={{
              color: '#eef6f2',
              textShadow:
                '-4px -4px 10px rgba(255, 255, 255, 0.95), 6px 8px 16px rgba(10, 58, 42, 0.09)'
            }}
          >
            AR
          </span>
        </div>
      </div>

      {/* Subtle Ambient Brand Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute w-72 h-72 rounded-full blur-3xl opacity-45"
        style={{
          background:
            'radial-gradient(circle, rgba(16, 185, 129, 0.14) 0%, rgba(245, 158, 11, 0.06) 55%, transparent 75%)'
        }}
      />

      {/* Hero Center: Brand Wordmark + Thin Indeterminate Shimmer Progress Bar */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center animate-arvea-logo">
        {/* Wordmark */}
        <div className="flex items-center gap-2.5">
          <span
            className="text-4xl sm:text-5xl font-black tracking-[0.06em] bg-clip-text text-transparent"
            style={{
              backgroundImage:
                'linear-gradient(90deg, #064e3b 0%, #0a3a2a 24%, #059669 58%, #10b981 78%, #d97706 100%)'
            }}
          >
            {brandName}
          </span>
        </div>

        {/* Thin Indeterminate Gradient Loading Bar */}
        <div className="mt-3.5 w-44 sm:w-52 h-[3px] rounded-full bg-[#0a3a2a]/10 overflow-hidden relative">
          <div
            className="absolute inset-y-0 left-0 w-1/2 rounded-full animate-arvea-progress"
            style={{
              backgroundImage:
                'linear-gradient(90deg, transparent 0%, #0a3a2a 20%, #10b981 55%, #f59e0b 82%, transparent 100%)'
            }}
          />
        </div>

        {/* Optional Status Message */}
        {message && (
          <p className="mt-3.5 text-[11px] sm:text-xs font-semibold tracking-wide text-[#0a3a2a]/65 transition-opacity duration-300">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
