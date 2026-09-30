import { DocumentItem } from '../types/document';

// Generates a high-resolution canvas data URL for the logistics invoice image
function generateLogisticsInvoicePhoto(): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 1200;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Thermal/shipping invoice paper background with subtle distress texture
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border & Header box
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 30, 840, 1140);

  // Top header bar
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(30, 30, 840, 90);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('APEX GLOBAL LOGISTICS & FREIGHT B.V.', 60, 75);
  ctx.font = '14px Arial, sans-serif';
  ctx.fillText('International Air & Ocean Freight Services · VAT ID: NL882941029B01', 60, 102);

  // Invoice stamp
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 20px "Courier New", monospace';
  ctx.fillText('COMMERCIAL FREIGHT INVOICE', 60, 160);
  ctx.font = '14px "Courier New", monospace';
  ctx.fillText('INVOICE NO: AGL-2026-8842-FX', 60, 185);
  ctx.fillText('DATE OF ISSUE: 2026-09-24', 60, 205);
  ctx.fillText('PORT OF LADING: Rotterdam (NLRTM)', 60, 225);
  ctx.fillText('DESTINATION: New York JFK (USJFK)', 60, 245);

  ctx.fillText('BILLED TO:', 520, 160);
  ctx.font = 'bold 15px "Courier New", monospace';
  ctx.fillText('Meridian Global Tech Inc.', 520, 185);
  ctx.font = '14px "Courier New", monospace';
  ctx.fillText('500 Howard Street, Suite 800', 520, 205);
  ctx.fillText('San Francisco, CA 94105, USA', 520, 225);
  ctx.fillText('CURRENCY: USD / EUR Dual-Billed', 520, 245);

  // Multi-currency notice box (Yellow warning background)
  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(50, 270, 800, 45);
  ctx.strokeStyle = '#f59e0b';
  ctx.strokeRect(50, 270, 800, 45);
  ctx.fillStyle = '#92400e';
  ctx.font = 'bold 13px "Courier New", monospace';
  ctx.fillText('⚠️ MULTI-CURRENCY CONVERSION NOTICE: Line 3 billed in EUR (ECB Fix 1.085 USD/EUR)', 70, 298);

  // Table header
  ctx.fillStyle = '#334155';
  ctx.fillRect(50, 335, 800, 35);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.fillText('ITEM / SERVICE DESCRIPTION', 65, 358);
  ctx.fillText('QTY', 440, 358);
  ctx.fillText('RATE', 530, 358);
  ctx.fillText('CURRENCY', 640, 358);
  ctx.fillText('AMOUNT (USD)', 730, 358);

  // Table items
  const items = [
    { desc: 'Air Cargo Express Tier 1 (4,200 kg Heavy Freight)', qty: '1 Lot', rate: '$5,800.00', curr: 'USD', amt: '$5,800.00' },
    { desc: 'Bunker Adjustment & Jet Fuel Surcharge (BAF 18.5%)', qty: '1 Lot', rate: '$1,073.00', curr: 'USD', amt: '$1,073.00' },
    { desc: 'EU Customs Handling & Clearance (EUR 450 @ 1.085)', qty: '1 Lot', rate: '€450.00', curr: 'EUR', amt: '$488.25' },
    { desc: 'Terminal Handling Charge at Origin (THC NLRTM)', qty: '1 Lot', rate: '$620.00', curr: 'USD', amt: '$620.00' },
    { desc: 'Bonded Warehouse Security & Dangerous Goods Inspection', qty: '2 Pcs', rate: '$219.50', curr: 'USD', amt: '$439.00' },
  ];

  let y = 395;
  ctx.font = '13px "Courier New", monospace';
  ctx.fillStyle = '#1e293b';
  items.forEach((item, idx) => {
    if (idx % 2 === 1) {
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(50, y - 18, 800, 28);
      ctx.fillStyle = '#1e293b';
    }
    ctx.fillText(item.desc, 65, y);
    ctx.fillText(item.qty, 440, y);
    ctx.fillText(item.rate, 530, y);
    ctx.fillText(item.curr, 650, y);
    ctx.fillText(item.amt, 735, y);
    y += 36;
  });

  // Calculation Math Check Area (with discrepancy highlight)
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(50, y + 10);
  ctx.lineTo(850, y + 10);
  ctx.stroke();

  y += 40;
  ctx.font = '14px "Courier New", monospace';
  ctx.fillText('SUBTOTAL (SUM OF ITEMIZED LINES):', 400, y);
  ctx.fillText('$8,420.25 USD', 720, y);

  y += 28;
  ctx.fillText('IMPORT TARIFF / CUSTOMS DUTY (5.0%):', 400, y);
  ctx.fillText('$421.01 USD', 720, y);

  y += 28;
  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 14px "Courier New", monospace';
  ctx.fillText('STATED TOTAL BILLED (INVOICE CLAIM):', 400, y);
  ctx.fillText('$9,341.26 USD', 720, y);

  y += 24;
  ctx.font = 'italic 12px "Courier New", monospace';
  ctx.fillText('[DISCREPANCY DETECTED: Mathematical sum is $8,841.26 ($500.00 Overcharge)]', 300, y);

  // Footer & Signatures
  y += 60;
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.fillText('PAYMENT INSTRUCTIONS & REMITTANCE:', 60, y);
  ctx.font = '12px "Courier New", monospace';
  ctx.fillText('Bank: ING Bank Amsterdam · IBAN: NL91INGB0492810291 · SWIFT: INGBNL2A', 60, y + 20);
  ctx.fillText('Payment Terms: Net 30 Days from B/L Date (Due: 2026-10-24)', 60, y + 40);

  // Red stamp on the side
  ctx.save();
  ctx.translate(720, 1050);
  ctx.rotate(-0.15);
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 3;
  ctx.strokeRect(-90, -35, 180, 70);
  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 16px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('AUDIT REQUIRED', 0, -5);
  ctx.font = '11px Arial, sans-serif';
  ctx.fillText('DISCREPANCY FLAGGED', 0, 18);
  ctx.restore();

  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
  const commaIndex = dataUrl.indexOf(',');
  return commaIndex !== -1 ? dataUrl.slice(commaIndex + 1) : dataUrl;
}

