import React from 'react';

export default function SectorBackground({ variant = 'dark' }) {
  // variant: 'dark' (for green hero banner) or 'light' (for white/emerald sections)
  const isDark = variant === 'dark';
  const strokeColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(10, 58, 42, 0.08)';
  const goldColor = isDark ? 'rgba(251, 191, 36, 0.14)' : 'rgba(217, 119, 6, 0.09)';
  const emeraldColor = isDark ? 'rgba(52, 211, 153, 0.16)' : 'rgba(5, 150, 105, 0.10)';

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
      
      {/* 1. MOTIF BIDANG USAHA 1: PETERNAKAN & TELUR AYAM */}
      {/* Floating Stylized Egg Silhouette (Top-Left) */}
      <div className="absolute -top-10 -left-8 w-48 sm:w-64 h-64 sm:h-80 animate-drift opacity-75">
        <svg viewBox="0 0 160 210" fill="none" className="w-full h-full">
          {/* Outer Egg Contour */}
          <path
            d="M 80 15 C 35 15, 12 75, 12 135 C 12 175, 42 200, 80 200 C 118 200, 148 175, 148 135 C 148 75, 125 15, 80 15 Z"
            stroke={goldColor}
            strokeWidth="1.8"
            strokeDasharray="4 3"
          />
          {/* Inner Golden Yolk Contour */}
          <circle cx="80" cy="135" r="32" stroke={goldColor} strokeWidth="1.5" />
          <circle cx="80" cy="135" r="16" stroke={goldColor} strokeWidth="1" strokeOpacity="0.6" />
          {/* Farm Grain Stalk */}
          <path
            d="M 80 190 Q 70 140 50 110 M 70 140 Q 55 135 50 125 M 65 160 Q 50 155 45 145"
            stroke={emeraldColor}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Floating Wheat / Padi Grain Stalk (Upper Center) */}
      <div className="absolute top-4 left-1/4 sm:left-1/3 w-24 sm:w-32 h-36 sm:h-44 animate-sway opacity-60">
        <svg viewBox="0 0 100 140" fill="none" className="w-full h-full">
          <path d="M 50 130 C 50 80, 60 40, 50 10" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
          {/* Grains */}
          <ellipse cx="40" cy="35" rx="8" ry="4" transform="rotate(-30 40 35)" stroke={goldColor} strokeWidth="1.4" />
          <ellipse cx="60" cy="45" rx="8" ry="4" transform="rotate(30 60 45)" stroke={goldColor} strokeWidth="1.4" />
          <ellipse cx="38" cy="60" rx="8" ry="4" transform="rotate(-30 38 60)" stroke={goldColor} strokeWidth="1.4" />
          <ellipse cx="62" cy="70" rx="8" ry="4" transform="rotate(30 62 70)" stroke={goldColor} strokeWidth="1.4" />
          <ellipse cx="38" cy="85" rx="8" ry="4" transform="rotate(-30 38 85)" stroke={goldColor} strokeWidth="1.4" />
          <ellipse cx="62" cy="95" rx="8" ry="4" transform="rotate(30 62 95)" stroke={goldColor} strokeWidth="1.4" />
        </svg>
      </div>

      {/* 2. MOTIF BIDANG USAHA 2: PENYEWAAN TENDA ACARA */}
      {/* Floating Marquee Event Canopy Tent (Lower-Center-Left) */}
      <div className="absolute bottom-4 left-4 sm:left-1/4 w-56 sm:w-80 h-40 sm:h-52 animate-drift-reverse opacity-70">
        <svg viewBox="0 0 240 150" fill="none" className="w-full h-full">
          {/* Center High Peak */}
          <path d="M 120 15 L 20 80 L 220 80 Z" stroke={strokeColor} strokeWidth="1.6" />
          {/* Tent Center Mast & Guy Wires */}
          <line x1="120" y1="15" x2="120" y2="135" stroke={emeraldColor} strokeWidth="1.5" strokeDasharray="3 3" />
          {/* Canopy Valance Waves */}
          <path
            d="M 20 80 Q 45 92 70 80 Q 95 92 120 80 Q 145 92 170 80 Q 195 92 220 80"
            stroke={goldColor}
            strokeWidth="1.8"
            fill="none"
          />
          {/* Support Poles */}
          <line x1="20" y1="80" x2="20" y2="135" stroke={strokeColor} strokeWidth="1.5" />
          <line x1="70" y1="80" x2="70" y2="135" stroke={strokeColor} strokeWidth="1.2" strokeOpacity="0.7" />
          <line x1="170" y1="80" x2="170" y2="135" stroke={strokeColor} strokeWidth="1.2" strokeOpacity="0.7" />
          <line x1="220" y1="80" x2="220" y2="135" stroke={strokeColor} strokeWidth="1.5" />
          {/* Top Festive Pennant Flag */}
          <path d="M 120 15 L 138 22 L 120 28 Z" fill={goldColor} stroke={goldColor} strokeWidth="1" />
        </svg>
      </div>

      {/* 3. MOTIF BIDANG USAHA 3: PENYEWAAN GEDUNG SERBAGUNA */}
      {/* Classical Hall Facade with Pillars & Archway (Bottom-Right / Behind cards) */}
      <div className="absolute -bottom-6 right-2 sm:right-16 w-60 sm:w-88 h-48 sm:h-64 animate-float opacity-75">
        <svg viewBox="0 0 260 180" fill="none" className="w-full h-full">
          {/* Triangular Roof Pediment */}
          <polygon points="130,20 25,65 235,65" stroke={emeraldColor} strokeWidth="1.8" />
          <circle cx="130" cy="46" r="10" stroke={goldColor} strokeWidth="1.4" />
          {/* Architrave Beam */}
          <rect x="25" y="65" width="210" height="12" stroke={strokeColor} strokeWidth="1.5" />
          {/* 4 Grand Pillars */}
          {/* Pillar 1 */}
          <line x1="45" y1="77" x2="45" y2="155" stroke={strokeColor} strokeWidth="3" />
          {/* Pillar 2 */}
          <line x1="90" y1="77" x2="90" y2="155" stroke={strokeColor} strokeWidth="2.5" />
          {/* Pillar 3 */}
          <line x1="170" y1="77" x2="170" y2="155" stroke={strokeColor} strokeWidth="2.5" />
          {/* Pillar 4 */}
          <line x1="215" y1="77" x2="215" y2="155" stroke={strokeColor} strokeWidth="3" />
          {/* Grand Archway Door in Center */}
          <path d="M 108 155 L 108 115 A 22 22 0 0 1 152 115 L 152 155" stroke={goldColor} strokeWidth="1.6" />
          {/* Foundation Base Steps */}
          <line x1="15" y1="155" x2="245" y2="155" stroke={strokeColor} strokeWidth="2" />
          <line x1="5" y1="163" x2="255" y2="163" stroke={strokeColor} strokeWidth="2" />
        </svg>
      </div>

      {/* 4. SENTANI PAPUA LANDSCAPE & TOPOGRAPHIC WAVES (BOTTOM BORDER) */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-20 sm:h-24 overflow-hidden">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
          {/* Rolling Hills of Cyclops & Waves of Lake Sentani */}
          <path
            d="M 0 60 C 150 90, 300 30, 450 65 C 600 100, 750 40, 900 70 C 1050 95, 1150 50, 1200 60 L 1200 120 L 0 120 Z"
            fill="none"
            stroke={emeraldColor}
            strokeWidth="1.2"
            strokeOpacity="0.7"
          />
          <path
            d="M 0 85 C 200 50, 400 105, 600 75 C 800 50, 1000 95, 1200 80 L 1200 120 L 0 120 Z"
            fill="none"
            stroke={goldColor}
            strokeWidth="1.2"
            strokeOpacity="0.5"
            strokeDasharray="6 4"
          />
        </svg>
      </div>

      {/* 5. GENTLE ROTATING PAPUA SUN WHEEL MOTIF (UPPER-RIGHT) */}
      <div className="absolute -top-12 sm:-top-16 -right-12 sm:-right-16 w-56 sm:w-80 h-56 sm:h-80 animate-rotate-slow opacity-80">
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
          <circle cx="100" cy="100" r="85" stroke={goldColor} strokeWidth="1" strokeDasharray="8 6" />
          <circle cx="100" cy="100" r="60" stroke={emeraldColor} strokeWidth="1" strokeDasharray="4 4" />
          {/* 8 Sun Rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
            <line
              key={i}
              x1="100"
              y1="10"
              x2="100"
              y2="25"
              transform={`rotate(${deg} 100 100)`}
              stroke={goldColor}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          ))}
        </svg>
      </div>

    </div>
  );
}
