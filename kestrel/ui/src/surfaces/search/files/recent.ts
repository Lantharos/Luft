import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { rank, searchable, type Match, type Query, type Searchable } from '../ranking.js';
import { shortFolder, type FoundFile } from './items.js';

Gio._promisify(Gio.File.prototype, 'load_contents_async');
Gio._promisify(Gio.File.prototype, 'query_info_async');

const REMEMBERED = 300;
const BIAS = 0.6;

export interface RecentFile extends Searchable {
  file: FoundFile;
  location: string;
}

async function exists(uri: string): Promise<boolean> {
  try {
    await Gio.File.new_for_uri(uri).query_info_async(Gio.FILE_ATTRIBUTE_STANDARD_TYPE, Gio.FileQueryInfoFlags.NONE, GLib.PRIORITY_LOW, null);
    return true;
  } catch {
    return false;
  }
}

function recentUris(bookmarks: GLib.BookmarkFile): string[] {
  return bookmarks.get_uris()
    .filter(uri => uri.startsWith('file://'))
    .map(uri => ({ uri, used: bookmarks.get_modified_date_time(uri).to_unix() }))
    .sort((a, b) => b.used - a.used)
    .slice(0, REMEMBERED)
    .map(({ uri }) => uri);
}

export class RecentFiles {
  private readonly history = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_data_dir(), 'recently-used.xbel']));
  private entries: RecentFile[] = [];
  private loadedAt = -1;
  private loading = false;

  find(search: Query): Match<RecentFile>[] {
    return rank(this.entries, search, BIAS, () => 0);
  }

  async refresh(): Promise<boolean> {
    if (this.loading) return false;
    this.loading = true;
    try {
      return await this.load();
    } finally {
      this.loading = false;
    }
  }

  private async load(): Promise<boolean> {
    let modified: number;
    try {
      const info = await this.history.query_info_async(Gio.FILE_ATTRIBUTE_TIME_MODIFIED, Gio.FileQueryInfoFlags.NONE, GLib.PRIORITY_LOW, null);
      modified = info.get_attribute_uint64(Gio.FILE_ATTRIBUTE_TIME_MODIFIED);
    } catch {
      const had = this.entries.length > 0;
      this.entries = [];
      return had;
    }
    if (modified === this.loadedAt) return false;
    const [contents] = await this.history.load_contents_async(null);
    const bookmarks = new GLib.BookmarkFile();
    try {
      bookmarks.load_from_data(contents);
    } catch (error) {
      console.warn(`Recent files could not be read: ${error}`);
      return false;
    }
    const uris = recentUris(bookmarks);
    const present = await Promise.all(uris.map(exists));
    this.entries = uris.filter((_uri, index) => present[index]).map(uri => {
      const location = Gio.File.new_for_uri(uri);
      const name = location.get_basename() ?? uri;
      return searchable({ file: { uri, name, folder: false }, location: shortFolder(location.get_parent()?.get_path() ?? '') }, `file:${uri}`, name, []);
    });
    this.loadedAt = modified;
    return true;
  }
}
