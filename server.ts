/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { APP_CONFIG, validateAppConfig, validateFileParameters } from './src/config/appConfig';
import { extractTextFromBuffer } from './server/services/documentExtractor';
import {
  analyzeLegalDocument,
  answerDocumentQuestion,
  compareLegalDocuments,
} from './server/services/geminiService';
import { chunkDocumentText, findRelevantChunks } from './src/utils/documentProcessor';

dotenv.config();

// Verify application configuration at startup
const configCheck = validateAppConfig();
if (!configCheck.isValid) {
  console.error('[LexiGuide AI] Startup Configuration Errors:', configCheck.errors);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware: parse JSON bodies with reasonable in-memory size limit
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Security headers middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Simple in-memory rate limiting map for Q&A and analysis
  const requestHistory = new Map<string, { count: number; firstRequestTime: number }>();
  const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
  const MAX_REQUESTS_PER_WINDOW = 30;

  function rateLimiter(req: Request, res: Response, next: NextFunction): void {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const clientRecord = requestHistory.get(ip);

    if (!clientRecord) {
      requestHistory.set(ip, { count: 1, firstRequestTime: now });
      return next();
    }

    if (now - clientRecord.firstRequestTime > RATE_LIMIT_WINDOW_MS) {
      requestHistory.set(ip, { count: 1, firstRequestTime: now });
      return next();
    }

    clientRecord.count++;
    if (clientRecord.count > MAX_REQUESTS_PER_WINDOW) {
      res.status(429).json({
        error: 'Too many requests. Please wait a moment before submitting additional analysis requests.',
        code: 'RATE_LIMIT_EXCEEDED',
      });
      return;
    }

    return next();
  }

  // API Routes

  /**
   * Health Check and Environment Status
   */
  app.get('/api/health', (req: Request, res: Response) => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);
    res.json({
      status: 'ok',
      application: APP_CONFIG.APPLICATION_NAME,
      version: APP_CONFIG.VERSION,
      geminiConfigured: hasKey,
      limits: {
        maxFileSizeMb: APP_CONFIG.MAX_FILE_SIZE_MB,
        maxDocLength: APP_CONFIG.MAX_DOCUMENT_LENGTH,
        supportedExtensions: APP_CONFIG.SUPPORTED_EXTENSIONS,
      },
    });
  });

  /**
   * Extract text from uploaded document buffer
   */
  app.post('/api/extract-text', async (req: Request, res: Response): Promise<void> => {
    try {
      const { filename, base64Data, mimeType } = req.body;

      if (!filename || !base64Data) {
        res.status(400).json({
          error: 'Missing file payload. Please provide filename and base64Data.',
          code: 'MISSING_PAYLOAD',
        });
        return;
      }

      // Validate file metadata
      const rawBuffer = Buffer.from(base64Data, 'base64');
      const fileValidation = validateFileParameters({
        name: filename,
        size: rawBuffer.length,
        type: mimeType,
      });

      if (!fileValidation.isValid) {
        res.status(400).json({
          error: fileValidation.error,
          code: 'INVALID_FILE',
        });
        return;
      }

      const extracted = await extractTextFromBuffer(rawBuffer, filename, mimeType);

      res.json({
        success: true,
        filename,
        text: extracted.text,
        charCount: extracted.charCount,
        wordCount: extracted.wordCount,
        pages: extracted.pages,
      });
    } catch (err: any) {
      console.error('[API /extract-text Error]:', err?.message);
      res.status(422).json({
        error: err?.message || 'Failed to extract text from document.',
        code: 'EXTRACTION_ERROR',
      });
    }
  });

  /**
   * Full Legal Document Analysis
   */
  app.post('/api/analyze', rateLimiter, async (req: Request, res: Response): Promise<void> => {
    try {
      const { text, filename } = req.body;

      if (!text || typeof text !== 'string' || text.trim().length < 20) {
        res.status(400).json({
          error: 'Document content is required and must contain readable legal text.',
          code: 'INVALID_INPUT',
        });
        return;
      }

      if (text.length > APP_CONFIG.MAX_DOCUMENT_LENGTH) {
        res.status(400).json({
          error: `Document exceeds maximum permitted length of ${APP_CONFIG.MAX_DOCUMENT_LENGTH} characters.`,
          code: 'DOCUMENT_TOO_LARGE',
        });
        return;
      }

      const analysis = await analyzeLegalDocument(text, filename || 'Uploaded Agreement');
      res.json(analysis);
    } catch (err: any) {
      console.error('[API /analyze Error]:', err?.message);
      const isCapacity =
        err?.message?.includes('503') ||
        err?.message?.includes('high demand') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.message?.includes('429');

      res.status(isCapacity ? 503 : 500).json({
        error: isCapacity
          ? 'The AI model service is currently experiencing temporary high demand spikes. Please click Retry in a moment.'
          : "We couldn't analyze this document right now. Please try again. Your uploaded document has not been modified.",
        detail: err?.message,
        code: isCapacity ? 'MODEL_HIGH_DEMAND' : 'ANALYSIS_FAILED',
      });
    }
  });

  /**
   * Document-Grounded Q&A
   */
  app.post('/api/qa', rateLimiter, async (req: Request, res: Response): Promise<void> => {
    try {
      const { question, documentText, chatHistory } = req.body;

      if (!question || typeof question !== 'string' || question.trim().length === 0) {
        res.status(400).json({
          error: 'Question is required.',
          code: 'MISSING_QUESTION',
        });
        return;
      }

      if (!documentText || typeof documentText !== 'string') {
        res.status(400).json({
          error: 'Document text is required to ground the answer.',
          code: 'MISSING_DOCUMENT',
        });
        return;
      }

      // Chunk document and retrieve relevant semantic snippets
      const chunks = chunkDocumentText(documentText);
      const relevantChunks = findRelevantChunks(question, chunks, APP_CONFIG.SEARCH_TOP_K);
      const contextText = relevantChunks.map((c) => `[Excerpt ${c.index + 1} - ${c.approximateSection || 'Clause'}]:\n${c.text}`).join('\n\n');

      const answerData = await answerDocumentQuestion(
        documentText,
        contextText,
        question.trim(),
        Array.isArray(chatHistory) ? chatHistory : []
      );

      res.json(answerData);
    } catch (err: any) {
      console.error('[API /qa Error]:', err?.message);
      const isCapacity =
        err?.message?.includes('503') ||
        err?.message?.includes('high demand') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.message?.includes('429');

      res.status(isCapacity ? 503 : 500).json({
        error: isCapacity
          ? 'The AI service is experiencing temporary high demand. Please try asking your question again in a moment.'
          : 'Unable to generate an answer at this time. Please try asking in a different way.',
        detail: err?.message,
        code: isCapacity ? 'MODEL_HIGH_DEMAND' : 'QA_FAILED',
      });
    }
  });

  /**
   * Comparative Analysis of Two Legal Documents
   */
  app.post('/api/compare', rateLimiter, async (req: Request, res: Response): Promise<void> => {
    try {
      const { doc1Text, doc1Name, doc2Text, doc2Name } = req.body;

      if (!doc1Text || !doc2Text) {
        res.status(400).json({
          error: 'Both Document 1 and Document 2 text contents are required for comparison.',
          code: 'MISSING_DOCUMENTS',
        });
        return;
      }

      const comparison = await compareLegalDocuments(
        doc1Text,
        doc1Name || 'Document 1',
        doc2Text,
        doc2Name || 'Document 2'
      );

      res.json(comparison);
    } catch (err: any) {
      console.error('[API /compare Error]:', err?.message);
      const isCapacity =
        err?.message?.includes('503') ||
        err?.message?.includes('high demand') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.message?.includes('429');

      res.status(isCapacity ? 503 : 500).json({
        error: isCapacity
          ? 'The AI service is experiencing temporary peak load. Please try comparing again in a moment.'
          : 'Unable to compare the documents at this time. Please verify both documents contain readable text.',
        detail: err?.message,
        code: isCapacity ? 'MODEL_HIGH_DEMAND' : 'COMPARISON_FAILED',
      });
    }
  });

  // Client Static Serving / Vite Middleware Setup
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[Global Server Error]:', err);
    res.status(500).json({
      error: 'An unexpected internal error occurred. Please try again.',
      code: 'INTERNAL_SERVER_ERROR',
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LexiGuide AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[LexiGuide AI] Fatal Startup Failure:', err);
  process.exit(1);
});
