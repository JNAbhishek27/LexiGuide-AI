/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DocumentProvider, useDocumentContext } from './context/DocumentContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { DocumentAnalysisDashboard } from './components/DocumentAnalysisDashboard';
import { DocumentCompareView } from './components/DocumentCompareView';
import { DocumentQAView } from './components/DocumentQAView';
import { ChecklistView } from './components/ChecklistView';
import { LawyerQuestionsView } from './components/LawyerQuestionsView';
import { DocumentReaderModal } from './components/DocumentReaderModal';
import { Scale, ShieldCheck, Heart } from 'lucide-react';
import { APP_CONFIG } from './config/appConfig';

function MainAppContent() {
  const { activeTab } = useDocumentContext();
  const [readerOpen, setReaderOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navbar */}
      <Navbar onOpenDocReader={() => setReaderOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'analysis' && <DocumentAnalysisDashboard />}
        {activeTab === 'compare' && <DocumentCompareView />}
        {activeTab === 'qa' && <DocumentQAView />}
        {activeTab === 'checklist' && <ChecklistView />}
        {activeTab === 'lawyer' && <LawyerQuestionsView />}
      </main>

      {/* Extracted Document Text Reader Modal */}
      <DocumentReaderModal isOpen={readerOpen} onClose={() => setReaderOpen(false)} />

      {/* Accessible Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-slate-700" />
              <span className="font-bold text-slate-800">LexiGuide AI</span>
              <span>•</span>
              <span>AI for Legal Assistance & Access</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>In-Memory Privacy Preserved</span>
              <span>•</span>
              <span>v{APP_CONFIG.VERSION}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            Notice: LexiGuide AI provides document-grounded intelligence and informational assistance only. It is not an attorney, law firm, or substitute for legal counsel. Never rely on automated analysis as legal advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <DocumentProvider>
      <MainAppContent />
    </DocumentProvider>
  );
}
