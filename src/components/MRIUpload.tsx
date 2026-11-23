import React, { useRef, useState } from 'react';
import { Upload, FileImage, Shield, AlertCircle } from 'lucide-react';
import { TumorCategory } from '../types/mri';
import { CATEGORY_META, TUMOR_CATEGORIES } from '../data/mockResearchData';
import { getIllustrativeSampleMRI } from '../utils/mriRenderer';

interface MRIUploadProps {
  onImageLoaded: (payload: {
    imageUrl: string;
    fileName: string;
    isDemoSample: boolean;
    sampleCategory?: TumorCategory;
  }) => void;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export const MRIUpload: React.FC<MRIUploadProps> = ({ onImageLoaded }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const processFile = (file: File) => {
    setErrorMsg(null);
    if (!ACCEPTED_TYPES.includes(file.type.toLowerCase())) {
      setErrorMsg('Unsupported file format. Please upload a JPG, JPEG, or PNG brain MRI image.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMsg('File exceeds the 10 MB limit. Please select a smaller MRI image.');
      return;
    }

    setUploadProgress(18);
    const reader = new FileReader();

    reader.onprogress = (evt) => {
      if (evt.lengthComputable) {
        const pct = Math.min(92, Math.round((evt.loaded / evt.total) * 100));
        setUploadProgress(pct);
      }
    };

    reader.onload = () => {
      setUploadProgress(100);
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      setTimeout(() => {
        setUploadProgress(null);
        if (dataUrl) {
          onImageLoaded({
            imageUrl: dataUrl,
            fileName: file.name,
            isDemoSample: false,
          });
        }
      }, 280);
    };

    reader.onerror = () => {
      setUploadProgress(null);
      setErrorMsg('Failed to read the selected file. Please try again.');
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleSelectSample = (category: TumorCategory) => {
    setErrorMsg(null);
    setUploadProgress(45);
    const imgUrl = getIllustrativeSampleMRI(category);
    setTimeout(() => {
      setUploadProgress(100);
      setTimeout(() => {
        setUploadProgress(null);
        onImageLoaded({
          imageUrl: imgUrl,
          fileName: `demo_${category.toLowerCase().replace(' ', '_')}_mri_sample.png`,
          isDemoSample: true,
          sampleCategory: category,
        });
      }, 180);
    }, 180);
  };

  return (
    <div className="space-y-6">
      {/* Main Drag & Drop Upload Card */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all sm:p-12 ${
          isDragging
            ? 'border-[#22D3EE] bg-[#141C31] shadow-[0_0_32px_rgba(34,211,238,0.2)]'
            : 'border-[#8B5CF6]/45 bg-[#141C31]/70 hover:border-[#8B5CF6]/80 hover:bg-[#141C31]/90'
        }`}
      >
        {/* Custom MRI Scan SVG Illustration */}
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#8B5CF6]/30 bg-gradient-to-br from-[#8B5CF6]/20 via-[#3B82F6]/15 to-[#22D3EE]/15">
          <svg
            width="44"
            height="44"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <ellipse cx="24" cy="24" rx="14" ry="17" stroke="#8B5CF6" strokeWidth="1.8" />
            <ellipse cx="24" cy="24" rx="10.5" ry="13.5" stroke="#22D3EE" strokeWidth="1.2" strokeDasharray="3 3" />
            <line x1="24" y1="9" x2="24" y2="39" stroke="#94A3B8" strokeOpacity="0.45" strokeWidth="1.2" />
            <path d="M18 18C20 15 22 17 22 24C22 30 20 33 18 30" stroke="#F8FAFC" strokeOpacity="0.7" strokeWidth="1.4" />
            <path d="M30 18C28 15 26 17 26 24C26 30 28 33 30 30" stroke="#F8FAFC" strokeOpacity="0.7" strokeWidth="1.4" />
            <line x1="7" y1="24" x2="41" y2="24" stroke="#22D3EE" strokeWidth="1.5" strokeOpacity="0.85" />
          </svg>
        </div>

        <h3 className="font-display text-xl font-semibold text-[#F8FAFC]">
          Upload a brain MRI image to begin AI-assisted analysis.
        </h3>
        <p className="mt-2 max-w-md text-sm text-[#94A3B8]">
          Drag and drop an axial, coronal, or sagittal MRI scan here, or browse from your local
          workstation.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
            e.target.value = '';
          }}
          className="hidden"
        />

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="nv-gradient-btn inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            Browse Files
          </button>
        </div>

        {/* Upload Progress Indicator */}
        {uploadProgress !== null && (
          <div className="mt-6 w-full max-w-sm">
            <div className="flex items-center justify-between text-xs text-[#94A3B8]">
              <span>Loading scan into local viewer</span>
              <span className="font-mono tabular-nums text-[#22D3EE]">{uploadProgress}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Validation Error */}
        {errorMsg && (
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Metadata Footer: Accepted Formats, Max Size, Privacy */}
        <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-3 border-t border-slate-800/80 pt-6 text-left sm:grid-cols-3">
          <div className="flex items-start gap-2.5">
            <FileImage className="mt-0.5 h-4 w-4 shrink-0 text-[#8B5CF6]" />
            <div>
              <p className="text-xs font-medium text-[#F8FAFC]">Accepted Formats</p>
              <p className="mt-0.5 font-mono text-[11px] text-[#94A3B8]">JPG, JPEG, PNG</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Upload className="mt-0.5 h-4 w-4 shrink-0 text-[#22D3EE]" />
            <div>
              <p className="text-xs font-medium text-[#F8FAFC]">Maximum File Size</p>
              <p className="mt-0.5 font-mono text-[11px] text-[#94A3B8]">Up to 10 MB / slice</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
            <div>
              <p className="text-xs font-medium text-[#F8FAFC]">Local Privacy Notice</p>
              <p className="mt-0.5 text-[11px] text-[#94A3B8]">
                Processed locally in browser demo mode
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick-Load Illustrative Demo MRI Samples */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#141C31]/65 p-5">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h4 className="font-display text-sm font-semibold text-[#F8FAFC]">
              Or load an illustrative demo MRI scan
            </h4>
            <p className="text-xs text-[#94A3B8]">
              Procedural educational MRI visuals for immediate multi-model and Grad-CAM testing (not
              clinical evidence).
            </p>
          </div>
          <span className="font-mono text-[11px] text-[#22D3EE] whitespace-nowrap">
            4 Demo Presets
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TUMOR_CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            const thumb = getIllustrativeSampleMRI(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleSelectSample(cat)}
                className="group flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#080B16]/85 p-2.5 text-left transition-all hover:border-[#8B5CF6]/60 hover:bg-[#101629] cursor-pointer"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black">
                  {thumb && (
                    <img
                      src={thumb}
                      alt={`Illustrative ${cat} demo MRI sample`}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-[#F8FAFC]">{cat}</span>
                  <span
                    className="font-mono text-[10px] font-medium"
                    style={{ color: meta.color }}
                  >
                    Sample
                  </span>
                </div>
                <span className="mt-0.5 text-[11px] text-[#94A3B8]">{meta.samplePlane}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
