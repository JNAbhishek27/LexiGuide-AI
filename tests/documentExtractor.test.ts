/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { extractTextFromBuffer } from '../server/services/documentExtractor';

describe('Document Extractor Service', () => {
  it('extracts plain text from UTF-8 buffers accurately', async () => {
    const rawText = 'MASTER SERVICES AGREEMENT\n\nThis agreement is made between Party A and Party B.';
    const buffer = Buffer.from(rawText, 'utf-8');

    const result = await extractTextFromBuffer(buffer, 'contract.txt', 'text/plain');
    expect(result.text).toContain('MASTER SERVICES AGREEMENT');
    expect(result.charCount).toBe(rawText.length);
    expect(result.wordCount).toBeGreaterThan(5);
    expect(result.pages).toBeGreaterThanOrEqual(1);
  });

  it('rejects empty buffers with clear user-facing error', async () => {
    const emptyBuffer = Buffer.from('', 'utf-8');
    await expect(extractTextFromBuffer(emptyBuffer, 'empty.txt', 'text/plain')).rejects.toThrow(
      /Document appears to be empty/i
    );
  });

  it('rejects unsupported extensions with appropriate error code', async () => {
    const buffer = Buffer.from('fake image binary', 'utf-8');
    await expect(extractTextFromBuffer(buffer, 'image.png', 'image/png')).rejects.toThrow(
      /Unsupported document extension/i
    );
  });
});
