import Gio from 'gi://Gio';
import Meta from 'gi://Meta';

import type { Keybindings } from '../../context.js';
import { canonical, claimable, reservedAccelerators } from '../../portal/shortcuts/accelerators.js';
import { SHORTCUT_MODES } from '../../system/dictation/grabbedShortcut.js';
import type { Manifest } from '../api/v1/types.js';
import type { ExtensionStore } from './store.js';

const APP_SHORTCUTS = 'global-shortcuts';

function appShortcuts(): string[] {
  const registered = JSON.parse(new Gio.Settings({ schema_id: 'com.lantharos.kestrel' }).get_string(APP_SHORTCUTS)) as
    Record<string, Record<string, { shortcuts: string[] }>>;
  return Object.values(registered).flatMap(shortcuts => Object.values(shortcuts).flatMap(shortcut => shortcut.shortcuts));
}

/**
 * What each of an extension's shortcuts is set to: what people chose, or else its default, unless Luft, an app or a
 * shortcut people chose for another extension already uses it, or it's something people would type by accident.
 */
export function chosenShortcuts(id: string, manifest: Manifest, store: ExtensionStore): Record<string, string[]> {
  const choices = store.shortcutChoices;
  const taken = new Set([
    ...reservedAccelerators(), ...appShortcuts().map(canonical),
    ...Object.entries(choices).filter(([other]) => other !== id).flatMap(([, keys]) => Object.values(keys).flat().map(canonical)),
    ...Object.values(choices[id] ?? {}).flat().map(canonical),
  ]);
  return Object.fromEntries((manifest.shortcuts ?? []).map(shortcut => {
    const chosen = choices[id]?.[shortcut.key];
    if (chosen) return [shortcut.key, chosen];
    const fallback = shortcut.default;
    const free = !!fallback && claimable(fallback) && !taken.has(canonical(fallback));
    if (free) taken.add(canonical(fallback));
    return [shortcut.key, free ? [fallback] : []];
  }));
}

/** An extension's shortcuts grabbed from the compositor while it runs. */
export class GrabbedShortcuts {
  private readonly grabs = new Map<number, string>();
  private readonly signal: number;
  private readonly unwatch: () => void;
  private bound: Record<string, string[]> = {};

  constructor(private readonly id: string, private readonly manifest: Manifest, private readonly store: ExtensionStore,
    private readonly keybindings: Keybindings, private readonly activated: (key: string) => void) {
    this.signal = global.display.connect('accelerator-activated', (_display, action: number) => {
      const key = this.grabs.get(action);
      if (key) this.activated(key);
    });
    this.unwatch = store.watchShortcuts(() => this.grab());
    this.grab();
  }

  /** What each shortcut is bound to: a shortcut someone else had already grabbed is left out. */
  get accelerators(): Record<string, string[]> {
    return this.bound;
  }

  private grab(): void {
    this.release();
    const wanted = chosenShortcuts(this.id, this.manifest, this.store);
    this.bound = Object.fromEntries(Object.entries(wanted).map(([key, accelerators]) => [key, accelerators.filter(accelerator => {
      const action = global.display.grab_accelerator(accelerator, Meta.KeyBindingFlags.IGNORE_AUTOREPEAT);
      if (action === Meta.KeyBindingAction.NONE) return false;
      this.keybindings.allow(Meta.external_binding_name_for_action(action), SHORTCUT_MODES);
      this.grabs.set(action, key);
      return true;
    })]));
  }

  private release(): void {
    for (const action of this.grabs.keys()) global.display.ungrab_accelerator(action);
    this.grabs.clear();
  }

  destroy(): void {
    this.unwatch();
    global.display.disconnect(this.signal);
    this.release();
  }
}
