/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from '@google/genai';
import { APP_CONFIG } from '../../src/config/appConfig';
import {
  DocumentAnalysis,
  ComparisonResult,
  ChatMessage,
  RiskCategory,
} from '../../src/types';

let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY || '';
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const SYSTEM_LEGAL_SAFETY_INSTRUCTIONS = `You are LexiGuide AI, a specialized legal document analysis and informational intelligence system.
CRITICAL SAFETY & OPERATIONAL DIRECTIVES:
1. You are NOT a licensed attorney and DO NOT provide definitive legal advice. Your purpose is general educational and informational guidance.
2. DO NOT present ambiguous interpretations as absolute fact. Prefer expressions like "The clause indicates", "Requires attention", "Consider discussing with counsel".
3. NEVER fabricate laws, statutory sections, case precedents, citations, or imaginary clauses. Only quote and reference provisions actually present in the provided document text.
4. If a piece of information is omitted or not clearly established in the document, explicitly state: "Not specified in the provided text".
5. Clearly distinguish between what is strictly stated within the text of the agreement versus general informational context.
6. Always encourage users to consult a qualified legal professional for binding, consequential decisions.
7. Output valid, parseable JSON matching the requested schema without any markdown formatting wrappers or conversational preamble.`;

// In-memory model health cooldown map (stores timestamp until which a model is de-prioritized)
const modelCooldowns = new Map<string, number>();

/**
 * Execute Gemini model call with exponential backoff retries and dynamic model fallback.
 * Automatically fails over to resilient secondary models if a model encounters
 * 503 high-demand capacity spikes, 429 rate limits, or transient network unavailability.
 */
async function callGeminiWithRetry(
  prompt: string,
  config: any = {}
): Promise<{ text: string; modelUsed: string }> {
  const ai = getGenAI();
  const configuredModels = [
    APP_CONFIG.AI_MODEL,
    ...((APP_CONFIG as any).AI_FALLBACK_MODELS || ['gemini-flash-latest', 'gemini-3.8-flash']),
  ];

  // Prioritize currently healthy models over any that recently reported 503 capacity limits
  const now = Date.now();
  const healthyModels = configuredModels.filter(
    (m) => !modelCooldowns.has(m) || (modelCooldowns.get(m) || 0) <= now
  );
  const coolingModels = configuredModels.filter(
    (m) => modelCooldowns.has(m) && (modelCooldowns.get(m) || 0) > now
  );
  const candidateModels = [...healthyModels, ...coolingModels];

  let lastError: any = null;
  const maxAttempts = Math.max(APP_CONFIG.MAX_RETRY_ATTEMPTS, candidateModels.length);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Select candidate model for this attempt
    const modelIndex = Math.min(attempt - 1, candidateModels.length - 1);
    const selectedModel = candidateModels[modelIndex];

    try {
      if (attempt > 1) {
        console.info(`[GeminiService] Attempt ${attempt}/${maxAttempts} calling model: ${selectedModel}`);
      }

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_LEGAL_SAFETY_INSTRUCTIONS,
          temperature: APP_CONFIG.AI_TEMPERATURE,
          maxOutputTokens: APP_CONFIG.AI_MAX_OUTPUT_TOKENS,
          ...config,
        },
      });

      const text = response.text?.trim() || '';
      if (text.length > 0) {
        // Clear any previous cooldown on successful call
        modelCooldowns.delete(selectedModel);
        if (selectedModel !== APP_CONFIG.AI_MODEL) {
          console.info(
            `[GeminiService] Successfully fulfilled request using resilient model "${selectedModel}".`
          );
        }
        return { text, modelUsed: selectedModel };
      }
      throw new Error('Received empty response from AI model.');
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);

      const isHighDemandOrUnavailable =
        errMsg.includes('503') ||
        errMsg.includes('high demand') ||
        errMsg.includes('UNAVAILABLE') ||
        errMsg.includes('429') ||
        errMsg.includes('RESOURCE_EXHAUSTED');

      if (isHighDemandOrUnavailable) {
        // Demote this model for 5 minutes so subsequent requests prioritize available models
        modelCooldowns.set(selectedModel, Date.now() + 5 * 60 * 1000);
        const nextModel = candidateModels[Math.min(attempt, candidateModels.length - 1)];
        console.info(
          `[GeminiService] Model "${selectedModel}" is currently experiencing peak demand. Seamlessly transitioning to "${nextModel}"...`
        );
      } else {
        console.warn(
          `[GeminiService] Attempt ${attempt} with model "${selectedModel}" did not succeed: ${err?.message || 'Transient error'}`
        );
      }

      if (attempt < maxAttempts) {
        // If it's a capacity spike, failover immediately (250-450ms) to maintain fluid UX
        const delay = isHighDemandOrUnavailable
          ? 250 + Math.random() * 200
          : Math.pow(2, attempt) * 400 + Math.random() * 200;

        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }

  throw new Error(
    `AI service request failed after ${maxAttempts} attempts: ${lastError?.message || 'Service unavailable'}`
  );
}

