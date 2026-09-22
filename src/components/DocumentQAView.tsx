/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  MessageSquareText,
  Send,
  Loader2,
  Sparkles,
  BookOpen,
  HelpCircle,
  AlertTriangle,
  AlertCircle,
  FileSearch,
  User,
  Bot,
} from 'lucide-react';
import { useDocumentContext } from '../context/DocumentContext';
import { LegalDisclaimer } from './LegalDisclaimer';

export const DocumentQAView: React.FC = () => {
  const {
    activeDocument,
    chatMessages,
    sendQuestion,
    isAsking,
    error,
    loadSampleAgreement,
  } = useDocumentContext();

  const [inputQuestion, setInputQuestion] = useState('');

  const suggestedQuestions = [
    'When can this agreement be terminated?',
    'What is the aggregate liability cap and what is excluded?',
    'Does the contract automatically renew, and what is the notice window?',
    'What are the payment deadlines, late interest rates, and fees?',
    'What happens to customer data after termination?',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim() || isAsking) return;
    const q = inputQuestion.trim();
    setInputQuestion('');
    sendQuestion(q);
  };

  const handleSuggestedClick = (q: string) => {
    if (isAsking) return;
    sendQuestion(q);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-sm">
            Grounded Intelligence
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500 font-medium">Document-Cited Answers</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Ask Questions About Your Document</h2>
        <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
          Queries are grounded directly in the text of your uploaded agreement. Answers cite relevant sections, provide short quotes, and clarify what specific clauses you should review with legal counsel.
        </p>

        {!activeDocument && (
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3">
            <span>No document loaded. Load a sample agreement to test interactive document Q&A:</span>
            <button
              type="button"
              onClick={loadSampleAgreement}
              className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-900 font-semibold text-xs shrink-0 hover:bg-amber-300 shadow-2xs"
            >
              Load Sample Document
            </button>
          </div>
        )}
      </div>

      {/* Suggested Questions Chips */}
      {activeDocument && chatMessages.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Suggested Inquiries for "{activeDocument.name}":
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((sq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSuggestedClick(sq)}
                disabled={isAsking}
                className="text-xs text-left px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 transition-colors disabled:opacity-50"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages Stream */}
      <div className="space-y-4">
        {chatMessages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              id={`chat-message-${msg.id}`}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 sm:p-5 text-sm space-y-3 shadow-2xs ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-br-xs'
                    : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs'
                }`}
              >
                {/* Message Header / Timestamp */}
                <div className="flex items-center justify-between gap-4 text-xs opacity-75">
                  <span className="font-semibold">{isUser ? 'You' : 'LexiGuide AI'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Primary Content / Answer */}
                <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>

                {/* Assistant Structured Grounding Additions */}
                {!isUser && (
                  <div className="space-y-3 pt-3 border-t border-slate-100 text-xs text-slate-700">
                    {/* Why this answer */}
                    {msg.whyThisAnswer && (
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-0.5">
                        <span className="font-bold text-slate-900 block">Why this answer:</span>
                        <p className="leading-relaxed">{msg.whyThisAnswer}</p>
                      </div>
                    )}

                    {/* Citations / Quotes */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Relevant Document Section:</span>
                        </span>
                        {msg.citations.map((cite, cIdx) => (
                          <div
                            key={cIdx}
                            className="bg-indigo-50/40 p-2.5 rounded-lg border border-indigo-100/70 font-mono text-[11px] text-slate-800"
                          >
                            <span className="font-sans font-bold text-indigo-900 block mb-0.5">
                              {cite.section}
                            </span>
                            <blockquote className="italic">"{cite.quote}"</blockquote>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* What to review */}
                    {msg.whatToReview && (
                      <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-100 text-amber-950">
                        <span className="font-bold text-amber-900 block mb-0.5">What to review:</span>
                        <span>{msg.whatToReview}</span>
                      </div>
                    )}

                    {/* Grounding Disclaimer */}
                    <div className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-100">
                      {msg.disclaimer || 'This interpretation is based strictly on the uploaded document.'}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isAsking && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-xs p-4 shadow-2xs text-xs text-slate-600 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              <span>Searching document context and formulating grounded answer...</span>
            </div>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && !isAsking && (
        <div
          role="alert"
          className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-0.5">
            <span className="font-semibold block">Notice</span>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="sticky bottom-4 z-20">
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-300 shadow-lg focus-within:border-indigo-500">
          <input
            id="qa-input-field"
            type="text"
            placeholder={
              activeDocument
                ? `Ask anything about ${activeDocument.name}...`
                : 'Upload or load a document first...'
            }
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            disabled={!activeDocument || isAsking}
            className="w-full px-3 py-2 text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-hidden disabled:opacity-50"
          />
          <button
            id="qa-submit-button"
            type="submit"
            disabled={!activeDocument || !inputQuestion.trim() || isAsking}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      <LegalDisclaimer compact />
    </div>
  );
};
