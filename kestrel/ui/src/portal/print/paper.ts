import { formatsLocale, t } from '../../shared/i18n/index.js';

export interface Paper {
  readonly keyword: string;
  readonly name: string;
  readonly width: number;
  readonly height: number;
}

type Unit = 'mm' | 'in';

const SELF_DESCRIBING = /^([a-z0-9]+_[a-z0-9.-]+)_(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)(mm|in)$/;
const MM_PER_INCH = 25.4;
const SIZE_TOLERANCE_MM = 1;
const INTL_UNITS = { mm: 'millimeter', in: 'inch' } as const;

const CODES: Record<string, string> = {
  iso_a3: 'A3',
  iso_a4: 'A4',
  iso_a5: 'A5',
  iso_a6: 'A6',
  iso_b4: 'B4',
  iso_b5: 'B5',
  jis_b4: 'B4 (JIS)',
  jis_b5: 'B5 (JIS)',
};

const NAMED: Record<string, string> = {
  na_letter: 'print-paper-letter',
  na_legal: 'print-paper-legal',
  na_executive: 'print-paper-executive',
  na_ledger: 'print-paper-tabloid',
  na_invoice: 'print-paper-statement',
};

const ENVELOPES: Record<string, string> = {
  'na_number-10': '#10',
  na_monarch: 'Monarch',
  iso_dl: 'DL',
  iso_c5: 'C5',
  iso_c6: 'C6',
};

function dimensions(width: number, height: number, unit: Unit): string {
  const locale = formatsLocale();
  const plain = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const measured = new Intl.NumberFormat(locale, { maximumFractionDigits: 1, style: 'unit', unit: INTL_UNITS[unit] });
  return t('print-paper-dimensions', { width: plain.format(width), height: measured.format(height) });
}

function paperName(base: string, width: number, height: number, unit: Unit): string {
  if (ENVELOPES[base]) return t('print-paper-envelope', { size: ENVELOPES[base] });
  if (NAMED[base]) return t(NAMED[base]);
  return CODES[base] ?? dimensions(width, height, unit);
}

export function paper(keyword: string): Paper | null {
  const match = SELF_DESCRIBING.exec(keyword);
  if (!match) return null;
  const [, base, width, height, unit] = match;
  const scale = unit === 'in' ? MM_PER_INCH : 1;
  return {
    keyword,
    name: paperName(base, Number(width), Number(height), unit as Unit),
    width: Number(width) * scale,
    height: Number(height) * scale,
  };
}

export function sizeLabel({ width, height, keyword }: Paper): string {
  return keyword.endsWith('in')
    ? dimensions(width / MM_PER_INCH, height / MM_PER_INCH, 'in')
    : dimensions(Math.round(width), Math.round(height), 'mm');
}

export function papers(keywords: string[]): Paper[] {
  return keywords.map(paper).filter((found): found is Paper => found !== null);
}

export function matching(available: Paper[], width: number, height: number): Paper | undefined {
  const [short, long] = [Math.min(width, height), Math.max(width, height)];
  return available.find(candidate => Math.abs(Math.min(candidate.width, candidate.height) - short) <= SIZE_TOLERANCE_MM
    && Math.abs(Math.max(candidate.width, candidate.height) - long) <= SIZE_TOLERANCE_MM);
}
