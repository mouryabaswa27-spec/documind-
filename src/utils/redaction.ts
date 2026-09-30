// Client-side Sensitive Data Detection and Redaction Shield

export interface RedactionRule {
  id: string;
  name: string;
  pattern: RegExp;
  mask: string;
  category: 'pii' | 'financial' | 'contact' | 'custom';
}

export const DEFAULT_REDACTION_RULES: RedactionRule[] = [
  {
    id: 'ssn',
    name: 'Social Security Number (SSN)',
    pattern: /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g,
    mask: '███-██-████',
    category: 'pii'
  },
  {
    id: 'credit_card',
    name: 'Credit Card / Bank Account',
    pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b|\b\d{4}\s?\d{6}\s?\d{5}\b|\b(?:\*{4}[-\s]?){3}\d{4}\b/g,
    mask: '████-████-████-████',
    category: 'financial'
  },
  {
    id: 'email',
    name: 'Personal Email Address',
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    mask: '████████@████.com',
    category: 'contact'
  },
  {
    id: 'phone',
    name: 'Phone Number',
    pattern: /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    mask: '(███) ███-████',
    category: 'contact'
  },
  {
    id: 'iban',
    name: 'Bank IBAN / Wire Code',
    pattern: /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g,
    mask: '████████████████',
    category: 'financial'
  }
];

export function redactText(
  text: string, 
  rules: RedactionRule[] = DEFAULT_REDACTION_RULES,
  customTerms: string[] = []
): { redactedText: string; matchCount: number } {
  if (!text) return { redactedText: '', matchCount: 0 };
  
  let result = text;
  let count = 0;

  // Apply default pattern rules
  rules.forEach(rule => {
    const matches = result.match(rule.pattern);
    if (matches) {
      count += matches.length;
      result = result.replace(rule.pattern, rule.mask);
    }
  });

  // Apply custom keywords if any
  customTerms.forEach(term => {
    if (!term.trim()) return;
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    const matches = result.match(regex);
    if (matches) {
      count += matches.length;
      result = result.replace(regex, '█'.repeat(term.length));
    }
  });

  return { redactedText: result, matchCount: count };
}
