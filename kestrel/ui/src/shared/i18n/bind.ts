import { type Args, onLocaleChanged, t } from './catalog.js';

interface Destroyable {
  connect(signal: 'destroy', callback: () => void): number;
}

export function localized(actor: Destroyable, apply: () => void): void {
  apply();
  actor.connect('destroy', onLocaleChanged(apply));
}

export function bindText(label: Destroyable & { text: string | null }, id: string, args?: Args): void {
  localized(label, () => (label.text = t(id, args)));
}
