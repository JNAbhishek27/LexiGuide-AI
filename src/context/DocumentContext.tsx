/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DocumentMeta,
  DocumentAnalysis,
  ComparisonResult,
  ChatMessage,
  ChecklistItem,
} from '../types';
import {
  analyzeDocument,
  askDocumentQuestion,
  compareDocuments,
  clearSessionCache,
} from '../services/apiService';
import {
  SAMPLE_AGREEMENT_V1,
  SAMPLE_AGREEMENT_V2_REVISED,
} from '../data/sampleLegalDocs';
import { APP_CONFIG } from '../config/appConfig';

interface DocumentContextType {
  activeDocument: DocumentMeta | null;
  comparisonDocument: DocumentMeta | null;
  analysis: DocumentAnalysis | null;
  comparisonResult: ComparisonResult | null;
  chatMessages: ChatMessage[];
  checklistItems: ChecklistItem[];
  activeTab: 'dashboard' | 'analysis' | 'compare' | 'qa' | 'checklist' | 'lawyer';
  isAnalyzing: boolean;
  isComparing: boolean;
  isAsking: boolean;
  loadingStage: string;
  error: string | null;
  setActiveTab: (tab: 'dashboard' | 'analysis' | 'compare' | 'qa' | 'checklist' | 'lawyer') => void;
  setError: (err: string | null) => void;
  setActiveDocument: (doc: DocumentMeta | null) => void;
  setComparisonDocument: (doc: DocumentMeta | null) => void;
  runDocumentAnalysis: (doc: DocumentMeta) => Promise<void>;
  runComparison: (doc1: DocumentMeta, doc2: DocumentMeta) => Promise<void>;
  sendQuestion: (question: string) => Promise<void>;
  toggleChecklistItem: (id: string) => void;
  loadSampleAgreement: () => Promise<void>;
  loadSampleComparisonPair: () => Promise<void>;
  clearSession: () => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const [activeDocument, setActiveDocument] = useState<DocumentMeta | null>(null);
  const [comparisonDocument, setComparisonDocument] = useState<DocumentMeta | null>(null);
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analysis' | 'compare' | 'qa' | 'checklist' | 'lawyer'>('dashboard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Sync checklist items when analysis updates
  useEffect(() => {
    if (analysis?.checklist) {
      setChecklistItems(analysis.checklist);
    }
  }, [analysis]);

  const toggleChecklistItem = (id: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const runDocumentAnalysis = async (doc: DocumentMeta) => {
    setError(null);
    setIsAnalyzing(true);
    setLoadingStage('Extracting key provisions...');

    try {
      const result = await analyzeDocument(doc.content, doc.name, (stage) => setLoadingStage(stage));
      setAnalysis(result);
      setActiveTab('analysis');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err?.message || 'Failed to analyze legal document. Please verify network and try again.');
    } finally {
      setIsAnalyzing(false);
      setLoadingStage('');
    }
  };

  const runComparison = async (doc1: DocumentMeta, doc2: DocumentMeta) => {
    setError(null);
    setIsComparing(true);
    setLoadingStage('Analyzing contractual variance between Document 1 and Document 2...');

    try {
      const result = await compareDocuments(
        doc1.content,
        doc1.name,
        doc2.content,
        doc2.name,
        (stage) => setLoadingStage(stage)
      );
      setComparisonResult(result);
      setActiveTab('compare');
    } catch (err: any) {
      console.error('Comparison error:', err);
      setError(err?.message || 'Failed to compare documents.');
    } finally {
      setIsComparing(false);
      setLoadingStage('');
    }
  };

  const sendQuestion = async (questionText: string) => {
    if (!activeDocument) {
      setError('Please upload or load a document first before asking questions.');
      return;
    }

    if (chatMessages.length >= APP_CONFIG.MAX_QUESTIONS_PER_SESSION) {
      setError(`Session question limit (${APP_CONFIG.MAX_QUESTIONS_PER_SESSION}) reached. Clear session to start fresh.`);
      return;
    }

    const userMessage: ChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: questionText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setIsAsking(true);
    setError(null);

    try {
      const response = await askDocumentQuestion(
        questionText,
        activeDocument.content,
        chatMessages.map((m) => ({ role: m.role, content: m.content }))
      );

      const assistantMessage: ChatMessage = {
        id: 'ast_' + Date.now(),
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: response.citations,
        whyThisAnswer: response.whyThisAnswer,
        whatToReview: response.whatToReview,
        disclaimer: response.disclaimer,
      };

      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('QA Error:', err);
      setError(err?.message || 'Failed to generate answer for question.');
    } finally {
      setIsAsking(false);
    }
  };

  const loadSampleAgreement = async () => {
    setError(null);
    const sampleDoc: DocumentMeta = {
      id: 'sample_v1',
      name: 'Sample_Master_Cloud_Agreement_V1.txt',
      size: SAMPLE_AGREEMENT_V1.length,
      type: 'text/plain',
      charCount: SAMPLE_AGREEMENT_V1.length,
      uploadedAt: new Date().toISOString(),
      content: SAMPLE_AGREEMENT_V1,
    };

    setActiveDocument(sampleDoc);
    await runDocumentAnalysis(sampleDoc);
  };

  const loadSampleComparisonPair = async () => {
    setError(null);
    const doc1: DocumentMeta = {
      id: 'sample_v1',
      name: 'Sample_Master_Cloud_Agreement_V1.txt',
      size: SAMPLE_AGREEMENT_V1.length,
      type: 'text/plain',
      charCount: SAMPLE_AGREEMENT_V1.length,
      uploadedAt: new Date().toISOString(),
      content: SAMPLE_AGREEMENT_V1,
    };

    const doc2: DocumentMeta = {
      id: 'sample_v2_amended',
      name: 'Sample_Master_Cloud_Agreement_V2_Amended.txt',
      size: SAMPLE_AGREEMENT_V2_REVISED.length,
      type: 'text/plain',
      charCount: SAMPLE_AGREEMENT_V2_REVISED.length,
      uploadedAt: new Date().toISOString(),
      content: SAMPLE_AGREEMENT_V2_REVISED,
    };

    setActiveDocument(doc1);
    setComparisonDocument(doc2);
    await runComparison(doc1, doc2);
  };

  const clearSession = () => {
    setActiveDocument(null);
    setComparisonDocument(null);
    setAnalysis(null);
    setComparisonResult(null);
    setChatMessages([]);
    setChecklistItems([]);
    setError(null);
    setActiveTab('dashboard');
    clearSessionCache();
  };

  return (
    <DocumentContext.Provider
      value={{
        activeDocument,
        comparisonDocument,
        analysis,
        comparisonResult,
        chatMessages,
        checklistItems,
        activeTab,
        isAnalyzing,
        isComparing,
        isAsking,
        loadingStage,
        error,
        setActiveTab,
        setError,
        setActiveDocument,
        setComparisonDocument,
        runDocumentAnalysis,
        runComparison,
        sendQuestion,
        toggleChecklistItem,
        loadSampleAgreement,
        loadSampleComparisonPair,
        clearSession,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocumentContext(): DocumentContextType {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocumentContext must be used within a DocumentProvider');
  }
  return context;
}
