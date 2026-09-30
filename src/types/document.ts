export type DocumentCategory = 
  | 'report'
  | 'invoice'
  | 'form'
  | 'policy'
  | 'contract'
  | 'other';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type ComplianceStatus = 'compliant' | 'partial' | 'non_compliant' | 'under_review';

export interface DocumentMetadata {
  id: string;
  name: string;
  category: DocumentCategory;
  uploadDate: string;
  fileSize: string;
  fileType: string;
  sourceType: 'sample' | 'upload' | 'pasted';
  pageCount?: number;
  rawText?: string;
  base64Data?: string;
  mimeType?: string;
}

export interface RiskItem {
  id: string;
  severity: RiskLevel;
  title: string;
  description: string;
  clauseLocation?: string;
  recommendedMitigation: string;
}

export interface ComplianceAuditItem {
  id: string;
  standard: string; // e.g. "SOC 2 Type II", "GDPR Art. 28", "GAAP Rev Rec", "Internal Expense Policy"
  status: ComplianceStatus;
  finding: string;
  referenceQuote?: string;
}

export interface ExtractedField {
  label: string;
  value: string;
  confidence: number; // 0.0 to 1.0
  category: 'financial' | 'entity' | 'date' | 'legal' | 'administrative';
}

export interface LineItem {
  id: string;
  itemNumber?: string;
  description: string;
  quantity?: number;
  unitPrice?: number;
  total: number;
  category?: string;
  flag?: string;
}

export interface ActionItem {
  id: string;
  priority: 'urgent' | 'high' | 'medium' | 'routine';
  title: string;
  assignedRole: string;
  deadlineSuggestion?: string;
  reason: string;
}

export interface DocumentReview {
  documentId: string;
  processedAt: string;
  processingTimeMs: number;
  modelUsed: string;
  documentCategory: DocumentCategory;
  detectedTitle: string;
  executiveSummary: string;
  overallSentimentOrPosture: 'favorable' | 'cautious' | 'high_exposure' | 'neutral';
  overallRiskLevel: RiskLevel;
  overallComplianceStatus: ComplianceStatus;
  keyInsights: Array<{
    id: string;
    topic: string;
    insight: string;
    impact: 'critical' | 'strategic' | 'operational';
  }>;
  riskAssessment: {
    overallSummary: string;
    scoreOutOf100: number;
    risks: RiskItem[];
  };
  complianceAudit: {
    summary: string;
    items: ComplianceAuditItem[];
  };
  structuredExtraction: {
    keyMetadata: ExtractedField[];
    lineItems?: LineItem[];
    signatories?: Array<{
      name: string;
      title: string;
      dateSigned?: string;
      validity: 'valid' | 'missing' | 'expired' | 'unverified';
    }>;
  };
  actionableRecommendations: ActionItem[];
  rawAnalysisNotes?: string;
  ocrText?: string;
}

export interface DocumentItem extends DocumentMetadata {
  status: 'idle' | 'scanning' | 'processed' | 'error';
  error?: string;
  review?: DocumentReview;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: Array<{
    documentName: string;
    quote: string;
    location?: string;
  }>;
}

export type ReviewMode = 'comprehensive' | 'risk_audit' | 'extraction' | 'compliance';
