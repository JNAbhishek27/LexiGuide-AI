/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  FileText,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { ExecutiveSummary } from '../types';

interface ExecutiveSummaryCardProps {
  summary: ExecutiveSummary;
  docName: string;
}

export const ExecutiveSummaryCard: React.FC<ExecutiveSummaryCardProps> = ({ summary, docName }) => {
  const getRiskBadge = (profile: string) => {
    switch (profile) {
      case 'Low':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: CheckCircle2,
          label: 'Standard Terms',
        };
      case 'Attention Advised':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-300',
          icon: AlertTriangle,
          label: 'Attention Advised',
        };
      default:
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          icon: Info,
          label: profile || 'Moderate Terms',
        };
    }
  };

  const riskBadge = getRiskBadge(summary.overallRiskProfile);
  const RiskIcon = riskBadge.icon;

  return (
    <div
      id="executive-summary-container"
      className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6"
    >
      {/* Top Header & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-sm">
              {summary.documentType || 'Legal Agreement'}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium truncate max-w-xs">{docName}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Executive Summary</h2>
        </div>

        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold self-start sm:self-auto ${riskBadge.bg}`}>
          <RiskIcon className="w-4 h-4" aria-hidden="true" />
          <span>{riskBadge.label}</span>
        </div>
      </div>

      {/* Plain English Narrative */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Plain English Translation</h3>
        <p className="text-slate-800 text-sm sm:text-base leading-relaxed">
          {summary.plainEnglishOverview}
        </p>
      </div>

      {/* Metadata Pills (Parties & Effective Date) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
          <Users className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-0.5">
            <span className="font-semibold text-slate-600 block">Identified Parties</span>
            <span className="text-slate-900 font-medium">
              {summary.primaryParties?.length ? summary.primaryParties.join(' & ') : 'Not explicitly extracted'}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
          <Calendar className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-0.5">
            <span className="font-semibold text-slate-600 block">Effective Date</span>
            <span className="text-slate-900 font-medium">{summary.effectiveDate || 'Not specified'}</span>
          </div>
        </div>
      </div>

      {/* Key Takeaways Cards */}
      {summary.keyTakeaways && summary.keyTakeaways.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Primary Takeaways</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {summary.keyTakeaways.map((takeaway, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-xs text-slate-800"
              >
                <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <span className="leading-snug">{takeaway}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
