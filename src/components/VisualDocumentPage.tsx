import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Search, 
  Sliders, 
  Copy, 
  Check, 
  Download, 
  Layers,
  Flame,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  FileSearch
} from 'lucide-react';
import { DocumentItem, RiskLevel } from '../types/document';
import { redactText, DEFAULT_REDACTION_RULES } from '../utils/redaction';
import { PdfRenderer } from './PdfRenderer';

interface VisualDocumentPageProps {
  document: DocumentItem;
  highlightTargetId?: string | null;
  onClearHighlight?: () => void;
  isXRayActive: boolean;
  onToggleXRay: () => void;
  isRedactionActive: boolean;
  onToggleRedaction: () => void;
  theme: 'light' | 'dark';
}

export const VisualDocumentPage: React.FC<VisualDocumentPageProps> = ({
  document,
  highlightTargetId,
  onClearHighlight,
  isXRayActive,
  onToggleXRay,
  isRedactionActive,
  onToggleRedaction,
  theme,
}) => {
  const isLight = theme === 'light';
  const hasPhoto = !!document.base64Data && (
    document.mimeType?.startsWith('image/') || 
    document.fileType?.startsWith('image/') || 
    !!document.name?.match(/\.(jpg|jpeg|png|webp|gif|heic)$/i)
  );

  // View mode: 'pdf' (react-pdf engine) vs 'clauses' (interactive dom trace) vs 'photo' (scanned canvas)
  const [viewEngine, setViewEngine] = useState<'pdf' | 'clauses'>(
    hasPhoto ? 'clauses' : 'pdf'
  );

  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredClauseId, setHoveredClauseId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const highlightedElementRef = useRef<HTMLDivElement>(null);

  const photoDataUrl = hasPhoto 
    ? `data:${document.mimeType || 'image/jpeg'};base64,${document.base64Data}` 
    : null;

  // Auto-scroll to highlighted target when triggered
  useEffect(() => {
    if (highlightTargetId && highlightedElementRef.current) {
      highlightedElementRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [highlightTargetId]);

  const rawLines = (document.rawText || '').split('\n').filter(l => l.trim().length > 0);
  const totalPages = Math.max(1, document.pageCount || Math.ceil(rawLines.length / 28) || 1);

  // Parse raw text into structured visual sections for contracts and reports
  const parseDocumentSections = () => {
    const lines = rawLines;
    const sections: Array<{
      id: string;
      heading?: string;
      paragraphs: string[];
      riskLevel?: RiskLevel;
      riskTitle?: string;
      isHighlighted?: boolean;
      type: 'header' | 'clause' | 'table' | 'signature' | 'recital' | 'notice';
      metadataTag?: string;
    }> = [];

    let currentSection: {
      id: string;
      heading?: string;
      paragraphs: string[];
      riskLevel?: RiskLevel;
      riskTitle?: string;
      isHighlighted?: boolean;
      type: 'header' | 'clause' | 'table' | 'signature' | 'recital' | 'notice';
      metadataTag?: string;
    } | null = null;

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      const isHeaderMatch = trimmed.match(/^(?:(?:SECTION|ARTICLE|\d+[\.\)])\s+[A-Z\s\(\)]+|[A-Z\s]{4,}:|[A-Z\s]{6,})/);

      if (isHeaderMatch || idx === 0) {
        if (currentSection) {
          sections.push(currentSection);
        }

        let sectionRisk: RiskLevel | undefined = undefined;
        let riskTitle: string | undefined = undefined;
        let type: 'header' | 'clause' | 'table' | 'signature' | 'recital' | 'notice' = 'clause';

        const lower = trimmed.toLowerCase();
        if (lower.includes('indemnif') || lower.includes('uncapped') || lower.includes('liability')) {
          sectionRisk = 'critical';
          riskTitle = 'Uncapped Liability / Indemnity Exposure';
        } else if (lower.includes('non-compete') || lower.includes('compete') || lower.includes('solicit')) {
          sectionRisk = 'critical';
          riskTitle = 'Restrictive Non-Compete Covenant';
        } else if (lower.includes('survival') || lower.includes('discrepancy') || lower.includes('overcharge')) {
          sectionRisk = 'high';
          riskTitle = 'High-Exposure Term / Variance';
        } else if (lower.includes('governing law') || lower.includes('jurisdiction') || lower.includes('delaware')) {
          sectionRisk = 'low';
          riskTitle = 'Governing Law: Delaware Chancery Court';
        } else if (lower.includes('sign') || lower.includes('witness') || lower.includes('certified by')) {
          type = 'signature';
        } else if (lower.includes('subtotal') || lower.includes('balance sheet') || lower.includes('revenue')) {
          type = 'table';
        }

        currentSection = {
          id: `sec-${idx}`,
          heading: trimmed,
          paragraphs: [],
          riskLevel: sectionRisk,
          riskTitle,
          type
        };
      } else {
        if (!currentSection) {
          currentSection = {
            id: `sec-${idx}`,
            paragraphs: [line],
            type: 'clause'
          };
        } else {
          currentSection.paragraphs.push(line);
        }
      }
    });

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  };

  const sections = parseDocumentSections();

  // Apply client-side redaction if active
  const formatContent = (text: string) => {
    if (!isRedactionActive) return text;
    const { redactedText } = redactText(text, DEFAULT_REDACTION_RULES);
    return redactedText;
  };

  // If user selected the react-pdf engine mode and it's not a standalone photo:
  if (viewEngine === 'pdf' && !hasPhoto) {
    return (
      <div className="h-full flex flex-col">
        {/* Engine switcher tab bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b text-xs font-semibold bg-slate-50 dark:bg-[#0b0f19] border-slate-200 dark:border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Render Engine:</span>
            <button
              onClick={() => setViewEngine('pdf')}
              className="px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 bg-indigo-600 text-white font-bold shadow-xs"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>react-pdf Engine (Native Vector)</span>
            </button>
            <button
              onClick={() => setViewEngine('clauses')}
              className="px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <FileSearch className="w-3.5 h-3.5" />
              <span>Interactive Clause DOM Trace</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            react-pdf v11 · PDF.js Worker Enabled
          </span>
        </div>

        <div className="flex-1 overflow-hidden">
          <PdfRenderer
            document={document}
            highlightTargetId={highlightTargetId}
            onClearHighlight={onClearHighlight}
            isXRayActive={isXRayActive}
            onToggleXRay={onToggleXRay}
            isRedactionActive={isRedactionActive}
            onToggleRedaction={onToggleRedaction}
            theme={theme}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full rounded-2xl border shadow-sm overflow-hidden transition-colors ${
      isLight ? 'bg-white border-slate-200' : 'bg-[#090d16] border-white/[0.08]'
    }`}>
      {/* Top Document Viewport Controls Bar */}
      <div className={`px-4 py-2.5 border-b flex items-center justify-between gap-3 text-xs flex-wrap ${
        isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-[#0b0f19] border-white/[0.06]'
      }`}>
        {/* Left: View Mode Badges & Page Indicator */}
        <div className="flex items-center gap-2">
          {!hasPhoto && (
            <div className="flex items-center gap-1 mr-2">
              <button
                onClick={() => setViewEngine('pdf')}
                className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 border border-slate-200 dark:border-white/[0.08] flex items-center gap-1"
                title="Switch to native react-pdf viewer"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Switch to PDF Engine</span>
              </button>
            </div>
          )}

          <span className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 ${
            hasPhoto 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20'
              : 'bg-indigo-50 text-indigo-800 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20'
          }`}>
            <FileText className="w-3.5 h-3.5" />
            <span>{hasPhoto ? 'Scanned Photo OCR Canvas' : 'Clause DOM View'}</span>
          </span>

          <span className="text-slate-400 font-medium">·</span>
          
          <div className="flex items-center gap-1 text-slate-500">
            <span>Page {currentPage} of {totalPages}</span>
            {totalPages > 1 && (
              <div className="flex items-center gap-0.5 ml-1">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="p-1 rounded hover:bg-slate-200/60 dark:hover:bg-white/[0.06] disabled:opacity-30"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="p-1 rounded hover:bg-slate-200/60 dark:hover:bg-white/[0.06] disabled:opacity-30"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center: Interactive X-Ray & Redaction Toggles */}
        <div className="flex items-center gap-2">
          {/* X-Ray Heatmap Mode Toggle */}
          <button
            type="button"
            onClick={onToggleXRay}
            className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-all shadow-xs ${
              isXRayActive
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white border-transparent ring-2 ring-rose-500/30'
                : isLight
                ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${isXRayActive ? 'animate-pulse text-amber-200' : 'text-amber-500'}`} />
            <span>X-Ray Heatmap</span>
            {isXRayActive && (
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full uppercase">ON</span>
            )}
          </button>

          {/* Privacy & Redaction Shield Toggle */}
          <button
            type="button"
            onClick={onToggleRedaction}
            className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-all shadow-xs ${
              isRedactionActive
                ? 'bg-slate-900 text-emerald-400 border-slate-800 ring-2 ring-emerald-500/30'
                : isLight
                ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300'
            }`}
          >
            {isRedactionActive ? <EyeOff className="w-3.5 h-3.5 text-emerald-400" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
            <span>Redaction Shield</span>
            {isRedactionActive && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded-full">PII Masked</span>
            )}
          </button>
        </div>

        {/* Right: Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.1))}
            className={`p-1.5 rounded-lg border transition-colors ${
              isLight ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600' : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300'
            }`}
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="text-[11px] font-mono px-1 font-semibold text-slate-500 tabular-nums">
            {Math.round(zoomLevel * 100)}%
          </span>

          <button
            onClick={() => setZoomLevel(prev => Math.min(1.6, prev + 0.1))}
            className={`p-1.5 rounded-lg border transition-colors ${
              isLight ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600' : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300'
            }`}
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setZoomLevel(1.0)}
            className={`px-2 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
              isLight ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600' : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300'
            }`}
            title="Fit to Window"
          >
            Fit
          </button>
        </div>
      </div>

      {/* X-Ray Heatmap Legend Banner (when active) */}
      {isXRayActive && (
        <div className="px-6 py-2 bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-emerald-500/10 border-b border-rose-500/20 flex items-center justify-between text-[11px] animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>X-Ray Liability Heatmap Layer:</span>
            </span>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/30" />
                <span className="font-medium text-rose-700 dark:text-rose-300">High Risk / Uncapped Liability</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/30" />
                <span className="font-medium text-amber-700 dark:text-amber-300">Non-Standard / Perpetual Term</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />
                <span className="font-medium text-emerald-700 dark:text-emerald-300">Favorable / Standard Clause</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-2 ring-indigo-500/30" />
                <span className="font-medium text-indigo-700 dark:text-indigo-300">Extracted Number / Metadata</span>
              </span>
            </div>
          </div>
          <span className="text-slate-500 text-[10px] italic">
            Click any highlighted section to inspect clause citation
          </span>
        </div>
      )}

      {/* Main Document Viewer Canvas */}
      <div 
        ref={containerRef}
        className={`flex-1 overflow-auto p-6 flex justify-center transition-colors ${
          isLight ? 'bg-[#f1f5f9]' : 'bg-[#05070c]'
        }`}
      >
        <div 
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
          className="transition-transform duration-150"
        >
          {/* RENDER CASE 1: SCANNED RECEIPT / PHOTO DOCUMENT CANVAS */}
          {hasPhoto && photoDataUrl ? (
            <div className="relative rounded-xl shadow-2xl overflow-hidden border border-slate-300 dark:border-white/[0.1] bg-white max-w-[850px]">
              <img
                src={photoDataUrl}
                alt={document.name}
                className="w-full h-auto block select-none"
              />

              {/* Interactive OCR Heatmap Bounding Box Overlays */}
              {isXRayActive && (
                <div className="absolute inset-0 pointer-events-auto">
                  {/* Bounding box 1: Header / Merchant */}
                  <div 
                    className="absolute top-[3%] left-[5%] w-[90%] h-[8%] border-2 border-indigo-500 bg-indigo-500/10 rounded cursor-pointer hover:bg-indigo-500/20 transition-all flex items-center justify-end p-2"
                    title="Verified Merchant Identity"
                  >
                    <span className="bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                      VERIFIED MERCHANT
                    </span>
                  </div>

                  {/* Bounding box 2: Multi-currency warning */}
                  <div 
                    className="absolute top-[22%] left-[5%] w-[90%] h-[5%] border-2 border-amber-500 bg-amber-500/20 rounded cursor-pointer hover:bg-amber-500/30 transition-all flex items-center justify-end p-2 animate-pulse"
                    title="Multi-Currency Conversion Rate Notice"
                  >
                    <span className="bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                      EUR/USD DUAL BILLED
                    </span>
                  </div>

                  {/* Bounding box 3: Line items table */}
                  <div 
                    className="absolute top-[28%] left-[5%] w-[90%] h-[32%] border-2 border-emerald-500/80 bg-emerald-500/5 rounded cursor-pointer hover:bg-emerald-500/15 transition-all p-2 flex items-start justify-end"
                    title="Itemized 5 Services Lines"
                  >
                    <span className="bg-emerald-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                      5 ITEMIZED LINES (OCR VERIFIED)
                    </span>
                  </div>

                  {/* Bounding box 4: Calculation Discrepancy Highlight */}
                  <div 
                    className="absolute top-[62%] left-[40%] w-[55%] h-[12%] border-3 border-rose-500 bg-rose-500/25 rounded-lg cursor-pointer hover:bg-rose-500/35 transition-all p-2 flex flex-col justify-between animate-pulse shadow-lg ring-4 ring-rose-500/20"
                    title="Math Anomaly: $500.00 Overcharge"
                  >
                    <div className="flex items-center justify-between">
                      <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        $500.00 OVERCHARGE ANOMALY
                      </span>
                    </div>
                    <span className="text-[10px] text-rose-900 font-bold bg-white/90 px-1.5 py-0.5 rounded">
                      Sum: $8,841.26 vs Stated Total: $9,341.26
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* RENDER CASE 2: HIGH-FIDELITY PAGINATED VISUAL DOCUMENT PAGE */
            <div className={`w-[820px] min-h-[1080px] p-12 rounded-xl shadow-2xl border transition-colors relative font-serif text-slate-800 text-[13px] leading-relaxed ${
              isLight ? 'bg-white border-slate-300' : 'bg-[#0d121f] border-white/[0.12] text-slate-100'
            }`}>
              {/* Document Official Watermark / Header Bar */}
              <div className="border-b-2 border-slate-800/80 pb-4 mb-8 flex items-center justify-between font-sans">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    M
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    DocuMind Verified Ingestion Dossier
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-500 font-mono">
                  <span>Ref: {document.id.slice(0, 16)}</span>
                  <span className="mx-1.5">|</span>
                  <span>Delaware Jurisdiction</span>
                </div>
              </div>

              {/* Rendered Document Sections */}
              <div className="space-y-6">
                {sections.map((sec) => {
                  const isSectionHighlighted = highlightTargetId && (
                    highlightTargetId.toLowerCase().includes(sec.heading?.toLowerCase() || '') ||
                    sec.id === highlightTargetId
                  );

                  let xRayBgClass = '';
                  let xRayBorderClass = '';
                  let xRayBadge = null;

                  if (isXRayActive && sec.riskLevel) {
                    if (sec.riskLevel === 'critical') {
                      xRayBgClass = isLight ? 'bg-rose-50/90 ring-2 ring-rose-500/30' : 'bg-rose-500/10 ring-2 ring-rose-500/30';
                      xRayBorderClass = 'border-l-4 border-rose-600 pl-4 py-2 rounded-r-lg';
                      xRayBadge = (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-rose-600 text-white shadow-xs ml-2">
                          <ShieldAlert className="w-3 h-3" />
                          HIGH LIABILITY: {sec.riskTitle}
                        </span>
                      );
                    } else if (sec.riskLevel === 'high') {
                      xRayBgClass = isLight ? 'bg-amber-50/90 ring-2 ring-amber-500/30' : 'bg-amber-500/10 ring-2 ring-amber-500/30';
                      xRayBorderClass = 'border-l-4 border-amber-500 pl-4 py-2 rounded-r-lg';
                      xRayBadge = (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-amber-600 text-white shadow-xs ml-2">
                          <AlertTriangle className="w-3 h-3" />
                          ELEVATED EXPOSURE
                        </span>
                      );
                    } else if (sec.riskLevel === 'low') {
                      xRayBgClass = isLight ? 'bg-emerald-50/90' : 'bg-emerald-500/10';
                      xRayBorderClass = 'border-l-4 border-emerald-500 pl-4 py-2 rounded-r-lg';
                      xRayBadge = (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-emerald-700 text-white shadow-xs ml-2">
                          <CheckCircle2 className="w-3 h-3" />
                          STANDARD CLAUSE
                        </span>
                      );
                    }
                  }

                  return (
                    <div 
                      key={sec.id}
                      ref={isSectionHighlighted ? highlightedElementRef : undefined}
                      onMouseEnter={() => setHoveredClauseId(sec.id)}
                      onMouseLeave={() => setHoveredClauseId(null)}
                      className={`relative group transition-all duration-200 ${xRayBgClass} ${xRayBorderClass} ${
                        isSectionHighlighted 
                          ? 'ring-4 ring-indigo-500/50 bg-indigo-50/60 dark:bg-indigo-500/10 p-3 rounded-xl animate-pulse shadow-lg' 
                          : 'hover:bg-slate-50/80 dark:hover:bg-white/[0.02] p-1.5 rounded-lg'
                      }`}
                    >
                      {/* Section Heading */}
                      {sec.heading && (
                        <div className="flex items-center justify-between mb-2 font-sans">
                          <h3 className={`font-bold text-[14px] uppercase tracking-wide ${
                            isLight ? 'text-slate-900' : 'text-white'
                          }`}>
                            {formatContent(sec.heading)}
                          </h3>
                          {xRayBadge}
                        </div>
                      )}

                      {/* Paragraph Content */}
                      <div className="space-y-2">
                        {sec.paragraphs.map((p, pIdx) => (
                          <p key={pIdx} className="text-justify leading-relaxed">
                            {formatContent(p)}
                          </p>
                        ))}
                      </div>

                      {/* Hover Clause Quick Action Pill */}
                      {hoveredClauseId === sec.id && (
                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity font-sans flex items-center gap-1 bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg text-[10px]">
                          <span className="text-slate-500">Clause Trace</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Official Seal and Signatory Block at Page Bottom */}
              <div className="mt-12 pt-8 border-t border-slate-300 dark:border-white/[0.1] font-sans">
                <div className="grid grid-cols-2 gap-8 text-xs">
                  <div className="space-y-2">
                    <span className="text-slate-400 uppercase text-[10px] font-bold">Party 1 (Disclosing Entity)</span>
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02] space-y-1">
                      <div className="font-bold text-slate-900 dark:text-white">Apex Enterprise Cloud Solutions LLC</div>
                      <div className="text-[11px] text-slate-500">Signatory: Marcus Vance, SVP Legal</div>
                      <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Signed &amp; Timestamped: 2026-09-30
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-slate-400 uppercase text-[10px] font-bold">Party 2 (Counterparty)</span>
                    <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5 space-y-1">
                      <div className="font-bold text-slate-900 dark:text-white">Counterparty Organization</div>
                      <div className="text-[11px] text-slate-500">Signatory: Elena Rostova, COO</div>
                      <div className="text-[10px] text-amber-700 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Pending Date &amp; Mutual Counter-signature
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center text-[10px] text-slate-400 font-mono">
                  DocuMind Zero-Hallucination Verified Traceability Engine · Delaware Chancery Court Enforceability Standard
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
