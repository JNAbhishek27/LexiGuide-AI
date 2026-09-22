/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Tag,
  AlertCircle,
  FileText,
  Search,
  BookOpen,
} from 'lucide-react';
import { Clause } from '../types';

interface KeyClausesViewProps {
  clauses: Clause[];
}

export const KeyClausesView: React.FC<KeyClausesViewProps> = ({ clauses }) => {
  const [expandedId, setExpandedId] = useState<string | null>(clauses[0]?.id || null);
  const [selectedImportance, setSelectedImportance] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState('');

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'Critical':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Important':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'Standard':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredClauses = clauses.filter((clause) => {
    const matchesImportance =
      selectedImportance === 'All' || clause.importance === selectedImportance;
    const matchesSearch =
      !searchFilter ||
      clause.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      clause.plainEnglishExplanation.toLowerCase().includes(searchFilter.toLowerCase()) ||
      clause.sourceSection.toLowerCase().includes(searchFilter.toLowerCase()) ||
      clause.category.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesImportance && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Controls Bar: Filter by importance & search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Critical', 'Important', 'Standard'].map((imp) => (
            <button
              key={imp}
              type="button"
              onClick={() => setSelectedImportance(imp)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                selectedImportance === imp
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {imp} {imp === 'All' ? `(${clauses.length})` : ''}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search clauses..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Clauses List */}
      {filteredClauses.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
          No clauses found matching your filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredClauses.map((clause) => {
            const isExpanded = expandedId === clause.id;
            return (
              <div
                key={clause.id}
                id={`clause-card-${clause.id}`}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs transition-all hover:border-slate-300"
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(clause.id)}
                  aria-expanded={isExpanded}
                  className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 focus:outline-hidden"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-md border ${getImportanceBadge(
                          clause.importance
                        )}`}
                      >
                        {clause.importance}
                      </span>
                      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {clause.category}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {clause.sourceSection}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base tracking-tight">
                      {clause.title}
                    </h3>

                    <p className="text-sm text-slate-700 leading-relaxed">
                      {clause.plainEnglishExplanation}
                    </p>
                  </div>

                  <div className="text-slate-400 p-1 hover:text-slate-600 shrink-0 mt-1">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {/* Expanded Details: Raw excerpt and practical implications */}
                {isExpanded && (
                  <div className="px-4 pb-5 pt-1 sm:px-5 border-t border-slate-100 bg-slate-50/50 space-y-3">
                    {clause.implications && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                          Practical Impact & Exposure
                        </span>
                        <p className="text-xs text-slate-800 leading-relaxed bg-white p-3 rounded-lg border border-slate-200/70">
                          {clause.implications}
                        </p>
                      </div>
                    )}

                    {clause.rawSnippet && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                          <span>Exact Document Snippet ({clause.sourceSection})</span>
                        </div>
                        <blockquote className="text-xs font-mono text-slate-700 bg-slate-100/90 p-3 rounded-lg border border-slate-200 italic leading-relaxed">
                          "{clause.rawSnippet}"
                        </blockquote>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
