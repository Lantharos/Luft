import Clutter from 'gi://Clutter';

import { LookError } from '../errors.js';

export interface Combo {
  readonly modifiers: number[];
  readonly key: number;
}

const MODIFIERS: Record<string, number> = {
  ctrl: Clutter.KEY_Control_L,
  control: Clutter.KEY_Control_L,
  shift: Clutter.KEY_Shift_L,
  alt: Clutter.KEY_Alt_L,
  super: Clutter.KEY_Super_L,
};

const NAMES: Record<string, string> = {
  enter: 'Return', return: 'Return', esc: 'Escape', escape: 'Escape', tab: 'Tab', space: 'space',
  backspace: 'BackSpace', delete: 'Delete', del: 'Delete', insert: 'Insert', home: 'Home', end: 'End',
  pageup: 'Page_Up', pagedown: 'Page_Down', up: 'Up', down: 'Down', left: 'Left', right: 'Right', menu: 'Menu',
};

const keysyms = Clutter as unknown as Record<string, number | undefined>;

function keysym(name: string): number | undefined {
  const lower = name.toLowerCase();
  if (NAMES[lower]) return keysyms[`KEY_${NAMES[lower]}`];
  if (/^f\d{1,2}$/.test(lower)) return keysyms[`KEY_F${lower.slice(1)}`];
  if ([...name].length === 1) return Clutter.unicode_to_keysym(name.codePointAt(0)!);
  return keysyms[`KEY_${name}`];
}

export function parseCombo(combo: string): Combo {
  const parts = combo.split(/\+(?!$)/);
  const key = keysym(parts.pop()!);
  if (!combo || key === undefined) throw new LookError('InvalidArgs', `${combo} isn't a key luft-look knows`);
  const modifiers = parts.map(part => {
    const modifier = MODIFIERS[part.toLowerCase()];
    if (modifier === undefined) throw new LookError('InvalidArgs', `${part} isn't a modifier. Use ctrl, shift, alt or super.`);
    return modifier;
  });
  return { modifiers, key };
}

export function textKeys(text: string): number[] {
  return [...text].map(character => {
    if (character === '\n') return Clutter.KEY_Return;
    if (character === '\t') return Clutter.KEY_Tab;
    return Clutter.unicode_to_keysym(character.codePointAt(0)!);
  });
}
