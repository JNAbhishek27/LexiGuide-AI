/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  GitCompare,
  PlusCircle,
  MinusCircle,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Shield,
  FileText,
} from 'lucide-react';
import { useDocumentContext } from '../context/DocumentContext';
import { LegalDisclaimer } from './LegalDisclaimer';
import { ComparisonDifference } from '../types';

export const DocumentCompareView: React.FC = () => {
  const {
    activeDocument,
    comparisonDocument,
    comparisonResult,
    isComparing,
    loadingStage,
    loadSampleComparisonPair,
    runComparison,
    error,
  } = useDocumentContext();

  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'ADDED' | 'REMOVED' | 'MODIFIED' | 'UNCHANGED'>('ALL');

  const diffs = comparisonResult?.differences || [];

  const filteredDiffs = diffs.filter((d) => {
    if (selectedFilter === 'ALL') return true;
    return d.changeType === selectedFilter;
  });

  const getChangeBadge = (type: ComparisonDifference['changeType']) => {
    switch (type) {
      case 'ADDED':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: PlusCircle,
          label: 'Added Provision',
        };
      case 'REMOVED':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          icon: MinusCircle,
          label: 'Removed Provision',
        };
      case 'MODIFIED':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-300',
          icon: RefreshCw,
          label: 'Modified Provision',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: CheckCircle2,
          label: 'Unchanged',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Sample Loader */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-sm">
                Comparative Intelligence
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">Side-by-Side Clause Variance</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Compare Two Legal Documents
            </h2>
            <p className="text-xs text-slate-600">
              Detect added, removed, and modified clauses with plain-English analysis of shifted legal exposures.
            </p>
          </div>

          <button
            id="load-sample-comparison-cta"
            type="button"
            disabled={isComparing}
            onClick={loadSampleComparisonPair}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-xs transition-all active:scale-95 disabled:opacity-50 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-slate-900" aria-hidden="true" />
            <span>Load Sample V1 vs V2 Revision</span>
          </button>
        </div>

        {/* Loaded Document Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs">
            <FileText className="w-4 h-4 text-slate-500 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Baseline Document (V1)</span>
              <span className="font-semibold text-slate-900 truncate block">
                {activeDocument ? activeDocument.name : 'Not selected (load or upload)'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs">
            <FileText className="w-4 h-4 text-slate-500 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Comparison Document (V2)</span>
              <span className="font-semibold text-slate-900 truncate block">
                {comparisonDocument ? comparisonDocument.name : 'Not selected (click "Load Sample" or upload)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {isComparing && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900">{loadingStage || 'Comparing agreements...'}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Extracting clauses, comparing financial and liability terms, and computing risk shifting impact.
          </p>
        </div>
      )}

      {error && !isComparing && (
        <div
          role="alert"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm"
        >
          <div className="space-y-1">
            <h4 className="font-semibold text-rose-950">Notice</h4>
            <p>{error}</p>
          </div>
          {activeDocument && comparisonDocument && (
            <button
              type="button"
              onClick={() => runComparison(activeDocument, comparisonDocument)}
              className="shrink-0 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-semibold shadow-2xs transition-all"
            >
              Retry Comparison
            </button>
          )}
        </div>
      )}

      {comparisonResult && !isComparing && (
        <div className="space-y-6">
          {/* Executive Diff Summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>Executive Comparison Overview</span>
            </h3>
            <p className="text-sm text-slate-800 leading-relaxed">
              {comparisonResult.summaryOfDifferences}
            </p>

            {/* Risk Shift Analysis Alert */}
            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 space-y-1">
              <span className="font-bold text-indigo-900 block text-xs">Risk Shift Analysis:</span>
              <p className="leading-relaxed">{comparisonResult.riskShiftAnalysis}</p>
            </div>

            {/* Recommendations */}
            {comparisonResult.recommendations?.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Recommended Discussion Points for Counsel:
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  {comparisonResult.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="font-bold text-slate-900">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
            {(['ALL', 'MODIFIED', 'ADDED', 'REMOVED', 'UNCHANGED'] as const).map((filter) => {
              const count = filter === 'ALL' ? diffs.length : diffs.filter((d) => d.changeType === filter).length;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedFilter === filter
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {filter} ({count})
                </button>
              );
            })}
          </div>

          {/* Differences List */}
          <div className="space-y-4">
            {filteredDiffs.map((diff) => {
              const badge = getChangeBadge(diff.changeType);
              const BadgeIcon = badge.icon;
              return (
                <div
                  key={diff.id}
                  id={`diff-card-${diff.id}`}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                        <BadgeIcon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>
                      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {diff.category}
                      </span>
                    </div>

                    <span className="text-xs font-medium text-slate-500">
                      Significance: <strong className="text-slate-800">{diff.significance}</strong>
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{diff.clauseTitle}</h4>
                  </div>

                  {/* Side-by-side textual comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 block">
                        Original (Document 1)
                      </span>
                      <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {diff.doc1Text || '— Not present in original agreement —'}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-indigo-50/40 border border-indigo-100 space-y-1">
                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-indigo-700 block">
                        Revised (Document 2)
                      </span>
                      <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {diff.doc2Text || '— Removed from revised agreement —'}
                      </p>
                    </div>
                  </div>

                  {/* Practical real-world impact */}
                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-700 bg-slate-50/70 p-3 rounded-lg">
                    <span className="font-bold text-slate-900 block mb-0.5">
                      Practical Legal & Business Impact:
                    </span>
                    <p className="leading-relaxed">{diff.practicalImpactExplanation}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <LegalDisclaimer compact />
        </div>
      )}
    </div>
  );
};