/**
 * Safely parse JSON from model output, handling potential formatting artifacts
 */
function cleanAndParseJSON<T>(rawText: string): T {
  let cleaned = rawText.trim();
  // Strip ```json and ``` if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  }
  cleaned = cleaned.trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    // Attempt regex extraction of the outer JSON object or array
    const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        // Try fixing trailing commas before closing braces/brackets
        const sanitized = match[0].replace(/,\s*([\}\]])/g, '$1');
        return JSON.parse(sanitized) as T;
      }
    }
    throw new Error('Unable to parse structured JSON from AI output: ' + (err as Error).message);
  }
}

/**
 * Perform comprehensive document analysis: summary, clauses, obligations, dates, financial terms, attention points, checklist, lawyer questions
 */
export async function analyzeLegalDocument(
  documentText: string,
  fileName: string
): Promise<DocumentAnalysis> {
  const truncatedText = documentText.slice(0, APP_CONFIG.MAX_DOCUMENT_LENGTH);

  const prompt = `Perform a comprehensive, serious legal document intelligence analysis on the following legal agreement titled "${fileName}".

Analyze and extract all requested components strictly in structured JSON format with this exact shape:
{
  "summary": {
    "plainEnglishOverview": "3-4 sentence high-level overview explaining what this contract does in simple terms",
    "documentType": "e.g. Master Services Agreement, Commercial Lease, NDA, Employment Agreement",
    "primaryParties": ["Party A", "Party B"],
    "effectiveDate": "Identified effective date or 'Not specified'",
    "keyTakeaways": ["Key point 1", "Key point 2", "Key point 3", "Key point 4"],
    "overallRiskProfile": "Low" | "Moderate" | "Attention Advised"
  },
  "keyClauses": [
    {
      "id": "c-1",
      "title": "Title of clause",
      "sourceSection": "Section X.X",
      "rawSnippet": "Short exact excerpt from document (under 150 chars)",
      "plainEnglishExplanation": "Clear translation into plain English",
      "importance": "Critical" | "Important" | "Standard" | "Informational",
      "category": "Termination" | "Payment" | "Liability" | "Confidentiality" | "Data/Privacy" | "Intellectual Property" | "Renewal" | "Dispute Resolution" | "Penalties" | "Other",
      "implications": "What this means in practice"
    }
  ],
  "obligations": [
    {
      "id": "o-1",
      "title": "Short title of duty",
      "party": "User/First Party" | "Counterparty" | "Mutual",
      "description": "Plain explanation of required obligation",
      "sourceSection": "Section X",
      "deadlineOrCondition": "Specific timeframe or trigger",
      "consequencesOfBreach": "Stated penalty or breach consequence if any"
    }
  ],
  "importantDates": [
    {
      "id": "d-1",
      "dateOrTimeline": "e.g. 60 days prior to expiration, January 15 2025, Net 30",
      "event": "Description of deadline or milestone event",
      "sourceClause": "Section X",
      "isRecurring": true | false,
      "actionRequired": "What must be delivered or provided"
    }
  ],
  "financialTerms": [
    {
      "id": "f-1",
      "item": "e.g. Annual Subscription Fee, Overage Charge, Late Penalty",
      "amountOrCalculation": "e.g. $48,000.00 / year, 1.5% monthly",
      "category": "Fee" | "Payment" | "Penalty" | "Deposit" | "Renewal" | "Cap",
      "terms": "Payment cadence and condition details",
      "sourceClause": "Section X"
    }
  ],
  "attentionPoints": [
    {
      "id": "a-1",
      "category": "Termination" | "Payment" | "Liability" | "Confidentiality" | "Data/Privacy" | "Intellectual Property" | "Renewal" | "Dispute Resolution" | "Penalties" | "Other",
      "issueTitle": "Issue requiring attention",
      "description": "Factual description of the concern",
      "whyItMatters": "Practical business or legal exposure impact",
      "suggestedActionOrQuestion": "Concrete question or review action",
      "severity": "Caution" | "Notable" | "Standard",
      "sourceSection": "Section X"
    }
  ],
  "checklist": [
    {
      "id": "chk-1",
      "category": "Before signing" | "Payment" | "Deadlines" | "Termination" | "Confidentiality" | "Liability",
      "task": "Actionable review item or condition to verify",
      "sourceClause": "Section X",
      "explanation": "Why to verify this",
      "completed": false,
      "priority": "High" | "Medium" | "Low"
    }
  ],
  "lawyerQuestions": [
    {
      "id": "lq-1",
      "category": "e.g. Liability Cap, Automatic Renewal",
      "question": "Specific question grounded in this document",
      "reasonToAsk": "Why this ambiguity or term merits counsel review",
      "documentReference": "Section X"
    }
  ]
}

DOCUMENT CONTENT:
"""
${truncatedText}
"""`;

  const { text: rawOutput, modelUsed } = await callGeminiWithRetry(prompt, {
    responseMimeType: 'application/json',
  });

  const parsed = cleanAndParseJSON<Omit<DocumentAnalysis, 'processingMetadata' | 'disclaimer'>>(rawOutput);

  return {
    summary: parsed.summary,
    keyClauses: parsed.keyClauses || [],
    obligations: parsed.obligations || [],
    importantDates: parsed.importantDates || [],
    financialTerms: parsed.financialTerms || [],
    attentionPoints: parsed.attentionPoints || [],
    checklist: parsed.checklist || [],
    lawyerQuestions: parsed.lawyerQuestions || [],
    processingMetadata: {
      processedAt: new Date().toISOString(),
      characterCount: documentText.length,
      modelUsed: modelUsed || APP_CONFIG.AI_MODEL,
      chunksAnalyzed: Math.max(1, Math.ceil(documentText.length / APP_CONFIG.MAX_TEXT_CHUNK_SIZE)),
    },
    disclaimer: APP_CONFIG.DISCLAIMER_TEXT,
  };
}

