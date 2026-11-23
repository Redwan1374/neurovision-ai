import React, { useState } from 'react';
import { Mail, Send, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { DashboardTab } from '../types/mri';

interface FooterProps {
  onNavigateDashboard: (tab: DashboardTab) => void;
  onScrollToSection: (sectionId: string) => void;
  onNotify: (title: string, message?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateDashboard,
  onScrollToSection,
  onNotify,
}) => {
  const [contactEmail, setContactEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail.trim() || !contactEmail.includes('@')) return;
    setSubmitted(true);
    onNotify('Research inquiry noted', `Collaboration details prepared for ${contactEmail.trim()}.`);
    setContactEmail('');
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <footer className="border-t border-slate-800/80 bg-[#080B16] pt-16 pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Platform Identity */}
          <div className="md:col-span-4">
            <BrandLogo onClick={() => onScrollToSection('hero')} />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#94A3B8]">
              NeuroVision AI is an interactive neuroimaging research platform designed to explore
              multi-backbone brain MRI classification, calibrated probability distributions, and
              Grad-CAM explainability workflows.
            </p>
            <p className="mt-3 text-xs font-medium text-[#22D3EE]">
              See Beyond the Scan. Understand the Brain.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-2">
            <h4 className="font-display text-sm font-semibold text-[#F8FAFC]">Platform</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-[#94A3B8]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateDashboard('analyze')}
                  className="hover:text-[#F8FAFC] transition-colors cursor-pointer"
                >
                  MRI Analysis Workspace
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateDashboard('models')}
                  className="hover:text-[#F8FAFC] transition-colors cursor-pointer"
                >
                  Model Comparison
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateDashboard('explainability')}
                  className="hover:text-[#F8FAFC] transition-colors cursor-pointer"
                >
                  Explainable AI (Grad-CAM)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateDashboard('history')}
                  className="hover:text-[#F8FAFC] transition-colors cursor-pointer"
                >
                  Analysis History
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-display text-sm font-semibold text-[#F8FAFC]">Research</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-[#94A3B8]">
              <li>
                <button
                  type="button"
                  onClick={() => onScrollToSection('research-overview')}
                  className="hover:text-[#F8FAFC] transition-colors cursor-pointer"
                >
                  Methodology Overview
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateDashboard('research')}
                  className="hover:text-[#F8FAFC] transition-colors cursor-pointer"
                >
                  Architecture Pipeline
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onScrollToSection('about')}
                  className="hover:text-[#F8FAFC] transition-colors cursor-pointer"
                >
                  Research Transparency
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="md:col-span-4">
            <h4 className="font-display text-sm font-semibold text-[#F8FAFC]">
              Research Collaboration &amp; Contact
            </h4>
            <p className="mt-3 text-sm text-[#94A3B8]">
              Reach our neuroimaging AI laboratory for benchmark datasets, academic collaboration,
              or model architecture inquiries.
            </p>
            <form onSubmit={handleSubscribe} className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="researcher@university.edu"
                  className="w-full rounded-lg border border-slate-700/80 bg-[#101629] py-2.5 pl-9 pr-3 text-sm text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#8B5CF6] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#7C3AED] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {submitted ? <CheckCircle2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                <span>{submitted ? 'Sent' : 'Connect'}</span>
              </button>
            </form>
            <p className="mt-2.5 font-mono text-xs text-[#94A3B8]">
              research@neurovision-ai.org · Neuroimaging AI Lab
            </p>
          </div>
        </div>

        {/* Research Disclaimer */}
        <div className="mt-12 rounded-xl border border-slate-800/90 bg-[#101629]/80 p-4 text-xs leading-relaxed text-[#94A3B8]">
          <span className="font-semibold text-[#F8FAFC]">Research &amp; Clinical Disclaimer: </span>
          NeuroVision AI is an educational and research demonstration platform. All predictions,
          confidence scores, benchmark charts, and Grad-CAM visualizations shown in DEMO MODE are
          illustrative simulations and do not constitute medical advice, clinical diagnosis, or
          validated experimental findings.
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-800/70 pt-6 text-xs text-[#94A3B8] sm:flex-row">
          <p>© {new Date().getFullYear()} NeuroVision AI Research Platform. All rights reserved.</p>
          <p>Brain MRI Classification &amp; Explainable AI Demonstration</p>
        </div>
      </div>
    </footer>
  );
};
