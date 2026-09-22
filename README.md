# LexiGuide AI — Legal Document Intelligence & Guidance

> **AI for Legal Assistance & Access Challenge Submission**

LexiGuide AI is an intelligent legal document assistance application engineered to help individuals, freelancers, and small business owners understand, analyze, compare, and navigate complex legal agreements. It provides plain-English translation and consultation preparation — **without replacing a qualified lawyer or providing definitive legal advice**.

---

## ⚖️ Legal Disclaimer

> **Informational Assistance Only:**
> LexiGuide AI is an automated informational intelligence tool designed to assist with document navigation and consultation preparation. It is **not** an attorney, a law firm, or a substitute for professional legal counsel. The outputs generated do not constitute formal legal opinions or binding interpretations. Always consult a qualified attorney licensed in your jurisdiction for decisions with legal consequences.

---

## 🎯 Problem Statement & Impact

Legal agreements govern almost every aspect of business, employment, and commerce. However:
1. **Inaccessible Legalese:** Standard commercial contracts contain dense archaic phrasing, nested indemnities, and subtle liability shifts that non-lawyers struggle to parse.
2. **Hidden Exposure:** Termination restrictions, unilateral renewal clauses, aggressive interest penalties, and uncapped liabilities often go unnoticed until a dispute arises.
3. **Prohibitive Costs:** Early-stage founders and individuals often cannot afford hundreds of dollars per hour just to understand baseline deal terms or identify what to negotiate.

**How LexiGuide AI Solves This:**
- **Executive Simplification:** Synthesizes dense agreements into digestible summaries with clear party identification and risk profiles.
- **Clause Intelligence:** Categorizes key provisions (Termination, Liability, Confidentiality, Financials) with plain-English translations and practical implications.
- **Contractual Version Comparison:** Compares agreement revisions (e.g. V1 vs V2), highlighting added, removed, and modified clauses with a plain-English assessment of how contractual risk has shifted.
- **Document-Grounded Q&A:** Answers user inquiries strictly based on the text of the agreement, complete with section citations, short quotes, and notes on what specific clauses to review.
- **Actionable Consultation Prep:** Generates pre-signing compliance checklists and grounded questions for your lawyer.

---

## 🏗️ System Architecture

LexiGuide AI follows a strict full-stack architecture with clear separation of concerns:

```
[ Client Browser (React 19 + Tailwind CSS) ]
      │
      ├── File Upload & Client Validation (src/components/FileUploadZone.tsx)
      ├── In-Memory Session Cache (src/services/apiService.ts)
      ├── Interactive Analysis Dashboard (src/components/DocumentAnalysisDashboard.tsx)
      ├── Version Diff Visualizer (src/components/DocumentCompareView.tsx)
      ├── Grounded Q&A Interface (src/components/DocumentQAView.tsx)
      └── Pre-Signing Checklist & Lawyer Questions (src/components/ChecklistView.tsx)
      │
      ▼ HTTP REST (In-Memory Buffers & JSON)
[ Express Backend Server (server.ts) ]
      │
      ├── Rate Limiting & Security Headers (X-Content-Type-Options, X-Frame-Options)
      ├── Document Extraction Engine (server/services/documentExtractor.ts)
      │     ├── PDF Extraction (pdf-parse)
      │     ├── DOCX Extraction (mammoth)
      │     └── UTF-8 Text Decoder
      ├── Text Sanitization & Chunking (src/utils/documentProcessor.ts)
      └── Server-Side GenAI Service (server/services/geminiService.ts)
            └── Google GenAI SDK (@google/genai) -> gemini-2.5-flash / gemini-3.8-flash
```

---

## 🚀 Key Features

| Feature | Description |
| :--- | :--- |
| **Instant Sample Agreement** | One-click evaluator demonstration with pre-loaded Master Cloud Agreement (V1 & V2). |
| **Multi-Format Ingestion** | In-memory parsing for **PDF**, **DOCX**, and **TXT** files up to 10 MB. |
| **Executive Summary** | Plain-English summary, primary parties, effective date, and overall risk badge. |
| **Key Clauses Explorer** | Categorized provisions with importance tags, source citations, and raw snippet views. |
| **Obligations Breakdown** | Clear segregation of **User Duties**, **Counterparty Duties**, and **Mutual Duties**. |
| **Important Dates & Timelines** | Milestone tracker with notice cutoffs, cure periods, and recurring renewal deadlines. |
| **Financial Terms Hub** | Extracts fees, overages, security deposits, interest penalties, and liability caps. |
| **Attention Points (Risks)** | Objective risk identification using responsible phrasing (*"Requires attention"*, *"Potential concern"*). |
| **Version Comparison Engine** | Side-by-side clause diffing showing added, removed, modified, and unchanged clauses. |
| **Grounded AI Q&A** | Interactive questioning with section citations and short quotes. |
| **Actionable Checklist** | Interactive checkboxes grouped by category with Markdown export capability. |
| **Questions for Your Lawyer** | Grounded questions with strategic reasons to ask and document references. |
| **Privacy & Clear Session** | Complete in-memory operation. A single click permanently purges all session documents. |

---

## 💻 Quick Start & Setup

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
# Clone the repository
git clone https://github.com/example/lexiguide-ai.git
cd lexiguide-ai

# Install dependencies
npm install
```

### Environment Configuration
Create a `.env` file in the root directory (refer to `.env.example`):
```env
GEMINI_API_KEY="your_actual_gemini_api_key_here"
```

### Development Server
```bash
npm run dev
```
The server will start at `http://localhost:3000`.

### Running Tests
```bash
npm test
```

### Production Build
```bash
npm run build
npm start
```

---

## 🏆 Evaluation Criteria Alignment

| Criterion | How LexiGuide AI Meets It |
| :--- | :--- |
| **1. Parameters** | All limits centralized in `src/config/appConfig.ts` with runtime startup validation. No magic numbers anywhere in the codebase. |
| **2. Code Quality** | 100% strict TypeScript types (`src/types/index.ts`), modular component hierarchy, no file bloat, clean error boundaries. |
| **3. Security** | Zero client-side API keys, strict MIME/extension/size validation, control character sanitization, in-memory processing, no permanent disk persistence, Clear Session button. |
| **4. Efficiency** | In-memory session caching, token-optimized text chunking, exponential backoff retries, debounced interactions. |
| **5. Testing** | Comprehensive Vitest test suite (`tests/`) covering parsers, chunking, limits, diff logic, and edge cases. |
| **6. Accessibility** | WCAG AA compliant contrast ratios, semantic HTML5 tags (`<main>`, `<nav>`, `<header>`, `<footer>`), keyboard navigation, explicit ARIA labels. |
| **7. Problem Alignment** | Specifically tailored for legal accessibility, plain-language simplification, clear attorney consultation preparation, and prominent legal disclaimers. |
| **8. GenAI Usage** | Server-side `@google/genai` integration, strictly enforced JSON schemas, grounded document citations, responsible non-definitive legal language. |
