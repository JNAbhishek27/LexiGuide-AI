/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';

interface LegalDisclaimerProps {
  compact?: boolean;
  className?: string;
  id?: string;
}

export const LegalDisclaimer: React.FC<LegalDisclaimerProps> = ({
  compact = false,
  className = '',
  id = 'legal-disclaimer-banner',
}) => {
  if (compact) {
    return (
      <div
        id={id}
        role="note"
        aria-label="Legal informational disclaimer"
        className={`flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200/80 rounded-lg px-3 py-2 ${className}`}
      >
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" aria-hidden="true" />
        <span className="leading-snug">
          <strong className="font-semibold">Informational Assistance Only:</strong> Not legal advice or an attorney substitute. Consult qualified legal counsel for binding decisions.
        </span>
      </div>
    );
  }

  return (
    <div
      id={id}
      role="region"
      aria-label="Official Legal Disclaimer"
      className={`relative overflow-hidden rounded-xl border border-amber-200 bg-linear-to-r from-amber-50/90 via-amber-50/60 to-orange-50/50 p-4 sm:p-5 shadow-xs ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <div className="p-2 bg-amber-100/90 text-amber-800 rounded-lg shrink-0 mt-0.5" aria-hidden="true">
          <ShieldCheck className="w-5 h-5 text-amber-700" />
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-amber-950 tracking-tight">Legal Notice & Scope of Assistance</h3>
            <span className="text-[11px] font-medium uppercase px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900">
              Informational Only
            </span>
          </div>
          <p className="text-amber-900/90 leading-relaxed">
            {APP_CONFIG.DISCLAIMER_TEXT}
          </p>
          <p className="text-xs text-amber-800/80 pt-0.5">
            LexiGuide AI extracts provisions, highlights potential attention points, and translates legal syntax based solely on the provided document text. It does not certify enforceability, compliance, or definitive validity under local jurisdiction law.
          </p>
        </div>
      </div>
    </div>
  );
};
