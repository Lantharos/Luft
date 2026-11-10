import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { Stored } from '../api/v1/types.js';
import { storageFile } from './folders.js';

const LIMIT_BYTES = 1024 * 1024;
const WRITE_DELAY_MS = 1000;
const BRACES_LESS_LAST_COMMA = 1;
const decoder = new TextDecoder();

const entrySize = (key: string, encoded: string) => JSON.stringify(key).length + encoded.length + ':,'.length;

/** One extension's stored values, read once and written soon after each change. */
export class StoredValues {
  private readonly file: string;
  private values: Record<string, Stored>;
  private readonly sizes = new Map<string, number>();
  private size = BRACES_LESS_LAST_COMMA;
  private writeSource = 0;
  private writing = false;
  private changedWhileWriting = false;
  private forgottenWhileWriting = false;

  constructor(id: string) {
    this.file = storageFile(id);
    this.values = this.read();
    for (const [key, value] of Object.entries(this.values)) this.resize(key, entrySize(key, JSON.stringify(value)));
  }

  private read(): Record<string, Stored> {
    try {
      const [, contents] = GLib.file_get_contents(this.file);
      return JSON.parse(decoder.decode(contents)) as Record<string, Stored>;
    } catch {
      return {};
    }
  }

  private resize(key: string, size: number): void {
    this.size += size - (this.sizes.get(key) ?? 0);
    if (size) this.sizes.set(key, size);
    else this.sizes.delete(key);
  }

  get(key: string): Stored | undefined {
    return this.values[key];
  }

  keys(): string[] {
    return Object.keys(this.values);
  }

  set(key: string, value: Stored): void {
    const encoded = JSON.stringify(value);
    const size = entrySize(key, encoded);
    if (this.size - (this.sizes.get(key) ?? 0) + size > LIMIT_BYTES) throw new Error('Storage holds at most 1 MB');
    this.resize(key, size);
    this.values[key] = JSON.parse(encoded) as Stored;
    this.queueWrite();
  }

  delete(key: string): void {
    if (!(key in this.values)) return;
    delete this.values[key];
    this.resize(key, 0);
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
    if (!this.writeSource && !this.changedWhileWriting) return;
    if (this.writeSource) GLib.source_remove(this.writeSource);
    this.writeSource = 0;
    this.changedWhileWriting = this.writing;
    GLib.mkdir_with_parents(GLib.path_get_dirname(this.file), 0o700);
    GLib.file_set_contents(this.file, JSON.stringify(this.values));
  }

  private write(): void {
    if (this.writing) {
      this.changedWhileWriting = true;
      return;
    }
    this.writing = true;
    GLib.mkdir_with_parents(GLib.path_get_dirname(this.file), 0o700);
    const contents = new GLib.Bytes(new TextEncoder().encode(JSON.stringify(this.values)));
    Gio.File.new_for_path(this.file).replace_contents_bytes_async(contents, null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null, (file, result) => {
      try {
        file!.replace_contents_finish(result);
      } catch (error) {
        console.warn(`What an extension stored could not be written: ${error}`);
      }
      this.written();
    });
  }

  private written(): void {
    this.writing = false;
    if (this.forgottenWhileWriting) GLib.unlink(this.file);
    this.forgottenWhileWriting = false;
    if (!this.changedWhileWriting) return;
    this.changedWhileWriting = false;
    this.write();
  }

  forget(): void {
    if (this.writeSource) GLib.source_remove(this.writeSource);
    this.writeSource = 0;
    this.changedWhileWriting = false;
    this.forgottenWhileWriting = this.writing;
    this.values = {};
    this.sizes.clear();
    this.size = BRACES_LESS_LAST_COMMA;
    GLib.unlink(this.file);
  }
}
