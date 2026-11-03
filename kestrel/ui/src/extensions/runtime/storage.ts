import GLib from 'gi://GLib';

import type { Stored } from '../api/v1/types.js';
import { storageFile } from './folders.js';

const LIMIT_BYTES = 1024 * 1024;
const WRITE_DELAY_MS = 1000;
const decoder = new TextDecoder();

/** One extension's stored values, read once and written soon after each change. */
export class StoredValues {
  private readonly file: string;
  private values: Record<string, Stored>;
  private writeSource = 0;

  constructor(id: string) {
    this.file = storageFile(id);
    this.values = this.read();
  }

  private read(): Record<string, Stored> {
    try {
      const [, contents] = GLib.file_get_contents(this.file);
      return JSON.parse(decoder.decode(contents)) as Record<string, Stored>;
    } catch {
      return {};
    }
  }

  get(key: string): Stored | undefined {
    return this.values[key];
  }

  keys(): string[] {
    return Object.keys(this.values);
  }

  set(key: string, value: Stored): void {
    const encoded = JSON.stringify({ ...this.values, [key]: value });
    if (encoded.length > LIMIT_BYTES) throw new Error('Storage holds at most 1 MB');
    this.values = JSON.parse(encoded) as Record<string, Stored>;
    this.queueWrite();
  }

  delete(key: string): void {
    if (!(key in this.values)) return;
    const { [key]: _deleted, ...rest } = this.values;
    this.values = rest;
    this.queueWrite();
  }

  private queueWrite(): void {
    this.writeSource ||= GLib.timeout_add(GLib.PRIORITY_LOW, WRITE_DELAY_MS, () => {
      this.writeSource = 0;
      this.write();
      return GLib.SOURCE_REMOVE;
    });
  }

  flush(): void {
    if (!this.writeSource) return;
    GLib.source_remove(this.writeSource);
    this.writeSource = 0;
    this.write();
  }

  private write(): void {
    GLib.mkdir_with_parents(GLib.path_get_dirname(this.file), 0o700);
    GLib.file_set_contents(this.file, JSON.stringify(this.values));
  }

  forget(): void {
    if (this.writeSource) GLib.source_remove(this.writeSource);
    this.writeSource = 0;
    this.values = {};
    GLib.unlink(this.file);
  }
}
