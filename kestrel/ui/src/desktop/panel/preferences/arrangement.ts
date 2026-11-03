import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {
  BUILT_IN_ELEMENTS, completeArrangement, fromEdgeAndAlignment, parseArrangement, sameArrangement, storeArrangement,
  type Arrangement, type Edge, type StoredArrangement,
} from '../../../../../../packages/web/ui/src/taskbar/arrangement/index';
import { taskbarElements } from '../elements/extensionElements.js';

const KEY = 'taskbar-arrangement';
const LEGACY_KEYS = ['taskbar-position', 'taskbar-alignment'];

/** Turns the edge and alignment people chose before the taskbar had islands into an arrangement, once. */
export function carryOverEdgeAndAlignment(): void {
  const settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });
  const legacy = new Gio.Settings({ schema_id: 'com.lantharos.kestrel.legacy-taskbar' });
  if (LEGACY_KEYS.every(key => legacy.get_user_value(key) === null)) return;
  if (settings.get_user_value(KEY) === null) {
    const arrangement = fromEdgeAndAlignment(legacy.get_string('taskbar-position') as Edge, legacy.get_string('taskbar-alignment') as 'center' | 'left');
    settings.set_value(KEY, new GLib.Variant('a(sas)', storeArrangement(arrangement)));
  }
  for (const key of LEGACY_KEYS) legacy.reset(key);
}

/** Where the taskbar's islands sit, as saved, or as previewed while people arrange it. */
class TaskbarArrangement {
  private readonly settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });
  private readonly watchers = new Set<() => void>();
  private saved: Arrangement;
  private draft: Arrangement | null = null;

  constructor() {
    carryOverEdgeAndAlignment();
    this.saved = this.read();
    this.settings.connect(`changed::${KEY}`, () => {
      this.saved = this.read();
      if (!this.draft) this.notify();
    });
    taskbarElements.watch((_element, added) => {
      if (added) this.placeNewElements();
      this.saved = this.read();
      if (!this.draft) this.notify();
    });
  }

  get current(): Arrangement {
    return this.draft ?? this.saved;
  }

  /** Shows `arrangement` without saving it, or the saved one again with `null`. */
  preview(arrangement: Arrangement | null): void {
    if (arrangement && this.draft && sameArrangement(arrangement, this.draft)) return;
    this.draft = arrangement && completeArrangement(arrangement, this.elements);
    this.notify();
  }

  save(arrangement: Arrangement): void {
    this.draft = null;
    if (sameArrangement(arrangement, this.saved)) this.notify();
    else this.write(arrangement);
  }

  get defaultArrangement(): Arrangement {
    return completeArrangement(parseArrangement(this.settings.get_default_value(KEY)!.deepUnpack() as StoredArrangement), this.elements);
  }

  watch(changed: () => void): () => void {
    this.watchers.add(changed);
    return () => this.watchers.delete(changed);
  }

  private get elements(): string[] {
    return [...BUILT_IN_ELEMENTS, ...taskbarElements.items.map(element => element.id)];
  }

  private get stored(): Arrangement {
    return parseArrangement(this.settings.get_value(KEY).deepUnpack() as StoredArrangement);
  }

  private read(): Arrangement {
    return completeArrangement(this.stored, this.elements);
  }

  private placeNewElements(): void {
    const stored = this.stored;
    const complete = completeArrangement(stored, this.elements);
    if (!sameArrangement(stored, complete)) this.write(complete);
  }

  private write(arrangement: Arrangement): void {
    this.settings.set_value(KEY, new GLib.Variant('a(sas)', storeArrangement(arrangement)));
  }

  private notify(): void {
    for (const watcher of [...this.watchers]) watcher();
  }
}

export const taskbarArrangement = new TaskbarArrangement();
