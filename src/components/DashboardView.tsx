/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Scale,
  FileText,
  GitCompare,
  MessageSquareText,
  CheckSquare,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useDocumentContext } from '../context/DocumentContext';
import { FileUploadZone } from './FileUploadZone';
import { LegalDisclaimer } from './LegalDisclaimer';

export const DashboardView: React.FC = () => {
  const { activeDocument, analysis, setActiveTab, loadSampleAgreement } = useDocumentContext();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Prominent Official Legal Notice */}
      <LegalDisclaimer />

      {/* Main Landing Hero Header */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span>AI for Legal Assistance & Access Challenge</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Understand your legal documents before you act.
        </h1>

        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Transform dense, complex contracts into clear, plain-English summaries, pinpoint high-exposure clauses, compare version differences, and generate actionable preparation for your qualified attorney.
        </p>
      </div>

      {/* Upload Zone & Evaluator One-Click Sample Trigger */}
      <FileUploadZone />

      {/* If document is already loaded in session, show quick resume card */}
      {activeDocument && analysis && (
        <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">
              Active Session Analysis Ready
            </span>
            <h3 className="font-bold text-slate-900 text-sm">{activeDocument.name}</h3>
            <p className="text-xs text-slate-600">
              {(analysis.keyClauses || analysis.clauses || []).length} clauses • {analysis.obligations.length} obligations • {analysis.attentionPoints.length} attention points analyzed.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('analysis')}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <span>View Full Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Evaluation Criteria Checklist & System Architecture Summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          Core Capabilities Overview
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Scale className="w-4 h-4 text-indigo-600" />
              <span>Document Analysis</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Synthesizes plain-English summaries, key clauses, party obligations, critical timelines, and financial terms.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <GitCompare className="w-4 h-4 text-indigo-600" />
              <span>Document Comparison</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Detects added, removed, and modified clauses between agreement versions with practical risk shift analysis.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <MessageSquareText className="w-4 h-4 text-indigo-600" />
              <span>Grounded Q&A</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Answers specific questions with direct section citations, exact excerpts, and notes on what to review.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>Attorney Preparation</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Generates pre-signing compliance checklists and targeted questions with strategic reasons to discuss with counsel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
