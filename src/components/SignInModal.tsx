import React, { useState } from 'react';
import { X, UserCheck } from 'lucide-react';
import { ResearcherProfile } from '../types/mri';

interface SignInModalProps {
  isOpen: boolean;
  researcher: ResearcherProfile;
  onClose: () => void;
  onSaveProfile: (profile: ResearcherProfile) => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  researcher,
  onClose,
  onSaveProfile,
}) => {
  const [name, setName] = useState(researcher.name);
  const [email, setEmail] = useState(researcher.email);
  const [institution, setInstitution] = useState(researcher.institution);
  const [role, setRole] = useState(researcher.role);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      name: name.trim() || 'Dr. Elena Vance',
      email: email.trim() || 'researcher@neurovision-ai.org',
      institution: institution.trim() || 'Neuroimaging AI Laboratory',
      role: role.trim() || 'Lead Researcher',
      isSignedIn: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-700/80 bg-[#101629] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <p className="font-mono text-[11px] font-semibold text-[#22D3EE]">
              RESEARCHER ACCESS · DEMO SESSION
            </p>
            <h3 className="mt-1 font-display text-lg font-bold text-[#F8FAFC]">
              Sign In to NeuroVision AI
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-[#141C31] text-[#94A3B8] hover:text-white cursor-pointer"
            aria-label="Close sign in dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#94A3B8]" htmlFor="nv-name">
              Researcher Name
            </label>
            <input
              id="nv-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-[#080B16] px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:border-[#8B5CF6] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#94A3B8]" htmlFor="nv-email">
              Academic / Lab Email
            </label>
            <input
              id="nv-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-[#080B16] px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:border-[#8B5CF6] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#94A3B8]" htmlFor="nv-inst">
                Institution
              </label>
              <input
                id="nv-inst"
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-[#080B16] px-3.5 py-2 text-xs text-[#F8FAFC] focus:border-[#8B5CF6] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#94A3B8]" htmlFor="nv-role">
                Role
              </label>
              <input
                id="nv-role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-[#080B16] px-3.5 py-2 text-xs text-[#F8FAFC] focus:border-[#8B5CF6] focus:outline-none"
              />
            </div>
          </div>

          <p className="text-[11px] text-[#94A3B8]">
            Client-side demo session only. No password or external credentials are transmitted.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-[#141C31] px-4 py-2 text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="nv-gradient-btn inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-semibold text-white cursor-pointer"
            >
              <UserCheck className="h-3.5 w-3.5" />
              Continue to Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
