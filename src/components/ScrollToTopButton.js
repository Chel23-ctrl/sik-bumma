import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTopButton({ targetRef = null }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      const windowPos = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const refPos = targetRef?.current ? targetRef.current.scrollTop : 0;
      const mainEl = document.querySelector('main');
      const mainPos = mainEl ? mainEl.scrollTop : 0;
      
      const maxScroll = Math.max(windowPos, refPos, mainPos);
      setIsScrolled(maxScroll > 60);
    };

    window.addEventListener('scroll', checkScroll, { passive: true });
    document.addEventListener('scroll', checkScroll, { passive: true });

    const currentRef = targetRef?.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', checkScroll, { passive: true });
    }

    const mainEl = document.querySelector('main');
    if (mainEl && mainEl !== currentRef) {
      mainEl.addEventListener('scroll', checkScroll, { passive: true });
    }

    checkScroll();
    const interval = setInterval(checkScroll, 400);

    return () => {
      window.removeEventListener('scroll', checkScroll);
      document.removeEventListener('scroll', checkScroll);
      if (currentRef) {
        currentRef.removeEventListener('scroll', checkScroll);
      }
      if (mainEl && mainEl !== currentRef) {
        mainEl.removeEventListener('scroll', checkScroll);
      }
      clearInterval(interval);
    };
  }, [targetRef]);

  const handleScrollToTop = () => {
    if (targetRef?.current) {
      targetRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (document.documentElement) {
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (document.body) {
      document.body.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <button
      onClick={handleScrollToTop}
      className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-[#0a3a2a] hover:bg-[#06291d] text-white border-2 border-emerald-400/60 flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:scale-110 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-emerald-500/30 cursor-pointer print:hidden ${
        isScrolled 
          ? 'opacity-100 shadow-2xl scale-100 ring-2 ring-emerald-400/40 animate-pulse-subtle' 
          : 'opacity-85 hover:opacity-100 scale-95 shadow-xl'
      }`}
      title="Kembali ke Bagian Paling Atas"
      aria-label="Kembali ke Bagian Paling Atas"
    >
      <ArrowUp className={`w-5 h-5 text-emerald-300 group-hover:text-white transition-all duration-200 ${
        isScrolled ? 'group-hover:-translate-y-1' : 'group-hover:-translate-y-0.5'
      }`} />
    </button>
  );
}
