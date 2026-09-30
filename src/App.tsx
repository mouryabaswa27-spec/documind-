import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DocumentViewer } from './components/DocumentViewer';
import { DocumentUploaderModal } from './components/DocumentUploaderModal';
import { AgentChatDrawer } from './components/AgentChatDrawer';
import { BatchComparisonModal } from './components/BatchComparisonModal';
import { ExportDossierModal } from './components/ExportDossierModal';
import { IDPConceptModal } from './components/IDPConceptModal';
import { RiskAuditView } from './components/RiskAuditView';
import { ComplianceGovernanceView } from './components/ComplianceGovernanceView';
import { SAMPLE_DOCUMENTS } from './data/sampleDocuments';
import { DocumentItem, DocumentCategory, ReviewMode } from './types/document';
import { AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

export default function App() {
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem('docupulse_documents');
    if (saved) {
      try {
        const parsed: DocumentItem[] = JSON.parse(saved);
        // Exclude legacy demo/sample documents
        const customDocs = parsed.filter((d) => !d.id.startsWith('doc-sample-') && d.sourceType !== 'sample');
        return customDocs;
      } catch (e) {
        console.error('Failed to parse saved docs', e);
      }
    }
    return [];
  });

  const [selectedDocId, setSelectedDocId] = useState<string | null>(() => {
    const saved = localStorage.getItem('docupulse_documents');
    if (saved) {
      try {
        const parsed: DocumentItem[] = JSON.parse(saved);
        const customDocs = parsed.filter((d) => !d.id.startsWith('doc-sample-') && d.sourceType !== 'sample');
        return customDocs.length > 0 ? customDocs[0].id : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Theme & Accessibility Preferences
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('docupulse_theme');
    return saved === 'dark' || saved === 'light' ? saved : 'light';
  });

  const [fontPreference, setFontPreference] = useState<'lexend' | 'dmsans' | 'system'>(() => {
    const saved = localStorage.getItem('docupulse_font');
    return saved === 'lexend' || saved === 'dmsans' || saved === 'system' ? saved : 'lexend';
  });

  const [fontSize, setFontSize] = useState<'normal' | 'relaxed' | 'large'>(() => {
    const saved = localStorage.getItem('docupulse_fontsize');
    return saved === 'normal' || saved === 'relaxed' || saved === 'large' ? saved : 'normal';
  });

  const [activeView, setActiveView] = useState<'repository' | 'scanner' | 'risks' | 'compliance' | 'batch'>('repository');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isIDPConceptOpen, setIsIDPConceptOpen] = useState(false);
  const [uploadInitialTab, setUploadInitialTab] = useState<'upload' | 'camera' | 'paste'>('upload');
  const [isScanning, setIsScanning] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Sync documents to local storage
  useEffect(() => {
    localStorage.setItem('docupulse_documents', JSON.stringify(documents));
  }, [documents]);

  // Sync theme & accessibility attributes to DOM
  useEffect(() => {
    localStorage.setItem('docupulse_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('docupulse_font', fontPreference);
    document.documentElement.setAttribute('data-font', fontPreference);
  }, [fontPreference]);

  useEffect(() => {
    localStorage.setItem('docupulse_fontsize', fontSize);
    document.documentElement.setAttribute('data-textsize', fontSize);
  }, [fontSize]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const selectedDocument = documents.find((d) => d.id === selectedDocId) || null;

  const handleSelectDoc = (id: string) => {
    setSelectedDocId(id);
    setActiveView('repository');
  };

  const handleClearAll = () => {
    setDocuments([]);
    setSelectedDocId(null);
    showToast('All documents cleared from workspace.', 'info');
  };

  const handleLoadSample = (sample: DocumentItem) => {
    setDocuments((prev) => {
      const existing = prev.find((d) => d.id === sample.id);
      if (existing) return prev;
      return [sample, ...prev];
    });
    setSelectedDocId(sample.id);
    setActiveView('repository');
    showToast(`Loaded ${sample.name} with complete audit dossier.`, 'success');
  };

  const handleDeleteDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (selectedDocId === id) {
      const remaining = documents.filter((d) => d.id !== id);
      setSelectedDocId(remaining.length > 0 ? remaining[0].id : null);
    }
    showToast('Document removed from workspace.', 'info');
  };

  // Perform processing with Gemini via Express API
  const handleProcessDocument = async (params: {
    id?: string;
    name: string;
    category: DocumentCategory;
    rawText?: string;
    base64Data?: string;
    mimeType?: string;
    reviewMode: ReviewMode;
    customInstructions?: string;
  }) => {
    const docId = params.id || `doc-${Date.now()}`;
    
    if (!params.id) {
      const newDoc: DocumentItem = {
        id: docId,
        name: params.name,
        category: params.category,
        uploadDate: new Date().toISOString(),
        fileSize: params.base64Data ? `${Math.round(params.base64Data.length * 0.75 / 1024)} KB` : `${Math.round((params.rawText?.length || 0) / 1024)} KB`,
        fileType: params.mimeType || 'text/plain',
        sourceType: 'upload',
        rawText: params.rawText,
        base64Data: params.base64Data,
        mimeType: params.mimeType,
        status: 'scanning',
      };
      // Add to list and select it immediately
      setDocuments((prev) => [newDoc, ...prev]);
    } else {
      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, status: 'scanning', error: undefined } : d))
      );
    }

    setSelectedDocId(docId);
    setActiveView('repository');
    setIsScanning(true);
    showToast(`Scanning "${params.name}" with Gemini...`, 'info');

    try {
      const response = await fetch('/api/documents/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: docId,
          name: params.name,
          category: params.category,
          rawText: params.rawText,
          base64Data: params.base64Data,
          mimeType: params.mimeType,
          reviewMode: params.reviewMode,
          customInstructions: params.customInstructions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server returned error during scan.');
      }

      const data = await response.json();
      const review = data.review;

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === docId
            ? {
                ...doc,
                status: 'processed',
                category: review.documentCategory || doc.category,
                rawText: doc.rawText || review.ocrText,
                review: review,
                error: undefined,
              }
            : doc
        )
      );

      showToast(`Scan complete for "${params.name}". Insights ready.`, 'success');
    } catch (err: any) {
      console.error('Scan failed:', err);
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === docId
            ? {
                ...doc,
                status: 'error',
                error: err.message,
              }
            : doc
        )
      );
      showToast(`Scan failed: ${err.message}`, 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const handleRescan = (docToScan: DocumentItem) => {
    handleProcessDocument({
      id: docToScan.id,
      name: docToScan.name,
      category: docToScan.category,
      rawText: docToScan.rawText,
      base64Data: docToScan.base64Data,
      mimeType: docToScan.mimeType,
      reviewMode: 'comprehensive',
    });
  };

  const criticalRisksCount = documents.reduce((acc, doc) => {
    if (doc.review?.overallRiskLevel === 'critical') return acc + 1;
    return acc;
  }, 0);

  const isLight = theme === 'light';

  return (
    <div 
      data-font={fontPreference}
      className={`min-h-screen flex flex-col font-sans transition-colors antialiased ${
        fontSize === 'relaxed' ? 'text-size-relaxed' : fontSize === 'large' ? 'text-size-large' : 'text-size-normal'
      } ${
        isLight 
          ? 'bg-[#f8fafc] text-slate-800 selection:bg-indigo-500/20 selection:text-indigo-700' 
          : 'bg-[#07090e] text-slate-100 selection:bg-indigo-500/20 selection:text-indigo-300'
      }`}
    >
      {/* Clean Accessible Top Bar */}
      <Header
        activeView={activeView}
        onViewChange={(view) => {
          if (view === 'batch') {
            setIsBatchOpen(true);
          } else {
            setActiveView(view);
          }
        }}
        onOpenUpload={() => {
          setUploadInitialTab('upload');
          setIsUploadOpen(true);
        }}
        onOpenScanPhoto={() => {
          setUploadInitialTab('camera');
          setIsUploadOpen(true);
        }}
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
        isChatOpen={isChatOpen}
        totalDocuments={documents.length}
        criticalRisksCount={criticalRisksCount}
        theme={theme}
        onToggleTheme={toggleTheme}
        fontPreference={fontPreference}
        onChangeFont={setFontPreference}
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
        onOpenIDPConcept={() => setIsIDPConceptOpen(true)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Document Navigation Sidebar */}
        <Sidebar
          documents={documents}
          selectedDocId={selectedDocId}
          onSelectDoc={handleSelectDoc}
          onOpenUpload={() => {
            setUploadInitialTab('upload');
            setIsUploadOpen(true);
          }}
          onOpenScanPhoto={() => {
            setUploadInitialTab('camera');
            setIsUploadOpen(true);
          }}
          onClearAll={handleClearAll}
          onDeleteDoc={handleDeleteDoc}
          theme={theme}
        />

        {/* Dynamic Center Viewport */}
        {activeView === 'repository' && (
          <DocumentViewer
            document={selectedDocument}
            onRescan={handleRescan}
            onOpenChat={() => setIsChatOpen(true)}
            onOpenExport={() => setIsExportOpen(true)}
            isScanning={isScanning}
            theme={theme}
            onOpenIDPConcept={() => setIsIDPConceptOpen(true)}
            onOpenUpload={() => {
              setUploadInitialTab('upload');
              setIsUploadOpen(true);
            }}
            onOpenScanPhoto={() => {
              setUploadInitialTab('camera');
              setIsUploadOpen(true);
            }}
            onOpenPaste={() => {
              setUploadInitialTab('paste');
              setIsUploadOpen(true);
            }}
            onLoadSample={handleLoadSample}
          />
        )}

        {activeView === 'risks' && (
          <RiskAuditView
            documents={documents}
            onSelectDocument={handleSelectDoc}
            theme={theme}
          />
        )}

        {activeView === 'compliance' && (
          <ComplianceGovernanceView
            documents={documents}
            onSelectDocument={handleSelectDoc}
            theme={theme}
          />
        )}
      </div>

      {/* Document Ingestion & Upload Modal */}
      <DocumentUploaderModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleProcessDocument}
        theme={theme}
        initialTab={uploadInitialTab}
      />

      {/* Cross-Document Comparison Modal */}
      <BatchComparisonModal
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        documents={documents}
        theme={theme}
      />

      {/* Export Review Dossier Modal */}
      <ExportDossierModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        document={selectedDocument}
        theme={theme}
      />

      {/* IDP Architecture & 5 Pillars Modal */}
      <IDPConceptModal
        isOpen={isIDPConceptOpen}
        onClose={() => setIsIDPConceptOpen(false)}
        theme={theme}
      />

      {/* Agent Interactive Q&A Drawer */}
      <AgentChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentDocument={selectedDocument}
        allDocuments={documents}
        theme={theme}
      />

      {/* Non-intrusive Toast Notifications */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom duration-200">
          <div className={`px-4 py-2.5 rounded-2xl border text-xs font-semibold shadow-xl flex items-center gap-2.5 backdrop-blur-xl ${
            toastMessage.type === 'success'
              ? isLight
                ? 'bg-white border-emerald-300 text-emerald-800 shadow-emerald-500/10'
                : 'bg-[#0b1510]/95 border-emerald-500/30 text-emerald-300'
              : toastMessage.type === 'error'
              ? isLight
                ? 'bg-white border-rose-300 text-rose-800 shadow-rose-500/10'
                : 'bg-[#190c10]/95 border-rose-500/30 text-rose-300'
              : isLight
                ? 'bg-white border-indigo-200 text-indigo-900 shadow-indigo-500/10'
                : 'bg-[#0d121f]/95 border-indigo-500/30 text-indigo-200'
          }`}>
            {toastMessage.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
            {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            {toastMessage.type === 'info' && <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
