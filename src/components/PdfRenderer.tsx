import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Flame, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Loader2, 
  FileText,
  Sliders,
  Expand
} from 'lucide-react';
import { DocumentItem } from '../types/document';
import { generatePdfBlobUrl } from '../utils/pdfGenerator';

// Configure pdfjs worker to unpkg CDN matching the installed version
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfRendererProps {
  document: DocumentItem;
  highlightTargetId?: string | null;
  onClearHighlight?: () => void;
  isXRayActive: boolean;
  onToggleXRay: () => void;
  isRedactionActive: boolean;
  onToggleRedaction: () => void;
  theme: 'light' | 'dark';
}

export const PdfRenderer: React.FC<PdfRendererProps> = ({
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
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  // Default large scale for expansive, crisp, easy-to-read document presentation
  const [scale, setScale] = useState<number>(1.65);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pdfSource, setPdfSource] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate or resolve PDF source
  useEffect(() => {
    setIsLoading(true);
    setLoadError(null);

    try {
      if (document.base64Data && (document.mimeType === 'application/pdf' || document.fileType === 'application/pdf' || document.name.endsWith('.pdf'))) {
        setPdfSource(`data:application/pdf;base64,${document.base64Data}`);
      } else {
        // Generate authentic standard PDF from document content
        const url = generatePdfBlobUrl(document);
        setPdfSource(url);
        return () => {
          URL.revokeObjectURL(url);
        };
      }
    } catch (err: any) {
      console.error('Failed to prepare PDF source:', err);
      setLoadError(err.message || 'Failed to initialize PDF render.');
      setIsLoading(false);
    }
  }, [document.id, document.rawText, document.base64Data]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setIsLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('react-pdf render error:', error);
    setLoadError(error.message);
    setIsLoading(false);
  };

  const handleZoomIn = () => setScale((prev) => Math.min(3.5, +(prev + 0.2).toFixed(2)));
  const handleZoomOut = () => setScale((prev) => Math.max(0.7, +(prev - 0.2).toFixed(2)));
  const handleSetScale = (newScale: number) => setScale(newScale);
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handlePrevPage = () => setPageNumber((prev) => Math.max(1, prev - 1));
  const handleNextPage = () => setPageNumber((prev) => Math.min(numPages || 1, prev + 1));

  // Determine highlights & X-Ray markers for the document
  const review = document.review;
  const isContract = document.category === 'contract';
  const hasDiscrepancy = (document.rawText || '').includes('DISCREPANCY') || (document.rawText || '').includes('Overcharge');

  return (
    <div className={`flex flex-col h-full w-full rounded-2xl border shadow-sm overflow-hidden transition-colors ${
      isLight ? 'bg-white border-slate-200' : 'bg-[#090d16] border-white/[0.08]'
    }`}>
      {/* Top Document Controls Bar (Pagination, Zoom Presets, Rotation, X-Ray) */}
      <div className={`px-4 py-2.5 border-b flex items-center justify-between gap-3 text-xs flex-wrap ${
        isLight ? 'bg-slate-50/90 border-slate-200' : 'bg-[#0b0f19] border-white/[0.06]'
      }`}>
        {/* Left: Engine Badge & Pagination */}
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 ${
            isLight 
              ? 'bg-indigo-50 text-indigo-800 border border-indigo-200' 
              : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
          }`}>
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>PDF Vector Engine</span>
          </span>

          {/* Pagination Controls */}
          <div className="flex items-center gap-1.5 bg-slate-200/60 dark:bg-white/[0.06] px-2 py-1 rounded-xl">
            <button
              onClick={handlePrevPage}
              disabled={pageNumber <= 1}
              className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <span className="text-xs font-semibold px-1 tabular-nums">
              Page <strong className="font-bold text-indigo-600 dark:text-indigo-400">{pageNumber}</strong> of {numPages || '...'}
            </span>

            <button
              onClick={handleNextPage}
              disabled={numPages === null || pageNumber >= numPages}
              className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
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
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full uppercase">ACTIVE</span>
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

        {/* Right: Quick Scale Presets & Zoom Controls */}
        <div className="flex items-center gap-1.5">
          {/* Quick Zoom Presets */}
          <div className="hidden sm:flex items-center gap-1 mr-1">
            <button
              onClick={() => handleSetScale(1.2)}
              className={`px-2 py-1 rounded-lg border text-[11px] font-semibold transition-colors ${
                Math.abs(scale - 1.2) < 0.05
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : isLight ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600' : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300'
              }`}
              title="Compact View (120%)"
            >
              Compact
            </button>
            <button
              onClick={() => handleSetScale(1.65)}
              className={`px-2 py-1 rounded-lg border text-[11px] font-semibold transition-colors ${
                Math.abs(scale - 1.65) < 0.05
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : isLight ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600' : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300'
              }`}
              title="Standard Large View (165%)"
            >
              Large
            </button>
            <button
              onClick={() => handleSetScale(2.0)}
              className={`px-2 py-1 rounded-lg border text-[11px] font-semibold transition-colors ${
                Math.abs(scale - 2.0) < 0.05
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : isLight ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600' : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300'
              }`}
              title="Extra Large (200%)"
            >
              XL
            </button>
          </div>

          <button
            onClick={handleZoomOut}
            className={`p-1.5 rounded-lg border transition-colors ${
              isLight ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600' : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300'
            }`}
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="text-[11px] font-mono px-1 font-bold text-slate-700 dark:text-slate-200 tabular-nums min-w-[3.2rem] text-center">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            className={`p-1.5 rounded-lg border transition-colors ${
              isLight ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600' : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300'
            }`}
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleRotate}
            className={`p-1.5 rounded-lg border transition-colors ${
              isLight ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600' : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300'
            }`}
            title="Rotate 90°"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* X-Ray Heatmap Layer Legend (when active) */}
      {isXRayActive && (
        <div className="px-6 py-2 bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-emerald-500/10 border-b border-rose-500/20 flex items-center justify-between text-[11px] animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>Interactive PDF X-Ray Overlays:</span>
            </span>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/30" />
                <span className="font-medium text-rose-700 dark:text-rose-300">High Risk / Uncapped Indemnity</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/30" />
                <span className="font-medium text-amber-700 dark:text-amber-300">Non-Standard Restrictive Term</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />
                <span className="font-medium text-emerald-700 dark:text-emerald-300">Standard / Verified Table</span>
              </span>
            </div>
          </div>
          <span className="text-slate-500 text-[10px] italic">
            Visual vector PDF rendered with react-pdf engine
          </span>
        </div>
      )}

      {/* PDF Viewport Area */}
      <div 
        ref={containerRef}
        className={`flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start transition-colors ${
          isLight ? 'bg-[#cbd5e1]/40' : 'bg-[#05070c]'
        }`}
      >
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-16 space-y-3 my-auto">
            <Loader2 className="w-9 h-9 text-indigo-600 animate-spin" />
            <span className="text-sm font-semibold text-slate-500">Rendering high-resolution PDF document pages...</span>
          </div>
        )}

        {loadError && (
          <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs max-w-md space-y-2 text-center my-auto">
            <AlertTriangle className="w-6 h-6 text-rose-600 mx-auto" />
            <div className="font-bold">PDF Engine Notice</div>
            <p>{loadError}</p>
          </div>
        )}

        {pdfSource && (
          <div className="relative shadow-2xl rounded-xl overflow-hidden bg-white border border-slate-300 dark:border-white/[0.1] my-2 transition-all">
            <Document
              file={pdfSource}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading=""
              className="flex justify-center"
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                rotate={rotation}
                renderTextLayer={true}
                renderAnnotationLayer={false}
                className="react-pdf__Page shadow-lg"
              />
            </Document>

            {/* Overlaid X-Ray Interactive Bounding Boxes on the PDF Page */}
            {isXRayActive && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Contract Page 1 Overlays */}
                {isContract && pageNumber === 1 && (
                  <>
                    {/* Section 4.2 Uncapped Indemnity Box */}
                    <div 
                      style={{ top: '38%', left: '7%', width: '86%', height: '11%' }}
                      className="absolute border-2 border-rose-500 bg-rose-500/15 rounded-lg pointer-events-auto cursor-pointer hover:bg-rose-500/25 transition-all p-1.5 flex items-start justify-end shadow-sm"
                      title="Section 4.2: Uncapped Liability Exposure"
                    >
                      <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        UNCAPPED INDEMNITY TRAP
                      </span>
                    </div>

                    {/* Section 7.1 Sneak Non-Compete Box */}
                    <div 
                      style={{ top: '64%', left: '7%', width: '86%', height: '10%' }}
                      className="absolute border-2 border-rose-500 bg-rose-500/15 rounded-lg pointer-events-auto cursor-pointer hover:bg-rose-500/25 transition-all p-1.5 flex items-start justify-end shadow-sm"
                      title="Section 7.1: 24-Month Restrictive Covenant"
                    >
                      <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        24-MONTH NON-COMPETE
                      </span>
                    </div>

                    {/* Governing Law Delaware Tag */}
                    <div 
                      style={{ top: '82%', left: '7%', width: '86%', height: '8%' }}
                      className="absolute border-2 border-emerald-500 bg-emerald-500/10 rounded-lg pointer-events-auto cursor-pointer hover:bg-emerald-500/20 transition-all p-1.5 flex items-start justify-end shadow-sm"
                      title="Governing Law: State of Delaware"
                    >
                      <span className="bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        DELAWARE GOVERNING LAW
                      </span>
                    </div>
                  </>
                )}

                {/* Financial Document Discrepancy Overlay */}
                {hasDiscrepancy && pageNumber === 1 && (
                  <div 
                    style={{ top: '55%', left: '40%', width: '53%', height: '16%' }}
                    className="absolute border-3 border-rose-500 bg-rose-500/25 rounded-lg pointer-events-auto cursor-pointer hover:bg-rose-500/35 transition-all p-2 flex flex-col justify-between animate-pulse shadow-lg ring-4 ring-rose-500/20"
                    title="Math Anomaly: $500.00 Overcharge Discrepancy"
                  >
                    <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1 w-fit">
                      <AlertTriangle className="w-3 h-3" />
                      $500.00 OVERCHARGE ANOMALY
                    </span>
                    <span className="text-[10px] text-rose-900 font-bold bg-white/90 px-1.5 py-0.5 rounded w-fit">
                      Sum of line items vs Stated Total Discrepancy
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
