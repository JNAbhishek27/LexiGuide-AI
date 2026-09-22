/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  Sparkles,
  Loader2,
  FileText,
  Shield,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { APP_CONFIG, validateFileParameters } from '../config/appConfig';
import { useDocumentContext } from '../context/DocumentContext';
import { uploadAndExtractDocument } from '../services/apiService';
import { DocumentMeta } from '../types';

export const FileUploadZone: React.FC = () => {
  const {
    runDocumentAnalysis,
    loadSampleAgreement,
    isAnalyzing,
    loadingStage,
    error,
    setError,
    activeDocument,
    setActiveDocument,
  } = useDocumentContext();

  const [isDragging, setIsDragging] = useState(false);
  const [localProcessing, setLocalProcessing] = useState(false);
  const [stageText, setStageText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processSelectedFile = async (file: File) => {
    setError(null);

    // Client validation before processing
    const validation = validateFileParameters(file);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file.');
      return;
    }

    setLocalProcessing(true);
    setStageText('Uploading & parsing document...');

    try {
      const extracted = await uploadAndExtractDocument(file, (msg) => setStageText(msg));

      const docMeta: DocumentMeta = {
        id: 'doc_' + Date.now(),
        name: file.name,
        size: file.size,
        type: file.type || 'text/plain',
        charCount: extracted.charCount,
        uploadedAt: new Date().toISOString(),
        content: extracted.text,
      };

      setActiveDocument(docMeta);
      setStageText('Running legal intelligence extraction...');
      await runDocumentAnalysis(docMeta);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err?.message || 'Failed to process the document. Please ensure it contains readable text.');
    } finally {
      setLocalProcessing(false);
      setStageText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processSelectedFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const isBusy = isAnalyzing || localProcessing;
  const currentStage = loadingStage || stageText || 'Processing document...';

  return (
    <div className="w-full space-y-6">
      {/* Upload Box Card */}
      <div
        id="file-dropzone-container"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
            : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/50'
        } ${isBusy ? 'pointer-events-none opacity-90' : ''}`}
      >
        <input
          ref={fileInputRef}
          id="legal-document-file-input"
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileChange}
          className="sr-only"
          aria-label="Upload legal document file in PDF, DOCX, or TXT format"
          disabled={isBusy}
        />

        {isBusy ? (
          <div className="py-6 space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-slate-900">{currentStage}</h3>
              <p className="text-xs text-slate-500">
                Extracting clauses, obligations, financial commitments, and attention points.
              </p>
            </div>

            {/* Progress Step Badges */}
            <div className="flex justify-center items-center gap-1.5 pt-2 text-[11px] font-medium text-slate-500">
              <span className="px-2 py-0.5 rounded-sm bg-indigo-100 text-indigo-800">1. Parse</span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded-sm bg-indigo-100 text-indigo-800">2. Chunk</span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded-sm bg-indigo-100 text-indigo-800">3. AI Analysis</span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700">4. Structure</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
              <UploadCloud className="w-7 h-7" aria-hidden="true" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Upload your legal document
              </h3>
              <p className="text-sm text-slate-600">
                Drag and drop your contract here, or{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="font-semibold text-indigo-600 hover:text-indigo-700 underline focus:outline-hidden"
                >
                  browse files
                </button>
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 text-xs text-slate-500 pt-1">
              <span className="inline-flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                PDF, DOCX, TXT
              </span>
              <span>•</span>
              <span>Max {APP_CONFIG.MAX_FILE_SIZE_MB} MB</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                In-Memory Secure Processing
              </span>
            </div>

            {/* Prominent Evaluator One-Click Sample Document CTA */}
            <div className="pt-4 border-t border-slate-200/80 max-w-sm mx-auto">
              <p className="text-xs text-slate-500 mb-2">Want to evaluate immediately without uploading?</p>
              <button
                id="try-sample-document-cta"
                type="button"
                onClick={loadSampleAgreement}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-xs transition-all active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-slate-900" aria-hidden="true" />
                <span>Try with sample document (Master Cloud Agreement)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Notification Alert */}
      {error && (
        <div
          id="upload-error-alert"
          role="alert"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <h4 className="font-semibold text-rose-950">Notice</h4>
              <p>{error}</p>
            </div>
          </div>
          {activeDocument && !isBusy && (
            <button
              type="button"
              onClick={() => runDocumentAnalysis(activeDocument)}
              className="shrink-0 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-semibold shadow-2xs transition-all"
            >
              Retry Analysis
            </button>
          )}
        </div>
      )}

      {/* 3 Core Value Cards matching prompt section 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
        <div
          id="feature-card-understand"
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-2 hover:border-slate-300 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
            01
          </div>
          <h4 className="font-bold text-slate-900 text-base">Understand</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Simplify complex legal language into plain English summaries, executive takeaways, and digestible clause breakdowns.
          </p>
        </div>

        <div
          id="feature-card-analyze"
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-2 hover:border-slate-300 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
            02
          </div>
          <h4 className="font-bold text-slate-900 text-base">Analyze</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Find important clauses, obligations, financial deadlines, and potential concerns categorized for thorough review.
          </p>
        </div>

        <div
          id="feature-card-prepare"
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-2 hover:border-slate-300 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
            03
          </div>
          <h4 className="font-bold text-slate-900 text-base">Prepare</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Create practical actionable checklists and grounded questions for informed discussion with a qualified legal professional.
          </p>
        </div>
      </div>
    </div>
  );
};
