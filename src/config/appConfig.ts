/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RiskCategory } from '../types';

/**
 * Centralized Application Configuration
 * All limits, AI parameters, file constraints, and safety guidelines are defined here.
 * Scatter no magic numbers in code.
 */
export const APP_CONFIG = {
  /**
   * Application branding & identity
   */
  APPLICATION_NAME: 'LexiGuide AI',
  TAGLINE: 'Legal Document Intelligence & Guidance',
  VERSION: '1.0.0',

  /**
   * Universal legal disclaimer mandated across all user-facing analysis and outputs
   */
  DISCLAIMER_TEXT:
    'This tool provides general informational assistance based on the documents and information you provide. It is not a lawyer and does not provide legal advice. For decisions with legal consequences, consult a qualified legal professional.',

  /**
   * File processing parameters
   */
  MAX_FILE_SIZE_MB: 10, // Max size in Megabytes per uploaded document
  MAX_DOCUMENT_LENGTH: 150000, // Maximum allowed character count after text extraction
  MAX_DOCUMENTS_FOR_COMPARISON: 2, // Maximum number of documents in a single comparative run
  SUPPORTED_FILE_TYPES: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ] as const,
  SUPPORTED_EXTENSIONS: ['.pdf', '.docx', '.txt'] as const,

  /**
   * Chat & Q&A session limits
   */
  MAX_CHAT_HISTORY: 20, // Retained messages in context to maintain quality and prevent token exhaustion
  MAX_QUESTIONS_PER_SESSION: 50, // Per-session question safeguard

  /**
   * GenAI / Gemini configuration
   */
  AI_MODEL: 'gemini-3.1-flash-lite', // Primary model from official @google/genai guidelines with optimal latency and availability
  AI_FALLBACK_MODELS: ['gemini-flash-latest', 'gemini-3.8-flash'] as const, // Fallback models if primary encounters high-demand or transient unavailability
  AI_TEMPERATURE: 0.15, // Low temperature for factual, grounded legal extraction without hallucinations
  AI_MAX_OUTPUT_TOKENS: 4096, // Ample token window for comprehensive structured JSON outputs
  REQUEST_TIMEOUT_MS: 50000, // Server request timeout in milliseconds
  MAX_RETRY_ATTEMPTS: 4, // Exponential backoff retry count for transient network/rate-limit issues
  MAX_CONCURRENT_REQUESTS: 2, // Concurrency limit to prevent overwhelming upstream quota

  /**
   * Document chunking & semantic search parameters
   */
  MAX_TEXT_CHUNK_SIZE: 3500, // Chunk size in characters for splitting lengthy agreements
  CHUNK_OVERLAP: 350, // Character overlap to prevent splitting clauses across boundary margins
  SEARCH_TOP_K: 4, // Top relevant document chunks retrieved for Q&A citations

  /**
   * Standardized legal risk and clause classification categories
   */
  RISK_CATEGORIES: [
    'Termination',
    'Payment',
    'Liability',
    'Confidentiality',
    'Data/Privacy',
    'Intellectual Property',
    'Renewal',
    'Dispute Resolution',
    'Penalties',
    'Other',
  ] as const satisfies readonly RiskCategory[],
} as const;

/**
 * Runtime validation for application parameters
 */
export function validateAppConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (APP_CONFIG.MAX_FILE_SIZE_MB <= 0 || APP_CONFIG.MAX_FILE_SIZE_MB > 50) {
    errors.push('MAX_FILE_SIZE_MB must be between 1 and 50 MB.');
  }

  if (APP_CONFIG.MAX_DOCUMENT_LENGTH < 1000) {
    errors.push('MAX_DOCUMENT_LENGTH must be at least 1,000 characters.');
  }

  if (APP_CONFIG.MAX_DOCUMENTS_FOR_COMPARISON !== 2) {
    errors.push('MAX_DOCUMENTS_FOR_COMPARISON currently strictly supports 2 documents.');
  }

  if ((APP_CONFIG.SUPPORTED_FILE_TYPES as readonly string[]).length === 0) {
    errors.push('SUPPORTED_FILE_TYPES cannot be empty.');
  }

  if (APP_CONFIG.AI_TEMPERATURE < 0 || APP_CONFIG.AI_TEMPERATURE > 1) {
    errors.push('AI_TEMPERATURE must be between 0 and 1.');
  }

  if (APP_CONFIG.MAX_RETRY_ATTEMPTS < 1 || APP_CONFIG.MAX_RETRY_ATTEMPTS > 5) {
    errors.push('MAX_RETRY_ATTEMPTS must be between 1 and 5.');
  }

  if (APP_CONFIG.MAX_TEXT_CHUNK_SIZE <= APP_CONFIG.CHUNK_OVERLAP) {
    errors.push('MAX_TEXT_CHUNK_SIZE must be strictly greater than CHUNK_OVERLAP.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a file before processing
 */
export function validateFileParameters(file: { name: string; size: number; type?: string }): {
  isValid: boolean;
  error?: string;
} {
  if (!file || !file.name) {
    return { isValid: false, error: 'No file provided.' };
  }

  // Check size
  const maxBytes = APP_CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024;
  if (file.size <= 0) {
    return { isValid: false, error: 'The uploaded file is empty (0 bytes).' };
  }
  if (file.size > maxBytes) {
    return {
      isValid: false,
      error: `Your document (${(file.size / (1024 * 1024)).toFixed(1)} MB) is larger than the supported limit of ${APP_CONFIG.MAX_FILE_SIZE_MB} MB.`,
    };
  }

  // Check extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  const validExtension = APP_CONFIG.SUPPORTED_EXTENSIONS.includes(
    extension as (typeof APP_CONFIG.SUPPORTED_EXTENSIONS)[number]
  );

  if (!validExtension) {
    return {
      isValid: false,
      error: `Unsupported file type "${extension}". Supported extensions: ${APP_CONFIG.SUPPORTED_EXTENSIONS.join(', ')}.`,
    };
  }

  return { isValid: true };
}

/**
 * Check if a file extension is supported
 */
export function isExtensionSupported(filename: string): boolean {
  if (!filename || !filename.includes('.')) return false;
  const ext = '.' + filename.split('.').pop()?.toLowerCase();
  return APP_CONFIG.SUPPORTED_EXTENSIONS.includes(
    ext as (typeof APP_CONFIG.SUPPORTED_EXTENSIONS)[number]
  );
}
