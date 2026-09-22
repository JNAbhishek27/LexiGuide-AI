# Testing Strategy & Verification Guide — LexiGuide AI

LexiGuide AI includes an automated unit and integration testing suite powered by **Vitest**. The test suite validates core business logic, text parsing, security bounds, chunking strategies, and comparison diffs without requiring external API access.

---

## 🧪 Test Suite Overview

| Test Suite | File | Tests | Focus Areas |
| :--- | :--- | :---: | :--- |
| **Config & Validation** | `tests/configAndValidation.test.ts` | 6 | Startup configuration audit, non-magic numbers, empty file rejection, 10 MB boundary check, allowed extensions (.pdf, .docx, .txt), case-insensitive extensions. |
| **Document Processor** | `tests/documentProcessor.test.ts` | 6 | Text sanitization (null bytes, control chars), blank document handling, overlapping chunk generation, section header detection, keyword retrieval ranking, fallback retrieval. |
| **Document Extractor** | `tests/documentExtractor.test.ts` | 3 | UTF-8 buffer decoding, word/character counting, empty buffer rejection, unsupported format error wrapping. |
| **Diff Engine** | `tests/diffEngine.test.ts` | 3 | Sample agreement integrity (V1 vs V2), modified commercial terms, price increase detection, liability cap shift verification. |

**Total Test Count:** 18 passing tests

---

## 🏃 How to Execute Tests

Run the full test suite in single-run mode:
```bash
npm test
```

Expected output:
```text
✓ tests/configAndValidation.test.ts (6 tests)
✓ tests/documentProcessor.test.ts (6 tests)
✓ tests/diffEngine.test.ts (3 tests)
✓ tests/documentExtractor.test.ts (3 tests)

Test Files  4 passed (4)
     Tests  18 passed (18)
```

Run tests in interactive watch mode during development:
```bash
npx vitest
```

---

## 🛡️ Edge Cases Covered

1. **Zero-Byte / Empty Files:** Guaranteed rejection with immediate user feedback.
2. **Oversized Documents:** Validated against maximum allowable byte limit (`10 MB`).
3. **Unsupported File Extensions:** Blocks `.exe`, `.png`, `.zip`, and unwhitelisted formats.
4. **Malicious ASCII Control Characters:** Strips null bytes (`\x00`) and non-printable control characters without modifying legal punctuation.
5. **Irrelevant / No-Match Q&A Searches:** Safely falls back to primary overview chunks instead of throwing errors or returning empty arrays.
6. **Graceful Server Error Boundaries:** Comprehensive try/catch blocks with human-readable error messages for missing API keys, network drops, or unparseable inputs.