/**
 * Answer a user query grounded strictly in document excerpts
 */
export async function answerDocumentQuestion(
  documentText: string,
  relevantContext: string,
  question: string,
  chatHistory: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<{
  answer: string;
  whyThisAnswer: string;
  citations: { section: string; quote: string }[];
  whatToReview: string;
  disclaimer: string;
}> {
  const historyText = chatHistory
    .slice(-4)
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  const prompt = `You are answering a question about an uploaded legal document.
Prioritize the provided document context.
If the document does not contain enough information to answer, explicitly say so and do not guess.
Structure your reply strictly in JSON format matching this schema:
{
  "answer": "Clear, direct, plain-English response to the question",
  "whyThisAnswer": "Concise reasoning explaining how the document text supports this answer",
  "citations": [
    {
      "section": "Identified section title or clause number",
      "quote": "Short exact quote from the document supporting the answer (max 120 chars)"
    }
  ],
  "whatToReview": "Practical follow-up clause or related topic the user should check",
  "disclaimer": "This interpretation is based strictly on the uploaded text and does not constitute formal legal counsel."
}

DOCUMENT RELEVANT CONTEXT:
"""
${relevantContext || documentText.slice(0, 10000)}
"""

RECENT CONVERSATION:
${historyText || 'None'}

QUESTION:
"${question}"`;

  const { text: rawOutput } = await callGeminiWithRetry(prompt, {
    responseMimeType: 'application/json',
  });

  return cleanAndParseJSON<{
    answer: string;
    whyThisAnswer: string;
    citations: { section: string; quote: string }[];
    whatToReview: string;
    disclaimer: string;
  }>(rawOutput);
}

/**
 * Compare two legal documents and extract differences with practical meaning
 */
export async function compareLegalDocuments(
  doc1Text: string,
  doc1Name: string,
  doc2Text: string,
  doc2Name: string
): Promise<ComparisonResult> {
  const doc1Trimmed = doc1Text.slice(0, 45000);
  const doc2Trimmed = doc2Text.slice(0, 45000);

  const prompt = `Compare the following two legal documents:
Document 1 ("${doc1Name}") vs Document 2 ("${doc2Name}").

Identify meaningful legal and business differences. Do not merely compute raw string diffs—explain the practical real-world impact of every significant change (monetary terms, renewal terms, liability caps, warranties, indemnity, termination rights, cure periods, notice dates).

Respond strictly with valid JSON with this structure:
{
  "document1Name": "${doc1Name}",
  "document2Name": "${doc2Name}",
  "summaryOfDifferences": "3-4 sentence executive overview of the primary strategic changes between Document 1 and Document 2",
  "differences": [
    {
      "id": "diff-1",
      "category": "Termination" | "Payment" | "Liability" | "Confidentiality" | "Data/Privacy" | "Intellectual Property" | "Renewal" | "Dispute Resolution" | "Penalties" | "Other",
      "changeType": "ADDED" | "REMOVED" | "MODIFIED" | "UNCHANGED",
      "clauseTitle": "Title of clause or section affected",
      "doc1Text": "Relevant excerpt from Document 1 or 'Not present'",
      "doc2Text": "Relevant excerpt from Document 2 or 'Not present'",
      "practicalImpactExplanation": "Plain English explanation of what this change means for rights, risk, or financial exposure",
      "significance": "Major" | "Moderate" | "Minor"
    }
  ],
  "riskShiftAnalysis": "Overview of whether risk shifted towards Customer, Provider, or remained balanced",
  "recommendations": ["Recommendation 1 for review", "Recommendation 2 for negotiation"]
}

DOCUMENT 1 ("${doc1Name}"):
"""
${doc1Trimmed}
"""

DOCUMENT 2 ("${doc2Name}"):
"""
${doc2Trimmed}
"""`;

  const { text: rawOutput } = await callGeminiWithRetry(prompt, {
    responseMimeType: 'application/json',
  });

  const parsed = cleanAndParseJSON<Omit<ComparisonResult, 'disclaimer'>>(rawOutput);

  return {
    document1Name: parsed.document1Name || doc1Name,
    document2Name: parsed.document2Name || doc2Name,
    summaryOfDifferences: parsed.summaryOfDifferences || 'Comparison complete.',
    differences: parsed.differences || [],
    riskShiftAnalysis: parsed.riskShiftAnalysis || 'No significant risk shift detected.',
    recommendations: parsed.recommendations || [],
    disclaimer: APP_CONFIG.DISCLAIMER_TEXT,
  };
}
