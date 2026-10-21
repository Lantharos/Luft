import { t } from '../i18n/index.js';

const KEY_NAMES: Record<string, string> = {
  super: 'keys-super', ctrl: 'keys-ctrl', alt: 'keys-alt', shift: 'keys-shift', meta: 'keys-meta', hyper: 'keys-hyper',
  return: 'keys-enter', escape: 'keys-escape', space: 'keys-space', tab: 'keys-tab', backspace: 'keys-backspace',
  delete: 'keys-delete', insert: 'keys-insert', home: 'keys-home', end: 'keys-end', page_up: 'keys-page-up', page_down: 'keys-page-down',
  print: 'keys-print-screen',
};

export function keyLabel(key: string): string {
  const id = KEY_NAMES[key.toLowerCase()];
  if (id) return t(id);
  return key.length === 1 ? key.toUpperCase() : key;
}
