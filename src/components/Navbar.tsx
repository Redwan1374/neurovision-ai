import React, { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { DashboardTab, ResearcherProfile } from '../types/mri';

interface NavbarProps {
  onNavigateDashboard: (tab: DashboardTab) => void;
  onScrollToSection: (sectionId: string) => void;
  onOpenSignIn: () => void;
  researcher: ResearcherProfile;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigateDashboard,
  onScrollToSection,
  onOpenSignIn,
  researcher,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLink = (action: () => void) => {
    setMobileOpen(false);
    action();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/70 bg-[#080B16]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        <BrandLogo onClick={() => onScrollToSection('hero')} />

        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#94A3B8]">
          <button
            type="button"
            onClick={() => onScrollToSection('hero')}
            className="hover:text-[#F8FAFC] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => onNavigateDashboard('analyze')}
            className="hover:text-[#F8FAFC] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            AI Analysis
          </button>
          <button
            type="button"
            onClick={() => onScrollToSection('research-overview')}
            className="hover:text-[#F8FAFC] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Research
          </button>
          <button
            type="button"
            onClick={() => onNavigateDashboard('models')}
            className="hover:text-[#F8FAFC] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Model Insights
          </button>
          <button
            type="button"
            onClick={() => onScrollToSection('about')}
            className="hover:text-[#F8FAFC] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            About
          </button>
        </nav>

        <div className="hidden lg:flex items-center gap-5 shrink-0">
          <button
            type="button"
            onClick={onOpenSignIn}
            className="text-sm font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {researcher.isSignedIn ? researcher.name.split(' ')[0] : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => onNavigateDashboard('analyze')}
            className="nv-gradient-btn inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            Start Analysis
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-[#101629] text-[#F8FAFC] hover:border-[#8B5CF6]/50 transition-colors"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-800/80 bg-[#080B16]/98 px-4 pb-5 pt-3">
          <div className="flex flex-col space-y-1">
            <button
              type="button"
              onClick={() => handleLink(() => onScrollToSection('hero'))}
              className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#94A3B8] hover:bg-[#141C31] hover:text-[#F8FAFC]"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleLink(() => onNavigateDashboard('analyze'))}
              className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#94A3B8] hover:bg-[#141C31] hover:text-[#F8FAFC]"
            >
              AI Analysis
            </button>
            <button
              type="button"
              onClick={() => handleLink(() => onScrollToSection('research-overview'))}
              className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#94A3B8] hover:bg-[#141C31] hover:text-[#F8FAFC]"
            >
              Research
            </button>
            <button
              type="button"
              onClick={() => handleLink(() => onNavigateDashboard('models'))}
              className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#94A3B8] hover:bg-[#141C31] hover:text-[#F8FAFC]"
            >
              Model Insights
            </button>
            <button
              type="button"
              onClick={() => handleLink(() => onScrollToSection('about'))}
              className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#94A3B8] hover:bg-[#141C31] hover:text-[#F8FAFC]"
            >
              About
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-2.5 border-t border-slate-800/80 pt-4">
            <button
              type="button"
              onClick={() => handleLink(onOpenSignIn)}
              className="w-full rounded-lg border border-slate-700/80 bg-[#101629] px-4 py-2.5 text-sm font-medium text-[#F8FAFC]"
            >
              {researcher.isSignedIn ? `Signed in as ${researcher.name}` : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => handleLink(() => onNavigateDashboard('analyze'))}
              className="nv-gradient-btn inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
            >
              Start Analysis
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
