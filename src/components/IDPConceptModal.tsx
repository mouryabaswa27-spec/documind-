import React from 'react';
import { 
  X, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Search, 
  ShieldCheck, 
  ExternalLink,
  Building2,
  Receipt,
  HeartPulse,
  Landmark,
  Truck
} from 'lucide-react';

interface IDPConceptModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

export const IDPConceptModal: React.FC<IDPConceptModalProps> = ({
  isOpen,
  onClose,
  theme = 'light',
}) => {
  if (!isOpen) return null;
  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#090d16] border-white/[0.08] text-slate-100'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-[#0b0f19]/80 border-white/[0.06]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-base font-bold font-display ${isLight ? 'text-slate-900' : 'text-white'}`}>
                DocuMind AI Architecture & IDP Concept
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Generative AI-Powered Intelligent Document Processing & Source Traceability
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

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Core Idea Banner */}
          <div className={`p-4 rounded-2xl border ${
            isLight ? 'bg-indigo-50/70 border-indigo-100 text-indigo-950' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-200'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
              Core Idea:
            </span>
            <p className="text-sm font-semibold mt-1 leading-relaxed">
              “DocuMind AI transforms unstructured documents into organized, actionable information using Generative AI, while providing source-level traceability for every generated result.”
            </p>
          </div>

          {/* Before vs After IDP */}
          <div className="space-y-3">
            <h3 className={`text-xs font-bold uppercase tracking-wider font-display ${isLight ? 'text-slate-900' : 'text-white'}`}>
              The Problem & Transformation: Before vs. With DocuMind IDP
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className={`p-4 rounded-xl border space-y-2 ${
                isLight ? 'bg-rose-50/50 border-rose-200 text-rose-900' : 'bg-rose-500/10 border-rose-500/20 text-rose-200'
              }`}>
                <div className="flex items-center gap-1.5 font-bold text-rose-700">
                  <span>❌ Before IDP (Manual Entry)</span>
                </div>
                <p className="leading-relaxed">
                  Person receives <strong>1,000 invoices or reports</strong> → manually opens each file one by one → manually copies name, date, line items, and amounts into Excel. Slow, repetitive, and error-prone.
                </p>
              </div>

              <div className={`p-4 rounded-xl border space-y-2 ${
                isLight ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
              }`}>
                <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                  <span>✅ With DocuMind IDP</span>
                </div>
                <p className="leading-relaxed">
                  📄 <strong>Upload Document</strong> → <strong>AI reads & OCRs it</strong> → extracts <strong>name, date, amounts, clauses</strong> → organizes data with <strong>verifiable source citations</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* The 5 Solution Pillars */}
          <div className="space-y-3">
            <h3 className={`text-xs font-bold uppercase tracking-wider font-display ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Our 5 Solution Pillars
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/[0.06]'
              }`}>
                <span className="text-base">📄</span>
                <div>
                  <strong className={isLight ? 'text-slate-900' : 'text-white'}>1. Extract:</strong>
                  <p className={`mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Automatically extract critical data: company name, invoice date, amounts, PO numbers, and line items.
                  </p>
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/[0.06]'
              }`}>
                <span className="text-base">🗂️</span>
                <div>
                  <strong className={isLight ? 'text-slate-900' : 'text-white'}>2. Categorize:</strong>
                  <p className={`mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Classifies incoming documents into Invoices, Policies, Contracts, Claim Forms, and Reports.
                  </p>
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/[0.06]'
              }`}>
                <span className="text-base">📝</span>
                <div>
                  <strong className={isLight ? 'text-slate-900' : 'text-white'}>3. Summarize:</strong>
                  <p className={`mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Summarizes 50-page complex contracts into concise, executive-friendly briefs with sentiment posture.
                  </p>
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/[0.06]'
              }`}>
                <span className="text-base">📊</span>
                <div>
                  <strong className={isLight ? 'text-slate-900' : 'text-white'}>4. Organize:</strong>
                  <p className={`mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Organizes data into structured tables with confidence scores and one-click export to CSV / Excel.
                  </p>
                </div>
              </div>

              <div className={`sm:col-span-2 p-3.5 rounded-xl border flex items-start gap-2.5 ${
                isLight ? 'bg-indigo-50/50 border-indigo-200 text-slate-800' : 'bg-indigo-500/10 border-indigo-500/20 text-slate-200'
              }`}>
                <span className="text-base">🔗</span>
                <div>
                  <strong className="text-indigo-600">5. Source Traceability (Our Main USP):</strong>
                  <p className={`mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    The AI doesn’t just generate answers—it proves them! Every field, answer, and risk item links directly back:
                    <span className="font-mono font-semibold ml-1 block mt-1 text-[11px] text-indigo-700">
                      Source: Invoice INV-1025 → Page 2 → Total Amount (₹45,000)
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Pipeline */}
          <div className="space-y-3">
            <h3 className={`text-xs font-bold uppercase tracking-wider font-display ${isLight ? 'text-slate-900' : 'text-white'}`}>
              End-to-End Processing Pipeline
            </h3>
            <div className={`p-4 rounded-xl border flex items-center justify-between text-center overflow-x-auto gap-2 text-xs font-semibold ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-white/[0.02] border-white/[0.06] text-slate-200'
            }`}>
              <div className="flex-1 min-w-[90px] p-2 rounded-lg bg-white shadow-2xs border border-slate-200/80">
                <div className="text-indigo-600 font-bold">1. Upload</div>
                <div className="text-[10px] text-slate-400 font-normal">PDF / Image</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

              <div className="flex-1 min-w-[90px] p-2 rounded-lg bg-white shadow-2xs border border-slate-200/80">
                <div className="text-indigo-600 font-bold">2. OCR</div>
                <div className="text-[10px] text-slate-400 font-normal">Vision Read</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

              <div className="flex-1 min-w-[90px] p-2 rounded-lg bg-white shadow-2xs border border-slate-200/80">
                <div className="text-indigo-600 font-bold">3. GenAI</div>
                <div className="text-[10px] text-slate-400 font-normal">Gemini Engine</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

              <div className="flex-1 min-w-[90px] p-2 rounded-lg bg-white shadow-2xs border border-slate-200/80">
                <div className="text-indigo-600 font-bold">4. Extract</div>
                <div className="text-[10px] text-slate-400 font-normal">Fields & Table</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

              <div className="flex-1 min-w-[90px] p-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 shadow-2xs">
                <div className="text-indigo-700 font-bold">5. Traceability</div>
                <div className="text-[10px] text-indigo-600 font-normal">Verified Proof</div>
              </div>
            </div>
          </div>

          {/* Industry Applications */}
          <div className="space-y-3">
            <h3 className={`text-xs font-bold uppercase tracking-wider font-display ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Where It's Used: Industry Use-Cases
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className={`p-3 rounded-xl border space-y-1 ${
                isLight ? 'bg-white border-slate-200' : 'bg-white/[0.02] border-white/[0.06]'
              }`}>
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Landmark className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Banks & Finance</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Loan agreements, credit memos, KYC forms, statutory tax invoices.
                </p>
              </div>

              <div className={`p-3 rounded-xl border space-y-1 ${
                isLight ? 'bg-white border-slate-200' : 'bg-white/[0.02] border-white/[0.06]'
              }`}>
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                  <span>Hospitals</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Patient admission records, medical indemnity, insurance claim forms.
                </p>
              </div>

              <div className={`p-3 rounded-xl border space-y-1 ${
                isLight ? 'bg-white border-slate-200' : 'bg-white/[0.02] border-white/[0.06]'
              }`}>
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Companies & AP</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Vendor invoices, PO matching, expense receipts, MSA agreements.
                </p>
              </div>

              <div className={`p-3 rounded-xl border space-y-1 ${
                isLight ? 'bg-white border-slate-200' : 'bg-white/[0.02] border-white/[0.06]'
              }`}>
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Building2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>Government</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Citizen applications, compliance policies, enterprise certifications.
                </p>
              </div>

              <div className={`p-3 rounded-xl border space-y-1 ${
                isLight ? 'bg-white border-slate-200' : 'bg-white/[0.02] border-white/[0.06]'
              }`}>
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Truck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Logistics</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Bills of lading, customs clearances, shipment invoices, manifests.
                </p>
              </div>

              <div className={`p-3 rounded-xl border space-y-1 ${
                isLight ? 'bg-white border-slate-200' : 'bg-white/[0.02] border-white/[0.06]'
              }`}>
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-violet-600" />
                  <span>Legal & Audit</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Cross-document contract audits, conflict detection, NDAs, SLA checks.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-3.5 border-t flex items-center justify-end ${
          isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-[#07090e] border-white/[0.06]'
        }`}>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-sm shadow-indigo-600/30"
          >
            Got It, Back to Workspace
          </button>
        </div>
      </div>
    </div>
  );
};
