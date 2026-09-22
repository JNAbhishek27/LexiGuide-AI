/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  UserCheck,
  Building2,
  Users,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Obligation } from '../types';

interface ObligationsViewProps {
  obligations: Obligation[];
}

export const ObligationsView: React.FC<ObligationsViewProps> = ({ obligations }) => {
  const [selectedParty, setSelectedParty] = useState<'All' | 'User/First Party' | 'Counterparty' | 'Mutual'>('All');

  const filtered = obligations.filter((obl) => {
    if (selectedParty === 'All') return true;
    return obl.party === selectedParty;
  });

  const getPartyBadge = (party: string) => {
    switch (party) {
      case 'User/First Party':
        return {
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          icon: UserCheck,
          label: 'Your Obligation',
        };
      case 'Counterparty':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: Building2,
          label: 'Counterparty Obligation',
        };
      default:
        return {
          bg: 'bg-purple-50 text-purple-800 border-purple-200',
          icon: Users,
          label: 'Mutual Obligation',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
        {(['All', 'User/First Party', 'Counterparty', 'Mutual'] as const).map((tab) => {
          const count = tab === 'All' ? obligations.length : obligations.filter((o) => o.party === tab).length;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedParty(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedParty === tab
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab === 'User/First Party' ? 'Your Duties' : tab === 'Counterparty' ? 'Their Duties' : tab} ({count})
            </button>
          );
        })}
      </div>

      {/* Obligations Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
          No obligations found for this party category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((obl) => {
            const partyInfo = getPartyBadge(obl.party);
            const PartyIcon = partyInfo.icon;
            return (
              <div
                key={obl.id}
                id={`obligation-card-${obl.id}`}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${partyInfo.bg}`}
                    >
                      <PartyIcon className="w-3 h-3" />
                      <span>{partyInfo.label}</span>
                    </span>
                    <span className="text-xs font-medium text-slate-500">{obl.sourceSection}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{obl.title}</h3>
                  <p className="text-xs text-slate-700 leading-relaxed">{obl.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                  {obl.deadlineOrCondition && (
                    <div className="flex items-start gap-1.5 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="font-semibold text-slate-700">Trigger/Timeline:</strong>{' '}
                        {obl.deadlineOrCondition}
                      </span>
                    </div>
                  )}

                  {obl.consequencesOfBreach && (
                    <div className="flex items-start gap-1.5 text-amber-900 bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <span>
                        <strong className="font-semibold">Breach Exposure:</strong>{' '}
                        {obl.consequencesOfBreach}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
