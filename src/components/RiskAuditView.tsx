import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRight, 
  Search, 
  CheckCircle2 
} from 'lucide-react';
import { DocumentItem, RiskLevel, RiskItem } from '../types/document';
import { getDocumentProfile } from '../utils/documentProfile';

interface RiskAuditViewProps {
  documents: DocumentItem[];
  onSelectDocument: (docId: string) => void;
  theme: 'light' | 'dark';
}

export const RiskAuditView: React.FC<RiskAuditViewProps> = ({
  documents,
  onSelectDocument,
  theme,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [search, setSearch] = useState('');
  const isLight = theme === 'light';

  // Collect risks strictly from documents where risk factors are relevant (e.g. contracts, legal agreements, flagged anomalies)
  // Normal everyday documents and receipts are excluded to avoid showing irrelevant information
  const allRisks: Array<{
    documentId: string;
    documentTitle: string;
    documentCategory: string;
    risk: RiskItem;
  }> = [];

  documents.forEach((doc) => {
    const profile = getDocumentProfile(doc);
    if (profile.showsRiskFactor && doc.review?.riskAssessment?.risks) {
      doc.review.riskAssessment.risks.forEach((r) => {
        allRisks.push({
          documentId: doc.id,
          documentTitle: doc.review?.detectedTitle || doc.name,
          documentCategory: doc.category,
          risk: r,
        });
      });
    }
  });

  const filteredRisks = allRisks.filter((item) => {
    const matchesSev = filterSeverity === 'all' || item.risk.severity === filterSeverity;
    const matchesSearch = 
      item.risk.title.toLowerCase().includes(search.toLowerCase()) ||
      item.risk.description.toLowerCase().includes(search.toLowerCase()) ||
      item.documentTitle.toLowerCase().includes(search.toLowerCase());
    return matchesSev && matchesSearch;
  });

  const criticalCount = allRisks.filter((r) => r.risk.severity === 'critical').length;
  const highCount = allRisks.filter((r) => r.risk.severity === 'high').length;

  return (
    <div className={`flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-5xl mx-auto transition-colors ${
      isLight ? 'text-slate-800' : 'text-slate-100'
    }`}>
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl font-bold tracking-tight font-display ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Concerns & Risks Across Your Documents
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            We found these specific liabilities, disputed line items, and non-standard terms across your organization's files.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 ${
            isLight ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
          }`}>
            <span className="font-bold">{criticalCount}</span>
            <span>Needs Immediate Attention</span>
          </div>
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 ${
            isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
          }`}>
            <span className="font-bold">{highCount}</span>
            <span>High Priority</span>
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
            placeholder="Search identified issues, clauses, or documents..."
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
          <span className="text-slate-400 text-xs font-semibold mr-1">Filter:</span>
          {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-xl capitalize font-semibold transition-colors ${
                filterSeverity === sev
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isLight 
                    ? 'text-slate-600 hover:bg-slate-100' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              {sev === 'all' ? 'All' : sev}
            </button>
          ))}
        </div>
      </div>

      {/* Risks Grid */}
      <div className="space-y-3">
        {filteredRisks.length === 0 ? (
          <div className={`p-12 text-center text-xs rounded-2xl border ${
            isLight ? 'bg-white border-slate-200 text-slate-500' : 'border-white/[0.06] bg-white/[0.01] text-slate-400'
          }`}>
            No concerns matching your search. Everything looks clear!
          </div>
        ) : (
          filteredRisks.map((item, idx) => (
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
                      item.risk.severity === 'critical'
                        ? isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                        : item.risk.severity === 'high'
                        ? isLight ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                        : isLight ? 'bg-yellow-50 text-yellow-800 border-yellow-200' : 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20'
                    }`}>
                      {item.risk.severity}
                    </span>
                    <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {item.risk.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span className="capitalize text-indigo-600 font-semibold">{item.documentCategory}</span>
                    <span>·</span>
                    <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>{item.documentTitle}</span>
                    {item.risk.clauseLocation && (
                      <>
                        <span>·</span>
                        <span className="text-slate-400">Section: {item.risk.clauseLocation}</span>
                      </>
                    )}
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
                {item.risk.description}
              </p>

              <div className={`pt-3 border-t flex items-start gap-2 text-xs ${
                isLight ? 'border-slate-100' : 'border-white/[0.06]'
              }`}>
                <span className={`font-semibold shrink-0 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
                  Action suggested:
                </span>
                <span className={`${isLight ? 'text-slate-700' : 'text-slate-300'} leading-relaxed`}>
                  {item.risk.recommendedMitigation}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
