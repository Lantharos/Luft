import type { ElementLayout, View } from '@luft/extension-api';

import type { Pult } from './pult.js';

export const ICON = 'icons/pult-symbolic.svg';

/** The Pult mark, with how many items wait beside it once signed in. */
export function compact(pult: Pult, layout: ElementLayout): View {
  const icon: View = { type: 'icon', icon: ICON, size: Math.round(layout.button * 0.5) };
  if (!pult.places) return icon;
  return {
    type: layout.vertical ? 'column' : 'row',
    spacing: layout.vertical ? 2 : 6,
    align: 'center',
    children: [icon, { type: 'text', text: String(pult.count), style: 'number' }],
  };
}
