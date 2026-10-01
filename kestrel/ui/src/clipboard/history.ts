import type Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';
import System from 'system';

import { whenGraphicsRestored } from '../shared/graphics.js';
import { ClipboardImageFiles } from './imageFiles.js';
import { createThumbnail, type Thumbnail, type ThumbnailBounds } from './thumbnail.js';

const HISTORY_LIMIT = 25;
const IMAGE_LIMIT = 8;
const TEXT_LIMIT = 20000;
const IMAGE_BYTE_LIMIT = 16 * 1024 * 1024;
const PREFERRED_IMAGE_TYPE = 'image/png';
const SENSITIVE_MIME_TYPE = 'x-kde-passwordManagerHint';
const THUMBNAIL_BOUNDS: ThumbnailBounds = { width: 388, height: 128, radius: 6 };
export const TEXT_MIME_TYPES = ['text/plain;charset=utf-8', 'UTF8_STRING', 'text/plain', 'STRING'];

interface TextEntry {
  readonly kind: 'text';
  readonly text: string;
  copied: number;
}

interface ImageEntry {
  readonly kind: 'image';
  readonly id: string;
  readonly mimeType: string;
  readonly file: Gio.File;
  thumbnail: Thumbnail;
  copied: number;
}

export type ClipboardEntry = TextEntry | ImageEntry;

const sameEntry = (entry: ClipboardEntry, other: ClipboardEntry) =>
  entry.kind === 'text' ? other.kind === 'text' && other.text === entry.text : other.kind === 'image' && other.id === entry.id;

function imageType(mimeTypes: string[]): string | undefined {
  return mimeTypes.includes(PREFERRED_IMAGE_TYPE) ? PREFERRED_IMAGE_TYPE : mimeTypes.find(type => type.startsWith('image/'));
}

export class ClipboardHistory {
  private items: ClipboardEntry[] = [];
  private copies = 0;
  private readonly images = new ClipboardImageFiles();
  private readonly clipboard = St.Clipboard.get_default();
  private readonly selection = (global as unknown as Shell.Global).display.get_selection();
  private readonly ownerChanged: number;
  private readonly stopWatchingGraphics = whenGraphicsRestored(() => void this.redrawThumbnails());
  private quiet = false;

  constructor(private readonly changed: () => void) {
    this.ownerChanged = this.selection.connect('owner-changed', (_selection, type: Meta.SelectionType, source: Meta.SelectionSource | null) => {
      if (this.quiet || type !== Meta.SelectionType.SELECTION_CLIPBOARD || !source) return;
      const mimeTypes = source.get_mimetypes();
      if (mimeTypes.includes(SENSITIVE_MIME_TYPE)) return;
      const copied = ++this.copies;
      const mimeType = imageType(mimeTypes);
      if (mimeTypes.some(type => TEXT_MIME_TYPES.includes(type))) this.readText(copied);
      else if (mimeType) this.readImage(mimeType, copied);
    });
  }

  get entries(): readonly ClipboardEntry[] {
    return this.items;
  }

  quietly(write: () => void): void {
    this.quiet = true;
    try {
      write();
    } finally {
      this.quiet = false;
    }
  }

  async put(entry: ClipboardEntry): Promise<void> {
    if (entry.kind === 'text') this.quietly(() => this.clipboard.set_text(St.ClipboardType.CLIPBOARD, entry.text));
    else {
      const bytes = await this.images.load(entry.file);
      this.quietly(() => this.clipboard.set_content(St.ClipboardType.CLIPBOARD, entry.mimeType, bytes));
    }
    entry.copied = ++this.copies;
    this.remember(entry);
  }

  remove(entry: ClipboardEntry): void {
    this.update(this.items.filter(item => item !== entry));
  }

  clear(): void {
    this.update([]);
  }

  private readText(copied: number): void {
    this.clipboard.get_text(St.ClipboardType.CLIPBOARD, (_clipboard, text) => {
      if (text?.trim()) this.remember({ kind: 'text', text: text.slice(0, TEXT_LIMIT), copied });
    });
  }

  private readImage(mimeType: string, copied: number): void {
    this.clipboard.get_content(St.ClipboardType.CLIPBOARD, mimeType, (_clipboard, bytes) => {
      if (bytes && bytes.get_size() <= IMAGE_BYTE_LIMIT)
        void this.keepImage(mimeType, new GLib.Bytes(bytes.toArray()), copied);
    });
  }

  private async keepImage(mimeType: string, bytes: GLib.Bytes, copied: number): Promise<void> {
    const id = GLib.compute_checksum_for_bytes(GLib.ChecksumType.SHA1, bytes)!;
    const known = this.items.find(item => item.kind === 'image' && item.id === id);
    if (known) {
      known.copied = copied;
      this.remember(known);
      return;
    }
    const thumbnail = await createThumbnail(bytes, THUMBNAIL_BOUNDS);
    if (thumbnail) this.remember({ kind: 'image', id, mimeType, file: await this.images.save(id, bytes), thumbnail, copied });
    GLib.idle_add(GLib.PRIORITY_LOW, () => {
      System.gc();
      return GLib.SOURCE_REMOVE;
    });
  }

  private async redrawThumbnails(): Promise<void> {
    for (const item of this.items) {
      if (item.kind !== 'image') continue;
      const thumbnail = await createThumbnail(await this.images.load(item.file), THUMBNAIL_BOUNDS);
      if (thumbnail) item.thumbnail = thumbnail;
    }
    this.changed();
  }

  private remember(entry: ClipboardEntry): void {
    const others = this.items.filter(item => !sameEntry(item, entry));
    const newer = others.filter(item => item.copied > entry.copied);
    this.update([...newer, entry, ...others.slice(newer.length)]);
  }

  private update(entries: ClipboardEntry[]): void {
    let images = 0;
    const kept = entries.filter(entry => entry.kind === 'text' || ++images <= IMAGE_LIMIT).slice(0, HISTORY_LIMIT);
    for (const item of this.items)
      if (item.kind === 'image' && !kept.some(entry => sameEntry(entry, item))) this.images.discard(item.file);
    this.items = kept;
    this.changed();
  }

  destroy(): void {
    this.selection.disconnect(this.ownerChanged);
    this.stopWatchingGraphics();
    for (const item of this.items)
      if (item.kind === 'image') this.images.discard(item.file);
  }
}
