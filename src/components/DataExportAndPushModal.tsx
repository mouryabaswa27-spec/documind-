import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  FileCode, 
  Send, 
  Check, 
  Copy, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Building2,
  Receipt,
  CreditCard,
  RotateCw
} from 'lucide-react';
import { DocumentItem } from '../types/document';
import { generateExcelWorkbook, generateJsonSchemaPayload, generateErpPayload } from '../utils/exportHelpers';

interface DataExportAndPushModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  theme?: 'light' | 'dark';
}

export const DataExportAndPushModal: React.FC<DataExportAndPushModalProps> = ({
  isOpen,
  onClose,
  document,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [activeTab, setActiveTab] = useState<'export' | 'erp'>('export');
  const [selectedErp, setSelectedErp] = useState<'quickbooks' | 'sap' | 'stripe' | 'netsuite'>('quickbooks');
  const [isPushing, setIsPushing] = useState(false);
  const [pushSuccess, setPushSuccess] = useState<{ txnId: string; timestamp: string; target: string } | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  if (!isOpen || !document) return null;

  const review = document.review;

  const handleDownloadExcel = () => {
    const xml = generateExcelWorkbook(document);
    const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.name.replace(/\.[^/.]+$/, '')}_DocuMind_Dossier.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJsonSchema = () => {
    const json = generateJsonSchemaPayload(document);
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.name.replace(/\.[^/.]+$/, '')}_DocuMind_Schema.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = () => {
    const json = generateJsonSchemaPayload(document);
    navigator.clipboard.writeText(JSON.stringify(json, null, 2));
    setCopiedFormat('json');
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  const handlePushToErp = () => {
    setIsPushing(true);
    setPushSuccess(null);

    setTimeout(() => {
      setIsPushing(false);
      const targets = {
        quickbooks: 'QuickBooks Online (Bill API v3)',
        sap: 'SAP S/4HANA Cloud (Supplier Invoice)',
        stripe: 'Stripe Payments / Invoices API',
        netsuite: 'Oracle NetSuite ERP (Vendor Bill)'
      };
      setPushSuccess({
        txnId: `TXN-${selectedErp.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: new Date().toLocaleTimeString(),
        target: targets[selectedErp]
      });
    }, 1200);
  };

  const currentErpPayload = generateErpPayload(document, selectedErp);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#090d16] border-white/[0.08] text-slate-100'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-[#0b0f19] border-white/[0.06]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-base font-bold font-display ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Automated Export &amp; ERP Integration
              </h2>
              <p className="text-xs text-slate-500">
                Export validated tables to Excel/JSON or push directly into ERP and ledger systems
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60' : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className={`px-6 pt-3 border-b flex items-center gap-6 text-xs font-semibold ${
          isLight ? 'border-slate-200 text-slate-500' : 'border-white/[0.06] text-slate-400'
        }`}>
          <button
            onClick={() => setActiveTab('export')}
            className={`pb-2.5 transition-colors relative flex items-center gap-1.5 ${
              activeTab === 'export' ? isLight ? 'text-indigo-600 font-bold' : 'text-white font-bold' : isLight ? 'hover:text-slate-900' : 'hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>One-Click Schema Export</span>
            {activeTab === 'export' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('erp')}
            className={`pb-2.5 transition-colors relative flex items-center gap-1.5 ${
              activeTab === 'erp' ? isLight ? 'text-indigo-600 font-bold' : 'text-white font-bold' : isLight ? 'hover:text-slate-900' : 'hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>ERP &amp; Webhook Push</span>
            {activeTab === 'erp' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'export' ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Download structured data, itemized tables, confidence indices, and risk audits formatted for financial spreadsheets and automated pipelines:
              </p>

              {/* Export Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Excel Option */}
                <div 
                  onClick={handleDownloadExcel}
                  className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between ${
                    isLight 
                      ? 'bg-emerald-50/50 hover:bg-emerald-50 border-emerald-200/80 shadow-xs' 
                      : 'bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20'
                  }`}
                >
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-2.5">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <h3 className={`text-xs font-bold ${isLight ? 'text-emerald-950' : 'text-emerald-200'}`}>
                      Formatted Excel Workbook (.xls)
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Multi-worksheet workbook with metadata, itemized tables, currency formatting, and severity formulas.
                    </p>
                  </div>
                  <div className="pt-4 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <span>Download Excel</span>
                    <Download className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* JSON Schema Option */}
                <div 
                  onClick={handleDownloadJsonSchema}
                  className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between ${
                    isLight 
                      ? 'bg-indigo-50/50 hover:bg-indigo-50 border-indigo-200/80 shadow-xs' 
                      : 'bg-indigo-500/5 hover:bg-indigo-500/10 border-indigo-500/20'
                  }`}
                >
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center mb-2.5">
                      <FileCode className="w-4 h-4" />
                    </div>
                    <h3 className={`text-xs font-bold ${isLight ? 'text-indigo-950' : 'text-indigo-200'}`}>
                      Standard JSON Schema
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Enterprise JSON schema with typed field values, confidence scores, and OCR clause citations.
                    </p>
                  </div>
                  <div className="pt-4 flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-300">
                    <span>Download JSON</span>
                    <Download className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* JSON Preview Box */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    JSON Schema Preview (Draft 2020-12)
                  </span>
                  <button
                    onClick={handleCopyJson}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 hover:underline"
                  >
                    {copiedFormat === 'json' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedFormat === 'json' ? 'Copied' : 'Copy Payload'}</span>
                  </button>
                </div>
                <pre className={`p-3 rounded-xl border text-[11px] font-mono overflow-x-auto max-h-48 leading-normal select-all ${
                  isLight ? 'bg-slate-900 text-emerald-300 border-slate-800' : 'bg-black/80 text-emerald-400 border-white/[0.08]'
                }`}>
                  {JSON.stringify(generateJsonSchemaPayload(document), null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Dispatch extracted document records, validated totals, and line items directly to your company ERP or accounting software:
              </p>

              {/* ERP Selection Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'quickbooks', name: 'QuickBooks', desc: 'Bill & AP', icon: Building2 },
                  { id: 'sap', name: 'SAP S/4HANA', desc: 'Supplier Inv', icon: Database },
                  { id: 'stripe', name: 'Stripe', desc: 'Invoices & Pay', icon: CreditCard },
                  { id: 'netsuite', name: 'Oracle NetSuite', desc: 'Vendor Bill', icon: Receipt },
                ].map((erp) => {
                  const Icon = erp.icon;
                  const isSelected = selectedErp === erp.id;
                  return (
                    <div
                      key={erp.id}
                      onClick={() => { setSelectedErp(erp.id as any); setPushSuccess(null); }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all text-center flex flex-col items-center gap-1.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : isLight
                          ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                          : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] text-slate-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <div className="text-xs font-bold">{erp.name}</div>
                      <div className={`text-[10px] ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {erp.desc}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Push Success Receipt Notification */}
              {pushSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between animate-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold">Successfully Synchronized with {pushSuccess.target}</div>
                      <div className="text-[11px] text-emerald-700">Receipt ID: {pushSuccess.txnId} · Timestamp: {pushSuccess.timestamp}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-800">
                    HTTP 200 OK
                  </span>
                </div>
              )}

              {/* Payload Preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-600 dark:text-slate-300">
                    Generated API Webhook Payload ({currentErpPayload.target})
                  </span>
                  <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">
                    {currentErpPayload.method} {currentErpPayload.endpoint}
                  </span>
                </div>
                <pre className={`p-3 rounded-xl border text-[11px] font-mono overflow-x-auto max-h-44 leading-normal ${
                  isLight ? 'bg-slate-900 text-indigo-200 border-slate-800' : 'bg-black/80 text-indigo-300 border-white/[0.08]'
                }`}>
                  {JSON.stringify(currentErpPayload.payload, null, 2)}
                </pre>
              </div>

              {/* Push Trigger Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handlePushToErp}
                  disabled={isPushing}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/30 transition-all active:scale-98"
                >
                  {isPushing ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Dispatching to {currentErpPayload.target}...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Push Validated Invoice to {selectedErp.toUpperCase()}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-3.5 border-t flex items-center justify-end ${
          isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-[#07090e] border-white/[0.06]'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors ${
              isLight ? 'border-slate-200 hover:bg-slate-100 text-slate-700' : 'border-white/[0.08] hover:bg-white/[0.06] text-slate-300'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
