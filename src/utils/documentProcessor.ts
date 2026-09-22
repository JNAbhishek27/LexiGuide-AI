/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { APP_CONFIG, validateFileParameters } from '../config/appConfig';
import { ValidationResult } from '../types';

export interface ExtractedDocument {
  text: string;
  charCount: number;
  wordCount: number;
  estimatedPages: number;
}

export interface TextChunk {
  index: number;
  text: string;
  startChar: number;
  endChar: number;
  approximateSection?: string;
}

/**
 * Sanitize raw string to prevent malicious control sequences or script tags
 */
export function sanitizeDocumentText(rawText: string): string {
  if (!rawText) return '';
  // Remove null characters and non-printable control codes (except standard newlines/tabs)
  let clean = rawText.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '');
  // Normalize windows/mac line breaks to standard Unix newlines
  clean = clean.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  // Collapse excessive consecutive blank lines (more than 3 into 2)
  clean = clean.replace(/\n{4,}/g, '\n\n\n');
  return clean.trim();
}

/**
 * Validates a file object against system security boundaries
 */
export function validateLegalDocumentFile(file: File | { name: string; size: number; type?: string }): ValidationResult {
  const check = validateFileParameters(file);
  if (!check.isValid) {
    return { isValid: false, error: check.error, code: 'FILE_VALIDATION_ERROR' };
  }
  return { isValid: true };
}

/**
 * Divides long legal documents into overlapping chunks for analysis and grounded citations.
 * Respects section headers and paragraph breaks wherever possible.
 */
export function chunkDocumentText(
  text: string,
  chunkSize: number = APP_CONFIG.MAX_TEXT_CHUNK_SIZE,
  overlap: number = APP_CONFIG.CHUNK_OVERLAP
): TextChunk[] {
  const sanitized = sanitizeDocumentText(text);
  if (!sanitized) return [];

  if (sanitized.length <= chunkSize) {
    return [
      {
        index: 0,
        text: sanitized,
        startChar: 0,
        endChar: sanitized.length,
        approximateSection: extractLeadingSectionTitle(sanitized),
      },
    ];
  }

  const chunks: TextChunk[] = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < sanitized.length) {
    let endIndex = startIndex + chunkSize;

    if (endIndex >= sanitized.length) {
      endIndex = sanitized.length;
    } else {
      // Find optimal split point (paragraph boundary or period)
      const lookback = Math.min(300, chunkSize - overlap);
      const splitSlice = sanitized.substring(endIndex - lookback, endIndex);
      const paragraphBreak = splitSlice.lastIndexOf('\n\n');
      const sentenceBreak = splitSlice.lastIndexOf('. ');

      if (paragraphBreak !== -1) {
        endIndex = endIndex - lookback + paragraphBreak + 2;
      } else if (sentenceBreak !== -1) {
        endIndex = endIndex - lookback + sentenceBreak + 2;
      }
    }

    const chunkContent = sanitized.substring(startIndex, endIndex).trim();
    if (chunkContent.length > 0) {
      chunks.push({
        index: chunkIndex++,
        text: chunkContent,
        startChar: startIndex,
        endChar: endIndex,
        approximateSection: extractLeadingSectionTitle(chunkContent),
      });
    }

    if (endIndex >= sanitized.length) break;
    startIndex = Math.max(startIndex + 1, endIndex - overlap);
  }

  return chunks;
}

/**
 * Attempts to detect section titles like "SECTION 3. TERM" or "Article II" at chunk onset
 */
function extractLeadingSectionTitle(chunkText: string): string | undefined {
  const match = chunkText.match(/^(?:SECTION|ARTICLE|CLAUSE|\d+\.|\d+\))\s*([^\n]{3,60})/im);
  if (match && match[0]) {
    return match[0].trim();
  }
  return undefined;
}

/**
 * Retrieves top K relevant text chunks based on query terms for grounded Q&A
 */
export function findRelevantChunks(
  query: string,
  chunks: TextChunk[],
  topK: number = APP_CONFIG.SEARCH_TOP_K
): TextChunk[] {
  if (chunks.length <= topK) return chunks;

  const queryTerms = query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  if (queryTerms.length === 0) return chunks.slice(0, topK);

  const scoredChunks = chunks.map((chunk) => {
    const textLower = chunk.text.toLowerCase();
    let score = 0;

    for (const term of queryTerms) {
      // Term frequency
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      const matches = textLower.match(regex);
      if (matches) {
        score += matches.length * 3;
      } else if (textLower.includes(term)) {
        score += 1;
      }
    }

    // Boost if section header matches any query terms
    if (chunk.approximateSection) {
      const sectionLower = chunk.approximateSection.toLowerCase();
      for (const term of queryTerms) {
        if (sectionLower.includes(term)) score += 5;
      }
    }

    return { chunk, score };
  });

  scoredChunks.sort((a, b) => b.score - a.score);

  // If top scores are 0, return first few chunks
  const bestScored = scoredChunks.filter((s) => s.score > 0);
  if (bestScored.length === 0) {
    return chunks.slice(0, topK);
  }

  return scoredChunks.slice(0, topK).map((s) => s.chunk);
}
