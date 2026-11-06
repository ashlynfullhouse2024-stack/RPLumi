import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Info,
  MousePointerClick,
  Sparkles,
  X,
} from 'lucide-react';
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

/**
 * Unclippable Portal Pop-up Guide whenever the user points (hovers) or focuses/taps on a menu/field/point.
 */
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
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    placement: 'top' | 'bottom';
  }>({
    top: 0,
    left: 0,
    placement: 'bottom',
  });
  const triggerRef = useRef<HTMLDivElement | null>(null);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 300;
    const tooltipEstimatedHeight = tip ? 145 : 105;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    // Decide whether to show above or below based on available viewport space
    let placement: 'top' | 'bottom' = position === 'top' ? 'top' : 'bottom';
    if (placement === 'bottom' && rect.bottom + tooltipEstimatedHeight + 16 > viewportH) {
      placement = 'top';
    } else if (placement === 'top' && rect.top - tooltipEstimatedHeight - 16 < 0) {
      placement = 'bottom';
    }

    const top = placement === 'bottom' ? rect.bottom + 10 : Math.max(12, rect.top - 10);

    // Clamp horizontal center so the popup never overflows left or right screen edges
    const centerLeft = rect.left + rect.width / 2;
    const minLeft = tooltipWidth / 2 + 12;
    const maxLeft = Math.max(minLeft, viewportW - tooltipWidth / 2 - 12);
    const clampedLeft = Math.min(Math.max(centerLeft, minLeft), maxLeft);

    setCoords({
      top,
      left: clampedLeft,
      placement,
    });
  };

  const handleOpen = () => {
    updatePosition();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onScrollOrResize = () => updatePosition();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [isOpen]);

  return (
    <div
      ref={triggerRef}
      className={`relative ${className}`}
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
      onFocusCapture={handleOpen}
      onBlurCapture={handleClose}
    >
      {children}

      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="tooltip"
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform:
                coords.placement === 'bottom'
                  ? 'translate(-50%, 0)'
                  : 'translate(-50%, -100%)',
              zIndex: 9999,
            }}
            className="pointer-events-none w-[290px] sm:w-[310px] rounded-2xl border border-[#C9AD96] bg-[#FFFDF9]/98 backdrop-blur-md p-3.5 text-left shadow-[0_16px_38px_rgba(59,40,32,0.22)] transition-opacity duration-150"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5">
                <CamelliaBlossomSvg className="w-4 h-4 shrink-0" />
                <span className="font-display text-xs font-bold text-[#3B2820] leading-snug">
                  {title}
                </span>
              </div>
              {badge ? (
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F4DFE2] text-[#5A392C] shrink-0">
                  {badge}
                </span>
              ) : (
                <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#F5EAE0] text-[#6F4B3E] shrink-0">
                  Petunjuk
                </span>
              )}
            </div>

            <p className="text-[11px] sm:text-xs leading-relaxed text-[#5A392C]">
              {description}
            </p>

            {tip && (
              <div className="mt-2 pt-1.5 border-t border-[#EFE4D8] text-[11px] text-[#6F4B3E] leading-snug">
                <span className="font-bold text-[#4A2E23]">Tips Guru:</span> {tip}
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}

/**
 * Label with a subtle "?" Petunjuk pill so users immediately see they can hover/focus any point for instructions.
 */
export function FieldLabelWithGuide({
  label,
  required,
  guideTitle,
  guideDesc,
  guideTip,
}: {
  label: string;
  required?: boolean;
  guideTitle: string;
  guideDesc: string;
  guideTip?: string;
}) {
  return (
    <HoverGuide
      title={guideTitle}
      description={guideDesc}
      tip={guideTip}
      badge="Isian Data"
      position="top"
      className="flex items-center justify-between gap-1.5 mb-1 cursor-help"
    >
      <label className="text-xs font-semibold text-[#5A392C] flex items-center gap-1 cursor-help">
        <span>{label}</span>
        {required && <span className="text-[#C24B3B]">*</span>}
      </label>
      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[#876D60] hover:text-[#5A392C] bg-[#F5ECE2] px-1.5 py-0.5 rounded-md shrink-0">
        <HelpCircle className="w-3 h-3 text-[#6F4B3E]" />
        <span>Petunjuk</span>
      </span>
    </HoverGuide>
  );
}

export type WorkspaceTabId = 'profil' | 'dokumen' | 'bukti_cek' | 'ekspor';

export interface WorkflowStepItem {
  stepNumber: string;
  id: WorkspaceTabId;
  title: string;
  shortDesc: string;
  hoverTitle: string;
  hoverDetail: string;
  hoverTip: string;
  isCompleted: boolean;
  badgeText?: string;
}

interface OnboardingFlowProps {
  steps: WorkflowStepItem[];
  activeTab: WorkspaceTabId;
  onSelectTab: (tab: WorkspaceTabId) => void;
  onLoadSampleProfile: () => void;
  onGenerateAll13: () => void;
}

export function OnboardingWorkflowBar({
  steps,
  activeTab,
  onSelectTab,
  onLoadSampleProfile,
  onGenerateAll13,
}: OnboardingFlowProps) {
  const [activeGuideStepIndex, setActiveGuideStepIndex] = useState<number | null>(null);
  const [hoveredStepId, setHoveredStepId] = useState<WorkspaceTabId | null>(null);

  const activeModalStep =
    activeGuideStepIndex !== null ? steps[activeGuideStepIndex] : null;

  // Show the hovered step's explanation or the currently selected tab's explanation
  const explainedStep =
    steps.find((s) => s.id === (hoveredStepId || activeTab)) || steps[0];

  return (
    <section className="mb-5 relative z-10">
      {/* Compact Stepper Bar — 2x2 grid on mobile, 4 columns on desktop */}
      <div className="bg-[#FFFDF9]/92 backdrop-blur-xs border border-[#E7D8C9] rounded-2xl p-3 sm:p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-[#EFE4D8]">
          <div className="flex items-center gap-2 min-w-0">
            <CamelliaBlossomSvg className="w-4 h-4 shrink-0" />
            <span className="text-xs font-bold text-[#4A3127]">
              Alur Penggunaan Aplikasi (Arahkan kursor atau klik poin untuk melihat petunjuk):
            </span>
          </div>

          <HoverGuide
            title="Tur Panduan Penggunaan Lengkap"
            description="Membuka jendela panduan langkah demi langkah (Langkah 1 sampai 4) agar Bapak/Ibu Guru memahami alur pembuatan berkas RPL dengan mudah."
            tip="Klik tombol ini kapan saja jika Anda baru pertama kali membuka aplikasi."
            badge="Panduan Pemula"
            position="bottom"
          >
            <button
              type="button"
              onClick={() => setActiveGuideStepIndex(0)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#4A2E23] bg-[#F4DFE2] hover:bg-[#EBCAD0] border border-[#E2C2C7] rounded-xl transition-colors whitespace-nowrap shrink-0"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#6F4B3E]" />
              <span>Cara Pakai Aplikasi (Panduan)</span>
            </button>
          </HoverGuide>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {steps.map((step, index) => {
            const isActive = activeTab === step.id;
            return (
              <HoverGuide
                key={step.id}
                title={step.hoverTitle}
                description={step.hoverDetail}
                tip={step.hoverTip}
                badge={`Langkah ${step.stepNumber}`}
                position="bottom"
                className="block"
              >
                <div
                  onMouseEnter={() => setHoveredStepId(step.id)}
                  onMouseLeave={() => setHoveredStepId(null)}
                  className="relative h-full"
                >
                  <button
                    type="button"
                    onClick={() => onSelectTab(step.id)}
                    className={`w-full h-full text-left p-2.5 sm:p-3 rounded-xl border transition-all flex flex-col justify-between min-h-[76px] ${
                      isActive
                        ? 'bg-[#6F4B3E] text-[#FFFDF9] border-[#6F4B3E] shadow-xs'
                        : step.isCompleted
                        ? 'bg-[#F6FAF5] text-[#3B2820] border-[#CBE0C9] hover:border-[#8FB38D]'
                        : 'bg-[#FCF9F5] text-[#3B2820] border-[#E7D8C9] hover:bg-[#FAF2EA]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <span
                        className={`font-mono text-[11px] font-bold tabular-nums ${
                          isActive ? 'text-[#F5DFE2]' : 'text-[#7E6458]'
                        }`}
                      >
                        POIN {step.stepNumber}
                      </span>
                      <div className="flex items-center gap-1">
                        {step.isCompleted && (
                          <CheckCircle2
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isActive ? 'text-[#DCE8D8]' : 'text-[#3F6A45]'
                            }`}
                          />
                        )}
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveGuideStepIndex(index);
                          }}
                          title="Klik untuk penjelasan detail langkah ini"
                          className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
                            isActive
                              ? 'bg-white/20 text-white hover:bg-white/30'
                              : 'bg-[#EFE4D8] text-[#6F4B3E] hover:bg-[#E2D1C0]'
                          }`}
                        >
                          ?
                        </span>
                      </div>
                    </div>

                    <div className="font-bold text-xs sm:text-sm leading-snug truncate">
                      {step.title}
                    </div>
                    <div
                      className={`text-[11px] truncate mt-0.5 ${
                        isActive ? 'text-[#EFE0D4]' : 'text-[#876D60]'
                      }`}
                    >
                      {step.badgeText || step.shortDesc}
                    </div>
                  </button>
                </div>
              </HoverGuide>
            );
          })}
        </div>

        {/* Live Contextual Explanation Strip for the Pointed / Active Step */}
        {explainedStep && (
          <div className="mt-3 px-3.5 py-2.5 rounded-xl bg-[#FAF2EA] border border-[#E6D4C3] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-start gap-2.5 min-w-0">
              <Info className="w-4 h-4 text-[#6F4B3E] shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed text-[#4A3127]">
                <span className="font-bold text-[#3B2820] mr-1.5">
                  Petunjuk {explainedStep.hoverTitle}:
                </span>
                <span>{explainedStep.hoverDetail}</span>
                <span className="block sm:inline sm:ml-2 text-[#6F4B3E] font-medium">
                  ({explainedStep.hoverTip})
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#7E6458] shrink-0">
              <MousePointerClick className="w-3.5 h-3.5 text-[#6F4B3E]" />
              <span>Arahkan kursor ke tombol/isian untuk info detail</span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Step-by-Step Guide Modal */}
      {activeModalStep && activeGuideStepIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B1C16]/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-[#DFCBB8] bg-[#FFFDF9] p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#EFE4D8]">
              <div className="flex items-center gap-2">
                <CamelliaBlossomSvg className="w-4 h-4" />
                <span className="font-mono text-xs font-bold text-[#6F4B3E]">
                  PETUNJUK POIN {activeModalStep.stepNumber} DARI {steps.length}
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

            <div className="py-4 space-y-3">
              <h3 className="font-display text-lg font-bold text-[#3B2820]">
                {activeModalStep.hoverTitle}
              </h3>
              <p className="text-xs sm:text-sm text-[#5E4539] leading-relaxed">
                {activeModalStep.hoverDetail}
              </p>
              <div className="p-3 rounded-xl bg-[#FAF2EA] border border-[#E7D8C9] text-xs text-[#5A392C] leading-relaxed">
                <strong className="block mb-0.5 text-[#3B2820]">Tips Guru:</strong>
                {activeModalStep.hoverTip}
              </div>

              {activeGuideStepIndex === 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onLoadSampleProfile();
                    setActiveGuideStepIndex(1);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#4A2E23] bg-[#F4DFE2] hover:bg-[#EBCAD0] rounded-xl transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#6F4B3E]" />
                  <span>Gunakan Contoh Data Fiktif & Lanjut →</span>
                </button>
              )}

              {activeGuideStepIndex === 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveGuideStepIndex(null);
                    onSelectTab('dokumen');
                    onGenerateAll13();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#FFFDF9] bg-[#6F4B3E] hover:bg-[#58392E] rounded-xl transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Semua 13 Dokumen Sekarang</span>
                </button>
              )}
            </div>

            <div className="pt-3 border-t border-[#EFE4D8] flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {steps.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveGuideStepIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === activeGuideStepIndex ? 'w-5 bg-[#6F4B3E]' : 'w-2 bg-[#DFCBB8]'
                    }`}
                    aria-label={`Langkah ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab(activeModalStep.id);
                    setActiveGuideStepIndex(null);
                  }}
                  className="px-3 py-2 text-xs font-semibold text-[#5A392C] bg-[#F5EAE0] hover:bg-[#EAD8C8] rounded-xl"
                >
                  Buka Menu Ini
                </button>

                {activeGuideStepIndex < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveGuideStepIndex(activeGuideStepIndex + 1)}
                    className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-[#FFFDF9] bg-[#6F4B3E] hover:bg-[#58392E] rounded-xl"
                  >
                    <span>Lanjut</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveGuideStepIndex(null)}
                    className="px-3.5 py-2 text-xs font-semibold text-[#FFFDF9] bg-[#4F6D52] hover:bg-[#3F5942] rounded-xl"
                  >
                    Selesai
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
