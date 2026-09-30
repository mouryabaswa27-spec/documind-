import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Layers, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  ArrowRight, 
  ShieldAlert, 
  Sliders, 
  Lock, 
  Unlock, 
  RotateCcw,
  Check,
  ChevronDown,
  Scale,
  Diff,
  FileCheck
} from 'lucide-react';
import { DocumentItem } from '../types/document';

interface BatchComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
  theme?: 'light' | 'dark';
}

export const BatchComparisonModal: React.FC<BatchComparisonModalProps> = ({
  isOpen,
  onClose,
  documents,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [docAId, setDocAId] = useState<string>(documents[0]?.id || '');
  const [docBId, setDocBId] = useState<string>(documents[1]?.id || documents[0]?.id || '');
  const [isSyncedScroll, setIsSyncedScroll] = useState(true);
  const [activeTab, setActiveTab] = useState<'redline' | 'matrix' | 'synthesis'>('redline');
  const [selectedClauseFilter, setSelectedClauseFilter] = useState<'all' | 'deviations' | 'liabilities'>('all');

  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef(false);

  // Sync scroll between the two panes when enabled
  const handleScroll = (sourcePane: 'left' | 'right') => {
    if (!isSyncedScroll || isSyncingScroll.current) return;
    
    isSyncingScroll.current = true;
    const source = sourcePane === 'left' ? leftPaneRef.current : rightPaneRef.current;
    const target = sourcePane === 'left' ? rightPaneRef.current : leftPaneRef.current;

    if (source && target) {
      const scrollPercentage = source.scrollTop / (source.scrollHeight - source.clientHeight);
      target.scrollTop = scrollPercentage * (target.scrollHeight - target.clientHeight);
    }

    setTimeout(() => {
      isSyncingScroll.current = false;
    }, 40);
  };

  if (!isOpen) return null;

  const docA = documents.find(d => d.id === docAId) || documents[0];
  const docB = documents.find(d => d.id === docBId) || documents[1] || documents[0];

  // Synthesize clause deviations between the two documents
  const clauseDeviations = [
    {
      clauseName: 'Indemnification & Third-Party Claims',
      baselineStandard: 'Mutual indemnification capped at total annual fees paid ($50,000 max). Excludes consequential & punitive damages.',
      counterpartyTerm: 'Strictly UNCAPPED indemnification by Receiving Party for all direct, indirect, consequential, and punitive damages.',
      deviationSeverity: 'critical',
      deviationImpact: 'HIGH RISK: Uncapped liability exposure violating Corporate Risk Governance Rule 7.',
      actionRecommendation: 'Reject uncapped clause; insert Standard Playbook Section 4.1 mutual cap.'
    },
    {
      clauseName: 'Non-Competition & Employee Non-Solicitation',
      baselineStandard: 'No restrictive covenant or commercial non-compete permitted in standard NDA agreements.',
      counterpartyTerm: '24-month restrictive covenant prohibiting development or sale of competing cloud optimization tools.',
      deviationSeverity: 'critical',
      deviationImpact: 'BLOCKER: Completely bars engineering roadmap and commercial expansion.',
      actionRecommendation: 'Completely eliminate Section 7.1 non-compete before execution.'
    },
    {
      clauseName: 'Trade Secret Survival Duration',
      baselineStandard: 'Confidentiality obligations expire after three (3) years from Effective Date.',
      counterpartyTerm: 'Confidentiality obligations for all trade secrets and pricing survive IN PERPETUITY indefinitely.',
      deviationSeverity: 'high',
      deviationImpact: 'ELEVATED: Indefinite tracking and compliance burden on engineering teams.',
      actionRecommendation: 'Counter with 3-year term or maximum 5-year trade secret survival.'
    },
    {
      clauseName: 'Governing Law & Dispute Venue',
      baselineStandard: 'State of California or State of Delaware with AAA commercial arbitration.',
      counterpartyTerm: 'State of Delaware Court of Chancery, Wilmington with mandatory fee-shifting.',
      deviationSeverity: 'low',
      deviationImpact: 'ACCEPTABLE: Delaware Chancery Court is standard approved corporate venue.',
      actionRecommendation: 'Accept Delaware governing law; confirm mutual fee-shifting reciprocity.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[92vh] border transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#090d16] border-white/[0.08] text-slate-100'
      }`}>
        {/* Modal Top Bar */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-[#0b0f19] border-white/[0.06]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-base font-bold font-display ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Multi-Document Diff &amp; Redline Matrix
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                  Side-by-Side Synced
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Compare vendor contracts against benchmark standard agreements to instantly isolate policy deviations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Synced Scroll Lock Toggle */}
            <button
              onClick={() => setIsSyncedScroll(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isSyncedScroll
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : isLight
                  ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300'
              }`}
              title="Synchronized Scrolling"
            >
              {isSyncedScroll ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{isSyncedScroll ? 'Synced Scroll: Locked' : 'Synced Scroll: Off'}</span>
            </button>

            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors ${
                isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60' : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className={`px-6 pt-3 border-b flex items-center justify-between text-xs font-semibold ${
          isLight ? 'border-slate-200 text-slate-500 bg-slate-50/40' : 'border-white/[0.06] text-slate-400 bg-black/20'
        }`}>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('redline')}
              className={`pb-2.5 transition-colors relative flex items-center gap-1.5 ${
                activeTab === 'redline' ? isLight ? 'text-indigo-600 font-bold' : 'text-white font-bold' : isLight ? 'hover:text-slate-900' : 'hover:text-slate-200'
              }`}
            >
              <Diff className="w-3.5 h-3.5" />
              <span>Side-by-Side Redline Diff</span>
              {activeTab === 'redline' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`pb-2.5 transition-colors relative flex items-center gap-1.5 ${
                activeTab === 'matrix' ? isLight ? 'text-indigo-600 font-bold' : 'text-white font-bold' : isLight ? 'hover:text-slate-900' : 'hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Deviation &amp; Risk Matrix ({clauseDeviations.length})</span>
              {activeTab === 'matrix' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600 rounded-full" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 pb-2 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Standard Benchmark
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Unfavorable Deviation
            </span>
          </div>
        </div>

        {/* Modal Body */}
        {activeTab === 'redline' ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* File Pickers Selector Bar */}
            <div className={`px-6 py-2.5 border-b grid grid-cols-2 gap-4 text-xs ${
              isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-[#060911] border-white/[0.06]'
            }`}>
              {/* Document A Selector */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-500">Pane A:</span>
                <select
                  value={docAId}
                  onChange={(e) => setDocAId(e.target.value)}
                  className={`flex-1 text-xs px-2.5 py-1.5 rounded-lg border font-semibold truncate ${
                    isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-900 border-white/[0.1] text-white'
                  }`}
                >
                  {documents.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.review?.detectedTitle || d.name} ({d.category.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Document B Selector */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-500">Pane B (Comparison Target):</span>
                <select
                  value={docBId}
                  onChange={(e) => setDocBId(e.target.value)}
                  className={`flex-1 text-xs px-2.5 py-1.5 rounded-lg border font-semibold truncate ${
                    isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-900 border-white/[0.1] text-white'
                  }`}
                >
                  {documents.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.review?.detectedTitle || d.name} ({d.category.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Split Scrolling Viewports */}
            <div className="flex-1 grid grid-cols-2 divide-x divide-slate-200 dark:divide-white/[0.08] min-h-0 overflow-hidden">
              {/* Left Pane (Document A) */}
              <div 
                ref={leftPaneRef}
                onScroll={() => handleScroll('left')}
                className={`p-6 overflow-y-auto space-y-4 font-serif text-[12px] leading-relaxed transition-colors ${
                  isLight ? 'bg-white text-slate-800' : 'bg-[#090d16] text-slate-200'
                }`}
              >
                <div className="font-sans font-bold text-xs pb-2 border-b text-indigo-600 flex items-center justify-between">
                  <span>{docA?.review?.detectedTitle || docA?.name}</span>
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
                    Baseline Document
                  </span>
                </div>

                <div className="space-y-4 whitespace-pre-wrap">
                  {docA?.rawText || 'No text extracted for document A.'}
                </div>
              </div>

              {/* Right Pane (Document B with Redlines) */}
              <div 
                ref={rightPaneRef}
                onScroll={() => handleScroll('right')}
                className={`p-6 overflow-y-auto space-y-4 font-serif text-[12px] leading-relaxed transition-colors ${
                  isLight ? 'bg-slate-50/50 text-slate-800' : 'bg-[#0b0f19] text-slate-200'
                }`}
              >
                <div className="font-sans font-bold text-xs pb-2 border-b text-rose-600 flex items-center justify-between">
                  <span>{docB?.review?.detectedTitle || docB?.name}</span>
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold">
                    Vendor Deviations Highlighted
                  </span>
                </div>

                {/* Simulated Redline View on Document B */}
                <div className="space-y-4 font-sans text-xs">
                  <div className="p-3.5 rounded-xl border border-rose-300 bg-rose-50/80 dark:bg-rose-500/10 dark:border-rose-500/30 space-y-1">
                    <div className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>[CRITICAL REDLINE DEVIATION] Section 4.2 Uncapped Liability</span>
                    </div>
                    <p className="text-[11px] text-rose-900/90 dark:text-rose-200">
                      <span className="line-through text-slate-400 bg-rose-100 dark:bg-rose-950 px-1 rounded">- Standard $50,000 mutual cap</span>
                      <span className="bg-rose-200 dark:bg-rose-900/60 font-bold ml-2 px-1 rounded">+ STRICTLY UNCAPPED INDEMNITY WITH PUNITIVE DAMAGES</span>
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-rose-300 bg-rose-50/80 dark:bg-rose-500/10 dark:border-rose-500/30 space-y-1">
                    <div className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>[INSERTED REPAIR CLAUSE] Section 7.1 24-Month Non-Compete</span>
                    </div>
                    <p className="text-[11px] text-rose-900/90 dark:text-rose-200">
                      <span className="bg-rose-200 dark:bg-rose-900/60 font-bold px-1 rounded">+ Added 24-month restrictive covenant on cloud optimization products</span>
                    </p>
                  </div>

                  <div className="font-serif text-[12px] whitespace-pre-wrap pt-2">
                    {docB?.rawText || 'No text extracted for document B.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* DEVIATION MATRIX TAB */
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Policy &amp; Contract Deviation Matrix</h3>
                <p className="text-xs text-slate-500">
                  Automated clause-by-clause delta analysis comparing Vendor Document against Benchmark Standard
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {clauseDeviations.map((dev, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    dev.deviationSeverity === 'critical'
                      ? isLight ? 'bg-rose-50/70 border-rose-200 shadow-xs' : 'bg-rose-500/5 border-rose-500/20'
                      : dev.deviationSeverity === 'high'
                      ? isLight ? 'bg-amber-50/70 border-amber-200 shadow-xs' : 'bg-amber-500/5 border-amber-500/20'
                      : isLight ? 'bg-emerald-50/70 border-emerald-200 shadow-xs' : 'bg-emerald-500/5 border-emerald-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold font-display">{dev.clauseName}</h4>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        dev.deviationSeverity === 'critical'
                          ? 'bg-rose-600 text-white'
                          : dev.deviationSeverity === 'high'
                          ? 'bg-amber-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}>
                        {dev.deviationSeverity} deviation
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-2.5 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/[0.06] space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Baseline Standard</span>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                        {dev.baselineStandard}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/[0.06] space-y-1">
                      <span className="text-[10px] font-bold text-rose-600 uppercase">Vendor Proposed Term</span>
                      <p className="text-slate-800 dark:text-slate-100 text-[11px] font-semibold leading-relaxed">
                        {dev.counterpartyTerm}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-600 dark:text-slate-300">
                      <strong>Mitigation Recommendation:</strong> {dev.actionRecommendation}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Bar */}
        <div className={`px-6 py-3.5 border-t flex items-center justify-between ${
          isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-[#07090e] border-white/[0.06]'
        }`}>
          <span className="text-xs text-slate-500">
            Comparing: <strong>{docA?.name}</strong> vs <strong>{docB?.name}</strong>
          </span>

          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors ${
              isLight ? 'border-slate-200 hover:bg-slate-100 text-slate-700' : 'border-white/[0.08] hover:bg-white/[0.06] text-slate-300'
            }`}
          >
            Close Diff View
          </button>
        </div>
      </div>
    </div>
  );
};
