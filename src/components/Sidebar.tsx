import React from 'react';
import {
  LayoutDashboard,
  ScanSearch,
  History,
  GitCompare,
  Eye,
  BookOpen,
  Settings,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { DashboardTab } from '../types/mri';

interface SidebarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onReturnLanding: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  historyCount: number;
}

const NAV_ITEMS: {
  id: DashboardTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'analyze', label: 'New MRI Analysis', icon: ScanSearch },
  { id: 'history', label: 'Analysis History', icon: History },
  { id: 'models', label: 'Model Comparison', icon: GitCompare },
  { id: 'explainability', label: 'Explainable AI', icon: Eye },
  { id: 'research', label: 'Research Insights', icon: BookOpen },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onReturnLanding,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  historyCount,
}) => {
  const handleSelect = (tab: DashboardTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const renderContent = (isCompact: boolean) => (
    <div className="flex h-full flex-col bg-[#101629] border-r border-slate-800/80">
      {/* Brand header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-4">
        <BrandLogo compact={isCompact} onClick={onReturnLanding} />
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#141C31] hover:text-[#F8FAFC] transition-colors cursor-pointer"
          aria-label={isCompact ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCompact ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#141C31] hover:text-[#F8FAFC]"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4" aria-label="Dashboard Navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              title={isCompact ? item.label : undefined}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#8B5CF6]/18 text-[#F8FAFC] border border-[#8B5CF6]/55 shadow-[0_0_20px_rgba(139,92,246,0.22)]'
                  : 'border border-transparent text-[#94A3B8] hover:bg-[#141C31] hover:text-[#F8FAFC]'
              } ${isCompact ? 'justify-center px-2' : ''}`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive ? 'text-[#A855F7]' : 'text-[#94A3B8] group-hover:text-[#22D3EE]'
                }`}
              />
              {!isCompact && (
                <>
                  <span className="flex-1 truncate text-left whitespace-nowrap">{item.label}</span>
                  {item.id === 'history' && (
                    <span className="font-mono text-xs tabular-nums text-[#94A3B8]">
                      {historyCount}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Notice & Back to Landing */}
      <div className="border-t border-slate-800/80 p-3">
        {!isCompact && (
          <div className="mb-3 rounded-xl border border-slate-800 bg-[#080B16]/75 p-3">
            <p className="font-mono text-[11px] font-semibold text-[#22D3EE]">DEMO MODE ACTIVE</p>
            <p className="mt-1 text-[11px] leading-relaxed text-[#94A3B8]">
              Simulated multi-model inference for research demonstration only.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            onCloseMobile();
            onReturnLanding();
          }}
          title={isCompact ? 'Back to Landing Page' : undefined}
          className={`flex w-full items-center gap-2.5 rounded-xl border border-slate-800 bg-[#141C31]/70 px-3 py-2.5 text-xs font-medium text-[#94A3B8] hover:border-slate-700 hover:text-[#F8FAFC] transition-colors cursor-pointer ${
            isCompact ? 'justify-center px-2' : ''
          }`}
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          {!isCompact && <span className="whitespace-nowrap">Back to Landing Page</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop / Tablet Persistent Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-200 ${
          collapsed ? 'w-[76px]' : 'w-[256px]'
        }`}
      >
        <div className="sticky top-0 h-screen">{renderContent(collapsed)}</div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full w-[268px] max-w-[82vw]">
            {renderContent(false)}
          </div>
        </div>
      )}
    </>
  );
};
