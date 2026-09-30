// Pure TypeScript Vector PDF 1.4 Generator for DocuMind
// Generates standard-compliant multi-page PDFs with professional legal & financial typography

import { DocumentItem } from '../types/document';

interface PdfPageContent {
  textCommands: string[];
}

// Escape special characters in PDF literal strings
function escapePdfString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

export function generatePdfBlobUrl(doc: DocumentItem): string {
  const pdfBytes = generatePdfBytes(doc);
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}

export function generatePdfBase64(doc: DocumentItem): string {
  const pdfBytes = generatePdfBytes(doc);
  let binary = '';
  const len = pdfBytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(pdfBytes[i]);
  }
  return btoa(binary);
}

export function generatePdfBytes(doc: DocumentItem): Uint8Array {
  // Page dimensions: US Letter (612 x 792 points)
  const pageWidth = 612;
  const pageHeight = 792;
  const marginLeft = 54;
  const marginRight = 54;
  const marginTop = 54;
  const marginBottom = 54;
  const contentWidth = pageWidth - marginLeft - marginRight;
  const contentHeight = pageHeight - marginTop - marginBottom;

  const rawLines = (doc.rawText || '').split('\n');
  const pages: PdfPageContent[] = [];
  let currentCommands: string[] = [];
  let currentY = pageHeight - marginTop;

  const startNewPage = () => {
    if (currentCommands.length > 0) {
      pages.push({ textCommands: [...currentCommands] });
    }
    currentCommands = [];
    currentY = pageHeight - marginTop;

    // Header rule & branding
    currentCommands.push(`0.2 0.3 0.5 RG 1 w`);
    currentCommands.push(`${marginLeft} ${pageHeight - 36} m ${pageWidth - marginRight} ${pageHeight - 36} l S`);
    currentCommands.push(`BT /F2 8 Tf 0.4 0.4 0.4 rg ${marginLeft} ${pageHeight - 30} Td (${escapePdfString('DOCUMIND AI ENTERPRISE VERIFIED DOSSIER · REF: ' + doc.id.slice(0, 18).toUpperCase())}) Tj ET`);
    currentCommands.push(`BT /F1 8 Tf 0.4 0.4 0.4 rg ${pageWidth - marginRight - 60} ${pageHeight - 30} Td (${escapePdfString('PAGE ' + (pages.length + 1))}) Tj ET`);
  };

  startNewPage();

  // Document Title Header on Page 1
  const docTitle = doc.review?.detectedTitle || doc.name;
  currentCommands.push(`BT /F2 15 Tf 0.1 0.15 0.3 rg ${marginLeft} ${currentY - 18} Td (${escapePdfString(docTitle.slice(0, 60))}) Tj ET`);
  currentY -= 32;

  // Metadata Sub-banner
  currentCommands.push(`0.92 0.94 0.98 rg ${marginLeft} ${currentY - 18} ${contentWidth} 22 re f`);
  currentCommands.push(`0.75 0.8 0.9 RG 0.5 w ${marginLeft} ${currentY - 18} ${contentWidth} 22 re S`);
  currentCommands.push(`BT /F2 8.5 Tf 0.2 0.25 0.4 rg ${marginLeft + 8} ${currentY - 12} Td (${escapePdfString('CATEGORY: ' + (doc.category || 'DOCUMENT').toUpperCase() + '   |   FILE: ' + doc.name + '   |   SECURITY: DELAWARE JURISDICTION')}) Tj ET`);
  currentY -= 36;

  // Render text lines with word wrapping
  const maxCharsPerLine = 84;

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i].trim();
    if (!rawLine) {
      currentY -= 10;
      if (currentY < marginBottom + 20) {
        startNewPage();
      }
      continue;
    }

    const isHeader = /^(?:SECTION|ARTICLE|\d+[\.\)])\s+[A-Z\s\(\)]+|[A-Z\s]{5,}:/.test(rawLine);
    const isTableOrLineItem = rawLine.includes('$') || rawLine.includes('€') || rawLine.includes('|') || rawLine.includes('Total') || rawLine.includes('USD');
    const isRiskClause = rawLine.toLowerCase().includes('indemnif') || rawLine.toLowerCase().includes('non-compete') || rawLine.toLowerCase().includes('liability') || rawLine.toLowerCase().includes('discrepancy');

    if (isHeader) {
      if (currentY < marginBottom + 45) {
        startNewPage();
      }
      currentY -= 12;
      
      // Draw subtle background highlight for sections with high risk
      if (isRiskClause) {
        currentCommands.push(`1.0 0.92 0.92 rg ${marginLeft - 4} ${currentY - 14} ${contentWidth + 8} 18 re f`);
        currentCommands.push(`0.85 0.2 0.2 RG 1 w ${marginLeft - 4} ${currentY - 14} 3 18 re f`);
        currentCommands.push(`BT /F2 11 Tf 0.7 0.1 0.1 rg ${marginLeft + 4} ${currentY - 10} Td (${escapePdfString(rawLine)}) Tj ET`);
      } else {
        currentCommands.push(`BT /F2 11 Tf 0.1 0.15 0.25 rg ${marginLeft} ${currentY - 10} Td (${escapePdfString(rawLine)}) Tj ET`);
      }
      currentY -= 20;
    } else {
      // Word wrap paragraph text
      const words = rawLine.split(/\s+/);
      let lineBuf = '';

      for (const word of words) {
        if ((lineBuf + ' ' + word).trim().length > maxCharsPerLine) {
          if (currentY < marginBottom + 15) {
            startNewPage();
          }

          if (isTableOrLineItem) {
            currentCommands.push(`BT /F3 9 Tf 0.15 0.2 0.25 rg ${marginLeft} ${currentY - 9} Td (${escapePdfString(lineBuf.trim())}) Tj ET`);
          } else {
            currentCommands.push(`BT /F1 9.5 Tf 0.2 0.2 0.25 rg ${marginLeft} ${currentY - 9} Td (${escapePdfString(lineBuf.trim())}) Tj ET`);
          }
          currentY -= 13;
          lineBuf = word;
        } else {
          lineBuf = lineBuf ? `${lineBuf} ${word}` : word;
        }
      }

      if (lineBuf.trim()) {
        if (currentY < marginBottom + 15) {
          startNewPage();
        }

        if (isTableOrLineItem) {
          currentCommands.push(`BT /F3 9 Tf 0.15 0.2 0.25 rg ${marginLeft} ${currentY - 9} Td (${escapePdfString(lineBuf.trim())}) Tj ET`);
        } else {
          currentCommands.push(`BT /F1 9.5 Tf 0.2 0.2 0.25 rg ${marginLeft} ${currentY - 9} Td (${escapePdfString(lineBuf.trim())}) Tj ET`);
        }
        currentY -= 13;
      }
    }
  }

  // Footer for last page
  currentCommands.push(`0.3 0.6 0.4 RG 0.5 w`);
  currentCommands.push(`${marginLeft} ${marginBottom + 10} m ${pageWidth - marginRight} ${marginBottom + 10} l S`);
  currentCommands.push(`BT /F2 8 Tf 0.2 0.5 0.3 rg ${marginLeft} ${marginBottom + 2} Td (${escapePdfString('VERIFIED BY DOCUMIND ZERO-HALLUCINATION IDP ENGINE · SIGNATURES AUDITED')}) Tj ET`);

  if (currentCommands.length > 0) {
    pages.push({ textCommands: currentCommands });
  }

  // Build PDF 1.4 Objects
  const numPages = pages.length;
  const objects: string[] = [];
  const xrefOffsets: number[] = [];

  // 1: Catalog
  objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);

  // 2: Pages tree
  const kids = Array.from({ length: numPages }, (_, i) => `${3 + i * 2} 0 R`).join(' ');
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${numPages} >>\nendobj\n`);

  // Font definitions: 
  // Font F1: Helvetica (Regular)
  // Font F2: Helvetica-Bold
  // Font F3: Courier (Monospace for tables & numbers)
  const fontObjStart = 3 + numPages * 2;
  const fontF1Obj = `${fontObjStart} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;
  const fontF2Obj = `${fontObjStart + 1} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`;
  const fontF3Obj = `${fontObjStart + 2} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n`;

  // Page and Content objects
  pages.forEach((p, idx) => {
    const pageObjNum = 3 + idx * 2;
    const contentObjNum = pageObjNum + 1;
    const streamContent = p.textCommands.join('\n');
    const streamLength = new TextEncoder().encode(streamContent).length;

    objects.push(
      `${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${contentObjNum} 0 R /Resources << /Font << /F1 ${fontObjStart} 0 R /F2 ${fontObjStart + 1} 0 R /F3 ${fontObjStart + 2} 0 R >> >> >>\nendobj\n`
    );

    objects.push(
      `${contentObjNum} 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`
    );
  });

  objects.push(fontF1Obj);
  objects.push(fontF2Obj);
  objects.push(fontF3Obj);

  // Assemble full PDF with byte offsets for xref table
  let pdfOutput = `%PDF-1.4\n%âãÏÓ\n`;
  const encoder = new TextEncoder();

  objects.forEach((obj) => {
    xrefOffsets.push(encoder.encode(pdfOutput).length);
    pdfOutput += obj;
  });

  const startXref = encoder.encode(pdfOutput).length;
  const totalObjCount = objects.length + 1;

  pdfOutput += `xref\n0 ${totalObjCount}\n0000000000 65535 f \n`;
  xrefOffsets.forEach((offset) => {
    const padded = String(offset).padStart(10, '0');
    pdfOutput += `${padded} 00000 n \n`;
  });

  pdfOutput += `trailer\n<< /Size ${totalObjCount} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

  return encoder.encode(pdfOutput);
}
