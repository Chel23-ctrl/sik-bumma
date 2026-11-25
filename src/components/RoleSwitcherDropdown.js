import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, ChevronDown, Check, RotateCcw, Eye } from 'lucide-react';
import { OFFICIAL_ROLE_DEFINITIONS, getRoleMeta } from '../utils/roles';

/**
 * Menu Dropdown "Pilih Role Akses" pada Navbar Atas ARVÉA.
 * Styling pill button ungu lilac lembut senada dengan Periode & Semua Unit.
 */
export default function RoleSwitcherDropdown({
  activeRole,
  baseRole,
  canSwitch = true,
  onSelectRole,
  onResetRole
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const isSimulating = Boolean(baseRole && activeRole && activeRole !== baseRole);
  const currentMeta = getRoleMeta(activeRole);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleChoose = (roleValue) => {
    setOpen(false);
    if (typeof onSelectRole === 'function') {
      onSelectRole(roleValue);
    }
  };

  if (!canSwitch) {
    return (
      <div
        className="px-3 py-1.5 rounded-xl bg-[#F2EFFA] dark:bg-[#332B59] border border-[#9A90CC]/45 text-[#4E4380] dark:text-[#DDD6F0] text-xs font-bold flex items-center gap-1.5 shadow-xs select-none"
        title={`Hak akses terkunci pada peran ${activeRole}`}
      >
        <ShieldCheck className="w-3.5 h-3.5 text-[#64589F] dark:text-[#C4B9E5] shrink-0" />
        <span className="hidden xl:inline">Akses: {activeRole}</span>
        <span className="xl:hidden">{currentMeta.shortLabel}</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition shadow-xs cursor-pointer ${
          isSimulating
            ? 'bg-[#64589F] border-[#524788] text-white hover:bg-[#524788]'
            : 'bg-[#F2EFFA] dark:bg-[#332B59] border-[#9A90CC]/45 text-[#4E4380] dark:text-[#DDD6F0] hover:bg-[#E4DDF5] dark:hover:bg-[#3D346A]'
        }`}
        title="Pilih Role Akses untuk mengganti simulasi hak akses menu & tampilan secara langsung"
      >
        <ShieldCheck
          className={`w-3.5 h-3.5 shrink-0 ${
            isSimulating ? 'text-white' : 'text-[#64589F] dark:text-[#C4B9E5]'
          }`}
        />
        <span className="hidden xl:inline max-w-[175px] truncate">
          Akses: {activeRole}
        </span>
        <span className="xl:hidden max-w-[100px] truncate">
          {currentMeta.shortLabel}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-150 ${
            open ? 'rotate-180' : ''
          } ${isSimulating ? 'text-white/90' : 'text-[#64589F] dark:text-[#C4B9E5]'}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Pilih Role Akses"
          className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-[#251F42] border border-[#9A90CC]/40 dark:border-[#9A90CC]/30 shadow-2xl z-50 overflow-hidden"
        >
          {/* Dropdown Header */}
          <div className="px-4 py-3 bg-[#F6F4FC] dark:bg-[#2F2752] border-b border-[#9A90CC]/25 flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-extrabold text-[#3C3365] dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#64589F] dark:text-[#C4B9E5]" />
                Pilih Role Akses
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-300 mt-0.5">
                6 peran resmi BUMKam &bull; Ubah izin menu secara instan
              </p>
            </div>
            {isSimulating && onResetRole && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onResetRole();
                }}
                className="px-2 py-1 rounded-lg bg-white dark:bg-[#3B3166] border border-[#9A90CC]/40 text-[10px] font-bold text-[#524788] dark:text-[#EDE9F7] hover:bg-[#EDE9F7] flex items-center gap-1 shrink-0 transition"
                title={`Kembali ke peran asli (${baseRole})`}
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {/* 6 Official Roles List */}
          <div className="p-1.5 max-h-[360px] overflow-y-auto space-y-0.5">
            {OFFICIAL_ROLE_DEFINITIONS.map((roleOpt) => {
              const isSelected = activeRole === roleOpt.value;
              return (
                <button
                  key={roleOpt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleChoose(roleOpt.value)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition flex items-start gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#F2EFFA] dark:bg-[#382F63] border border-[#9A90CC]/50'
                      : 'hover:bg-slate-50 dark:hover:bg-[#302854] border border-transparent'
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${roleOpt.dotColor}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs font-bold truncate ${
                          isSelected
                            ? 'text-[#4E4380] dark:text-white'
                            : 'text-slate-800 dark:text-slate-100'
                        }`}
                      >
                        {roleOpt.label}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {roleOpt.readOnly && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 text-[9px] font-bold">
                            <Eye className="w-2.5 h-2.5" /> Read-Only
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-[#EDE9F7] dark:bg-[#3F356E] text-[#524788] dark:text-[#DDD6F0] text-[9px] font-extrabold">
                          {roleOpt.permissions.length} Menu
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                      {roleOpt.description}
                    </p>
                  </div>
                  <div className="w-4 flex items-center justify-center mt-0.5 shrink-0">
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#64589F] dark:text-[#C4B9E5]" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {isSimulating && (
            <div className="px-3.5 py-2 bg-amber-50 dark:bg-amber-950/40 border-t border-amber-200/80 dark:border-amber-800/50 text-[10px] text-amber-800 dark:text-amber-300 font-semibold">
              Mode simulasi aktif &bull; Akun asli Anda: <strong>{baseRole}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
