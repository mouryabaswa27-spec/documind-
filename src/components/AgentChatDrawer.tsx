import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  FileText, 
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { DocumentItem, ChatMessage } from '../types/document';

interface AgentChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentDocument: DocumentItem | null;
  allDocuments: DocumentItem[];
  theme?: 'light' | 'dark';
}

export const AgentChatDrawer: React.FC<AgentChatDrawerProps> = ({
  isOpen,
  onClose,
  currentDocument,
  allDocuments,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am DocuMind Assistant, ready to assist your document review and compliance audits. 
You can ask me to evaluate financial liabilities, identify policy contradictions, extract key clauses, or cross-reference documents across your organization's repository.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async (questionText?: string) => {
    const q = (questionText || inputValue).trim();
    if (!q || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/documents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          currentDocument: currentDocument || undefined,
          allDocuments: allDocuments,
          chatHistory: messages.slice(-6),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer from agent.');
      }

      const data = await response.json();
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.answer || 'No response generated.',
        citations: data.citations || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'assistant',
          content: `Unable to complete query: ${err?.message || 'Agent connection error. Please try again.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    'What are the critical financial exposures across our documents?',
    'Does the TechFlow agreement violate our AI security policy?',
    'What is the status of the Savannah crane casualty claim?',
    'Verify early payment discounts and net terms on pending invoices',
  ];

  return (
    <div className={`fixed inset-y-0 right-0 z-40 w-full sm:w-[480px] backdrop-blur-2xl border-l shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 transition-colors ${
      isLight ? 'bg-white/95 border-slate-200/90 text-slate-800' : 'bg-[#090d16]/95 border-white/[0.08] text-slate-100'
    }`}>
      {/* Top Header */}
      <div className={`px-5 py-4 border-b flex items-center justify-between ${
        isLight ? 'bg-slate-50/80 border-slate-200/80' : 'bg-[#0b0f19]/70 border-white/[0.06]'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className={`text-xs font-bold flex items-center gap-1.5 font-display ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              <span>DocuMind Assistant</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20 inline-block" />
            </h3>
            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {currentDocument ? (
                <span>Focus: <strong className={isLight ? 'text-slate-800 font-semibold' : 'text-slate-200 font-medium'}>{currentDocument.name}</strong></span>
              ) : (
                <span>Querying all repository files</span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className={`p-1.5 rounded-lg transition-colors ${
            isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60' : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
          }`}
          aria-label="Close assistant"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className={`px-4 py-2.5 border-b overflow-x-auto no-scrollbar flex items-center gap-1.5 ${
        isLight ? 'bg-slate-50/50 border-slate-200/80' : 'bg-white/[0.01] border-white/[0.04]'
      }`}>
        <span className={`text-[10px] uppercase font-semibold tracking-wider shrink-0 ${
          isLight ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Try:
        </span>
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors shrink-0 whitespace-nowrap border font-medium ${
              isLight 
                ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs' 
                : 'bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white border-white/[0.06]'
            }`}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Viewport */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${
        isLight ? 'bg-[#f8fafc]' : 'bg-[#090d16]/50'
      }`}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 text-xs ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                <Bot className="w-3 h-3" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-4 space-y-2 leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white font-normal shadow-sm shadow-indigo-600/20'
                  : isLight 
                    ? 'bg-white border border-slate-200/90 text-slate-800 shadow-xs' 
                    : 'bg-white/[0.03] border border-white/[0.06] text-slate-200'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Source Evidence:
                  </div>
                  {msg.citations.map((cite, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-2 rounded-lg bg-black/40 border border-white/[0.04] text-[11px] space-y-0.5"
                    >
                      <div className="flex items-center justify-between text-indigo-300 font-medium">
                        <span>{cite.documentName}</span>
                        {cite.location && <span className="font-mono text-[10px] text-slate-500">{cite.location}</span>}
                      </div>
                      <p className="text-slate-400 italic">"{cite.quote}"</p>
                    </div>
                  ))}
                </div>
              )}

              <div
                className={`text-[10px] font-mono ${
                  msg.role === 'user' ? 'text-indigo-200' : 'text-slate-500'
                } text-right`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-md bg-white/[0.06] flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                <User className="w-3 h-3" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5 text-xs justify-start items-center text-slate-400">
            <div className="w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Bot className="w-3 h-3" />
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
              <span className="text-slate-300">Synthesizing document insights...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className={`p-3.5 border-t ${
        isLight ? 'border-slate-200/90 bg-white' : 'border-white/[0.06] bg-[#07090e]'
      }`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about clauses, terms, risks..."
            disabled={isLoading}
            className={`flex-1 text-xs px-3.5 py-2.5 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 ${
              isLight 
                ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500' 
                : 'bg-white/[0.03] border-white/[0.08] text-white placeholder-slate-500 focus:border-indigo-500/70'
            }`}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 text-white disabled:text-slate-400 transition-colors shrink-0 shadow-sm shadow-indigo-600/25"
            aria-label="Send query"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
