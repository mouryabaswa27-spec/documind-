import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  ArrowRight,
  Search
} from 'lucide-react';
import { DocumentItem, ComplianceAuditItem } from '../types/document';
import { getDocumentProfile } from '../utils/documentProfile';

interface ComplianceGovernanceViewProps {
  documents: DocumentItem[];
  onSelectDocument: (docId: string) => void;
  theme: 'light' | 'dark';
}

export const ComplianceGovernanceView: React.FC<ComplianceGovernanceViewProps> = ({
  documents,
  onSelectDocument,
  theme,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const isLight = theme === 'light';

  // Collect compliance checks strictly from regulatory policies and contractual instruments
  // Normal everyday documents, invoices, and memos are excluded
  const allChecks: Array<{
    documentId: string;
    documentTitle: string;
    documentCategory: string;
    check: ComplianceAuditItem;
  }> = [];

  documents.forEach((doc) => {
    const profile = getDocumentProfile(doc);
    if (profile.showsCompliance && doc.review?.complianceAudit?.items) {
      doc.review.complianceAudit.items.forEach((c) => {
        allChecks.push({
          documentId: doc.id,
          documentTitle: doc.review?.detectedTitle || doc.name,
          documentCategory: doc.category,
          check: c,
        });
      });
    }
  });

  const filteredChecks = allChecks.filter((item) => {
    const matchesStatus = filterStatus === 'all' || item.check.status === filterStatus;
    const matchesSearch = 
      item.check.standard.toLowerCase().includes(search.toLowerCase()) ||
      item.check.finding.toLowerCase().includes(search.toLowerCase()) ||
      item.documentTitle.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const compliantCount = allChecks.filter((c) => c.check.status === 'compliant').length;
  const nonCompliantCount = allChecks.filter((c) => c.check.status === 'non_compliant').length;
  const underReviewCount = allChecks.filter((c) => c.check.status === 'under_review' || c.check.status === 'partial').length;

  return (
    <div className={`flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-5xl mx-auto transition-colors ${
      isLight ? 'text-slate-800' : 'text-slate-100'
    }`}>
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl font-bold tracking-tight font-display ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Policy & Regulatory Compliance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tracking your agreements and policies against standards like SOC 2, GDPR, ISO, and internal rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 ${
            isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-bold">{compliantCount}</span>
            <span>Passed</span>
          </div>
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 ${
            isLight ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
          }`}>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span className="font-bold">{nonCompliantCount}</span>
            <span>Rule Conflicts</span>
          </div>
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 ${
            isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
          }`}>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-bold">{underReviewCount}</span>
            <span>Needs Review</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={`flex items-center justify-between gap-4 p-3 rounded-2xl border ${
        isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-white/[0.02] border-white/[0.06]'
      }`}>
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search standards (e.g. GDPR, SOC 2, ISO, Procurement)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full text-xs placeholder-slate-400 pl-9 pr-3 py-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
              isLight 
                ? 'bg-slate-50 border border-slate-200 text-slate-900' 
                : 'bg-white/[0.03] border border-white/[0.08] text-white'
            }`}
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-xs font-semibold mr-1">Status:</span>
          {[
            { id: 'all', label: 'All' },
            { id: 'non_compliant', label: 'Conflicts' },
            { id: 'partial', label: 'Partial' },
            { id: 'compliant', label: 'Passed' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filterStatus === st.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isLight
                    ? 'text-slate-600 hover:bg-slate-100'
                    : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Items List */}
      <div className="space-y-3">
        {filteredChecks.length === 0 ? (
          <div className={`p-12 text-center text-xs rounded-2xl border ${
            isLight ? 'bg-white border-slate-200 text-slate-500' : 'border-white/[0.06] bg-white/[0.01] text-slate-400'
          }`}>
            No compliance items matching your filter.
          </div>
        ) : (
          filteredChecks.map((item, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all space-y-3 ${
                isLight 
                  ? 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs' 
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase px-2.5 py-0.5 rounded-full font-bold border ${
                      item.check.status === 'compliant'
                        ? isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                        : item.check.status === 'non_compliant'
                        ? isLight ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                        : isLight ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                    }`}>
                      {item.check.status === 'compliant' ? 'Passed' :
                       item.check.status === 'non_compliant' ? 'Policy Conflict' : 'Needs Review'}
                    </span>
                    <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {item.check.standard}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span className="text-indigo-600 font-semibold capitalize">{item.documentCategory}</span>
                    <span>·</span>
                    <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>{item.documentTitle}</span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectDocument(item.documentId)}
                  className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
                    isLight 
                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 shadow-2xs' 
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-200'
                  }`}
                >
                  <span>Open File</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                {item.check.finding}
              </p>

              {item.check.referenceQuote && (
                <div className={`p-3 rounded-xl border text-xs font-mono italic ${
                  isLight 
                    ? 'bg-slate-50 border-slate-200/80 text-slate-600' 
                    : 'bg-black/40 border-white/[0.04] text-slate-400'
                }`}>
                  "{item.check.referenceQuote}"
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
