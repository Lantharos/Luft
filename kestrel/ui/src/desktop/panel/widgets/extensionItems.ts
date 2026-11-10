import Clutter from 'gi://Clutter';
import type Gio from 'gi://Gio';
import St from 'gi://St';

import { Registry } from '../../../shared/registry.js';

export interface TaskbarEntry {
  readonly icon: Gio.Icon;
  readonly label: string;
  click(button: St.Button): void;
  secondaryClick(button: St.Button): void;
  watch(changed: () => void): () => void;
  shown(button: St.Button | null): void;
}

export const taskbarEntries = new Registry<TaskbarEntry>();

const ICON_SIZE = 16;

export class ExtensionItems {
  readonly actor = new St.BoxLayout({ name: 'kestrel-extension-items' });
  private readonly buttons = new Map<TaskbarEntry, { button: St.Button; unwatch: () => void }>();
  private readonly unwatch: () => void;

  constructor() {
    for (const entry of taskbarEntries.items) this.add(entry);
    this.unwatch = taskbarEntries.watch((entry, added) => added ? this.add(entry) : this.remove(entry));
  }

  private add(entry: TaskbarEntry): void {
    const icon = new St.Icon({ icon_size: ICON_SIZE });
    const button = new St.Button({
      style_class: 'kestrel-status-button', child: icon, can_focus: true, track_hover: true,
      button_mask: St.ButtonMask.PRIMARY | St.ButtonMask.SECONDARY,
    });
    const sync = () => {
      icon.gicon = entry.icon;
      button.accessible_name = entry.label;
    };
    button.connect('clicked', (_button, clicked: number) => clicked === Clutter.BUTTON_SECONDARY ? entry.secondaryClick(button) : entry.click(button));
    sync();
    this.actor.add_child(button);
    this.buttons.set(entry, { button, unwatch: entry.watch(sync) });
    entry.shown(button);
  }

  private remove(entry: TaskbarEntry): void {
    const shown = this.buttons.get(entry);
    if (!shown) return;
    this.buttons.delete(entry);
    shown.unwatch();
    entry.shown(null);
    shown.button.destroy();
  }

  shutdown(): void {
    this.unwatch();
    for (const entry of [...this.buttons.keys()]) this.remove(entry);
  }
}
