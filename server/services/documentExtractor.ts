/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mammoth from 'mammoth';
import { APP_CONFIG } from '../../src/config/appConfig';

/**
 * Extracts raw text from uploaded file buffer in-memory
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  filename: string,
  mimeType?: string
): Promise<{ text: string; charCount: number; wordCount: number; pages: number }> {
  const extension = '.' + filename.split('.').pop()?.toLowerCase();

  let rawText = '';
  let estimatedPages = 1;

  if (extension === '.txt' || mimeType === 'text/plain') {
    rawText = buffer.toString('utf-8');
    estimatedPages = Math.max(1, Math.ceil(rawText.length / 2500));
  } else if (
    extension === '.docx' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const result = await mammoth.extractRawText({ buffer });
    rawText = result.value;
    estimatedPages = Math.max(1, Math.ceil(rawText.length / 2500));
  } else if (extension === '.pdf' || mimeType === 'application/pdf') {
    try {
      // Dynamic import to handle CJS/ESM compatibility
      const pdfModule = await import('pdf-parse');
      // @ts-ignore
      const pdfParse = pdfModule.default || pdfModule;
      const pdfData = await pdfParse(buffer);
      rawText = pdfData.text || '';
      estimatedPages = pdfData.numpages || Math.max(1, Math.ceil(rawText.length / 2500));
    } catch (err: any) {
      console.warn('PDF parsing error, attempting textual fallback:', err?.message);
      // Fallback: extract any visible ASCII text stream from PDF buffer
      const rawString = buffer.toString('latin1');
      const textMatches = rawString.match(/\(([^()]{3,})\)/g) || [];
      if (textMatches.length > 0) {
        rawText = textMatches.map((m) => m.slice(1, -1)).join(' ');
      } else {
        throw new Error('Unable to extract text from PDF. The document may be password-protected or image-scanned.');
      }
    }
  } else {
    throw new Error(`Unsupported document extension "${extension}".`);
  }

  // Sanitize text
  const clean = rawText
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  if (!clean || clean.length < 20) {
    throw new Error('Document appears to be empty or contains insufficient readable text.');
  }

  if (clean.length > APP_CONFIG.MAX_DOCUMENT_LENGTH) {
    throw new Error(
      `Extracted text exceeds the maximum permitted limit of ${APP_CONFIG.MAX_DOCUMENT_LENGTH.toLocaleString()} characters (found ${clean.length.toLocaleString()}).`
    );
  }

  const words = clean.split(/\s+/).filter(Boolean).length;

  return {
    text: clean,
    charCount: clean.length,
    wordCount: words,
    pages: estimatedPages,
  };
}
