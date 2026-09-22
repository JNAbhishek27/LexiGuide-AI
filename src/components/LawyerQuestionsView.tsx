/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  HelpCircle,
  Copy,
  Check,
  FileQuestion,
  BookOpen,
} from 'lucide-react';
import { useDocumentContext } from '../context/DocumentContext';
import { LegalDisclaimer } from './LegalDisclaimer';
import { QuestionsForLawyer } from '../types';

export const LawyerQuestionsView: React.FC = () => {
  const { analysis, activeDocument } = useDocumentContext();
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const questions: QuestionsForLawyer[] =
    analysis?.lawyerQuestions || analysis?.questionsForLawyer || [];
  const categories: string[] = [
    'All',
    ...Array.from(new Set(questions.map((q: QuestionsForLawyer) => q.category))),
  ];

  const filtered: QuestionsForLawyer[] = questions.filter(
    (q: QuestionsForLawyer) => selectedCategory === 'All' || q.category === selectedCategory
  );

  const handleCopyQuestions = async () => {
    const lines = [
      `# Questions to Ask Qualified Legal Counsel regarding: ${activeDocument?.name || 'Document'}`,
      `Prepared with LexiGuide AI\n`,
      ...questions.map(
        (q: QuestionsForLawyer, idx: number) =>
          `### ${idx + 1}. [${q.category}] ${q.question}\n- **Why to Ask:** ${q.reasonToAsk || q.whyAskThis}\n- **Relevant Clause:** ${q.documentReference || q.relevantSection}\n`
      ),
      `\n*Notice: Prepared for informational consultation purposes only.*`,
    ];

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Clipboard write failed');
    }
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
        <FileQuestion className="w-8 h-8 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">No Questions Prepared</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Upload or analyze a document from the dashboard to generate grounded legal inquiries tailored for an attorney consultation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-sm">
                Legal Consultation Prep
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">{questions.length} Targeted Questions</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Questions for Your Legal Counsel</h2>
            <p className="text-xs text-slate-600">
              Take these document-grounded inquiries to your legal consultation to save time and address ambiguous provisions.
            </p>
          </div>

          <button
            id="copy-lawyer-questions-button"
            type="button"
            onClick={handleCopyQuestions}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy All Questions'}</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat: string) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat} {cat === 'All' ? `(${questions.length})` : ''}
          </button>
        ))}
      </div>

      {/* Questions Cards */}
      <div className="space-y-4">
        {filtered.map((item: QuestionsForLawyer) => (
          <div
            key={item.id}
            id={`lawyer-question-${item.id}`}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3 hover:border-slate-300 transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                {item.category}
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-slate-400" />
                {item.documentReference || item.relevantSection}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {item.question}
            </h3>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-700 space-y-1">
              <span className="font-semibold text-slate-900 block">Strategic Reason to Ask:</span>
              <p className="leading-relaxed">{item.reasonToAsk || item.whyAskThis}</p>
            </div>
          </div>
        ))}
      </div>

      <LegalDisclaimer />
    </div>
  );
};
