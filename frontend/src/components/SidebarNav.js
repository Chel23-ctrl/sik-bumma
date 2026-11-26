import React, { useMemo } from 'react';
import {
  Building2,
  Wallet,
  TrendingUp,
  Receipt,
  FileText,
  BookOpen,
  Scale,
  Package,
  Layers,
  DollarSign,
  LogOut,
  Store,
  ClipboardList,
  Boxes,
  FileEdit,
  UserCog
} from 'lucide-react';
import ArveaLogo from './ArveaLogo';
import { filterMenusForRole, getPathForMenu } from '../utils/permissions';

/**
 * Komponen Sidebar Navigasi Dinamis ARVÉA.
 * Hanya merender menu yang diizinkan untuk `userRole` aktif (menu yang tidak diizinkan
 * disembunyikan sepenuhnya dari DOM dan langsung berubah reaktif saat Role Switcher diganti).
 */
export default function SidebarNav({
  sidebarOpen,
  darkMode,
  userRole,
  isSimulatingRole,
  activeMenu,
  onNavigate,
  effectiveUser,
  onLogout,
  activeUsersCount = 0,
  transactionsCount = 0,
  adjustingJournalsCount = 0
}) {
  const visibleMenus = useMemo(() => {
    const allMenus = [
      { id: 'dashboard', label: 'Dashboard', icon: Store },
      { id: 'profil', label: 'Profil BUMKam', icon: Building2 },
      {
        id: 'pengguna',
        label: 'Pengelolaan Pengguna',
        icon: UserCog,
        badge: activeUsersCount ? String(activeUsersCount) : null
      },
      { id: 'master', label: 'Master Data', icon: Package },
      { id: 'aset', label: 'Inventarisasi Aset', icon: Boxes },
      { id: 'landing_unit', label: 'Profil Unit Usaha', icon: Building2 },
      {
        id: 'transaksi',
        label: 'Transaksi',
        icon: Receipt,
        badge: transactionsCount ? String(transactionsCount) : null
      },
      { id: 'kas_bank', label: 'Kas & Bank', icon: Wallet },
      { id: 'jurnal', label: 'Jurnal Umum', icon: BookOpen },
      {
        id: 'jurnal_penyesuaian',
        label: 'Jurnal Penyesuaian',
        icon: FileEdit,
        badge: adjustingJournalsCount ? String(adjustingJournalsCount) : null
      },
      { id: 'buku_besar', label: 'Buku Besar', icon: Layers },
      { id: 'neraca_saldo', label: 'Neraca Saldo', icon: Scale },
      { id: 'laporan', label: 'Laporan Keuangan', icon: FileText, highlight: true },
      { id: 'analisis', label: 'Analisis Kinerja', icon: TrendingUp },
      { id: 'operasional', label: 'Laporan Operasional', icon: ClipboardList },
      { id: 'penggajian', label: 'Penggajian', icon: DollarSign }
    ];

    return filterMenusForRole(allMenus, userRole);
  }, [userRole, activeUsersCount, transactionsCount, adjustingJournalsCount]);

  return (
    <aside
      className={`${
        sidebarOpen ? 'w-64' : 'w-20'
      } transition-all duration-200 border-r border-[#9A90CC]/30 dark:border-[#9A90CC]/20 bg-white/95 dark:bg-[#251F42] backdrop-blur flex flex-col justify-between shrink-0 print:hidden overflow-y-auto`}
    >
      <div>
        <div
          className={`p-4 flex items-center ${
            sidebarOpen ? 'justify-start' : 'justify-center'
          } border-b border-[#9A90CC]/20 dark:border-[#9A90CC]/15`}
        >
          {sidebarOpen ? (
            <ArveaLogo
              variant="horizontal"
              theme={darkMode ? 'light' : 'lilac'}
              size="sm"
              subtitle="BUMKam Mekar Sari"
            />
          ) : (
            <ArveaLogo variant="mark" theme={darkMode ? 'light' : 'lilac'} size="sm" />
          )}
        </div>

        {/* Role Indicator & Active Menu Count Pill */}
        {sidebarOpen && (
          <div className="px-3 py-1.5 mx-3 my-2 rounded-xl bg-[#F4F1FA] dark:bg-[#332B59]/80 border border-[#9A90CC]/30 text-[10px] flex items-center justify-between gap-2">
            <span className="text-slate-600 dark:text-slate-300 font-semibold truncate">
              Role: <strong className="text-[#524788] dark:text-[#DDD6F0]">{userRole}</strong>
            </span>
            <span
              className={`px-1.5 py-0.5 rounded-md font-bold shrink-0 ${
                isSimulatingRole
                  ? 'bg-[#64589F] text-white'
                  : 'bg-[#9A90CC]/25 text-[#4E4380] dark:text-[#EDE9F7]'
              }`}
            >
              {visibleMenus.length} Menu
            </span>
          </div>
        )}

        {/* Dynamic Role-Filtered Menu List */}
        <nav aria-label="Navigasi Utama" className="p-3 space-y-1">
          {visibleMenus.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                type="button"
                data-route={getPathForMenu(item.id)}
                onClick={() => onNavigate(item.id, item.label)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-[#64589F] text-white shadow-sm font-bold'
                    : item.highlight
                    ? 'text-[#524788] dark:text-[#C4B9E5] hover:bg-[#F2EFFA] dark:hover:bg-[#332B59]/50'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-[#F2EFFA] dark:hover:bg-[#332B59]/50'
                }`}
                title={item.label}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? 'text-white'
                      : item.highlight
                      ? 'text-[#7C6FB8]'
                      : 'text-[#9A90CC]'
                  }`}
                />
                {sidebarOpen && <span className="flex-1 text-left truncate">{item.label}</span>}
                {sidebarOpen && item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#EDE9F7] dark:bg-[#332B59] text-[#4E4380] dark:text-[#DDD6F0]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {sidebarOpen && (
        <div className="p-4 border-t border-[#9A90CC]/20 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#64589F] text-white font-bold flex items-center justify-center text-xs shrink-0">
              {effectiveUser?.initials ||
                (effectiveUser?.name ? effectiveUser.name.slice(0, 2).toUpperCase() : 'AD')}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-[#1E1B2E] dark:text-white leading-tight truncate">
                {effectiveUser?.name || 'Administrator ARVÉA'}
              </p>
              <p className="text-[10px] text-[#64589F] dark:text-[#C4B9E5] font-semibold leading-tight truncate">
                {effectiveUser?.role || userRole}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="text-slate-400 hover:text-red-600 p-1 shrink-0"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
