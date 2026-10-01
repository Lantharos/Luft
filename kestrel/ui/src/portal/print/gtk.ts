import GLib from 'gi://GLib';

import { option, type Options } from '../core/request.js';
import { COLOR, LONG_EDGE, MONOCHROME, ONE_SIDED, SHORT_EDGE, parseRanges, type Choices, type PageChoice, type Preferences } from './choices.js';

const DUPLEX: Record<string, string> = { simplex: ONE_SIDED, vertical: LONG_EDGE, horizontal: SHORT_EDGE };
const PAGE_CHOICES = new Set(['all', 'current', 'selection', 'ranges']);
const REPLACED_SETTINGS = new Set(['output-uri', 'page-ranges']);

function displayRanges(gtk: string): string {
  return gtk.split(',').map(range => range.split('-').map(page => Number(page) + 1).join('-')).join(', ');
}

function gtkRanges(ranges: [number, number][]): string {
  return ranges.map(([start, end]) => start === end ? `${start - 1}` : `${start - 1}-${end - 1}`).join(',');
}

function string(value: string): GLib.Variant {
  return new GLib.Variant('s', value);
}

function double(value: number): GLib.Variant {
  return new GLib.Variant('d', value);
}

export function gtkPreferences(settings: Options, pageSetup: Options): Preferences {
  const setting = (key: string) => option<string>(settings, key);
  const width = option<number>(pageSetup, 'Width');
  const height = option<number>(pageSetup, 'Height');
  const pages = setting('print-pages');
  const ranges = setting('page-ranges');
  const collate = setting('collate');
  const color = setting('use-color');
  return {
    printer: setting('printer'),
    copies: Number(setting('n-copies')) || undefined,
    collate: collate === undefined ? undefined : collate.toLowerCase() === 'true',
    pages: pages && PAGE_CHOICES.has(pages) ? pages as PageChoice : undefined,
    ranges: ranges ? displayRanges(ranges) : undefined,
    size: width && height ? [width, height] : undefined,
    orientation: (option<string>(pageSetup, 'Orientation') ?? setting('orientation'))?.endsWith('landscape') ? 'landscape' : 'portrait',
    sides: DUPLEX[setting('duplex') ?? ''],
    colorMode: color === undefined ? undefined : color.toLowerCase() === 'true' ? COLOR : MONOCHROME,
  };
}

export function gtkSettings(choices: Choices, settings: Options): GLib.Variant {
  const updated: Options = {
    ...Object.fromEntries(Object.entries(settings).filter(([key]) => !REPLACED_SETTINGS.has(key))),
    printer: string(choices.printer.name),
    'n-copies': string(String(choices.copies)),
    collate: string(String(choices.collate)),
    'print-pages': string(choices.pages),
    orientation: string(choices.orientation),
    'output-file-format': string('pdf'),
  };
  const ranges = choices.pages === 'ranges' && parseRanges(choices.ranges);
  if (ranges) updated['page-ranges'] = string(gtkRanges(ranges));
  const duplex = Object.keys(DUPLEX).find(key => DUPLEX[key] === choices.sides);
  if (duplex) updated.duplex = string(duplex);
  if (choices.colorMode) updated['use-color'] = string(String(choices.colorMode === COLOR));
  if (choices.paper) {
    updated['paper-format'] = string(choices.paper.keyword);
    updated['paper-width'] = string(String(choices.paper.width));
    updated['paper-height'] = string(String(choices.paper.height));
  }
  return new GLib.Variant('a{sv}', updated);
}

export function gtkPageSetup(choices: Choices, pageSetup: Options): GLib.Variant {
  const updated: Options = { ...pageSetup, Orientation: string(choices.orientation) };
  if (choices.paper) {
    delete updated.PPDName;
    Object.assign(updated, {
      Name: string(choices.paper.keyword),
      DisplayName: string(choices.paper.name),
      Width: double(choices.paper.width),
      Height: double(choices.paper.height),
    });
  }
  return new GLib.Variant('a{sv}', updated);
}
