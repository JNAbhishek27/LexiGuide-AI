/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import {
  SAMPLE_AGREEMENT_V1,
  SAMPLE_AGREEMENT_V2_REVISED,
} from '../src/data/sampleLegalDocs';

describe('Legal Document Sample & Comparison Integrity', () => {
  it('contains well-formed Sample Agreement V1 with core commercial clauses', () => {
    expect(SAMPLE_AGREEMENT_V1).toContain('SECTION 1. DEFINITIONS & ACCESS');
    expect(SAMPLE_AGREEMENT_V1).toContain('SECTION 2. FEES, INVOICING & PAYMENT TERMS');
    expect(SAMPLE_AGREEMENT_V1).toContain('SECTION 7. LIMITATION OF LIABILITY');
    expect(SAMPLE_AGREEMENT_V1).toContain('SECTION 4. TERMINATION & CANCELLATION');
    expect(SAMPLE_AGREEMENT_V1.length).toBeGreaterThan(1500);
  });

  it('contains intentional variance in Revised Sample Agreement V2 for comparison testing', () => {
    // In V1, annual fee is $48,000; in V2, fee is $54,000
    expect(SAMPLE_AGREEMENT_V1).toContain('$48,000.00');
    expect(SAMPLE_AGREEMENT_V2_REVISED).toContain('$54,000.00');

    // In V1, late payment interest is 1.5%; in V2, increased to 2.5%
    expect(SAMPLE_AGREEMENT_V1).toContain('1.5%');
    expect(SAMPLE_AGREEMENT_V2_REVISED).toContain('2.5%');

    // In V2, mandatory security deposit was added
    expect(SAMPLE_AGREEMENT_V2_REVISED).toContain('Mandatory Security Deposit');
    expect(SAMPLE_AGREEMENT_V1).not.toContain('Mandatory Security Deposit');

    // In V2, termination for convenience was removed
    expect(SAMPLE_AGREEMENT_V2_REVISED).toContain('Termination for Convenience: REMOVED');
  });

  it('properly validates textual variance between agreement versions', () => {
    expect(SAMPLE_AGREEMENT_V2_REVISED.length).not.toEqual(SAMPLE_AGREEMENT_V1.length);
  });
});
