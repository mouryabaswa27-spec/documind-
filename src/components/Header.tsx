import React, { useState, useRef, useEffect } from 'react';
import { 
  FileCheck2, 
  Upload, 
  MessageSquare, 
  Layers, 
  Sun, 
  Moon,
  Sparkles,
  Type,
  Check,
  Eye,
  Camera
} from 'lucide-react';

interface HeaderProps {
  activeView: 'repository' | 'scanner' | 'risks' | 'compliance' | 'batch';
  onViewChange: (view: 'repository' | 'scanner' | 'risks' | 'compliance' | 'batch') => void;
  onOpenUpload: () => void;
  onOpenScanPhoto?: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
  totalDocuments: number;
  criticalRisksCount: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  fontPreference: 'lexend' | 'dmsans' | 'system';
  onChangeFont: (font: 'lexend' | 'dmsans' | 'system') => void;
  fontSize: 'normal' | 'relaxed' | 'large';
  onChangeFontSize: (size: 'normal' | 'relaxed' | 'large') => void;
  onOpenIDPConcept?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onViewChange,
  onOpenUpload,
  onOpenScanPhoto,
  onToggleChat,
  isChatOpen,
  totalDocuments,
  criticalRisksCount,
  theme,
  onToggleTheme,
  fontPreference,
  onChangeFont,
  fontSize,
  onChangeFontSize,
  onOpenIDPConcept,
}) => {
  const isLight = theme === 'light';
  const [showAccessMenu, setShowAccessMenu] = useState(false);
  const accessMenuRef = useRef<HTMLDivElement>(null);

  // Close accessibility menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accessMenuRef.current && !accessMenuRef.current.contains(e.target as Node)) {
        setShowAccessMenu(false);
      }
    };
    if (showAccessMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAccessMenu]);

  return (
    <header className={`h-16 px-5 sm:px-6 border-b sticky top-0 z-30 flex items-center justify-between transition-colors ${
      isLight 
        ? 'bg-white/95 border-slate-200/90 text-slate-800 backdrop-blur-md shadow-xs' 
        : 'bg-[#0c1017]/95 border-white/[0.08] text-slate-100 backdrop-blur-md'
    }`}>
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <a 
          href="/" 
          onClick={(e) => { e.preventDefault(); onViewChange('repository'); }}
          className="group flex items-center gap-2.5 transition-transform"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight flex items-center gap-1.5 font-display">
              <span>DocuMind</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-sans uppercase tracking-wider ${
                isLight ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/70' : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
              }`}>
                IDP System
              </span>
            </span>
          </div>
        </a>
      </div>

      {/* Human Navigation Links */}
      <nav className={`hidden md:flex items-center gap-7 text-xs font-medium ${
        isLight ? 'text-slate-600' : 'text-slate-400'
      }`}>
        <button
          onClick={() => onViewChange('repository')}
          className={`py-1 transition-colors relative flex items-center gap-1.5 ${
            activeView === 'repository'
              ? isLight ? 'text-indigo-600 font-semibold' : 'text-white font-semibold'
              : isLight ? 'hover:text-slate-900' : 'hover:text-slate-200'
          }`}
        >
          <span>All Documents</span>
          <span className={`text-[11px] px-1.5 py-0.2 rounded-full tabular-nums ${
            isLight ? 'bg-slate-100 text-slate-600 font-semibold' : 'bg-slate-800 text-slate-400'
          }`}>
            {totalDocuments}
          </span>
          {activeView === 'repository' && (
            <span className="absolute -bottom-3.5 left-0 right-0 h-[2px] bg-indigo-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => onViewChange('risks')}
          className={`py-1 transition-colors relative flex items-center gap-1.5 ${
            activeView === 'risks'
              ? isLight ? 'text-indigo-600 font-semibold' : 'text-white font-semibold'
              : isLight ? 'hover:text-slate-900' : 'hover:text-slate-200'
          }`}
        >
          <span>Risk Review</span>
          {criticalRisksCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-500/20" />
          )}
          {activeView === 'risks' && (
            <span className="absolute -bottom-3.5 left-0 right-0 h-[2px] bg-indigo-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => onViewChange('compliance')}
          className={`py-1 transition-colors relative ${
            activeView === 'compliance'
              ? isLight ? 'text-indigo-600 font-semibold' : 'text-white font-semibold'
              : isLight ? 'hover:text-slate-900' : 'hover:text-slate-200'
          }`}
        >
          <span>Policy Checks</span>
          {activeView === 'compliance' && (
            <span className="absolute -bottom-3.5 left-0 right-0 h-[2px] bg-indigo-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => onViewChange('batch')}
          className={`py-1 transition-colors relative flex items-center gap-1.5 ${
            activeView === 'batch'
              ? isLight ? 'text-indigo-600 font-semibold' : 'text-white font-semibold'
              : isLight ? 'hover:text-slate-900' : 'hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 opacity-70" />
          <span>Redline &amp; Diff</span>
          {activeView === 'batch' && (
            <span className="absolute -bottom-3.5 left-0 right-0 h-[2px] bg-indigo-600 rounded-full" />
          )}
        </button>
      </nav>

      {/* Primary Actions & Accessibility Controls */}
      <div className="flex items-center gap-2">
        {/* Human Accessibility & Reading Comfort Popover */}
        <div className="relative" ref={accessMenuRef}>
          <button
            onClick={() => setShowAccessMenu((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
              showAccessMenu
                ? isLight ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-indigo-500/20 border-indigo-400 text-indigo-200'
                : isLight 
                  ? 'bg-slate-100/80 hover:bg-slate-200/80 border-slate-200 text-slate-700' 
                  : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300'
            }`}
            title="Reading Comfort & Accessibility Settings"
            aria-label="Reading Comfort Settings"
          >
            <Type className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Reading</span>
            <span className="text-[11px] font-semibold opacity-75">
              {fontPreference === 'lexend' ? 'Lexend' : fontPreference === 'dmsans' ? 'DM Sans' : 'System'}
            </span>
          </button>

          {showAccessMenu && (
            <div className={`absolute right-0 mt-2 w-72 p-3.5 rounded-2xl shadow-xl border z-50 animate-in fade-in zoom-in-95 duration-150 ${
              isLight 
                ? 'bg-white border-slate-200 text-slate-800 shadow-slate-300/40' 
                : 'bg-[#0f1420] border-slate-700 text-slate-100 shadow-2xl'
            }`}>
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200/80 dark:border-slate-800">
                <span className="text-xs font-semibold flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-500" />
                  Reading Comfort & Font
                </span>
                <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded-md">
                  Easy Reading
                </span>
              </div>

              {/* Font Choice */}
              <div className="space-y-1.5 mb-3">
                <label className="text-[11px] font-medium text-slate-500 block">
                  Readable Typography
                </label>
                <div className="space-y-1">
                  <button
                    onClick={() => onChangeFont('lexend')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      fontPreference === 'lexend'
                        ? 'bg-indigo-600 text-white font-medium shadow-xs'
                        : isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/[0.06] text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Lexend (Recommended)</div>
                      <div className={`text-[10px] ${fontPreference === 'lexend' ? 'text-indigo-100' : 'text-slate-400'}`}>
                        Engineered to reduce visual stress & ease reading
                      </div>
                    </div>
                    {fontPreference === 'lexend' && <Check className="w-3.5 h-3.5 shrink-0 ml-2" />}
                  </button>

                  <button
                    onClick={() => onChangeFont('dmsans')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      fontPreference === 'dmsans'
                        ? 'bg-indigo-600 text-white font-medium shadow-xs'
                        : isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/[0.06] text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">DM Sans</div>
                      <div className={`text-[10px] ${fontPreference === 'dmsans' ? 'text-indigo-100' : 'text-slate-400'}`}>
                        Warm, friendly, open humanist letterforms
                      </div>
                    </div>
                    {fontPreference === 'dmsans' && <Check className="w-3.5 h-3.5 shrink-0 ml-2" />}
                  </button>

                  <button
                    onClick={() => onChangeFont('system')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      fontPreference === 'system'
                        ? 'bg-indigo-600 text-white font-medium shadow-xs'
                        : isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/[0.06] text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">System Clear</div>
                      <div className={`text-[10px] ${fontPreference === 'system' ? 'text-indigo-100' : 'text-slate-400'}`}>
                        Default clean operating system typography
                      </div>
                    </div>
                    {fontPreference === 'system' && <Check className="w-3.5 h-3.5 shrink-0 ml-2" />}
                  </button>
                </div>
              </div>

              {/* Text Sizing */}
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
                <label className="text-[11px] font-medium text-slate-500 block mb-1.5">
                  Text Sizing
                </label>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => onChangeFontSize('normal')}
                    className={`py-1 text-xs rounded-lg font-medium transition-colors ${
                      fontSize === 'normal'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/[0.05] hover:bg-white/[0.09] text-slate-300'
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    onClick={() => onChangeFontSize('relaxed')}
                    className={`py-1 text-xs rounded-lg font-medium transition-colors ${
                      fontSize === 'relaxed'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/[0.05] hover:bg-white/[0.09] text-slate-300'
                    }`}
                  >
                    Comfort (+10%)
                  </button>
                  <button
                    onClick={() => onChangeFontSize('large')}
                    className={`py-1 text-xs rounded-lg font-medium transition-colors ${
                      fontSize === 'large'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/[0.05] hover:bg-white/[0.09] text-slate-300'
                    }`}
                  >
                    Large (+25%)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Theme Toggle with Friendly Tooltip */}
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-xl border transition-colors ${
            isLight 
              ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700 hover:text-slate-900' 
              : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300 hover:text-white'
          }`}
          title={isLight ? 'Switch to Gentle Night Mode' : 'Switch to Easy Day Reading Mode'}
          aria-label="Toggle Theme"
        >
          {isLight ? <Moon className="w-4 h-4 text-slate-600" /> : <Sun className="w-4 h-4 text-amber-300" />}
        </button>

        {/* How IDP Works / Architecture Concept Trigger */}
        {onOpenIDPConcept && (
          <button
            onClick={onOpenIDPConcept}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 border ${
              isLight 
                ? 'bg-amber-50 hover:bg-amber-100/80 border-amber-200/80 text-amber-900 shadow-2xs' 
                : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-200'
            }`}
            title="Intelligent Document Processing (IDP) Architecture & 5 Pillars"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">How IDP Works</span>
          </button>
        )}

        {/* Ask Agent Button */}
        <button
          onClick={onToggleChat}
          className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all flex items-center gap-1.5 border ${
            isChatOpen 
              ? isLight 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold' 
                : 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300 font-semibold'
              : isLight 
                ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700' 
                : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Ask Agent</span>
        </button>

        {/* Scan Photo Button */}
        {onOpenScanPhoto && (
          <button
            onClick={onOpenScanPhoto}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 border shadow-2xs active:scale-[0.98] ${
              isLight 
                ? 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200 text-emerald-800' 
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-200'
            }`}
            title="Scan Photo from Camera or Image"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Scan Photo</span>
          </button>
        )}

        {/* Upload File Button */}
        <button
          onClick={onOpenUpload}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-sm shadow-indigo-600/25 flex items-center gap-1.5 active:scale-[0.98]"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload File</span>
        </button>
      </div>
    </header>
  );
};


