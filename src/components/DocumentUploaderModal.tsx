import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  FileCheck2, 
  Receipt, 
  ScrollText, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  AlertCircle,
  FileCode,
  Camera,
  RotateCw,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  Sliders,
  Maximize2
} from 'lucide-react';
import { DocumentCategory, ReviewMode } from '../types/document';

interface DocumentUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: {
    name: string;
    category: DocumentCategory;
    rawText?: string;
    base64Data?: string;
    mimeType?: string;
    reviewMode: ReviewMode;
    customInstructions?: string;
  }) => void;
  theme?: 'light' | 'dark';
  initialTab?: 'upload' | 'camera' | 'paste';
}

export const DocumentUploaderModal: React.FC<DocumentUploaderModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  theme = 'light',
  initialTab = 'upload',
}) => {
  const [tab, setTab] = useState<'upload' | 'camera' | 'paste'>(initialTab);
  const [category, setCategory] = useState<DocumentCategory>('invoice');
  const [reviewMode, setReviewMode] = useState<ReviewMode>('comprehensive');
  const [customInstructions, setCustomInstructions] = useState('');
  const isLight = theme === 'light';
  
  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [fileMime, setFileMime] = useState<string | null>(null);
  const [photoRotation, setPhotoRotation] = useState(0);
  const [isReadingFile, setIsReadingFile] = useState(false);

  // Camera scan state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<{
    dataUrl: string;
    base64: string;
    name: string;
  } | null>(null);
  
  // Pasted text state
  const [pastedName, setPastedName] = useState('Pasted_Document.txt');
  const [pastedText, setPastedText] = useState('');

  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Sync initial tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setError(null);
      setCameraError(null);
    } else {
      stopCamera();
    }
  }, [isOpen, initialTab]);

  // Handle camera start/stop when switching to camera tab
  useEffect(() => {
    if (isOpen && tab === 'camera' && !capturedPhoto) {
      startCamera(cameraFacing);
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, tab, capturedPhoto, cameraFacing]);

  const startCamera = async (facing: 'environment' | 'user' = 'environment') => {
    stopCamera();
    setCameraError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera facingMode error, attempting default camera:', err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          await videoRef.current.play().catch(() => {});
        }
        setCameraActive(true);
      } catch (fallbackErr: any) {
        setCameraError(
          'Unable to access camera. Please allow camera permissions in your browser, or upload a photo directly.'
        );
        setCameraActive(false);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const commaIndex = dataUrl.indexOf(',');
    const base64 = commaIndex !== -1 ? dataUrl.slice(commaIndex + 1) : dataUrl;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    setCapturedPhoto({
      dataUrl,
      base64,
      name: `Photo_Receipt_${timestamp.slice(0, 19)}.jpg`,
    });
    setCategory('invoice');
    stopCamera();
  };

  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
    startCamera(cameraFacing);
  };

  const handleToggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    processSelectedFile(selectedFile);
  };

  const processSelectedFile = (selectedFile: File) => {
    setError(null);
    setFile(selectedFile);
    setPhotoRotation(0);
    setIsReadingFile(true);

    const fileName = selectedFile.name.toLowerCase();
    const isText = selectedFile.type.startsWith('text/') || 
                   fileName.endsWith('.txt') || 
                   fileName.endsWith('.md') || 
                   fileName.endsWith('.csv') || 
                   fileName.endsWith('.json') || 
                   fileName.endsWith('.log');

    // If text or markdown
    if (isText) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = (event.target?.result as string) || '';
        setPastedText(text);
        setFileBase64(null);
        setFileMime('text/plain');
        setFilePreviewUrl(null);
        setIsReadingFile(false);
      };
      reader.onerror = () => {
        setError('Failed to read text file. Please try again.');
        setIsReadingFile(false);
      };
      reader.readAsText(selectedFile);
    } else {
      // PDF or Image
      let inferredMime = selectedFile.type;
      if (!inferredMime || inferredMime === 'application/octet-stream') {
        if (fileName.endsWith('.pdf')) inferredMime = 'application/pdf';
        else if (fileName.endsWith('.png')) inferredMime = 'image/png';
        else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) inferredMime = 'image/jpeg';
        else if (fileName.endsWith('.webp')) inferredMime = 'image/webp';
        else inferredMime = 'application/pdf';
      }
      setFileMime(inferredMime);

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = (event.target?.result as string) || '';
        setFilePreviewUrl(result);
        const commaIndex = result.indexOf(',');
        const base64 = commaIndex !== -1 ? result.slice(commaIndex + 1) : result;
        setFileBase64(base64);
        setPastedText('');
        setIsReadingFile(false);
      };
      reader.onerror = () => {
        setError('Failed to read file content. Please try another file.');
        setIsReadingFile(false);
      };
      reader.readAsDataURL(selectedFile);
    }

    // Auto-guess category from filename
    if (fileName.includes('inv') || fileName.includes('bill') || fileName.includes('receipt') || fileName.includes('expense')) {
      setCategory('invoice');
    } else if (fileName.includes('pol') || fileName.includes('sec') || fileName.includes('guideline')) {
      setCategory('policy');
    } else if (fileName.includes('rep') || fileName.includes('q1') || fileName.includes('q2') || fileName.includes('q3') || fileName.includes('q4')) {
      setCategory('report');
    } else if (fileName.includes('form') || fileName.includes('claim')) {
      setCategory('form');
    } else if (fileName.includes('contract') || fileName.includes('msa') || fileName.includes('agree')) {
      setCategory('contract');
    }
  };

  const handleRotatePhoto = () => {
    setPhotoRotation((prev) => (prev + 90) % 360);
  };

  const handleSubmit = () => {
    setError(null);

    if (tab === 'camera') {
      if (!capturedPhoto) {
        setError('Please snap a photo first or select an existing photo.');
        return;
      }
      onUpload({
        name: capturedPhoto.name,
        category,
        base64Data: capturedPhoto.base64,
        mimeType: 'image/jpeg',
        reviewMode,
        customInstructions: customInstructions.trim() || undefined,
      });
      onClose();
    } else if (tab === 'upload') {
      if (isReadingFile) {
        setError('Document is still loading. Please wait a moment...');
        return;
      }
      if (!file) {
        setError('Please select a file or photo to process.');
        return;
      }
      if (!pastedText && !fileBase64) {
        setError('Document content is empty or still being prepared. Please try re-selecting the file.');
        return;
      }
      onUpload({
        name: file.name,
        category,
        rawText: pastedText || undefined,
        base64Data: fileBase64 || undefined,
        mimeType: fileMime || file.type || 'application/pdf',
        reviewMode,
        customInstructions: customInstructions.trim() || undefined,
      });
      onClose();
    } else if (tab === 'paste') {
      if (!pastedText.trim()) {
        setError('Please paste document content to proceed.');
        return;
      }
      onUpload({
        name: pastedName.trim() || 'Document.txt',
        category,
        rawText: pastedText.trim(),
        reviewMode,
        customInstructions: customInstructions.trim() || undefined,
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors border ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#090d16] border-white/[0.08] text-white'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isLight ? 'border-slate-200/80 bg-slate-50/50' : 'border-white/[0.06] bg-[#0b0f19]/80'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-base font-bold font-display ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Scan Photo or Upload Document
              </h2>
              <p className="text-xs text-slate-500">
                Capture receipts with your camera, scan photos, or upload files for OCR analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className={`px-6 pt-3 border-b flex items-center gap-6 text-xs font-semibold overflow-x-auto no-scrollbar ${
          isLight ? 'border-slate-200/80 text-slate-500' : 'border-white/[0.06] text-slate-400'
        }`}>
          <button
            onClick={() => setTab('camera')}
            className={`pb-2.5 transition-colors relative flex items-center gap-1.5 shrink-0 ${
              tab === 'camera' 
                ? isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-bold' 
                : isLight ? 'hover:text-slate-900' : 'hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Camera Photo Scan</span>
            {tab === 'camera' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setTab('upload')}
            className={`pb-2.5 transition-colors relative flex items-center gap-1.5 shrink-0 ${
              tab === 'upload' ? isLight ? 'text-indigo-600 font-bold' : 'text-white font-bold' : isLight ? 'hover:text-slate-900' : 'hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo / PDF</span>
            {tab === 'upload' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setTab('paste')}
            className={`pb-2.5 transition-colors relative shrink-0 ${
              tab === 'paste' ? isLight ? 'text-indigo-600 font-bold' : 'text-white font-bold' : isLight ? 'hover:text-slate-900' : 'hover:text-slate-200'
            }`}
          >
            <span>Paste Text</span>
            {tab === 'paste' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: CAMERA SCAN */}
          {tab === 'camera' && (
            <div className="space-y-4">
              {!capturedPhoto ? (
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-700 shadow-inner">
                    {cameraError ? (
                      <div className="p-6 text-center text-xs text-rose-400 space-y-3 max-w-sm">
                        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
                        <p>{cameraError}</p>
                        <div className="flex items-center justify-center gap-2 pt-2">
                          <button
                            onClick={() => startCamera(cameraFacing)}
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                          >
                            Retry Camera
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />

                        {/* Scanner Viewfinder Reticle Overlay */}
                        <div className="absolute inset-4 pointer-events-none border border-white/20 rounded-xl flex flex-col justify-between p-2">
                          <div className="flex justify-between">
                            <div className="w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl" />
                            <div className="w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr" />
                          </div>
                          <div className="text-center">
                            <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-[11px] font-mono tracking-wide">
                              Align document or receipt within frame
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <div className="w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl" />
                            <div className="w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br" />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Camera Controls */}
                  <div className="flex items-center justify-end gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleToggleCameraFacing}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                        isLight ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700' : 'bg-white/[0.04] border-white/[0.08] text-slate-300'
                      }`}
                      title="Flip Camera"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleCapturePhoto}
                      disabled={!cameraActive}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-emerald-600/30 disabled:opacity-50 transition-all active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Take Photo</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Captured Photo Review */
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] max-h-72 flex items-center justify-center">
                    <img
                      src={capturedPhoto.dataUrl}
                      alt="Captured photo preview"
                      className="max-h-72 w-auto object-contain transition-transform"
                      style={{ transform: `rotate(${photoRotation}deg)` }}
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleRotatePhoto}
                        className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 backdrop-blur-md transition-colors"
                        title="Rotate 90 degrees"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Photo captured: {capturedPhoto.name}</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleRetakePhoto}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline"
                    >
                      Retake Photo
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UPLOAD FILE OR PHOTO */}
          {tab === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) {
                    processSelectedFile(e.dataTransfer.files[0]);
                  }
                }}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3 ${
                  isLight 
                    ? 'border-slate-200 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/20' 
                    : 'border-white/[0.14] hover:border-emerald-500/70 bg-white/[0.01] hover:bg-white/[0.03]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {filePreviewUrl && fileMime?.startsWith('image/') ? (
                  <div className="space-y-2">
                    <div className="w-36 h-36 mx-auto rounded-xl overflow-hidden border border-slate-200 shadow-md bg-white flex items-center justify-center">
                      <img
                        src={filePreviewUrl}
                        alt="Photo preview"
                        className="max-w-full max-h-full object-contain"
                        style={{ transform: `rotate(${photoRotation}deg)` }}
                      />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {file?.name}
                    </p>
                    <p className="text-[11px] text-emerald-600 font-semibold">
                      Photo loaded and ready for Vision OCR scan
                    </p>
                  </div>
                ) : (
                  <>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto shadow-xs ${
                      isLight ? 'bg-white border border-slate-200 text-emerald-600' : 'bg-white/[0.04] border border-white/[0.08] text-emerald-400'
                    }`}>
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className={`text-sm font-bold font-display ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                        {file ? file.name : 'Click to select or drop any photo or document'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Supports Photos (JPG, PNG, WebP, HEIC), PDF, Invoices, and Reports
                      </p>
                    </div>
                  </>
                )}

                {file && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Selected: {(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                )}
              </div>

              {/* Quick Actions for Photo */}
              <div className="flex items-center justify-between gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setTab('camera')}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-white/[0.03] border-white/[0.08] text-slate-300'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Use Device Camera Instead</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PASTE TEXT */}
          {tab === 'paste' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Title or Reference
                </label>
                <input
                  type="text"
                  value={pastedName}
                  onChange={(e) => setPastedName(e.target.value)}
                  placeholder="e.g. Master_Services_Agreement_2026.txt"
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                    isLight ? 'bg-slate-50 border border-slate-200 text-slate-800' : 'bg-white/[0.03] border border-white/[0.08] text-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Content
                </label>
                <textarea
                  rows={8}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste text from any contract, invoice, policy, or claim..."
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl font-mono transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                    isLight ? 'bg-slate-50 border border-slate-200 text-slate-800' : 'bg-white/[0.03] border border-white/[0.08] text-slate-200'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Processing Options Section */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-white/[0.02] border-white/[0.06]'
          }`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Category Selection */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Document Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                  className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                    isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0f1420] border-white/[0.08] text-slate-200'
                  }`}
                >
                  <option value="invoice">Invoice / Receipt / Bill</option>
                  <option value="contract">Legal Agreement / Contract</option>
                  <option value="policy">Corporate Policy / Compliance Standard</option>
                  <option value="report">Executive Report / Financial Statement</option>
                  <option value="form">Claim Form / Application</option>
                  <option value="other">Other Document</option>
                </select>
              </div>

              {/* Review Mode */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Scanning Depth
                </label>
                <select
                  value={reviewMode}
                  onChange={(e) => setReviewMode(e.target.value as ReviewMode)}
                  className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                    isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0f1420] border-white/[0.08] text-slate-200'
                  }`}
                >
                  <option value="comprehensive">Comprehensive (All Insights & Traceability)</option>
                  <option value="risk_audit">Risk & Liability Priority</option>
                  <option value="extraction">Structured Field & Table Extraction</option>
                  <option value="compliance">Policy & Regulatory Audit</option>
                </select>
              </div>
            </div>

            {/* Optional Custom Instructions */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Custom Review Guidance (Optional)
              </label>
              <input
                type="text"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="e.g. Verify tax calculation, check auto-renewal clauses, extract all line items..."
                className={`w-full text-xs px-3 py-1.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                  isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0f1420] border-white/[0.08] text-slate-200'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`px-6 py-4 border-t flex items-center justify-between ${
          isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-[#07090e] border-white/[0.06]'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors ${
              isLight ? 'border-slate-200 hover:bg-slate-100 text-slate-700' : 'border-white/[0.08] hover:bg-white/[0.06] text-slate-300'
            }`}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isReadingFile}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-all shadow-sm shadow-indigo-600/30 flex items-center gap-1.5"
          >
            {isReadingFile ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Preparing File...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {tab === 'camera' ? 'Scan Photo with AI' : 'Scan Document with AI'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
