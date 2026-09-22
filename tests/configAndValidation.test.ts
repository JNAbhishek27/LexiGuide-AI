/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import {
  APP_CONFIG,
  validateAppConfig,
  validateFileParameters,
  isExtensionSupported,
} from '../src/config/appConfig';

describe('App Configuration & File Validation', () => {
  it('passes startup configuration audit with non-magic bounded parameters', () => {
    const audit = validateAppConfig();
    expect(audit.isValid).toBe(true);
    expect(audit.errors).toHaveLength(0);
  });

  it('rejects an empty file or size of zero bytes', () => {
    const result = validateFileParameters({
      name: 'agreement.pdf',
      size: 0,
      type: 'application/pdf',
    });
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('is empty');
  });

  it('rejects files that exceed maximum file size limits (10 MB)', () => {
    const oversizedBytes = (APP_CONFIG.MAX_FILE_SIZE_MB + 1) * 1024 * 1024;
    const result = validateFileParameters({
      name: 'large_contract.pdf',
      size: oversizedBytes,
      type: 'application/pdf',
    });
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('is larger than the supported limit');
  });

  it('accepts valid PDF, DOCX, and TXT files within limits', () => {
    const validPdf = validateFileParameters({
      name: 'valid_agreement.pdf',
      size: 1024 * 500, // 500 KB
      type: 'application/pdf',
    });
    expect(validPdf.isValid).toBe(true);

    const validDocx = validateFileParameters({
      name: 'employment_contract.docx',
      size: 1024 * 250,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    expect(validDocx.isValid).toBe(true);

    const validTxt = validateFileParameters({
      name: 'terms.txt',
      size: 1024 * 10,
      type: 'text/plain',
    });
    expect(validTxt.isValid).toBe(true);
  });

  it('rejects unsupported file formats like .exe, .png, or .zip', () => {
    expect(isExtensionSupported('malicious.exe')).toBe(false);
    expect(isExtensionSupported('photo.png')).toBe(false);
    expect(isExtensionSupported('archive.zip')).toBe(false);

    const invalidResult = validateFileParameters({
      name: 'archive.zip',
      size: 1024 * 10,
      type: 'application/zip',
    });
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.error).toContain('Unsupported file type');
  });

  it('correctly handles case-insensitive file extensions', () => {
    expect(isExtensionSupported('CONTRACT.PDF')).toBe(true);
    expect(isExtensionSupported('AGREEMENT.DOCX')).toBe(true);
    expect(isExtensionSupported('NOTES.TXT')).toBe(true);
  });

  it('configures approved AI models with high-demand fallback resilience', () => {
    expect(['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest']).toContain(APP_CONFIG.AI_MODEL);
    expect(APP_CONFIG.AI_FALLBACK_MODELS).toBeDefined();
    expect(APP_CONFIG.AI_FALLBACK_MODELS.length).toBeGreaterThan(0);
    expect(APP_CONFIG.MAX_RETRY_ATTEMPTS).toBeGreaterThanOrEqual(3);
  });
});
