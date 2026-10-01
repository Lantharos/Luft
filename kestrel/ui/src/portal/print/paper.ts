export interface Paper {
  readonly keyword: string;
  readonly name: string;
  readonly width: number;
  readonly height: number;
}

const SELF_DESCRIBING = /^([a-z0-9]+_[a-z0-9.-]+)_(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)(mm|in)$/;
const MM_PER_INCH = 25.4;
const SIZE_TOLERANCE_MM = 1;

const NAMES: Record<string, string> = {
  iso_a3: 'A3',
  iso_a4: 'A4',
  iso_a5: 'A5',
  iso_a6: 'A6',
  iso_b4: 'B4',
  iso_b5: 'B5',
  jis_b4: 'B4 (JIS)',
  jis_b5: 'B5 (JIS)',
  na_letter: 'Letter',
  na_legal: 'Legal',
  na_executive: 'Executive',
  na_ledger: 'Tabloid',
  na_invoice: 'Statement',
  'na_number-10': 'Envelope #10',
  na_monarch: 'Envelope Monarch',
  iso_dl: 'Envelope DL',
  iso_c5: 'Envelope C5',
  iso_c6: 'Envelope C6',
};

function dimension(value: number): string {
  return String(Math.round(value * 10) / 10);
}

export function paper(keyword: string): Paper | null {
  const match = SELF_DESCRIBING.exec(keyword);
  if (!match) return null;
  const [, base, width, height, unit] = match;
  const scale = unit === 'in' ? MM_PER_INCH : 1;
  return {
    keyword,
    name: NAMES[base] ?? `${dimension(Number(width))} × ${dimension(Number(height))} ${unit}`,
    width: Number(width) * scale,
    height: Number(height) * scale,
  };
}

export function sizeLabel({ width, height, keyword }: Paper): string {
  return keyword.endsWith('in')
    ? `${dimension(width / MM_PER_INCH)} × ${dimension(height / MM_PER_INCH)} in`
    : `${Math.round(width)} × ${Math.round(height)} mm`;
}

export function papers(keywords: string[]): Paper[] {
  return keywords.map(paper).filter((found): found is Paper => found !== null);
}

export function matching(available: Paper[], width: number, height: number): Paper | undefined {
  const [short, long] = [Math.min(width, height), Math.max(width, height)];
  return available.find(candidate => Math.abs(Math.min(candidate.width, candidate.height) - short) <= SIZE_TOLERANCE_MM
    && Math.abs(Math.max(candidate.width, candidate.height) - long) <= SIZE_TOLERANCE_MM);
}
