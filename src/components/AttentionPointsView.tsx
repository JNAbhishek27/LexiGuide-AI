/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  Info,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { AttentionPoint, RiskCategory } from '../types';

interface AttentionPointsViewProps {
  attentionPoints: AttentionPoint[];
}

export const AttentionPointsView: React.FC<AttentionPointsViewProps> = ({ attentionPoints }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(attentionPoints.map((a) => a.category)))];

  const filtered = attentionPoints.filter(
    (pt) => selectedCategory === 'All' || pt.category === selectedCategory
  );

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Caution':
        return {
          badge: 'bg-rose-50 text-rose-800 border-rose-200',
          label: 'Requires Attention',
        };
      case 'Notable':
        return {
          badge: 'bg-amber-50 text-amber-900 border-amber-200',
          label: 'Potential Concern',
        };
      default:
        return {
          badge: 'bg-blue-50 text-blue-800 border-blue-200',
          label: 'Notable Provision',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Informative Header Note */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-950 space-y-1">
        <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
          <ShieldAlert className="w-4 h-4 text-amber-700" />
          <span>Objective Risk & Attention Profiling</span>
        </div>
        <p className="leading-relaxed text-amber-900/90">
          Items below are highlighted based on common commercial exposure factors (unilateral termination rights, strict liability waivers, uncapped indemnities, or short notice windows). In accordance with responsible legal tech standards, provisions are not labeled definitively "invalid" without authoritative judicial rulings.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
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
            {cat} {cat === 'All' ? `(${attentionPoints.length})` : ''}
          </button>
        ))}
      </div>

      {/* Attention Points Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
          No attention points found in this category.
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtered.map((pt) => {
            const sev = getSeverityBadge(pt.severity);
            return (
              <div
                key={pt.id}
                id={`attention-point-${pt.id}`}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${sev.badge}`}
                    >
                      {sev.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {pt.category}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-slate-500">{pt.sourceSection}</span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-base">{pt.issueTitle}</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{pt.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                    <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Why It Matters (Exposure Impact):
                    </span>
                    <p className="text-slate-700 leading-relaxed">{pt.whyItMatters}</p>
                  </div>

                  <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 space-y-1">
                    <span className="font-semibold text-indigo-950 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                      Consider Discussing With Counsel:
                    </span>
                    <p className="text-indigo-900 leading-relaxed">{pt.suggestedActionOrQuestion}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
