import GLib from 'gi://GLib';

import type { Options } from '../../core/request.js';
import type { Choices, Orientation, PageChoice, Preferences } from './choices.js';

export interface Wanted {
  printer?: string;
  copies?: number;
  collate?: boolean;
  pages?: PageChoice;
  ranges?: string;
  size?: [width: number, height: number];
  orientation?: Orientation;
  sides?: string;
  'color-mode'?: string;
}

export function preferences({ 'color-mode': colorMode, ...wanted }: Wanted): Preferences {
  return { ...wanted, colorMode };
}

export function chosen(choices: Choices): Options {
  const { printer, copies, collate, pages, ranges, orientation, sides, colorMode, paper } = choices;
  const string = (value: string) => new GLib.Variant('s', value);
  const values: Options = {
    printer: string(printer.name),
    copies: new GLib.Variant('i', copies),
    collate: new GLib.Variant('b', collate),
    pages: string(pages),
    ranges: string(ranges),
    orientation: string(orientation),
    sides: string(sides),
    'color-mode': string(colorMode),
  };
  if (paper) {
    Object.assign(values, {
      paper: string(paper.keyword),
      'paper-name': string(paper.name),
      'paper-width': new GLib.Variant('d', paper.width),
      'paper-height': new GLib.Variant('d', paper.height),
    });
  }
  return values;
}
