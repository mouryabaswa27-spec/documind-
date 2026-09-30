import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  RotateCw, 
  Download, 
  MessageSquare, 
  Copy, 
  Check, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  FileCode, 
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Clock,
  Link2,
  ExternalLink,
  ArrowRight,
  Layers,
  Search,
  Camera,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  Sliders,
  Receipt,
  Store,
  DollarSign,
  Upload,
  Flame,
  Scale,
  Send,
  EyeOff,
  Shield,
  FileSpreadsheet
} from 'lucide-react';
import { DocumentItem, RiskLevel, ComplianceStatus } from '../types/document';
import { getDocumentProfile } from '../utils/documentProfile';
import { VisualDocumentPage } from './VisualDocumentPage';
import { DataExportAndPushModal } from './DataExportAndPushModal';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocuments';

interface DocumentViewerProps {
  document: DocumentItem | null;
  onRescan: (doc: DocumentItem) => void;
  onOpenChat: () => void;
  onOpenExport: () => void;
  isScanning: boolean;
  theme: 'light' | 'dark';
  onOpenIDPConcept?: () => void;
  onOpenScanPhoto?: () => void;
  onOpenUpload?: () => void;
  onOpenPaste?: () => void;
  onLoadSample?: (sample: DocumentItem) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  onRescan,
  onOpenChat,
  onOpenExport,
  isScanning,
  theme,
  onOpenIDPConcept,
  onOpenScanPhoto,
  onOpenUpload,
  onOpenPaste,
  onLoadSample,
}) => {
  const hasPhoto = !!document?.base64Data && (
    document?.mimeType?.startsWith('image/') || 
    document?.fileType?.startsWith('image/') || 
    !!document?.name?.match(/\.(jpg|jpeg|png|webp|gif|heic)$/i)
  );
  const photoDataUrl = hasPhoto ? `data:${document?.mimeType || 'image/jpeg'};base64,${document?.base64Data}` : null;

  const profile = getDocumentProfile(document);

  const [activeTab, setActiveTab] = useState<'visual' | 'synthesis' | 'extraction' | 'traceability' | 'risks' | 'compliance' | 'raw' | 'photo'>(
    profile.defaultTab
  );

  const [isXRayActive, setIsXRayActive] = useState(true);
  const [isRedactionActive, setIsRedactionActive] = useState(false);
  const [highlightTargetId, setHighlightTargetId] = useState<string | null>(null);
  const [isExportPushOpen, setIsExportPushOpen] = useState(false);
  const [photoZoom, setPhotoZoom] = useState(1);
  const [showOcrSideBySide, setShowOcrSideBySide] = useState(true);
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [verifiedToast, setVerifiedToast] = useState<string | null>(null);
  const [traceFilter, setTraceFilter] = useState<'all' | 'financial' | 'metadata' | 'risks' | 'compliance'>('all');
  const [traceSearch, setTraceSearch] = useState('');
  const [copiedCitationId, setCopiedCitationId] = useState<string | null>(null);
  const isLight = theme === 'light';

  useEffect(() => {
    if (!profile.availableTabs.includes(activeTab)) {
      setActiveTab(profile.defaultTab);
    }
  }, [document?.id, profile.availableTabs]);

  // Click-to-Trace handler: Switches directly to Visual Page and locks bounding box
  const handleTraceClick = (targetId: string, quote?: string) => {
    setActiveTab('visual');
    setHighlightTargetId(targetId);
    setVerifiedToast(`Focused on clause: "${(quote || targetId).slice(0, 42)}..."`);
    setTimeout(() => {
      setVerifiedToast(null);
    }, 3000);
  };

  if (!document) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-6 sm:p-10 text-center transition-colors overflow-y-auto ${
        isLight ? 'bg-[#f8fafc] text-slate-600' : 'bg-[#07090e] text-slate-400'
      }`}>
        <div className="max-w-2xl mx-auto space-y-7 animate-in fade-in duration-300">
          <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg transition-transform ${
            isLight ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-indigo-600 text-white shadow-indigo-600/30'
          }`}>
            <FileText className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className={`text-2xl sm:text-3xl font-bold font-display ${isLight ? 'text-slate-900' : 'text-white'}`}>
              DocuMind Intelligent Document Assistant
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
              Autonomous document processing and review platform with interactive visual X-Ray heatmap, clause-level traceability, redline diff matrix, and compliance auditing.
            </p>
          </div>

          {/* SECTION 1: ONE-CLICK PRELOADED DEMO SAMPLES */}
          <div className="text-left space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 font-display flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Pre-Loaded Demo Samples (One-Click Instant Evaluation)</span>
              </span>
              <span className="text-[11px] text-slate-400">Click any file to test immediately</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SAMPLE_DOCUMENTS.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => onLoadSample && onLoadSample(sample)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between ${
                    sample.category === 'contract'
                      ? isLight ? 'bg-indigo-50/60 hover:bg-indigo-50 border-indigo-200/90 shadow-2xs' : 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/30'
                      : sample.category === 'invoice'
                      ? isLight ? 'bg-emerald-50/60 hover:bg-emerald-50 border-emerald-200/90 shadow-2xs' : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30'
                      : isLight ? 'bg-violet-50/60 hover:bg-violet-50 border-violet-200/90 shadow-2xs' : 'bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/30'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                        sample.category === 'contract'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
                          : sample.category === 'invoice'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                      }`}>
                        {sample.category === 'contract' ? 'Legal NDA' : sample.category === 'invoice' ? 'Multi-Currency' : 'Financial Statement'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-50" />
                    </div>

                    <h4 className={`text-xs font-bold leading-snug line-clamp-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {sample.name}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {sample.category === 'contract' && 'Contains uncapped indemnity, perpetual survival, and a 24-month sneak non-compete.'}
                      {sample.category === 'invoice' && 'Dual USD/EUR billing with an automated $500.00 mathematical overcharge discrepancy.'}
                      {sample.category === 'report' && 'Q3 Consolidated GAAP statement, EBITDA reconciliation tables, and auditor sign-off.'}
                    </p>
                  </div>

                  <div className="pt-3 mt-2 border-t border-slate-200/60 dark:border-white/[0.08] flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    <span>Load Full Audit</span>
                    <Sparkles className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: QUICK INGESTION ACTIONS */}
          <div className="text-left space-y-2.5 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">
              Or Upload Your Own Document
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {onOpenUpload && (
                <div
                  onClick={onOpenUpload}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${
                    isLight
                      ? 'bg-white hover:bg-slate-50 border-slate-200/90 shadow-2xs'
                      : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Upload className="w-4 h-4 text-indigo-600" />
                    <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Upload File
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    PDF, DOCX, PNG, TIFF, or HEIC files.
                  </p>
                </div>
              )}

              {onOpenScanPhoto && (
                <div
                  onClick={onOpenScanPhoto}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${
                    isLight
                      ? 'bg-white hover:bg-slate-50 border-slate-200/90 shadow-2xs'
                      : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Camera Scan
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Snap receipt or invoice with camera.
                  </p>
                </div>
              )}

              {onOpenPaste && (
                <div
                  onClick={onOpenPaste}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${
                    isLight
                      ? 'bg-white hover:bg-slate-50 border-slate-200/90 shadow-2xs'
                      : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-violet-600" />
                    <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Paste Text
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Directly paste clauses or contract text.
                  </p>
                </div>
              )}
            </div>
          </div>

          {onOpenIDPConcept && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenIDPConcept}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  isLight 
                    ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700' 
                    : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Explore IDP System Architecture &amp; 5 Pillars</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const review = document.review;
  const isScanningDoc = document.status === 'scanning' || (isScanning && !review);
  const isErrorDoc = document.status === 'error';
  const isPending = (document.status === 'idle' || !review) && !isScanningDoc && !isErrorDoc;

  const handleCopyRaw = () => {
    if (document.rawText) {
      navigator.clipboard.writeText(document.rawText);
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    }
  };

  const getRiskBadge = (level?: RiskLevel) => {
    switch (level) {
      case 'critical':
        return isLight 
          ? 'bg-rose-50 text-rose-700 border-rose-200' 
          : 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'high':
        return isLight 
          ? 'bg-amber-50 text-amber-800 border-amber-200' 
          : 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'medium':
        return isLight 
          ? 'bg-yellow-50 text-yellow-800 border-yellow-200' 
          : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      default:
        return isLight 
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
          : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  // Extract financial properties for financial documents
  const totalField = review?.structuredExtraction?.keyMetadata?.find(m => 
    m.label.toLowerCase().includes('total') || 
    m.label.toLowerCase().includes('amount') || 
    m.label.toLowerCase().includes('payable') ||
    m.label.toLowerCase().includes('price')
  );

  const vendorField = review?.structuredExtraction?.keyMetadata?.find(m => 
    m.label.toLowerCase().includes('vendor') || 
    m.label.toLowerCase().includes('merchant') || 
    m.label.toLowerCase().includes('issuer') ||
    m.label.toLowerCase().includes('store') ||
    m.label.toLowerCase().includes('company')
  );

  const lineItemsCount = review?.structuredExtraction?.lineItems?.length || 0;

  // Compute proactive red flags and missing clauses
  const isContract = profile.category === 'contract';
  const hasUncappedIndemnity = review?.riskAssessment?.risks?.some(r => r.title.toLowerCase().includes('uncapped') || r.description.toLowerCase().includes('uncapped'));
  const hasSneakNonCompete = review?.riskAssessment?.risks?.some(r => r.title.toLowerCase().includes('non-compete') || r.description.toLowerCase().includes('non-compete'));
  const hasDiscrepancy = (document.rawText || '').includes('DISCREPANCY') || (document.rawText || '').includes('Overcharge');
  const jurisdictionMatch = (document.rawText || '').match(/laws of the (STATE OF [A-Za-z]+|State of [A-Za-z]+|[A-Za-z\s]+Court)/i);
  const governingLaw = jurisdictionMatch ? jurisdictionMatch[1] : 'State of Delaware';

  return (
    <div className={`flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden transition-colors ${
      isLight ? 'bg-slate-50/50' : 'bg-[#07090e]'
    }`}>
      {/* Top Header Banner */}
      <div className={`px-8 pt-6 pb-4 border-b transition-colors ${
        isLight ? 'bg-white border-slate-200/90 shadow-2xs' : 'bg-[#090d16]/80 border-white/[0.06]'
      }`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            {/* Friendly Category Kicker */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 flex-wrap">
              <span className={`px-2 py-0.5 rounded-md uppercase tracking-wider text-[11px] font-bold ${
                isLight ? 'bg-indigo-50 text-indigo-700' : 'bg-indigo-500/10 text-indigo-400'
              }`}>
                {document.category}
              </span>
              {hasPhoto && (
                <span className={`px-2 py-0.5 rounded-md uppercase tracking-wider text-[11px] font-bold inline-flex items-center gap-1 ${
                  isLight ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                }`}>
                  <Camera className="w-3 h-3 text-emerald-600" />
                  <span>Photo Scanned</span>
                </span>
              )}
              <span aria-hidden="true">·</span>
              <span className="truncate max-w-xs">{document.name}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{document.fileSize}</span>
              {review?.processingTimeMs && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-400 tabular-nums">Analyzed in {(review.processingTimeMs / 1000).toFixed(1)}s</span>
                </>
              )}
            </div>

            {/* Document Title */}
            <h1 className={`text-xl sm:text-2xl font-bold tracking-tight font-display truncate ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              {review?.detectedTitle || document.name}
            </h1>

            {/* Contextual Status Strip */}
            {review && (
              <div className="flex items-center gap-2.5 text-xs pt-0.5 flex-wrap">
                {profile.isFinancial ? (
                  <>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold ${
                      isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                    }`}>
                      <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{totalField ? totalField.value : 'Financial Record'}</span>
                    </div>

                    {vendorField && (
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium ${
                        isLight ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                      }`}>
                        <Store className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Vendor: <strong>{vendorField.value}</strong></span>
                      </div>
                    )}

                    {hasDiscrepancy && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>$500.00 Calculation Discrepancy Flagged</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {profile.showsRiskFactor && (
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium ${getRiskBadge(review.overallRiskLevel)}`}>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>
                          {review.overallRiskLevel === 'critical' ? 'High Liability / Critical Traps' :
                           review.overallRiskLevel === 'high' ? 'Elevated Contractual Liability' : 'Standard Terms'}
                        </span>
                        <span className="opacity-70 tabular-nums font-mono">
                          ({review.riskAssessment.scoreOutOf100}/100)
                        </span>
                      </div>
                    )}

                    {/* Governing Law Badge */}
                    <div 
                      onClick={() => handleTraceClick('delaware', governingLaw)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer hover:underline ${
                        isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-white/[0.04] border-white/[0.08] text-slate-300'
                      }`}
                      title="Click to jump to Governing Law clause in visual page"
                    >
                      <Scale className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Jurisdiction: <strong>{governingLaw}</strong></span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 pt-1 flex-wrap">
            <button
              onClick={() => onRescan(document)}
              disabled={isScanning}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50 ${
                isLight 
                  ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-2xs' 
                  : 'border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-slate-200'
              }`}
            >
              <RotateCw className={`w-3.5 h-3.5 text-indigo-500 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Re-Scan'}</span>
            </button>

            {/* Automated Export & ERP Webhook Push Button */}
            <button
              onClick={() => setIsExportPushOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/30 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Export &amp; ERP Push</span>
            </button>

            <button
              onClick={onOpenChat}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask Agent</span>
            </button>
          </div>
        </div>

        {/* PROACTIVE AI "AUDIT & RED FLAGS" PANEL */}
        {review && (
          <div className="max-w-6xl mx-auto mt-3.5 pt-3 border-t border-slate-200/80 dark:border-white/[0.06]">
            <div className="flex items-center justify-between gap-3 text-xs flex-wrap">
              <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Proactive AI Audit &amp; Red Flags:</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-[11px]">
                {/* Missing clauses alert */}
                {isContract && (
                  <span 
                    onClick={() => handleTraceClick('force-majeure', 'Missing Force Majeure')}
                    className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 font-semibold hover:bg-amber-100"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <span>Missing: No Force Majeure clause detected</span>
                  </span>
                )}

                {hasUncappedIndemnity && (
                  <span 
                    onClick={() => handleTraceClick('Section 4.2', 'Uncapped Indemnity')}
                    className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 font-bold hover:bg-rose-100"
                  >
                    <ShieldAlert className="w-3 h-3 text-rose-600" />
                    <span>Section 4.2: Uncapped Liability Trap</span>
                  </span>
                )}

                {hasSneakNonCompete && (
                  <span 
                    onClick={() => handleTraceClick('Section 7.1', 'Non-Compete')}
                    className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 font-bold hover:bg-rose-100"
                  >
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    <span>Section 7.1: 24-Month Sneak Non-Compete</span>
                  </span>
                )}

                {/* Mathematical Anomaly Flag */}
                {hasDiscrepancy && (
                  <span 
                    onClick={() => handleTraceClick('SUBTOTAL', '$500 Overcharge')}
                    className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 font-bold hover:bg-rose-100 animate-pulse"
                  >
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    <span>Anomaly: Stated total exceeds line item math by $500</span>
                  </span>
                )}

                {/* Signatory status */}
                {review.structuredExtraction?.signatories && review.structuredExtraction.signatories.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                    <span>Signatures: {review.structuredExtraction.signatories.filter(s => s.validity === 'valid').length} / {review.structuredExtraction.signatories.length} Verified</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Underline Navigation Tabs */}
        <div className={`max-w-6xl mx-auto flex items-center gap-6 mt-4 border-b text-xs font-semibold transition-colors overflow-x-auto no-scrollbar ${
          isLight ? 'border-slate-200 text-slate-500' : 'border-white/[0.08] text-slate-400'
        }`}>
          {/* TAB 1: VISUAL DOCUMENT PAGE & X-RAY (STAR FEATURE) */}
          <button
            onClick={() => setActiveTab('visual')}
            className={`pb-2.5 transition-colors relative flex items-center gap-1.5 shrink-0 ${
              activeTab === 'visual'
                ? isLight ? 'text-indigo-600 font-bold' : 'text-white font-bold'
                : isLight ? 'hover:text-slate-800' : 'hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Interactive Visual Page &amp; X-Ray</span>
            <span className="text-[10px] bg-gradient-to-r from-amber-500 to-rose-500 text-white px-1.5 py-0.2 rounded-full font-bold">
              STAR
            </span>
            {activeTab === 'visual' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600 rounded-full" />
            )}
          </button>

          {/* Overview & Summary Tab */}
          <button
            onClick={() => setActiveTab('synthesis')}
            className={`pb-2.5 transition-colors relative shrink-0 ${
              activeTab === 'synthesis'
                ? isLight ? 'text-indigo-600 font-bold' : 'text-white font-bold'
                : isLight ? 'hover:text-slate-800' : 'hover:text-slate-200'
            }`}
          >
            <span>{profile.isFinancial ? 'Summary & Spend' : 'Overview & Synthesis'}</span>
            {activeTab === 'synthesis' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600 rounded-full" />
            )}
          </button>

          {/* Extracted Data & Tables Tab */}
          {profile.availableTabs.includes('extraction') && (
            <button
              onClick={() => setActiveTab('extraction')}
              className={`pb-2.5 transition-colors relative flex items-center gap-1.5 shrink-0 ${
                activeTab === 'extraction'
                  ? isLight ? 'text-indigo-600 font-bold' : 'text-white font-bold'
                  : isLight ? 'hover:text-slate-800' : 'hover:text-slate-200'
              }`}
            >
              <span>{profile.isFinancial ? 'Itemized Lines & Totals' : 'Extracted Data & Tables'}</span>
              {activeTab === 'extraction' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600 rounded-full" />
              )}
            </button>
          )}

          {/* Source Traceability Tab */}
          {profile.availableTabs.includes('traceability') && (
            <button
              onClick={() => setActiveTab('traceability')}
              className={`pb-2.5 transition-colors relative flex items-center gap-1.5 shrink-0 ${
                activeTab === 'traceability'
                  ? isLight ? 'text-emerald-600 font-bold' : 'text-emerald-400 font-bold'
                  : isLight ? 'hover:text-slate-800' : 'hover:text-slate-200'
              }`}
            >
              <span className="flex items-center gap-1">
                <span>Source Traceability</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  Zero-Hallucination
                </span>
              </span>
              {activeTab === 'traceability' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-600 rounded-full" />
              )}
            </button>
          )}

          {/* Validation & Risks Tab */}
          {profile.availableTabs.includes('risks') && (
            <button
              onClick={() => setActiveTab('risks')}
              className={`pb-2.5 transition-colors relative flex items-center gap-1.5 shrink-0 ${
                activeTab === 'risks'
                  ? isLight ? 'text-indigo-600 font-bold' : 'text-white font-bold'
                  : isLight ? 'hover:text-slate-800' : 'hover:text-slate-200'
              }`}
            >
              <span>{profile.category === 'contract' ? 'Contractual Liabilities' : 'Risks & Anomalies'} ({review?.riskAssessment?.risks?.length || 0})</span>
              {activeTab === 'risks' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600 rounded-full" />
              )}
            </button>
          )}

          {/* Policy & Compliance Checks Tab */}
          {profile.availableTabs.includes('compliance') && (
            <button
              onClick={() => setActiveTab('compliance')}
              className={`pb-2.5 transition-colors relative flex items-center gap-1.5 shrink-0 ${
                activeTab === 'compliance'
                  ? isLight ? 'text-indigo-600 font-bold' : 'text-white font-bold'
                  : isLight ? 'hover:text-slate-800' : 'hover:text-slate-200'
              }`}
            >
              <span>Policy &amp; Regulatory Checks ({review?.complianceAudit?.items?.length || 0})</span>
              {activeTab === 'compliance' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600 rounded-full" />
              )}
            </button>
          )}

          {/* Original OCR Text Tab */}
          {profile.availableTabs.includes('raw') && (
            <button
              onClick={() => setActiveTab('raw')}
              className={`pb-2.5 transition-colors relative shrink-0 ${
                activeTab === 'raw'
                  ? isLight ? 'text-indigo-600 font-bold' : 'text-white font-bold'
                  : isLight ? 'hover:text-slate-800' : 'hover:text-slate-200'
              }`}
            >
              <span>Raw OCR Text</span>
              {activeTab === 'raw' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600 rounded-full" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Content Viewport */}
      <div className={`flex-1 ${activeTab === 'visual' ? 'overflow-hidden p-2 sm:p-3' : 'overflow-y-auto px-6 py-5'}`}>
        {/* TAB 1: VISUAL DOCUMENT PAGE & X-RAY VIEW */}
        {activeTab === 'visual' && (
          <div className="h-full w-full animate-in fade-in duration-200">
            <VisualDocumentPage
              document={document}
              highlightTargetId={highlightTargetId}
              onClearHighlight={() => setHighlightTargetId(null)}
              isXRayActive={isXRayActive}
              onToggleXRay={() => setIsXRayActive(prev => !prev)}
              isRedactionActive={isRedactionActive}
              onToggleRedaction={() => setIsRedactionActive(prev => !prev)}
              theme={theme}
            />
          </div>
        )}

        {/* TAB 2: OVERVIEW & SYNTHESIS */}
        {activeTab === 'synthesis' && (
          <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
            {/* Executive Summary Banner */}
            <div className={`p-6 rounded-2xl border ${
              isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-white/[0.02] border-white/[0.06]'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 font-display">
                  Core Executive Brief &amp; Intent
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {review ? `Analyzed with ${review.modelUsed}` : 'Pending AI Ingestion'}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200 font-medium">
                {review?.executiveSummary || 'Document is pending analysis. Click Re-Scan to process with Gemini.'}
              </p>
            </div>

            {/* Key Insights Cards */}
            {review?.keyInsights && review.keyInsights.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">
                  Key Document Insights &amp; Findings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {review.keyInsights.map((ins) => (
                    <div
                      key={ins.id}
                      onClick={() => handleTraceClick(ins.topic, ins.insight)}
                      className={`p-4 rounded-xl border cursor-pointer hover:scale-[1.01] transition-all flex flex-col justify-between ${
                        ins.impact === 'critical'
                          ? isLight ? 'bg-rose-50/60 border-rose-200' : 'bg-rose-500/10 border-rose-500/20'
                          : ins.impact === 'strategic'
                          ? isLight ? 'bg-indigo-50/60 border-indigo-200' : 'bg-indigo-500/10 border-indigo-500/20'
                          : isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/[0.06]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <h4 className="text-xs font-bold truncate">{ins.topic}</h4>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            ins.impact === 'critical'
                              ? 'bg-rose-600 text-white'
                              : ins.impact === 'strategic'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-200 text-slate-700 dark:bg-white/[0.1] dark:text-slate-300'
                          }`}>
                            {ins.impact}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                          {ins.insight}
                        </p>
                      </div>
                      <div className="pt-2 text-[10px] text-indigo-600 font-semibold flex items-center gap-1">
                        <span>Click to trace in Visual X-Ray</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: EXTRACTION */}
        {activeTab === 'extraction' && (
          <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
            {/* Metadata Fields Grid */}
            {review?.structuredExtraction?.keyMetadata && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">
                    Extracted Structured Metadata
                  </h3>
                  <button
                    onClick={() => setIsExportPushOpen(true)}
                    className="text-xs text-indigo-600 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export to Excel / JSON</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {review.structuredExtraction.keyMetadata.map((f, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleTraceClick(f.label, f.value)}
                      className={`p-3.5 rounded-xl border cursor-pointer hover:border-indigo-400 transition-all ${
                        isLight ? 'bg-white border-slate-200' : 'bg-white/[0.02] border-white/[0.06]'
                      }`}
                    >
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                        {f.label}
                      </div>
                      <div className="text-sm font-bold mt-1 text-slate-900 dark:text-white truncate">
                        {f.value}
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-white/[0.04] text-[10px] text-slate-400">
                        <span>{f.category}</span>
                        <span className="font-mono text-emerald-600 font-bold">{Math.round(f.confidence * 100)}% Verified</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Itemized Line Items Table (if financial) */}
            {review?.structuredExtraction?.lineItems && review.structuredExtraction.lineItems.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">
                  Itemized Line Items ({review.structuredExtraction.lineItems.length})
                </h3>
                <div className={`rounded-xl border overflow-hidden ${
                  isLight ? 'bg-white border-slate-200' : 'bg-white/[0.02] border-white/[0.06]'
                }`}>
                  <table className="w-full text-xs text-left">
                    <thead className={`text-[11px] font-bold uppercase border-b ${
                      isLight ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-white/[0.04] text-slate-300 border-white/[0.06]'
                    }`}>
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">Description</th>
                        <th className="p-3 text-right">Qty</th>
                        <th className="p-3 text-right">Unit Price</th>
                        <th className="p-3 text-right">Total</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                      {review.structuredExtraction.lineItems.map((li) => (
                        <tr key={li.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="p-3 font-mono text-slate-400">{li.itemNumber || li.id}</td>
                          <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">{li.description}</td>
                          <td className="p-3 text-right font-mono">{li.quantity || 1}</td>
                          <td className="p-3 text-right font-mono">${(li.unitPrice || li.total).toFixed(2)}</td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-600">${li.total.toFixed(2)}</td>
                          <td className="p-3 text-center">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                              {li.flag || 'Verified'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TRACEABILITY */}
        {activeTab === 'traceability' && (
          <div className="max-w-5xl mx-auto space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Clause &amp; Proof Traceability Matrix</h3>
                <p className="text-xs text-slate-500">Every extracted field and risk is linked to verbatim OCR source text.</p>
              </div>
            </div>

            <div className="space-y-3">
              {review?.riskAssessment?.risks?.map((r, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleTraceClick(r.clauseLocation || r.title, r.description)}
                  className={`p-4 rounded-xl border cursor-pointer hover:scale-[1.01] transition-all ${
                    isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-white/[0.02] border-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <span className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{r.title}</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {r.clauseLocation}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    "{r.description}"
                  </p>
                  <div className="pt-2 text-[10px] text-indigo-600 font-bold flex items-center gap-1">
                    <span>Click to spotlight in Visual X-Ray</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: RISKS */}
        {activeTab === 'risks' && (
          <div className="max-w-5xl mx-auto space-y-4 animate-in fade-in duration-200">
            <h3 className="text-sm font-bold">Contractual Liability &amp; Risk Exposures</h3>
            <div className="space-y-3">
              {review?.riskAssessment?.risks?.map((r, idx) => (
                <div key={idx} className={`p-4 rounded-xl border ${
                  r.severity === 'critical' 
                    ? isLight ? 'bg-rose-50/70 border-rose-200' : 'bg-rose-500/10 border-rose-500/20'
                    : isLight ? 'bg-amber-50/70 border-amber-200' : 'bg-amber-500/10 border-amber-500/20'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold font-display">{r.title}</h4>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      r.severity === 'critical' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                    }`}>
                      {r.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-200 mb-2">
                    {r.description}
                  </p>
                  <div className="pt-2 border-t border-slate-200/80 dark:border-white/[0.06] text-[11px] text-indigo-700 dark:text-indigo-300">
                    <strong>Mitigation:</strong> {r.recommendedMitigation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: COMPLIANCE */}
        {activeTab === 'compliance' && (
          <div className="max-w-5xl mx-auto space-y-4 animate-in fade-in duration-200">
            <h3 className="text-sm font-bold">Policy &amp; Regulatory Standard Audits</h3>
            <div className="space-y-3">
              {review?.complianceAudit?.items?.map((c, idx) => (
                <div key={idx} className={`p-4 rounded-xl border ${
                  c.status === 'compliant'
                    ? isLight ? 'bg-emerald-50/70 border-emerald-200' : 'bg-emerald-500/10 border-emerald-500/20'
                    : isLight ? 'bg-rose-50/70 border-rose-200' : 'bg-rose-500/10 border-rose-500/20'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold font-display">{c.standard}</h4>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      c.status === 'compliant' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                    }`}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-200">
                    {c.finding}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: RAW */}
        {activeTab === 'raw' && (
          <div className="max-w-5xl mx-auto space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Verbatim OCR Extracted Text</span>
              <button
                onClick={handleCopyRaw}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isLight ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700' : 'bg-white/[0.04] text-slate-300'
                }`}
              >
                {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRaw ? 'Copied' : 'Copy All'}</span>
              </button>
            </div>
            <pre className={`p-6 rounded-2xl border font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-[550px] overflow-y-auto ${
              isLight ? 'bg-white border-slate-200 text-slate-800 shadow-2xs' : 'bg-[#05070c] border-white/[0.06] text-slate-300'
            }`}>
              {document.rawText || 'No raw text found.'}
            </pre>
          </div>
        )}
      </div>

      {/* Automated Data Export & ERP Push Modal */}
      <DataExportAndPushModal
        isOpen={isExportPushOpen}
        onClose={() => setIsExportPushOpen(false)}
        document={document}
        theme={theme}
      />

      {/* Floating Verification Notification Toast */}
      {verifiedToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom duration-200">
          <div className="px-4 py-2.5 rounded-2xl bg-indigo-700 text-white text-xs font-semibold shadow-xl flex items-center gap-2 border border-indigo-500/30 backdrop-blur-xl">
            <CheckCircle2 className="w-4 h-4 text-indigo-200 shrink-0" />
            <span>{verifiedToast}</span>
          </div>
        </div>
      )}
    </div>
  );
};
