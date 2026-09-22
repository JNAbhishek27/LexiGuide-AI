/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Scale,
  FileText,
  GitCompare,
  MessageSquareText,
  CheckSquare,
  HelpCircle,
  Trash2,
  Sparkles,
  Menu,
  X,
  FileSearch,
} from 'lucide-react';
import { useDocumentContext } from '../context/DocumentContext';

interface NavbarProps {
  onOpenDocReader: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDocReader }) => {
  const {
    activeTab,
    setActiveTab,
    activeDocument,
    loadSampleAgreement,
    clearSession,
    isAnalyzing,
  } = useDocumentContext();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FileText },
    { id: 'analysis', label: 'Document Analysis', icon: Scale },
    { id: 'compare', label: 'Compare Documents', icon: GitCompare },
    { id: 'qa', label: 'Ask AI', icon: MessageSquareText },
    { id: 'checklist', label: 'Checklist', icon: CheckSquare },
    { id: 'lawyer', label: 'Questions for Lawyer', icon: HelpCircle },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <button
              id="brand-home-button"
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-3 text-left group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-lg p-1"
              aria-label="LexiGuide AI Home"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-xs group-hover:bg-slate-800 transition-colors">
                <Scale className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-lg tracking-tight">LexiGuide AI</span>
                  <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-700 border border-slate-200">
                    GenAI
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium tracking-tight -mt-0.5">
                  Legal Document Intelligence & Guidance
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {activeDocument ? (
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
                <button
                  id="view-document-text-button"
                  type="button"
                  onClick={onOpenDocReader}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                  title="Inspect raw extracted document text"
                >
                  <FileSearch className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                  <span className="max-w-[120px] truncate">{activeDocument.name}</span>
                </button>

                <button
                  id="clear-session-button"
                  type="button"
                  onClick={clearSession}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                  title="Permanently remove all loaded document data from browser session"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Clear Session</span>
                </button>
              </div>
            ) : (
              <button
                id="navbar-sample-button"
                type="button"
                disabled={isAnalyzing}
                onClick={loadSampleAgreement}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-2xs transition-all active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-900" aria-hidden="true" />
                <span>Try Sample Agreement</span>
              </button>
            )}

            {/* Mobile menu hamburger toggle */}
            <button
              id="mobile-menu-toggle-button"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {!activeDocument ? (
              <button
                id="mobile-sample-button"
                type="button"
                onClick={() => {
                  loadSampleAgreement();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold bg-amber-400 text-slate-900 rounded-lg shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Try Sample Agreement</span>
              </button>
            ) : (
              <button
                id="mobile-clear-session-button"
                type="button"
                onClick={() => {
                  clearSession();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Session Data</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
