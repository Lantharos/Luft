import Gio from 'gi://Gio';

import type { SavedWindow } from '../../desktop/windows/recovery/snapshot.js';
import { load, recordedWindows, store, storeNow, type Ending, type RecordedWindow, type SessionRecord } from './record.js';

const BUS_NAME = 'org.gnome.SessionManager';
const MANAGER_PATH = '/org/gnome/SessionManager';

const contentsOf = (record: SessionRecord) => JSON.stringify(record);

export class SessionRecorder {
  readonly previous = load();
  private windows: RecordedWindow[] = [];
  private ending: Ending = 'running';
  private held = true;
  private writing = false;
  private dirty = false;
  private written = '';

  constructor() {
    void this.previous.then(record => {
      if (!record) this.written = contentsOf(this.record);
    });
    for (const [signal, handler] of [['SessionOver', () => this.end('ordinary')], ['SessionRunning', () => this.resume()]] as const) {
      Gio.DBus.session.signal_subscribe(BUS_NAME, BUS_NAME, signal, MANAGER_PATH, null, Gio.DBusSignalFlags.NONE, handler);
    }
  }

  private get record(): SessionRecord {
    return { ending: this.ending, windows: this.windows };
  }

  note(saved: SavedWindow[]): void {
    if (this.ending !== 'running') return;
    this.windows = recordedWindows(saved);
    this.save();
  }

  release(): void {
    this.held = false;
    this.save();
  }

  end(ending: Exclude<Ending, 'running'>): void {
    if (this.ending !== 'running') return;
    this.ending = ending;
    this.written = contentsOf(this.record);
    storeNow(this.record);
  }

  private resume(): void {
    if (this.ending === 'running') return;
    this.ending = 'running';
    this.save();
  }

  private save(): void {
    if (this.writing) {
      this.dirty = true;
      return;
    }
    if (this.held) return;
    const contents = contentsOf(this.record);
    if (contents === this.written) return;
    this.written = contents;
    this.writing = true;
    store(this.record, () => {
      const changed = this.dirty;
      this.writing = false;
      this.dirty = false;
      if (this.ending !== 'running') storeNow(this.record);
      else if (changed) this.save();
    });
  }
}