export const SAMPLE_DOCUMENTS: DocumentItem[] = [
  // SAMPLE 1: CONTRACT WITH HIDDEN TRAPS
  {
    id: 'doc-sample-nda-traps',
    name: 'Mutual_NDA_VendorStandard_Traps.pdf',
    category: 'contract',
    uploadDate: '2026-09-30T09:15:00Z',
    fileSize: '412 KB',
    fileType: 'application/pdf',
    sourceType: 'sample',
    pageCount: 3,
    rawText: `MUTUAL NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is entered into as of September 30, 2026 ("Effective Date"), by and between:
Disclosing Party: Apex Enterprise Cloud Solutions LLC, a Delaware corporation ("Apex"); and
Receiving Party: Counterparty Organization ("Company").

RECITALS
WHEREAS, the parties desire to explore a strategic commercial collaboration and in connection therewith may disclose proprietary technical and commercial information.

NOW, THEREFORE, the parties agree as follows:

1. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" includes all proprietary software, source code, financial projections, customer rosters, API architectures, and any business data disclosed orally, visually, or in writing.

2. OBLIGATIONS OF RECEIVING PARTY
2.1 Standard of Care: Receiving Party agrees to protect Confidential Information using the highest standard of care, but in no event less than reasonable care.
2.2 Non-Use: Receiving Party shall not use any Confidential Information for any purpose other than evaluating the Proposed Transaction.

3. TERM AND SURVIVAL [HIDDEN TRAP: UNUSUALLY EXTENDED]
3.1 This Agreement shall remain in effect for a term of two (2) years from the Effective Date.
3.2 Survival Clause: Notwithstanding Section 3.1, the confidentiality obligations with respect to all Trade Secrets, Customer Records, and Pricing Architecture shall SURVIVE IN PERPETUITY and indefinitely, extending beyond any termination.

4. INDEMNIFICATION AND UNLIMITED LIABILITY [CRITICAL RISK TRAP]
4.1 Mutual Indemnity: Receiving Party agrees to defend, indemnify, and hold harmless Apex, its affiliates, directors, officers, and employees from and against any and all claims, liabilities, losses, damages, legal fees, and regulatory penalties arising out of or relating to any unauthorized disclosure, whether intentional or accidental.
4.2 Uncapped Liability: NOTWITHSTANDING ANYTHING TO THE CONTRARY IN THIS AGREEMENT OR ANY RELATED ORDER, RECEIVING PARTY'S INDEMNIFICATION OBLIGATIONS AND LIABILITY FOR BREACH UNDER THIS SECTION 4 SHALL BE STRICTLY UNCAPPED, WITHOUT REGARD TO CONSEQUENTIAL, INDIRECT, SPECIAL, OR PUNITIVE DAMAGES, AND SHALL NOT BE SUBJECT TO ANY LIMITATION OF LIABILITY CAP.

5. INTELLECTUAL PROPERTY & RESIDUALS
Apex retains all title, copyright, patent, and intellectual property rights in and to all materials provided. No license is granted under this Agreement.

6. RETURN OR DESTRUCTION OF MATERIALS
Within ten (10) calendar days of receiving a written request, Receiving Party shall certify in an executive affidavit that all physical and digital copies of Confidential Information have been permanently purged and destroyed from all backup systems.

7. COVENANT NOT TO COMPETE AND NON-SOLICITATION [SNEAK NON-COMPETE TRAP]
7.1 Non-Compete: During the term of this Agreement and for a period of TWENTY-FOUR (24) MONTHS following its termination for any reason, Receiving Party covenants and agrees that it shall not, directly or indirectly, develop, market, license, or sell any competing cloud optimization software or identity workflow services.
7.2 Non-Solicitation of Personnel: Receiving Party shall not directly or indirectly recruit, solicit, or hire any engineer, executive, or contractor of Apex during the term and for 18 months thereafter.

8. GOVERNING LAW AND DISPUTE VENUE
This Agreement shall be governed by and construed strictly in accordance with the substantive laws of the STATE OF DELAWARE, United States, without regard to conflicts of law principles. Any dispute arising out of or in connection with this Agreement shall be submitted exclusively to the Delaware Court of Chancery, Wilmington, Delaware. Both parties waive any objection to personal jurisdiction or venue.

9. MISCELLANEOUS & REMEDIES
9.1 Injunctive Relief: Receiving Party acknowledges that monetary damages may be inadequate in the event of a breach, and Apex shall be entitled to immediate preliminary injunctive relief without the necessity of posting a bond.
9.2 Attorney's Fees: The prevailing party in any litigation shall be entitled to recover full attorney fees and forensic auditing expenses.
9.3 Missing Signatory Dates: This document has been executed by authorized officers as of the dates indicated below.

IN WITNESS WHEREOF, the parties have executed this Agreement.

APEX ENTERPRISE CLOUD SOLUTIONS LLC:
By: /s/ Marcus Vance
Name: Marcus Vance
Title: Senior Vice President of Legal Affairs
Date: September 30, 2026

COUNTERPARTY ORGANIZATION:
By: [PENDING SIGNATURE]
Name: Elena Rostova
Title: Chief Operating Officer
Date: [MISSING DATE FIELD]`,
    status: 'processed',
    review: {
      documentId: 'doc-sample-nda-traps',
      processedAt: '2026-09-30T09:15:10Z',
      processingTimeMs: 1420,
      modelUsed: 'gemini-3.7-flash (DocuMind Engine)',
      documentCategory: 'contract',
      detectedTitle: 'Mutual NDA with Uncapped Indemnity & Sneak Non-Compete',
      executiveSummary: 'This standard-looking NDA contains three critical legal liability traps: Section 4.2 enforces strictly UNCAPPED indemnity including consequential damages; Section 7.1 embeds a 24-month restrictive non-compete clause disguised inside a confidentiality agreement; and Section 3.2 enforces perpetual survival. Governing law is Delaware Chancery Court.',
      overallSentimentOrPosture: 'high_exposure',
      overallRiskLevel: 'critical',
      overallComplianceStatus: 'non_compliant',
      keyInsights: [
        {
          id: 'insight-1',
          topic: 'Uncapped Liability & Indemnity',
          insight: 'Section 4.2 explicitly disclaims all liability caps and includes punitive/indirect damages, posing severe financial exposure.',
          impact: 'critical'
        },
        {
          id: 'insight-2',
          topic: 'Disguised 24-Month Non-Compete',
          insight: 'Section 7.1 prohibits developing competing cloud optimization software for 2 years after NDA termination.',
          impact: 'critical'
        },
        {
          id: 'insight-3',
          topic: 'Missing Force Majeure & Signatory Date',
          insight: 'No Force Majeure protection clause is included; Counterparty signature date is missing.',
          impact: 'strategic'
        }
      ],
      riskAssessment: {
        overallSummary: 'Critical legal liability risk: 2 high-severity restrictive clauses that exceed market norms for commercial NDAs.',
        scoreOutOf100: 89,
        risks: [
          {
            id: 'risk-1',
            severity: 'critical',
            title: 'Uncapped Consequential Indemnification',
            description: 'Section 4.2 enforces unlimited liability without any standard cap or mutual threshold, including consequential and punitive damages.',
            clauseLocation: 'Section 4.2 (Page 2, Lines 35-42)',
            recommendedMitigation: 'Strike Section 4.2 and insert standard mutual liability cap limited to 12 months fees or $50,000 maximum.'
          },
          {
            id: 'risk-2',
            severity: 'critical',
            title: 'Surreptitious 24-Month Non-Compete Covenant',
            description: 'Section 7.1 restricts the Receiving Party from marketing or selling any competing cloud optimization tools for 24 months after termination.',
            clauseLocation: 'Section 7.1 (Page 2, Lines 68-74)',
            recommendedMitigation: 'Completely eliminate Section 7 (Non-Compete); NDAs should never restrict commercial product roadmaps.'
          },
          {
            id: 'risk-3',
            severity: 'high',
            title: 'Perpetual Confidentiality Survival on Broad Trade Secrets',
            description: 'Section 3.2 extends confidentiality indefinitely for all customer records and pricing architecture rather than the industry-standard 3-5 years.',
            clauseLocation: 'Section 3.2 (Page 1, Lines 28-32)',
            recommendedMitigation: 'Cap trade secret survival period to three (3) years from the Effective Date.'
          }
        ]
      },
      complianceAudit: {
        summary: 'Failed internal enterprise contract playbook standards due to non-compete and unilateral uncapped indemnity.',
        items: [
          {
            id: 'comp-1',
            standard: 'Standard Commercial NDA Playbook v4',
            status: 'non_compliant',
            finding: 'Violates Policy Section 3.1: NDAs must not include non-competition clauses.',
            referenceQuote: 'Receiving Party covenants and agrees that it shall not... develop, market, license, or sell any competing cloud optimization software'
          },
          {
            id: 'comp-2',
            standard: 'Corporate Risk Governance (Limitation of Liability)',
            status: 'non_compliant',
            finding: 'Violates Rule 7: Uncapped consequential damages are prohibited without Board Audit approval.',
            referenceQuote: 'RECEIVING PARTY\'S INDEMNIFICATION OBLIGATIONS... SHALL BE STRICTLY UNCAPPED'
          },
          {
            id: 'comp-3',
            standard: 'Governing Law Policy',
            status: 'compliant',
            finding: 'Delaware Court of Chancery is an approved corporate litigation venue.',
            referenceQuote: 'governed by and construed strictly in accordance with the substantive laws of the STATE OF DELAWARE'
          }
        ]
      },
      structuredExtraction: {
        keyMetadata: [
          { label: 'Agreement Type', value: 'Mutual Non-Disclosure Agreement (NDA)', confidence: 0.99, category: 'legal' },
          { label: 'Governing Law', value: 'State of Delaware, United States', confidence: 0.98, category: 'legal' },
          { label: 'Dispute Venue', value: 'Delaware Court of Chancery, Wilmington', confidence: 0.97, category: 'legal' },
          { label: 'Agreement Term', value: '2 Years (with Perpetual Survival on Secrets)', confidence: 0.95, category: 'date' },
          { label: 'Liability Cap', value: 'Strictly UNCAPPED (High Risk)', confidence: 0.99, category: 'financial' },
          { label: 'Disclosing Party', value: 'Apex Enterprise Cloud Solutions LLC', confidence: 0.98, category: 'entity' },
          { label: 'Receiving Party', value: 'Counterparty Organization', confidence: 0.96, category: 'entity' },
          { label: 'Non-Compete Duration', value: '24 Months Post-Termination', confidence: 0.99, category: 'administrative' }
        ],
        signatories: [
          { name: 'Marcus Vance', title: 'Senior VP of Legal Affairs (Apex)', dateSigned: '2026-09-30', validity: 'valid' },
          { name: 'Elena Rostova', title: 'Chief Operating Officer', dateSigned: undefined, validity: 'missing' }
        ]
      },
      actionableRecommendations: [
        {
          id: 'act-1',
          priority: 'urgent',
          title: 'Redline and Redact Section 7.1 Non-Compete',
          assignedRole: 'Legal Counsel',
          deadlineSuggestion: 'Prior to signature',
          reason: 'Severe commercial restriction that would impede product engineering and sales.'
        },
        {
          id: 'act-2',
          priority: 'urgent',
          title: 'Cap Indemnification Liability under Section 4.2',
          assignedRole: 'General Counsel / CFO',
          deadlineSuggestion: 'Prior to signature',
          reason: 'Prevent exposure to unlimited consequential and third-party damages.'
        },
        {
          id: 'act-3',
          priority: 'medium',
          title: 'Fill Missing Counterparty Signature Date',
          assignedRole: 'Contract Administrator',
          deadlineSuggestion: 'Upon execution',
          reason: 'Ensure enforceability and clear effective commencement timeline.'
        }
      ]
    }
  },

  // SAMPLE 2: MESSY MULTI-CURRENCY FREIGHT INVOICE
  {
    id: 'doc-sample-inv-logistics',
    name: 'Apex_Global_Logistics_Freight_Inv.png',
    category: 'invoice',
    uploadDate: '2026-09-28T14:22:00Z',
    fileSize: '684 KB',
    fileType: 'image/png',
    mimeType: 'image/jpeg',
    sourceType: 'sample',
    base64Data: typeof window !== 'undefined' ? generateLogisticsInvoicePhoto() : '',
    rawText: `APEX GLOBAL LOGISTICS & FREIGHT B.V.
International Air & Ocean Freight Services · VAT ID: NL882941029B01
Port of Lading: Rotterdam (NLRTM) | Destination: New York JFK (USJFK)

COMMERCIAL FREIGHT INVOICE
Invoice No: AGL-2026-8842-FX
Date: 2026-09-24
Billed To: Meridian Global Tech Inc., 500 Howard Street, San Francisco, CA 94105
Payment Terms: Net 30 Days (Due Date: 2026-10-24)

LINE ITEMS & SERVICES:
1. Air Cargo Express Tier 1 (4,200 kg Heavy Freight) - Qty: 1 Lot - Rate: $5,800.00 USD - Total: $5,800.00
2. Bunker Adjustment & Jet Fuel Surcharge (BAF 18.5%) - Qty: 1 Lot - Rate: $1,073.00 USD - Total: $1,073.00
3. EU Customs Handling & Clearance (EUR 450 @ ECB Fix 1.085) - Qty: 1 Lot - Rate: €450.00 EUR - Total: $488.25
4. Terminal Handling Charge at Origin (THC NLRTM) - Qty: 1 Lot - Rate: $620.00 USD - Total: $620.00
5. Bonded Warehouse Security & Dangerous Goods Inspection - Qty: 2 Pcs - Rate: $219.50 USD - Total: $439.00

FINANCIAL SUMMARY & DISCREPANCY:
Subtotal (Line Items Sum): $8,420.25 USD
Import Tariff / Customs Duty (5.0%): $421.01 USD
Actual Expected Total: $8,841.26 USD
Stated Invoice Billed Total: $9,341.26 USD
[ANOMALY FLAGGED: $500.00 Mathematical Overcharge discrepancy between itemized sum and billed claim]

Payment Remittance: ING Bank Amsterdam · IBAN: NL91INGB0492810291 · SWIFT: INGBNL2A`,
    status: 'processed',
    review: {
      documentId: 'doc-sample-inv-logistics',
      processedAt: '2026-09-28T14:22:15Z',
      processingTimeMs: 1120,
      modelUsed: 'gemini-3.7-flash (DocuMind OCR Engine)',
      documentCategory: 'invoice',
      detectedTitle: 'Apex Global Logistics Air Freight & Multi-Currency Invoice',
      executiveSummary: 'International air cargo invoice for $9,341.26 USD with mixed USD/EUR line items. DocuMind detected a $500.00 mathematical calculation overcharge between the itemized subtotal ($8,420.25 + $421.01 tariff = $8,841.26) and the stated total ($9,341.26).',
      overallSentimentOrPosture: 'cautious',
      overallRiskLevel: 'high',
      overallComplianceStatus: 'partial',
      keyInsights: [
        {
          id: 'insight-inv-1',
          topic: '$500.00 Calculation Discrepancy',
          insight: 'Itemized lines sum to $8,420.25 + $421.01 duty ($8,841.26), but vendor billed $9,341.26 ($500.00 overcharge).',
          impact: 'critical'
        },
        {
          id: 'insight-inv-2',
          topic: 'Multi-Currency Conversion Rate Verified',
          insight: 'Line 3 EU Customs Fee (€450.00) properly converted at EUR/USD 1.085 to $488.25 USD.',
          impact: 'operational'
        }
      ],
      riskAssessment: {
        overallSummary: 'Financial anomaly flagged: The billed invoice total exceeds the mathematical sum of line items by $500.00 USD.',
        scoreOutOf100: 68,
        risks: [
          {
            id: 'risk-inv-1',
            severity: 'high',
            title: 'Invoice Arithmetic Overcharge Anomaly',
            description: 'The sum of all 5 line items and 5% tariff is $8,841.26. The invoice requests $9,341.26, representing a $500.00 overcharge.',
            clauseLocation: 'Financial Summary (Lines 15-20)',
            recommendedMitigation: 'Withhold payment and request an amended credit memo for $500.00 from Apex Global Logistics billing.'
          }
        ]
      },
      complianceAudit: {
        summary: 'Accounts payable 3-way match failed due to pricing variance.',
        items: [
          {
            id: 'comp-inv-1',
            standard: 'AP 3-Way Math Verification Rule',
            status: 'non_compliant',
            finding: 'Total billed does not equal sum of approved rate card lines.',
            referenceQuote: 'Actual Expected Total: $8,841.26 USD vs Stated Invoice Billed Total: $9,341.26 USD'
          },
          {
            id: 'comp-inv-2',
            standard: 'Cross-Border VAT / Tax Compliance',
            status: 'compliant',
            finding: 'Valid Dutch VAT ID NL882941029B01 and port clearance certificates present.',
            referenceQuote: 'VAT ID: NL882941029B01'
          }
        ]
      },
      structuredExtraction: {
        keyMetadata: [
          { label: 'Invoice Number', value: 'AGL-2026-8842-FX', confidence: 0.99, category: 'administrative' },
          { label: 'Vendor Name', value: 'Apex Global Logistics & Freight B.V.', confidence: 0.98, category: 'entity' },
          { label: 'Total Billed', value: '$9,341.26 USD', confidence: 0.99, category: 'financial' },
          { label: 'Calculated Sum', value: '$8,841.26 USD', confidence: 0.99, category: 'financial' },
          { label: 'Variance / Discrepancy', value: '+$500.00 (Overcharge Alert)', confidence: 0.98, category: 'financial' },
          { label: 'Invoice Date', value: '2026-09-24', confidence: 0.97, category: 'date' },
          { label: 'Payment Due Date', value: '2026-10-24 (Net 30)', confidence: 0.96, category: 'date' },
          { label: 'Remittance IBAN', value: 'NL91INGB0492810291', confidence: 0.98, category: 'financial' }
        ],
        lineItems: [
          { id: 'li-1', itemNumber: '01', description: 'Air Cargo Express Tier 1 (4,200 kg Heavy Freight)', quantity: 1, unitPrice: 5800.00, total: 5800.00, category: 'Freight', flag: 'Verified' },
          { id: 'li-2', itemNumber: '02', description: 'Bunker Adjustment & Jet Fuel Surcharge (BAF 18.5%)', quantity: 1, unitPrice: 1073.00, total: 1073.00, category: 'Fuel Surcharge', flag: 'Verified' },
          { id: 'li-3', itemNumber: '03', description: 'EU Customs Handling & Clearance (€450 @ 1.085)', quantity: 1, unitPrice: 488.25, total: 488.25, category: 'Customs', flag: 'Multi-Currency EUR' },
          { id: 'li-4', itemNumber: '04', description: 'Terminal Handling Charge at Origin (THC NLRTM)', quantity: 1, unitPrice: 620.00, total: 620.00, category: 'Handling', flag: 'Verified' },
          { id: 'li-5', itemNumber: '05', description: 'Bonded Warehouse Security & Dangerous Goods Inspection', quantity: 2, unitPrice: 219.50, total: 439.00, category: 'Inspection', flag: 'Verified' }
        ]
      },
      actionableRecommendations: [
        {
          id: 'act-inv-1',
          priority: 'urgent',
          title: 'Issue Billing Discrepancy Notice for $500.00',
          assignedRole: 'AP Specialist',
          deadlineSuggestion: 'Within 48 hours',
          reason: 'Correct the $500 mathematical discrepancy before issuing wire transfer.'
        }
      ]
    }
  },

  // SAMPLE 3: COMPLEX FINANCIAL STATEMENT WITH BALANCE TABLES
  {
    id: 'doc-sample-rep-financials',
    name: 'CloudScale_Q3_GAAP_Financial_Statement.pdf',
    category: 'report',
    uploadDate: '2026-09-25T11:00:00Z',
    fileSize: '820 KB',
    fileType: 'application/pdf',
    sourceType: 'sample',
    pageCount: 4,
    rawText: `CLOUDSCALE ENTERPRISE SYSTEMS, INC.
CONDENSED CONSOLIDATED STATEMENTS OF OPERATIONS AND BALANCE SHEET
For the Three and Nine Months Ended September 30, 2026
(In Thousands of USD, Except Per Share Data · Unaudited)

EXECUTIVE FINANCIAL OVERVIEW:
Total revenue for Q3 2026 reached $142,850 thousand, representing a 28.4% year-over-year expansion driven by enterprise subscription ARR growth of 34.1%. GAAP Operating Income was $24,190 thousand compared to $15,820 thousand in Q3 2025. Non-GAAP Adjusted EBITDA stood at $38,420 thousand (26.9% margin).

CONSOLIDATED STATEMENT OF OPERATIONS:
Revenue:
- Subscription Software & Cloud Services: $122,400
- Professional Implementation & Advisory: $20,450
Total Revenue: $142,850

Cost of Revenue:
- Cost of Subscription Software: $26,928
- Cost of Professional Services: $16,360
Total Cost of Revenue: $43,288
Gross Profit: $99,562 (69.7% Gross Margin)

Operating Expenses:
- Research & Development (R&D): $34,280
- Sales & Marketing (S&M): $28,950
- General & Administrative (G&A): $12,142
Total Operating Expenses: $75,372
Income from Operations (GAAP): $24,190

Other Income / (Expense):
- Interest Income on Cash Reserves: $1,420
- Foreign Exchange Currency Gain: $310
Income Before Income Taxes: $25,920
Provision for Income Taxes (18.5% Effective Rate): $4,795
Net Income (GAAP): $21,125

NON-GAAP RECONCILIATION:
- Stock-Based Compensation Expense: $11,850
- Amortization of Acquired Intangible Assets: $2,380
Non-GAAP Net Income: $35,355
Non-GAAP Adjusted EBITDA: $38,420

CONSOLIDATED BALANCE SHEET SUMMARY (As of September 30, 2026):
ASSETS:
- Cash, Cash Equivalents & Short-Term Treasuries: $184,500
- Accounts Receivable (Net of Allowances): $48,200
- Prepaid Expenses & Current Assets: $12,650
Total Current Assets: $245,350
- Property, Equipment & Data Center Assets: $38,900
- Operating Lease Right-of-Use Assets: $24,100
- Goodwill & Intangibles: $92,400
TOTAL ASSETS: $400,750

LIABILITIES & STOCKHOLDERS' EQUITY:
- Accounts Payable & Accrued Expenses: $22,400
- Current Deferred Revenue (Unearned ARR): $74,800
Total Current Liabilities: $97,200
- Long-Term Debt (Convertible Senior Notes due 2029): $65,000
- Non-Current Deferred Revenue: $18,400
Total Liabilities: $180,600
Total Stockholders' Equity: $220,150
TOTAL LIABILITIES & EQUITY: $400,750

AUDIT SIGN-OFF & CERTIFICATION:
In our opinion, the condensed consolidated financial statements present fairly, in all material respects, the financial position of CloudScale Enterprise Systems, Inc. as of September 30, 2026, in conformity with U.S. GAAP.

Certified by:
/s/ Robert Chen, Chief Financial Officer
/s/ Amanda Sterling, VP of Global Corporate Controller`,
    status: 'processed',
    review: {
      documentId: 'doc-sample-rep-financials',
      processedAt: '2026-09-25T11:00:20Z',
      processingTimeMs: 1650,
      modelUsed: 'gemini-3.7-flash (DocuMind GAAP Engine)',
      documentCategory: 'report',
      detectedTitle: 'CloudScale Q3 Consolidated GAAP Financial Statement & Balance Sheet',
      executiveSummary: 'Robust Q3 performance with $142.85M revenue (+28.4% YoY), $99.56M gross profit (69.7% margin), and $21.12M GAAP net income. Non-GAAP Adjusted EBITDA reached $38.42M (26.9% margin). The balance sheet maintains strong liquidity with $184.5M in cash/treasuries and zero near-term credit line draws.',
      overallSentimentOrPosture: 'favorable',
      overallRiskLevel: 'low',
      overallComplianceStatus: 'compliant',
      keyInsights: [
        {
          id: 'ins-rep-1',
          topic: 'High-Margin Subscription Growth',
          insight: 'Subscription revenue grew 34.1% YoY to $122.4M, now representing 85.7% of total revenue.',
          impact: 'strategic'
        },
        {
          id: 'ins-rep-2',
          topic: 'Substantial Deferred Revenue Pipeline',
          insight: 'Total deferred revenue of $93.2M ($74.8M current + $18.4M non-current) provides high forward visibility.',
          impact: 'strategic'
        },
        {
          id: 'ins-rep-3',
          topic: 'Healthy Cash Runway',
          insight: 'Cash and short-term treasuries of $184.5M vs $65M convertible notes due 2029 indicates strong solvency.',
          impact: 'operational'
        }
      ],
      riskAssessment: {
        overallSummary: 'Financial posture is healthy with strong liquidity, positive operating cash flow, and GAAP compliance.',
        scoreOutOf100: 12,
        risks: []
      },
      complianceAudit: {
        summary: 'All financial presentation items adhere strictly to U.S. GAAP and ASC 606 revenue recognition standards.',
        items: [
          {
            id: 'comp-rep-1',
            standard: 'U.S. GAAP (ASC 606 Revenue Recognition)',
            status: 'compliant',
            finding: 'Subscription contracts and multi-element arrangements properly amortized over performance periods.',
            referenceQuote: 'Current Deferred Revenue (Unearned ARR): $74,800'
          },
          {
            id: 'comp-rep-2',
            standard: 'SEC Regulation G (Non-GAAP Reconciliation)',
            status: 'compliant',
            finding: 'Clear reconciliation provided from GAAP Net Income ($21.12M) to Adjusted EBITDA ($38.42M).',
            referenceQuote: 'Stock-Based Compensation Expense: $11,850 ... Non-GAAP Adjusted EBITDA: $38,420'
          }
        ]
      },
      structuredExtraction: {
        keyMetadata: [
          { label: 'Period Covered', value: 'Q3 2026 (Three Months Ended Sep 30, 2026)', confidence: 0.99, category: 'date' },
          { label: 'Total Revenue', value: '$142,850,000 USD (+28.4% YoY)', confidence: 0.99, category: 'financial' },
          { label: 'Gross Profit (Margin)', value: '$99,562,000 USD (69.7%)', confidence: 0.98, category: 'financial' },
          { label: 'GAAP Operating Income', value: '$24,190,000 USD', confidence: 0.99, category: 'financial' },
          { label: 'GAAP Net Income', value: '$21,125,000 USD', confidence: 0.99, category: 'financial' },
          { label: 'Non-GAAP Adjusted EBITDA', value: '$38,420,000 USD (26.9%)', confidence: 0.98, category: 'financial' },
          { label: 'Cash & Short-Term Treasuries', value: '$184,500,000 USD', confidence: 0.99, category: 'financial' },
          { label: 'Total Deferred Revenue', value: '$93,200,000 USD', confidence: 0.97, category: 'financial' }
        ],
        signatories: [
          { name: 'Robert Chen', title: 'Chief Financial Officer', dateSigned: '2026-09-30', validity: 'valid' },
          { name: 'Amanda Sterling', title: 'VP of Global Corporate Controller', dateSigned: '2026-09-30', validity: 'valid' }
        ]
      },
      actionableRecommendations: [
        {
          id: 'act-rep-1',
          priority: 'routine',
          title: 'Export Q3 Dossier for Board of Directors Review',
          assignedRole: 'FP&A Director',
          deadlineSuggestion: 'By Oct 5, 2026',
          reason: 'Prepare quarterly investor relations and board deck executive summary.'
        }
      ]
    }
  }
];
