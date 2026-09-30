import React, { useState } from 'react';
import { 
  FileText, 
  Receipt, 
  ShieldCheck, 
  FileCheck2, 
  ScrollText, 
  Search, 
  Plus, 
  RotateCcw,
  Sparkles,
  ChevronDown,
  Trash2,
  Camera
} from 'lucide-react';
import { DocumentCategory, DocumentItem, RiskLevel } from '../types/document';
import { getDocumentProfile } from '../utils/documentProfile';

interface SidebarProps {
  documents: DocumentItem[];
  selectedDocId: string | null;
  onSelectDoc: (id: string) => void;
  onOpenUpload: () => void;
  onOpenScanPhoto?: () => void;
  onClearAll?: () => void;
  onDeleteDoc?: (id: string) => void;
  theme: 'light' | 'dark';
}

export const Sidebar: React.FC<SidebarProps> = ({
  documents,
  selectedDocId,
  onSelectDoc,
  onOpenUpload,
  onOpenScanPhoto,
  onClearAll,
  onDeleteDoc,
  theme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('all');
  const isLight = theme === 'light';

  const categories = [
    { id: 'all', label: 'All Files', count: documents.length },
    { id: 'invoice', label: 'Invoices', count: documents.filter(d => d.category === 'invoice').length },
    { id: 'contract', label: 'Agreements', count: documents.filter(d => d.category === 'contract').length },
    { id: 'policy', label: 'Policies', count: documents.filter(d => d.category === 'policy').length },
    { id: 'report', label: 'Reports', count: documents.filter(d => d.category === 'report').length },
    { id: 'form', label: 'Forms', count: documents.filter(d => d.category === 'form').length },
  ];

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.review?.detectedTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (doc.review?.executiveSummary?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesRisk = 
      selectedRiskFilter === 'all' || 
      (doc.review?.overallRiskLevel === selectedRiskFilter);

    return matchesSearch && matchesCategory && matchesRisk;
  });

  const getRiskDot = (riskLevel?: RiskLevel) => {
    switch (riskLevel) {
      case 'critical':
        return <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-500/20 shrink-0" title="Needs Attention" />;
      case 'high':
        return <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-amber-500/20 shrink-0" title="Review Recommended" />;
      case 'medium':
        return <span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" title="Medium Priority" />;
      case 'low':
        return <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="All Good" />;
      default:
        return <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />;
    }
  };

  const getCategoryIcon = (category: DocumentCategory) => {
    switch (category) {
      case 'invoice':
        return <Receipt className="w-4 h-4 text-emerald-600" />;
      case 'contract':
        return <FileText className="w-4 h-4 text-indigo-600" />;
      case 'policy':
        return <ShieldCheck className="w-4 h-4 text-sky-600" />;
      case 'report':
        return <FileCheck2 className="w-4 h-4 text-violet-600" />;
      case 'form':
        return <ScrollText className="w-4 h-4 text-amber-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <aside className={`w-80 h-[calc(100vh-4rem)] border-r flex flex-col shrink-0 select-none transition-colors ${
      isLight 
        ? 'bg-slate-50/70 border-slate-200/80 text-slate-800' 
        : 'bg-[#090d16]/95 border-white/[0.06] text-slate-100'
    }`}>
      {/* Search Input Bar */}
      <div className={`p-4 border-b space-y-3 ${isLight ? 'border-slate-200/80 bg-white/60' : 'border-white/[0.06]'}`}>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search documents, terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full text-xs placeholder-slate-400 pl-9 pr-3 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
              isLight 
                ? 'bg-white border border-slate-200 text-slate-800 shadow-xs' 
                : 'bg-white/[0.03] border border-white/[0.08] text-slate-200'
            }`}
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap font-medium ${
                selectedCategory === cat.id
                  ? isLight
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white/[0.12] text-white font-semibold'
                  : isLight
                    ? 'text-slate-600 hover:bg-slate-200/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <span>{cat.label}</span>
              <span className="ml-1 opacity-70 tabular-nums text-[11px]">({cat.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Document Library Section */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="px-2 py-1.5 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Files to Review ({documents.length})</span>
          {documents.length > 0 && onClearAll && (
            <button
              onClick={onClearAll}
              className="text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors text-[11px]"
              title="Clear all uploaded documents"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {filteredDocs.length === 0 ? (
          documents.length === 0 ? (
            <div className="p-5 text-center text-xs space-y-3.5">
              <div className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center ${
                isLight ? 'bg-indigo-50 text-indigo-600' : 'bg-white/[0.05] text-indigo-400'
              }`}>
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
                  Workspace Ready
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Select a demo file or upload any document to start AI extraction &amp; audit.
                </p>
              </div>

              {/* Supported Format Tags */}
              <div className="pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Supported Formats
                </span>
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  {['PDF', 'DOCX', 'PNG', 'TIFF', 'HEIC'].map((ext) => (
                    <span
                      key={ext}
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                        isLight 
                          ? 'bg-slate-100 border-slate-200 text-slate-600' 
                          : 'bg-white/[0.04] border-white/[0.08] text-slate-300'
                      }`}
                    >
                      {ext}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No matching documents found.
            </div>
          )
        ) : (
          filteredDocs.map((doc) => {
            const isSelected = doc.id === selectedDocId;
            const review = doc.review;
            const title = review?.detectedTitle || doc.name;
            const profile = getDocumentProfile(doc);

            // Extract total for financial documents
            const totalField = profile.isFinancial ? review?.structuredExtraction?.keyMetadata?.find(m => 
              m.label.toLowerCase().includes('total') || 
              m.label.toLowerCase().includes('amount') || 
              m.label.toLowerCase().includes('payable')
            ) : null;

            return (
              <div
                key={doc.id}
                onClick={() => onSelectDoc(doc.id)}
                className={`group p-3 rounded-xl cursor-pointer transition-all flex flex-col gap-1.5 ${
                  isSelected
                    ? isLight
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 ring-1 ring-indigo-500/10'
                      : 'bg-white/[0.08] text-white shadow-sm'
                    : isLight
                      ? 'text-slate-700 hover:bg-white/80 hover:shadow-2xs'
                      : 'text-slate-300 hover:bg-white/[0.03] hover:text-slate-100'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-1.5 rounded-lg shrink-0 ${isLight ? 'bg-slate-100' : 'bg-white/[0.05]'}`}>
                      {getCategoryIcon(doc.category)}
                    </div>
                    <span className="text-xs font-semibold truncate">
                      {title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {onDeleteDoc && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteDoc(doc.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-600 transition-opacity"
                        title="Remove document"
                        aria-label="Remove document"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                    {/* Only show risk indicator for documents where risk assessment is actually relevant */}
                    {profile.showsRiskFactor ? (
                      getRiskDot(review?.overallRiskLevel)
                    ) : profile.isFinancial && totalField ? (
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        isLight ? 'bg-emerald-50 text-emerald-700' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {totalField.value}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Friendly readable metadata */}
                <div className={`flex items-center gap-2 text-[11px] pl-8.5 font-medium ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  <span className="capitalize">{doc.category}</span>
                  {(doc.fileType.startsWith('image/') || doc.mimeType?.startsWith('image/')) && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold">
                        <Camera className="w-2.5 h-2.5" />
                        <span>Photo</span>
                      </span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{doc.fileSize}</span>
                  {/* Contextual indicator: only show risk assessment if risk is relevant to this file type */}
                  {profile.showsRiskFactor && review?.riskAssessment?.scoreOutOf100 !== undefined && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className={`font-semibold tabular-nums ${
                        review.overallRiskLevel === 'critical' ? 'text-rose-600' :
                        review.overallRiskLevel === 'high' ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {review.overallRiskLevel === 'critical' ? 'Attention needed' :
                         review.overallRiskLevel === 'high' ? 'High risk' : 'Normal'}
                      </span>
                    </>
                  )}
                  {profile.isFinancial && (review?.structuredExtraction?.lineItems?.length || 0) > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-500">
                        {review?.structuredExtraction?.lineItems?.length} items
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Add Bar */}
      <div className={`p-3 border-t space-y-2 ${isLight ? 'border-slate-200/80 bg-white/70' : 'border-white/[0.06]'}`}>
        <div className="grid grid-cols-2 gap-2">
          {onOpenScanPhoto && (
            <button
              onClick={onOpenScanPhoto}
              className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                isLight
                  ? 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200 text-emerald-800'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-emerald-600" />
              <span>Scan Photo</span>
            </button>
          )}

          <button
            onClick={onOpenUpload}
            className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
              !onOpenScanPhoto ? 'col-span-2' : ''
            } ${
              isLight
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            <span>Upload File</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

