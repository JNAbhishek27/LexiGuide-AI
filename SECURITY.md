# Security & Privacy Policy — LexiGuide AI

At LexiGuide AI, security, confidentiality, and data privacy are treated as foundational engineering requirements. Legal agreements contain confidential business data, intellectual property, and personal identifying information (PII). This document details our architecture, protections, and threat mitigations.

---

## 1. Zero Client-Side Secret Exposure

- **Server-Only API Keys:** The `GEMINI_API_KEY` is exclusively managed in server-side memory (`process.env.GEMINI_API_KEY`).
- **No Client Bundling:** The client React application never receives or bundles API secrets. No environment variables containing keys use Vite's `VITE_` prefix.
- **Lazy Client Initialization:** The `@google/genai` client is instantiated server-side only when required.

---

## 2. In-Memory Session Architecture & Document Privacy

- **No Permanent Disk Persistence:** Uploaded documents (PDF, DOCX, TXT) are processed in volatile memory buffers (`Buffer.from(...)`) during the active HTTP request. They are never written to disk, database, or secondary storage.
- **Client Session Clear:** A prominent **"Clear Session"** button allows users to immediately purge all extracted text, analysis results, comparison diffs, and chat history from browser memory.
- **No External Tracking:** No telemetry or third-party tracking scripts are embedded in the application.

---

## 3. Strict Input Validation & Denial-of-Service Defense

- **File Size Bounding:** Files are strictly validated both on the client and the server. Any document exceeding `10 MB` is rejected prior to processing.
- **MIME & Extension Whitelisting:** Only `.pdf`, `.docx`, and `.txt` extensions with corresponding verified MIME types (`application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/plain`) are processed.
- **Character Sanitization:** All incoming text is sanitized to remove null bytes (`\x00`), non-printable ASCII control characters, and rogue terminal escape sequences via `sanitizeDocumentText`.
- **Text Length Cap:** Documents are capped at `120,000 characters` to prevent token exhaustion and unexpected server memory pressure.

---

## 4. Rate Limiting & Abuse Prevention

- **Server Rate Limiter:** An in-memory IP-based rate limiter restricts intensive AI analysis and Q&A requests to a maximum of 30 requests per minute per IP address.
- **Request Timeouts:** All fetch calls utilize strict `AbortController` timeouts (capped at 60 seconds) to prevent hanging server connections.

---

## 5. Safe Rendering & Output Sanitization

- **No Dangerous HTML Injection:** AI outputs are rendered strictly as escaped text nodes inside React components. No `dangerouslySetInnerHTML` is used.
- **Structured JSON Parsing:** All GenAI responses are validated via strict JSON parsing with regex recovery before being mapped to strongly-typed TypeScript interfaces.

---

## 6. Responsible Legal AI Guardrails

- **Prominent Disclaimers:** Visible legal notice banners are presented across every view (Dashboard, Analysis, Q&A, Checklist, Lawyer Questions).
- **Objective Phrasing:** The AI model is strictly instructed to avoid definitively labeling provisions as "illegal" or "invalid" without authoritative judicial rulings. Responsible phrasing is enforced: *"Requires attention"*, *"Potential concern"*, *"Consider discussing with counsel"*.
- **Grounding Mandate:** Answers to legal questions require direct document citations and verbatim excerpts. If the document lacks sufficient context, the model explicitly acknowledges the limitation.
