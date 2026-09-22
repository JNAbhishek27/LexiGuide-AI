/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, Clock, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { ImportantDate } from '../types';

interface ImportantDatesViewProps {
  dates: ImportantDate[];
}

export const ImportantDatesView: React.FC<ImportantDatesViewProps> = ({ dates }) => {
  if (dates.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
        No critical deadlines or timeline milestones detected in the document.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span>Contractual Milestones, Notice Periods & Deadlines</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Explicit notice windows, renewal cutoffs, cure periods, and payment milestones.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {dates.map((item) => (
          <div
            key={item.id}
            id={`date-card-${item.id}`}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                  <Clock className="w-3 h-3" />
                  <span>{item.dateOrTimeline}</span>
                </span>
                {item.isRecurring && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>Recurring</span>
                  </span>
                )}
              </div>

              <h4 className="font-bold text-slate-900 text-sm">{item.event}</h4>
              <p className="text-xs text-slate-500 font-medium">Source: {item.sourceClause}</p>
            </div>

            {item.actionRequired && (
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg">
                <span className="font-semibold text-slate-900 block mb-0.5">Action Required:</span>
                <span>{item.actionRequired}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
