import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Printer, 
  FileText, 
  FileJson,
  CheckCircle2
} from 'lucide-react';
import { DocumentItem } from '../types/document';
import { getDocumentProfile } from '../utils/documentProfile';

interface ExportDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  theme?: 'light' | 'dark';
}

export const ExportDossierModal: React.FC<ExportDossierModalProps> = ({
  isOpen,
  onClose,
  document,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<'text' | 'json'>('text');

  if (!isOpen || !document || !document.review) return null;

  const review = document.review;
  const profile = getDocumentProfile(document);

  const generateTextReport = () => {
    let report = `DOCUMIND ENTERPRISE DOCUMENT INTELLIGENCE REPORT
=================================================================
DOCUMENT: ${review.detectedTitle || document.name}
CATEGORY: ${document.category.toUpperCase()} (${profile.headerBadge.label})
PROCESSED: ${review.processedAt}
MODEL: ${review.modelUsed}
AUDIT DURATION: ${review.processingTimeMs}ms\n`;

    if (profile.showsRiskFactor) {
      report += `OVERALL RISK LEVEL: ${review.overallRiskLevel.toUpperCase()} (Score: ${review.riskAssessment.scoreOutOf100}/100)\n`;
    }
    if (profile.showsCompliance) {
      report += `COMPLIANCE STATUS: ${review.overallComplianceStatus.toUpperCase()}\n`;
    }
    report += `=================================================================\n\n`;

    let sectionNum = 1;
    report += `${sectionNum++}. EXECUTIVE SUMMARY & CORE INTENT\n-----------------------------------------------------------------\n`;
    if (profile.showsRiskFactor || profile.showsCompliance) {
      report += `Posture: ${review.overallSentimentOrPosture.toUpperCase()}\n`;
    } else {
      report += `Document Status: VERIFIED & INGESTED\n`;
    }
    report += `${review.executiveSummary}\n\n`;

    report += `${sectionNum++}. KEY INSIGHTS & TAKEAWAYS\n-----------------------------------------------------------------\n`;
    report += `${review.keyInsights.map((ins, i) => `${i + 1}. [${ins.impact.toUpperCase()}] ${ins.topic}: ${ins.insight}`).join('\n')}\n\n`;

    if (profile.showsRiskFactor && review.riskAssessment.risks.length > 0) {
      report += `${sectionNum++}. RISK & EXPOSURE AUDIT\n-----------------------------------------------------------------\n`;
      report += `Summary: ${review.riskAssessment.overallSummary}\n\nIdentified Vulnerabilities:\n`;
      report += review.riskAssessment.risks.map((r) => `
- ${r.title} [Severity: ${r.severity.toUpperCase()}]
  Reference: ${r.clauseLocation || 'N/A'}
  Analysis: ${r.description}
  Recommended Action: ${r.recommendedMitigation}`).join('\n') + '\n\n';
    }

    if (profile.showsCompliance && review.complianceAudit.items.length > 0) {
      report += `${sectionNum++}. REGULATORY & POLICY COMPLIANCE AUDIT\n-----------------------------------------------------------------\n`;
      report += `Status: ${review.complianceAudit.summary}\n\nAudited Checkpoints:\n`;
      report += review.complianceAudit.items.map((c) => `
- Standard: ${c.standard} [${c.status.toUpperCase()}]
  Finding: ${c.finding}
  Reference Quote: ${c.referenceQuote || 'N/A'}`).join('\n') + '\n\n';
    }

    report += `${sectionNum++}. EXTRACTED DOCUMENT DATA & METADATA\n-----------------------------------------------------------------\n`;
    report += review.structuredExtraction.keyMetadata.map((f) => `- ${f.label} [${f.category.toUpperCase()}]: ${f.value}`).join('\n') + '\n\n';

    if (review.structuredExtraction.lineItems && review.structuredExtraction.lineItems.length > 0) {
      report += `${sectionNum++}. ITEMIZED LINE ITEMS\n-----------------------------------------------------------------\n`;
      report += review.structuredExtraction.lineItems.map((li, i) => `${i + 1}. ${li.description} | Qty: ${li.quantity || 1} | Total: $${li.total.toLocaleString()} ${li.flag ? `[Flag: ${li.flag}]` : ''}`).join('\n') + '\n\n';
    }

    if (review.actionableRecommendations.length > 0) {
      report += `${sectionNum++}. RECOMMENDED ACTIONS & DIRECTIVES\n-----------------------------------------------------------------\n`;
      report += review.actionableRecommendations.map((a, i) => `${i + 1}. [Priority: ${a.priority.toUpperCase()}] ${a.title} - ${a.reason} (Assigned: ${a.assignedRole})`).join('\n') + '\n';
    }

    return report;
  };

  const handleCopy = () => {
    const textToCopy = format === 'text' ? generateTextReport() : JSON.stringify(review, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = format === 'text' ? generateTextReport() : JSON.stringify(review, null, 2);
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.name.replace(/\.[^/.]+$/, '')}_Audit_Dossier.${format === 'json' ? 'json' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#090d16] border-white/[0.08] text-slate-100'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-[#0b0f19]/80 border-white/[0.06]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-sm font-bold font-display ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Export Review Report
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Download formatted executive briefing or audit JSON data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60' : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selector */}
        <div className={`px-6 py-3 border-b flex items-center justify-between ${
          isLight ? 'border-slate-200 bg-white' : 'border-white/[0.06]'
        }`}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFormat('text')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                format === 'text'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-white/[0.04]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Executive Brief</span>
            </button>
            <button
              onClick={() => setFormat('json')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                format === 'json'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-white/[0.04]'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Data JSON</span>
            </button>
          </div>

          <button
            onClick={handlePrint}
            className={`text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors font-medium ${
              isLight 
                ? 'text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-200' 
                : 'text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.06]'
            }`}
          >
            <Printer className="w-3.5 h-3.5 text-indigo-500" />
            <span>Print Report</span>
          </button>
        </div>

        {/* Preview Viewport */}
        <div className={`flex-1 overflow-y-auto p-5 font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-[460px] ${
          isLight ? 'bg-slate-50/80 text-slate-800' : 'bg-[#05070c] text-slate-300'
        }`}>
          {format === 'text' ? generateTextReport() : JSON.stringify(review, null, 2)}
        </div>

        {/* Footer Actions */}
        <div className={`px-6 py-3.5 border-t flex items-center justify-between ${
          isLight ? 'border-slate-200 bg-white' : 'border-white/[0.06] bg-[#07090e]'
        }`}>
          <button
            onClick={handleCopy}
            className={`px-3.5 py-2 text-xs rounded-xl border flex items-center gap-1.5 transition-colors font-semibold ${
              isLight 
                ? 'text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-200' 
                : 'text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.06]'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy to Clipboard'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className={`px-4 py-2 text-xs font-semibold transition-colors ${
                isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm shadow-indigo-600/30 flex items-center gap-1.5 transition-all active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
