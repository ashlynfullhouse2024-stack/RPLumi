import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, HelpCircle, Sparkles, X } from 'lucide-react';
import { CamelliaBlossomSvg } from './FloralOrnaments';

export interface HoverGuideProps {
  title: string;
  description: string;
  tip?: string;
  badge?: string;
  position?: 'bottom' | 'top' | 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

export function HoverGuide({
  title,
  description,
  tip,
  badge,
  position = 'bottom',
  children,
  className = 'inline-flex',
}: HoverGuideProps) {
  const [isOpen, setIsOpen] = useState(false);

  const posClasses = {
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2.5',
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2.5',
  }[position];

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
    >
      {children}

      {isOpen && (
        <div
          role="tooltip"
          className={`pointer-events-none absolute z-50 w-72 sm:w-80 rounded-2xl border border-[#D8C0AD] bg-[#FFFDF9] p-3.5 text-left shadow-xl transition-opacity duration-150 ${posClasses}`}
        >
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              <CamelliaBlossomSvg className="w-4 h-4 shrink-0" />
              <span className="font-display text-xs font-bold text-[#4A2E23]">{title}</span>
            </div>
            {badge && (
              <span className="font-mono text-[10px] font-semibold text-[#6F4B3E]">
                {badge}
              </span>
            )}
          </div>

          <p className="text-[11px] leading-relaxed text-[#5E4539]">{description}</p>

          {tip && (
            <div className="mt-2 pt-2 border-t border-[#EFE4D8] text-[10px] text-[#7D6153] leading-snug">
              <span className="font-semibold text-[#5A392C]">Tips Guru:</span> {tip}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export interface WorkflowStepItem {
  stepNumber: string;
  id: string;
  targetSectionId: string;
  title: string;
  shortDesc: string;
  hoverTitle: string;
  hoverDetail: string;
  hoverTip: string;
  isCompleted: boolean;
  actionLabel: string;
}

interface OnboardingFlowProps {
  steps: WorkflowStepItem[];
  onJumpToSection: (sectionId: string) => void;
  onLoadSampleProfile: () => void;
  onGenerateAll13: () => void;
}

export function OnboardingWorkflowBar({
  steps,
  onJumpToSection,
  onLoadSampleProfile,
  onGenerateAll13,
}: OnboardingFlowProps) {
  const [activeGuideStepIndex, setActiveGuideStepIndex] = useState<number | null>(null);
  const [isBannerExpanded, setIsBannerExpanded] = useState<boolean>(true);

  const activeModalStep =
    activeGuideStepIndex !== null ? steps[activeGuideStepIndex] : null;

  return (
    <section className="mb-8 bg-[#FFFDF9] border border-[#E7D8C9] rounded-2xl p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#EFE4D8]">
        <div className="flex items-center gap-2.5">
          <CamelliaBlossomSvg className="w-5 h-5 shrink-0" />
          <div>
            <h2 className="font-display text-base sm:text-lg font-bold text-[#3B2820]">
              Alur Penggunaan RPLumi untuk Guru (5 Langkah Mudah)
            </h2>
            <p className="text-xs text-[#876D60]">
              Arahkan kursor ke setiap langkah atau menu untuk melihat penjelasan fungsi, atau klik
              langkah untuk langsung menuju bagiannya.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <HoverGuide
            title="Tur Panduan Interaktif"
            description="Membuka jendela panduan langkah demi langkah dari pengisian profil hingga pengunduhan berkas ZIP."
            tip="Cocok bagi Bapak/Ibu guru yang baru pertama kali membuka RPLumi."
            position="bottom"
          >
            <button
              type="button"
              onClick={() => setActiveGuideStepIndex(0)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#4A2E23] bg-[#F4DFE2] hover:bg-[#EBCAD0] rounded-xl transition-colors whitespace-nowrap"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#6F4B3E]" />
              <span>Buka Tur Panduan</span>
            </button>
          </HoverGuide>

          <button
            type="button"
            onClick={() => setIsBannerExpanded((prev) => !prev)}
            className="px-3 py-2 text-xs font-semibold text-[#7E6458] hover:text-[#3B2820] border border-[#E7D8C9] rounded-xl transition-colors whitespace-nowrap"
          >
            {isBannerExpanded ? 'Sembunyikan Alur' : 'Tampilkan Alur'}
          </button>
        </div>
      </div>

      {isBannerExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-4">
          {steps.map((step, index) => (
            <HoverGuide
              key={step.id}
              title={step.hoverTitle}
              description={step.hoverDetail}
              tip={step.hoverTip}
              badge={`Langkah ${step.stepNumber}`}
              position="bottom"
              className="block"
            >
              <button
                type="button"
                onClick={() => onJumpToSection(step.targetSectionId)}
                className={`w-full h-full text-left p-3.5 rounded-xl border transition-colors flex flex-col justify-between group ${
                  step.isCompleted
                    ? 'bg-[#F6FAF5] border-[#C8DEC6] hover:border-[#8FB38D]'
                    : 'bg-[#FCF9F5] border-[#E7D8C9] hover:border-[#8C6453] hover:bg-[#FAF2EA]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-[#6F4B3E] tabular-nums">
                      Langkah {step.stepNumber}
                    </span>
                    {step.isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3F6A45]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Selesai
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#9C8275]">Ke bagian →</span>
                    )}
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-[#3B2820] group-hover:text-[#6F4B3E] mb-1">
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-[#7E6458] leading-relaxed">{step.shortDesc}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#EFE4D8] flex items-center justify-between text-[11px] font-semibold text-[#6F4B3E]">
                  <span>{step.actionLabel}</span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveGuideStepIndex(index);
                    }}
                    className="text-[#876D60] hover:text-[#3B2820] underline"
                  >
                    Detail
                  </span>
                </div>
              </button>
            </HoverGuide>
          ))}
        </div>
      )}

      {/* Interactive Step-by-Step Guide Modal */}
      {activeModalStep && activeGuideStepIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B1C16]/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl border border-[#DFCBB8] bg-[#FFFDF9] p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#EFE4D8]">
              <div className="flex items-center gap-2">
                <CamelliaBlossomSvg className="w-5 h-5" />
                <span className="font-mono text-xs font-bold text-[#6F4B3E]">
                  PANDUAN LANGKAH {activeModalStep.stepNumber} DARI {steps.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveGuideStepIndex(null)}
                className="p-1.5 text-[#876D60] hover:text-[#3B2820] rounded-lg"
                aria-label="Tutup panduan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-5 space-y-3">
              <h3 className="font-display text-xl font-bold text-[#3B2820]">
                {activeModalStep.hoverTitle}
              </h3>
              <p className="text-sm text-[#5E4539] leading-relaxed">
                {activeModalStep.hoverDetail}
              </p>
              <div className="p-3.5 rounded-xl bg-[#FAF2EA] border border-[#E7D8C9] text-xs text-[#5A392C] leading-relaxed">
                <strong className="block mb-0.5 text-[#3B2820]">
                  Tips Praktis untuk Bapak/Ibu Guru:
                </strong>
                {activeModalStep.hoverTip}
              </div>

              {activeGuideStepIndex === 0 && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onLoadSampleProfile();
                      setActiveGuideStepIndex(1);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#4A2E23] bg-[#F4DFE2] hover:bg-[#EBCAD0] rounded-xl transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#6F4B3E]" />
                    <span>Coba Isi Contoh Profil Guru Sekarang & Lanjut →</span>
                  </button>
                </div>
              )}

              {activeGuideStepIndex === 1 && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveGuideStepIndex(null);
                      onGenerateAll13();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#FFFDF9] bg-[#6F4B3E] hover:bg-[#58392E] rounded-xl transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Langsung Generate Semua 13 Dokumen Sekarang</span>
                  </button>
                </div>
              )}
            </div>

            {/* Step Dots & Modal Footer Controls */}
            <div className="pt-4 border-t border-[#EFE4D8] flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                {steps.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveGuideStepIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === activeGuideStepIndex
                        ? 'w-6 bg-[#6F4B3E]'
                        : 'w-2 bg-[#DFCBB8] hover:bg-[#B89F8D]'
                    }`}
                    aria-label={`Langkah ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {activeGuideStepIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveGuideStepIndex(activeGuideStepIndex - 1)}
                    className="px-3.5 py-2 text-xs font-semibold text-[#6E5346] hover:text-[#3B2820] border border-[#E7D8C9] rounded-xl"
                  >
                    Sebelumnya
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onJumpToSection(activeModalStep.targetSectionId);
                    setActiveGuideStepIndex(null);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-[#5A392C] bg-[#F5EAE0] hover:bg-[#EAD8C8] rounded-xl"
                >
                  Buka Bagian Ini
                </button>

                {activeGuideStepIndex < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveGuideStepIndex(activeGuideStepIndex + 1)}
                    className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold text-[#FFFDF9] bg-[#6F4B3E] hover:bg-[#58392E] rounded-xl"
                  >
                    <span>Selanjutnya</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveGuideStepIndex(null)}
                    className="px-4 py-2 text-xs font-semibold text-[#FFFDF9] bg-[#4F6D52] hover:bg-[#3F5942] rounded-xl"
                  >
                    Selesai & Mulai Kerja
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
