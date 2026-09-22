/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  ListFilter,
  CheckCircle2,
  Calendar,
  DollarSign,
  AlertTriangle,
  Sparkles,
  MessageSquareText,
  CheckSquare,
  HelpCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { useDocumentContext } from '../context/DocumentContext';
import { ExecutiveSummaryCard } from './ExecutiveSummaryCard';
import { KeyClausesView } from './KeyClausesView';
import { ObligationsView } from './ObligationsView';
import { ImportantDatesView } from './ImportantDatesView';
import { FinancialTermsView } from './FinancialTermsView';
import { AttentionPointsView } from './AttentionPointsView';
import { LegalDisclaimer } from './LegalDisclaimer';

export const DocumentAnalysisDashboard: React.FC = () => {
  const {
    analysis,
    activeDocument,
    isAnalyzing,
    loadingStage,
    setActiveTab,
  } = useDocumentContext();

  const [activeSubTab, setActiveSubTab] = useState<
    'clauses' | 'obligations' | 'dates' | 'financials' | 'attention'
  >('clauses');

  if (isAnalyzing) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8 space-y-4 shadow-2xs">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900">
            {loadingStage || 'Synthesizing legal document intelligence...'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Extracting clauses, translating legal jargon to plain English, and calculating risk profiles.
          </p>
        </div>
      </div>
    );
  }

  if (!analysis || !activeDocument) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3 shadow-2xs">
        <FileText className="w-8 h-8 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">No Document Analyzed Yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Please upload a legal document or choose "Try Sample Agreement" from the dashboard.
        </p>
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className="mt-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const keyClausesList = analysis.keyClauses || analysis.clauses || [];
  const lawyerQuestionsList = analysis.lawyerQuestions || analysis.questionsForLawyer || [];
  const execSummary = analysis.summary || analysis.executiveSummary || {
    plainEnglishOverview: '',
    documentType: 'Legal Document',
    primaryParties: [],
    effectiveDate: '',
    keyTakeaways: [],
    overallRiskProfile: 'Moderate' as const,
  };

  const subTabs = [
    {
      id: 'clauses',
      label: 'Key Clauses',
      count: keyClausesList.length,
      icon: ListFilter,
    },
    {
      id: 'obligations',
      label: 'Obligations',
      count: analysis.obligations.length,
      icon: CheckCircle2,
    },
    {
      id: 'dates',
      label: 'Important Dates',
      count: analysis.importantDates.length,
      icon: Calendar,
    },
    {
      id: 'financials',
      label: 'Financial Terms',
      count: analysis.financialTerms.length,
      icon: DollarSign,
    },
    {
      id: 'attention',
      label: 'Attention Points',
      count: analysis.attentionPoints.length,
      icon: AlertTriangle,
    },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Executive Summary Card */}
      <ExecutiveSummaryCard
        summary={execSummary}
        docName={activeDocument.name}
      />

      {/* Quick Action Navigator */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('qa')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all text-left flex items-center justify-between group"
        >
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-900 block group-hover:text-indigo-600 transition-colors">
              Ask Grounded Questions
            </span>
            <span className="text-[11px] text-slate-500">Instant answers with clause citations</span>
          </div>
          <MessageSquareText className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('checklist')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all text-left flex items-center justify-between group"
        >
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-900 block group-hover:text-indigo-600 transition-colors">
              Pre-Signing Checklist
            </span>
            <span className="text-[11px] text-slate-500">{analysis.checklist.length} actionable review items</span>
          </div>
          <CheckSquare className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('lawyer')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all text-left flex items-center justify-between group"
        >
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-900 block group-hover:text-indigo-600 transition-colors">
              Questions for Counsel
            </span>
            <span className="text-[11px] text-slate-500">{lawyerQuestionsList.length} targeted questions</span>
          </div>
          <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </button>
      </div>

      {/* Sub-Tabs Navigation for Provisions Breakdown */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-px" aria-label="Analysis Tabs">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-bold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sub-Tab View Rendering */}
      <div>
        {activeSubTab === 'clauses' && <KeyClausesView clauses={keyClausesList} />}
        {activeSubTab === 'obligations' && <ObligationsView obligations={analysis.obligations} />}
        {activeSubTab === 'dates' && <ImportantDatesView dates={analysis.importantDates} />}
        {activeSubTab === 'financials' && (
          <FinancialTermsView financialTerms={analysis.financialTerms} />
        )}
        {activeSubTab === 'attention' && (
          <AttentionPointsView attentionPoints={analysis.attentionPoints} />
        )}
      </div>

      <LegalDisclaimer />
    </div>
  );
};
