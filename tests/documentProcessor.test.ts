/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import {
  sanitizeDocumentText,
  chunkDocumentText,
  findRelevantChunks,
} from '../src/utils/documentProcessor';

describe('Document Processor & Text Chunking', () => {
  it('sanitizes null bytes and excessive whitespace', () => {
    const raw = 'Section 1.\x000\tTitle\r\n\r\n\r\n\r\nText   with    excessive   spaces.';
    const sanitized = sanitizeDocumentText(raw);

    expect(sanitized).not.toContain('\x00');
    expect(sanitized).not.toContain('\r');
    expect(sanitized).toContain('Section 1.0\tTitle');
  });

  it('handles empty or blank document text gracefully', () => {
    const chunks = chunkDocumentText('');
    expect(chunks).toHaveLength(0);

    const whitespaceOnly = chunkDocumentText('    \n\n   ');
    expect(whitespaceOnly).toHaveLength(0);
  });

  it('splits long legal text into overlapping chunks with section preservation', () => {
    const paragraph = 'Section 1. Definitions and Obligations. Party A shall provide services.\n\n';
    const longText = paragraph.repeat(50); // Generates text larger than CHUNK_SIZE

    const chunks = chunkDocumentText(longText, 600, 100);
    expect(chunks.length).toBeGreaterThan(1);

    // Verify all chunks have indices and valid bounds
    chunks.forEach((chunk, i) => {
      expect(chunk.index).toBe(i);
      expect(chunk.text.length).toBeGreaterThan(0);
      expect(chunk.text.length).toBeLessThanOrEqual(700);
    });
  });

  it('detects and labels section headers in chunks', () => {
    const legalDoc = `
Section 1. Scope of Services.
Vendor shall deliver the cloud software.

ARTICLE 2. PAYMENT TERMS.
Client agrees to pay within 30 days.

Section 3. Termination for Cause.
Either party may terminate immediately for breach.
`;

    const chunks = chunkDocumentText(legalDoc, 500, 50);
    expect(chunks.length).toBeGreaterThan(0);
    const sections = chunks.map((c) => c.approximateSection).filter(Boolean);
    expect(sections.length).toBeGreaterThan(0);
  });

  it('retrieves relevant chunks grounded in user query keywords', () => {
    const doc = `
Section 1. Scope of Services.
Provider agrees to deliver managed cloud infrastructure.

Section 2. Fees and Billing.
The monthly rate is $5,000 USD payable Net 30 days. Late fees incur 1.5% interest.

Section 3. Confidentiality.
Parties must maintain secrecy of proprietary information for 5 years.

Section 4. Termination for Convenience.
Customer may terminate upon 60 days prior written notice.
`;

    const chunks = chunkDocumentText(doc, 300, 50);
    const feeChunks = findRelevantChunks('What are the monthly fees and payment deadlines?', chunks, 2);

    expect(feeChunks.length).toBeGreaterThan(0);
    expect(feeChunks[0].text).toContain('Fees and Billing');

    const termChunks = findRelevantChunks('termination notice period', chunks, 1);
    expect(termChunks.length).toBeGreaterThan(0);
    expect(termChunks[0].text).toContain('Termination');
  });

  it('safely returns fallback chunks when query terms have no exact token match', () => {
    const doc = 'All provisions herein apply to the parties in jurisdiction.';
    const chunks = chunkDocumentText(doc);
    const result = findRelevantChunks('astronomy telescope stars', chunks, 1);

    expect(result.length).toBe(1);
    expect(result[0].text).toBe(doc);
  });
});
