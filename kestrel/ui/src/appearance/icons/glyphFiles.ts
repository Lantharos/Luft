import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import St from 'gi://St';
import { PACKAGE_VERSION } from '../../core/config.js';

import { readText, removeFile, userFile, writeText } from '../files.js';
import { styledIcon } from './appIcons.js';
import { GLYPH_PAINT } from './paint.js';

interface GlyphCache extends St.TextureCache {
  lookup_styled_icon_file(icon: Gio.Icon, size: number): Gio.File | null;
  save_styled_icon_async(icon: Gio.Icon, size: number, path: string, cancellable: Gio.Cancellable | null): Promise<boolean>;
}

Gio._promisify(St.TextureCache.prototype, 'save_styled_icon_async');
Gio._promisify(Gio.File.prototype, 'enumerate_children_async');
Gio._promisify(Gio.FileEnumerator.prototype, 'next_files_async');

const GLYPH_SIZE = 96;
const SYNC_DELAY = 2000;
const SOURCES = '.sources.json';
const cache = St.TextureCache.get_default() as GlyphCache;

const glyphName = (app: Gio.AppInfo) => `${app.get_id()!.replace(/\.desktop$/, '')}.png`;

async function sourceOf(icon: Gio.Icon): Promise<string | null> {
  const file = cache.lookup_styled_icon_file(icon, GLYPH_SIZE);
  if (!file) return null;
  const [contents] = await file.load_contents_async(null);
  const checksum = GLib.compute_checksum_for_bytes(GLib.ChecksumType.SHA256, contents);
  return `${PACKAGE_VERSION} ${GLYPH_SIZE} ${icon.to_string()} ${file.get_uri()} ${checksum}`;
}

export class GlyphFiles {
  readonly directory = GLib.build_filenamev([GLib.get_user_cache_dir(), 'kestrel', 'app-glyphs']);
  private readonly sources = userFile(this.directory, SOURCES);
  private readonly appSystem = Shell.AppSystem.get_default();
  private readonly signals: [{ disconnect(id: number): void }, number][];
  private cancellable = new Gio.Cancellable();
  private syncId = 0;

  constructor() {
    this.signals = [
      [this.appSystem, this.appSystem.connect('installed-changed', () => this.schedule())],
      [cache, cache.connect('icon-theme-changed', () => this.schedule())],
    ];
    this.schedule();
  }

  private schedule(): void {
    if (this.syncId) GLib.source_remove(this.syncId);
    this.syncId = GLib.timeout_add(GLib.PRIORITY_LOW, SYNC_DELAY, () => {
      this.syncId = 0;
      this.cancellable.cancel();
      this.cancellable = new Gio.Cancellable();
      this.sync(this.cancellable).catch(error => {
        if (!(error instanceof GLib.Error && error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED)))
          console.error('Kestrel could not save app glyphs', error);
      });
      return GLib.SOURCE_REMOVE;
    });
  }

  private async savedSources(): Promise<Record<string, string>> {
    try {
      return JSON.parse(await readText(this.sources) ?? '{}');
    } catch {
      return {};
    }
  }

  private async sync(cancellable: Gio.Cancellable): Promise<void> {
    GLib.mkdir_with_parents(this.directory, 0o755);
    const apps = this.appSystem.get_installed().filter(app => app.get_id());
    const names = new Set(apps.map(glyphName));
    const saved = await this.savedSources();
    const sources: Record<string, string> = {};
    for (const app of apps) {
      if (cancellable.is_cancelled()) return;
      const name = glyphName(app);
      const path = GLib.build_filenamev([this.directory, name]);
      const icon = styledIcon(app, GLYPH_PAINT);
      const source = await sourceOf(icon).catch(() => null);
      if (source && saved[name] === source && GLib.file_test(path, GLib.FileTest.EXISTS)) {
        sources[name] = source;
        continue;
      }
      const rendered = await cache.save_styled_icon_async(icon, GLYPH_SIZE, path, cancellable).catch(() => false);
      if (rendered && source) sources[name] = source;
    }
    await writeText(this.sources, JSON.stringify(sources));
    const children = await Gio.File.new_for_path(this.directory).enumerate_children_async('standard::name', Gio.FileQueryInfoFlags.NONE, GLib.PRIORITY_LOW, cancellable);
    for (let batch = await children.next_files_async(64, GLib.PRIORITY_LOW, cancellable); batch.length; batch = await children.next_files_async(64, GLib.PRIORITY_LOW, cancellable)) {
      for (const info of batch)
        if (!names.has(info.get_name()) && info.get_name() !== SOURCES) await removeFile(userFile(this.directory, info.get_name()));
    }
  }

  destroy(): void {
    if (this.syncId) GLib.source_remove(this.syncId);
    this.cancellable.cancel();
    for (const [object, id] of this.signals) object.disconnect(id);
  }
}
