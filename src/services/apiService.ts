/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { APP_CONFIG } from '../config/appConfig';
import {
  DocumentAnalysis,
  ComparisonResult,
  ChatMessage,
  ChatCitation,
} from '../types';

/**
 * In-memory session cache for analysis and comparisons to avoid duplicate AI calls
 */
const sessionAnalysisCache = new Map<string, DocumentAnalysis>();
const sessionComparisonCache = new Map<string, ComparisonResult>();

export function clearSessionCache(): void {
  sessionAnalysisCache.clear();
  sessionComparisonCache.clear();
}

/**
 * Fetch wrapper with timeout
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = APP_CONFIG.REQUEST_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs / 1000} seconds. Please try again.`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Extract text from document file
 */
export async function uploadAndExtractDocument(
  file: File,
  onProgress?: (stage: string) => void
): Promise<{ text: string; charCount: number; wordCount: number; pages: number }> {
  if (onProgress) onProgress('Reading file into secure memory...');

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const result = e.target?.result;
        if (!result) {
          throw new Error('Could not read file content.');
        }

        if (file.name.endsWith('.txt')) {
          const text = typeof result === 'string' ? result : new TextDecoder().decode(result as ArrayBuffer);
          const words = text.split(/\s+/).filter(Boolean).length;
          return resolve({
            text,
            charCount: text.length,
            wordCount: words,
            pages: Math.max(1, Math.ceil(text.length / 2500)),
          });
        }

        // For PDF and DOCX, convert to Base64 and send to server text extractor
        if (onProgress) onProgress('Extracting document text on server...');

        const arrayBuffer = result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Data = btoa(binary);

        const response = await fetchWithTimeout('/api/extract-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            mimeType: file.type,
            base64Data,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to extract text from file.');
        }

        resolve({
          text: data.text,
          charCount: data.charCount,
          wordCount: data.wordCount,
          pages: data.pages,
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read document from disk.'));

    if (file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
}

/**
 * Request full document intelligence analysis
 */
export async function analyzeDocument(
  text: string,
  filename: string,
  onProgress?: (status: string) => void
): Promise<DocumentAnalysis> {
  // Check cache first to avoid redundant AI calls
  const cacheKey = `${filename}_${text.length}_${text.slice(0, 100)}`;
  if (sessionAnalysisCache.has(cacheKey)) {
    if (onProgress) onProgress('Loaded analysis from session cache');
    return sessionAnalysisCache.get(cacheKey)!;
  }

  if (onProgress) onProgress('Analyzing clauses & obligations with GenAI...');

  const response = await fetchWithTimeout('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, filename }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Document analysis failed.');
  }

  sessionAnalysisCache.set(cacheKey, data);
  return data;
}

/**
 * Ask grounded question against document
 */
export async function askDocumentQuestion(
  question: string,
  documentText: string,
  chatHistory: { role: 'user' | 'assistant'; content: string }[]
): Promise<{
  answer: string;
  whyThisAnswer: string;
  citations: ChatCitation[];
  whatToReview: string;
  disclaimer: string;
}> {
  const response = await fetchWithTimeout('/api/qa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, documentText, chatHistory }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to generate answer for question.');
  }

  return data;
}

/**
 * Compare two legal documents
 */
export async function compareDocuments(
  doc1Text: string,
  doc1Name: string,
  doc2Text: string,
  doc2Name: string,
  onProgress?: (status: string) => void
): Promise<ComparisonResult> {
  const cacheKey = `${doc1Name}_${doc1Text.length}_vs_${doc2Name}_${doc2Text.length}`;
  if (sessionComparisonCache.has(cacheKey)) {
    return sessionComparisonCache.get(cacheKey)!;
  }

  if (onProgress) onProgress('Comparing document clauses and calculating risk shifts...');

  const response = await fetchWithTimeout('/api/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doc1Text, doc1Name, doc2Text, doc2Name }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Document comparison failed.');
  }

  sessionComparisonCache.set(cacheKey, data);
  return data;
}
