/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RiskCategory =
  | 'Termination'
  | 'Payment'
  | 'Liability'
  | 'Confidentiality'
  | 'Data/Privacy'
  | 'Intellectual Property'
  | 'Renewal'
  | 'Dispute Resolution'
  | 'Penalties'
  | 'Other';

export interface DocumentMeta {
  id: string;
  name: string;
  size: number;
  type: string;
  charCount: number;
  uploadedAt: string;
  content: string;
}

export interface ExecutiveSummary {
  plainEnglishOverview: string;
  documentType: string;
  primaryParties: string[];
  effectiveDate: string;
  keyTakeaways: string[];
  overallRiskProfile: 'Low' | 'Moderate' | 'Attention Advised';
}

export interface Clause {
  id: string;
  title: string;
  sourceSection: string;
  rawSnippet: string;
  plainEnglishExplanation: string;
  importance: 'Critical' | 'Important' | 'Standard' | 'Informational';
  category: RiskCategory;
  implications: string;
}

export interface Obligation {
  id: string;
  title: string;
  party: 'User/First Party' | 'Counterparty' | 'Mutual';
  description: string;
  sourceSection: string;
  deadlineOrCondition?: string;
  consequencesOfBreach?: string;
}

export interface ImportantDate {
  id: string;
  dateOrTimeline: string;
  event: string;
  sourceClause: string;
  isRecurring: boolean;
  actionRequired?: string;
}

export interface FinancialTerm {
  id: string;
  item: string;
  amountOrCalculation: string;
  category: 'Fee' | 'Payment' | 'Penalty' | 'Deposit' | 'Renewal' | 'Cap';
  terms: string;
  sourceClause: string;
}

export interface AttentionPoint {
  id: string;
  category: RiskCategory;
  issueTitle: string;
  description: string;
  whyItMatters: string;
  suggestedActionOrQuestion: string;
  severity: 'Caution' | 'Notable' | 'Standard';
  sourceSection: string;
}

export interface ChecklistItem {
  id: string;
  category: string;
  task: string;
  sourceClause: string;
  explanation: string;
  completed: boolean;
  priority: 'High' | 'Medium' | 'Low';
}

export interface QuestionsForLawyer {
  id: string;
  category: string;
  question: string;
  reasonToAsk: string;
  documentReference: string;
  whyAskThis?: string;
  relevantSection?: string;
}

export interface DocumentAnalysis {
  summary: ExecutiveSummary;
  executiveSummary?: ExecutiveSummary;
  keyClauses: Clause[];
  clauses?: Clause[];
  obligations: Obligation[];
  importantDates: ImportantDate[];
  financialTerms: FinancialTerm[];
  attentionPoints: AttentionPoint[];
  checklist: ChecklistItem[];
  lawyerQuestions: QuestionsForLawyer[];
  questionsForLawyer?: QuestionsForLawyer[];
  processingMetadata: {
    processedAt: string;
    characterCount: number;
    modelUsed: string;
    chunksAnalyzed: number;
  };
  disclaimer: string;
}

export interface ComparisonDifference {
  id: string;
  category: string;
  changeType: 'ADDED' | 'REMOVED' | 'MODIFIED' | 'UNCHANGED';
  clauseTitle: string;
  doc1Text?: string;
  doc2Text?: string;
  practicalImpactExplanation: string;
  significance: 'Major' | 'Moderate' | 'Minor';
}

export interface ComparisonResult {
  document1Name: string;
  document2Name: string;
  summaryOfDifferences: string;
  differences: ComparisonDifference[];
  riskShiftAnalysis: string;
  recommendations: string[];
  disclaimer: string;
}

export interface ChatCitation {
  section: string;
  quote: string;
  page?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: ChatCitation[];
  whyThisAnswer?: string;
  whatToReview?: string;
  disclaimer?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  code?: string;
}
