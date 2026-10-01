import { matching, paper, papers, type Paper } from './paper.js';
import type { JobOptions, Printer } from './printers.js';

export type PageChoice = 'all' | 'current' | 'selection' | 'ranges';
export type Orientation = 'portrait' | 'landscape';

export const ONE_SIDED = 'one-sided';
export const LONG_EDGE = 'two-sided-long-edge';
export const SHORT_EDGE = 'two-sided-short-edge';
export const COLOR = 'color';
export const MONOCHROME = 'monochrome';

export interface Choices {
  printer: Printer;
  copies: number;
  collate: boolean;
  pages: PageChoice;
  ranges: string;
  paper: Paper | null;
  orientation: Orientation;
  sides: string;
  colorMode: string;
}

export interface Preferences {
  printer?: string;
  copies?: number;
  collate?: boolean;
  pages?: PageChoice;
  ranges?: string;
  size?: [width: number, height: number];
  orientation?: Orientation;
  sides?: string;
  colorMode?: string;
}

const RANGE = /^(\d+)(?:\s*[-–]\s*(\d+))?$/;

function preferred(offered: string[], ...wanted: (string | undefined)[]): string {
  return wanted.find(value => value !== undefined && offered.includes(value)) ?? offered[0] ?? '';
}

export function sidesOffered(printer: Printer): string[] {
  return [ONE_SIDED, LONG_EDGE, SHORT_EDGE].filter(sides => printer.sides.includes(sides));
}

export function colorModesOffered(printer: Printer): string[] {
  return [COLOR, MONOCHROME].filter(mode => printer.colorModes.includes(mode));
}

export function parseRanges(text: string): [number, number][] | null {
  const ranges: [number, number][] = [];
  for (const part of text.split(',').map(part => part.trim()).filter(Boolean)) {
    const match = RANGE.exec(part);
    const start = Number(match?.[1]);
    const end = Number(match?.[2] ?? match?.[1]);
    if (!match || start < 1 || end < start) return null;
    ranges.push([start, end]);
  }
  return ranges.length ? ranges : null;
}

export function defaultPrinter(printers: Printer[], wanted?: string): Printer {
  return printers.find(printer => printer.name === wanted) ?? printers.find(printer => printer.isDefault) ?? printers[0];
}

export function forPrinter(printer: Printer, wanted: Preferences, pageChoices: PageChoice[]): Choices {
  const available = papers(printer.media);
  const size = wanted.size && matching(available, ...wanted.size);
  return {
    printer,
    copies: Math.min(Math.max(wanted.copies ?? 1, 1), printer.maxCopies),
    collate: wanted.collate ?? true,
    pages: pageChoices.find(choice => choice === wanted.pages) ?? 'all',
    ranges: wanted.ranges ?? '',
    paper: size ?? paper(printer.mediaDefault) ?? available[0] ?? null,
    orientation: wanted.orientation ?? 'portrait',
    sides: preferred(sidesOffered(printer), wanted.sides, printer.sidesDefault),
    colorMode: preferred(colorModesOffered(printer), wanted.colorMode, printer.colorModeDefault),
  };
}

export function jobOptions(choices: Choices, rangesApplied: boolean): JobOptions {
  return {
    copies: choices.copies,
    collate: choices.collate,
    sides: choices.sides,
    colorMode: choices.colorMode,
    media: choices.paper?.keyword ?? '',
    pageRanges: !rangesApplied && choices.pages === 'ranges' ? parseRanges(choices.ranges) ?? undefined : undefined,
  };
}

export function ready(choices: Choices): boolean {
  return choices.printer.accepting && (choices.pages !== 'ranges' || parseRanges(choices.ranges) !== null);
}
