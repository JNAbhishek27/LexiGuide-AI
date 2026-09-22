/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DollarSign, CreditCard, AlertCircle, Percent, ArrowUpRight } from 'lucide-react';
import { FinancialTerm } from '../types';

interface FinancialTermsViewProps {
  financialTerms: FinancialTerm[];
}

export const FinancialTermsView: React.FC<FinancialTermsViewProps> = ({ financialTerms }) => {
  if (financialTerms.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
        No specific monetary amounts or financial formulas extracted from this document.
      </div>
    );
  }

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Penalty':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Fee':
      case 'Payment':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Deposit':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Cap':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>Financial Provisions & Monetary Commitments</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Base subscription rates, interest penalties, overage fees, renewal caps, and billing conditions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {financialTerms.map((term) => (
          <div
            key={term.id}
            id={`financial-term-${term.id}`}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-md border ${getCategoryBadge(
                    term.category
                  )}`}
                >
                  {term.category}
                </span>
                <span className="text-xs font-medium text-slate-500">{term.sourceClause}</span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm">{term.item}</h4>
                <div className="text-lg font-extrabold text-slate-900 mt-1 tracking-tight">
                  {term.amountOrCalculation}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-2.5 rounded-lg">
              <span className="font-semibold text-slate-700 block mb-0.5">Billing Terms:</span>
              <span>{term.terms}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
