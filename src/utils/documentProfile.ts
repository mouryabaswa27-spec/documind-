import { DocumentItem, DocumentCategory } from '../types/document';

export interface DocumentProfile {
  category: DocumentCategory;
  // Whether risk factor & liabilities should be displayed
  showsRiskFactor: boolean;
  // Whether regulatory / policy compliance should be displayed
  showsCompliance: boolean;
  // Whether this is a financial transaction document (invoice, receipt, expense photo)
  isFinancial: boolean;
  // Header highlight metrics
  headerBadge: {
    label: string;
    sublabel?: string;
    type: 'financial' | 'risk' | 'compliance' | 'general';
  };
  // Visible tabs specifically relevant to this document type
  availableTabs: Array<'visual' | 'synthesis' | 'extraction' | 'traceability' | 'risks' | 'compliance' | 'photo' | 'raw'>;
  // Default tab when user opens this document
  defaultTab: 'visual' | 'synthesis' | 'extraction' | 'traceability' | 'risks' | 'compliance' | 'photo' | 'raw';
  // Human readable description
  profileTagline: string;
}

export function getDocumentProfile(doc: DocumentItem | null): DocumentProfile {
  if (!doc) {
    return {
      category: 'other',
      showsRiskFactor: false,
      showsCompliance: false,
      isFinancial: false,
      headerBadge: { label: 'Standard File', type: 'general' },
      availableTabs: ['visual', 'synthesis', 'extraction', 'raw'],
      defaultTab: 'visual',
      profileTagline: 'General document overview',
    };
  }

  const category: DocumentCategory = doc.category || 'other';
  const hasPhoto = !!doc.base64Data && (
    doc.mimeType?.startsWith('image/') || 
    doc.fileType?.startsWith('image/') || 
    !!doc.name?.match(/\.(jpg|jpeg|png|webp|gif|heic)$/i)
  );

  const review = doc.review;
  const criticalOrHighRisk = review?.overallRiskLevel === 'critical' || review?.overallRiskLevel === 'high';
  const hasSpecificRisks = (review?.riskAssessment?.risks?.length || 0) > 0 && review?.overallRiskLevel !== 'low';
  const hasSpecificComplianceItems = (review?.complianceAudit?.items?.length || 0) > 0 && 
    review?.complianceAudit?.items?.some(i => i.status === 'non_compliant' || i.status === 'partial');

  switch (category) {
    case 'contract': {
      // Contracts & Legal Agreements: Visual X-Ray, Risk Factor and Legal Compliance are ESSENTIAL
      const tabs: DocumentProfile['availableTabs'] = [
        'visual',
        'synthesis',
        'risks',
        'compliance',
        'extraction',
        'traceability',
      ];
      if (hasPhoto) tabs.push('photo');
      tabs.push('raw');

      return {
        category,
        showsRiskFactor: true,
        showsCompliance: true,
        isFinancial: false,
        headerBadge: {
          label: 'Legal Contract Review',
          sublabel: review ? `Risk Score: ${review.riskAssessment?.scoreOutOf100 || 0}/100` : undefined,
          type: 'risk',
        },
        availableTabs: tabs,
        defaultTab: 'visual',
        profileTagline: 'Interactive X-Ray heatmap, contractual liabilities, and governing law compliance.',
      };
    }

    case 'policy': {
      // Policies & Standards: Compliance is the PRIMARY purpose
      const tabs: DocumentProfile['availableTabs'] = [
        'visual',
        'compliance',
        'synthesis',
        'risks',
        'extraction',
        'traceability',
      ];
      if (hasPhoto) tabs.push('photo');
      tabs.push('raw');

      return {
        category,
        showsRiskFactor: true,
        showsCompliance: true,
        isFinancial: false,
        headerBadge: {
          label: 'Regulatory Compliance Audit',
          sublabel: review?.overallComplianceStatus ? `Status: ${review.overallComplianceStatus.replace('_', ' ')}` : undefined,
          type: 'compliance',
        },
        availableTabs: tabs,
        defaultTab: 'visual',
        profileTagline: 'Regulatory framework verification (SOC 2, GDPR, ISO) and corporate policy compliance.',
      };
    }

    case 'invoice': {
      // Invoices, Receipts, Expense Photos ("Normal Financial Documents")
      const tabs: DocumentProfile['availableTabs'] = ['visual', 'synthesis', 'extraction'];
      if (hasPhoto) tabs.push('photo');
      tabs.push('traceability');
      if (criticalOrHighRisk) {
        tabs.push('risks');
      }
      tabs.push('raw');

      // Find total amount if extracted
      const totalField = review?.structuredExtraction?.keyMetadata?.find(m => 
        m.label.toLowerCase().includes('total') || 
        m.label.toLowerCase().includes('amount') || 
        m.label.toLowerCase().includes('payable')
      );

      return {
        category,
        showsRiskFactor: criticalOrHighRisk,
        showsCompliance: false,
        isFinancial: true,
        headerBadge: {
          label: 'Financial Transaction',
          sublabel: totalField ? `Total: ${totalField.value}` : 'Itemized Receipt',
          type: 'financial',
        },
        availableTabs: tabs,
        defaultTab: 'visual',
        profileTagline: 'Interactive visual invoice canvas, line item tables, and anomaly detection.',
      };
    }

    case 'report': {
      // Reports
      const tabs: DocumentProfile['availableTabs'] = ['visual', 'synthesis', 'extraction', 'traceability'];
      if (hasPhoto) tabs.push('photo');
      tabs.push('raw');

      return {
        category,
        showsRiskFactor: false,
        showsCompliance: false,
        isFinancial: false,
        headerBadge: {
          label: 'Executive Report',
          sublabel: 'Findings & Key Metrics',
          type: 'general',
        },
        availableTabs: tabs,
        defaultTab: 'visual',
        profileTagline: 'Visual paginated layout, executive synthesis, and balance sheet tables.',
      };
    }

    case 'form': {
      // Forms
      const tabs: DocumentProfile['availableTabs'] = ['visual', 'synthesis', 'extraction', 'traceability'];
      if (hasPhoto) tabs.push('photo');
      tabs.push('raw');

      return {
        category,
        showsRiskFactor: false,
        showsCompliance: false,
        isFinancial: false,
        headerBadge: {
          label: 'Form & Record',
          sublabel: 'Field Verification',
          type: 'general',
        },
        availableTabs: tabs,
        defaultTab: 'visual',
        profileTagline: 'Form field verification, values, and signatory validity without irrelevant risk scores.',
      };
    }

    case 'other':
    default: {
      const tabs: DocumentProfile['availableTabs'] = ['visual', 'synthesis', 'extraction', 'traceability'];
      if (hasPhoto) tabs.push('photo');
      tabs.push('raw');

      return {
        category,
        showsRiskFactor: false,
        showsCompliance: false,
        isFinancial: false,
        headerBadge: {
          label: 'Standard File',
          sublabel: 'Summary & Key Information',
          type: 'general',
        },
        availableTabs: tabs,
        defaultTab: 'visual',
        profileTagline: 'Pristine document synthesis and key data points without unnecessary risk or compliance overhead.',
      };
    }
  }
}
