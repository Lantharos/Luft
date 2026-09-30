import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import St from 'gi://St';

import { removeFile, userFile } from '../files.js';
import { styledIcon } from './appIcons.js';
import { GLYPH_PAINT } from './paint.js';

interface GlyphCache extends St.TextureCache {
  save_styled_icon_async(icon: Gio.Icon, size: number, path: string, cancellable: Gio.Cancellable | null): Promise<boolean>;
}

Gio._promisify(St.TextureCache.prototype, 'save_styled_icon_async');
Gio._promisify(Gio.File.prototype, 'enumerate_children_async');
Gio._promisify(Gio.FileEnumerator.prototype, 'next_files_async');

const GLYPH_SIZE = 96;
const SYNC_DELAY = 2000;
const cache = St.TextureCache.get_default() as GlyphCache;

const glyphName = (app: Gio.AppInfo) => `${app.get_id()!.replace(/\.desktop$/, '')}.png`;

export class GlyphFiles {
  readonly directory = GLib.build_filenamev([GLib.get_user_cache_dir(), 'kestrel', 'app-glyphs']);
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

  private async sync(cancellable: Gio.Cancellable): Promise<void> {
    GLib.mkdir_with_parents(this.directory, 0o755);
    const apps = this.appSystem.get_installed().filter(app => app.get_id());
    const names = new Set(apps.map(glyphName));
    for (const app of apps) {
      if (cancellable.is_cancelled()) return;
      const path = GLib.build_filenamev([this.directory, glyphName(app)]);
      await cache.save_styled_icon_async(styledIcon(app, GLYPH_PAINT), GLYPH_SIZE, path, cancellable).catch(() => false);
    }
    const children = await Gio.File.new_for_path(this.directory).enumerate_children_async('standard::name', Gio.FileQueryInfoFlags.NONE, GLib.PRIORITY_LOW, cancellable);
    for (let batch = await children.next_files_async(64, GLib.PRIORITY_LOW, cancellable); batch.length; batch = await children.next_files_async(64, GLib.PRIORITY_LOW, cancellable)) {
      for (const info of batch)
        if (!names.has(info.get_name())) await removeFile(userFile(this.directory, info.get_name()));
    }
  }

  destroy(): void {
    if (this.syncId) GLib.source_remove(this.syncId);
    this.cancellable.cancel();
    for (const [object, id] of this.signals) object.disconnect(id);
  }
}
