import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const HISTORY_LIMIT = 300;

export interface RecentFile {
  uri: string;
  name: string;
  folder: string;
  icon: Gio.Icon;
}

export class RecentFiles {
  private readonly history = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_data_dir(), 'recently-used.xbel']));
  private loadedAt = -1;
  private files: (RecentFile & { key: string })[] = [];
  private readonly existing = new Map<string, boolean>();

  search(query: string, limit: number): RecentFile[] {
    this.refresh();
    const matches: RecentFile[] = [];
    for (const file of this.files) {
      if (!file.key.includes(query)) continue;
      if (!this.exists(file.uri)) continue;
      matches.push(file);
      if (matches.length === limit) break;
    }
    return matches;
  }

  private exists(uri: string): boolean {
    let exists = this.existing.get(uri);
    if (exists === undefined) {
      exists = Gio.File.new_for_uri(uri).query_exists(null);
      this.existing.set(uri, exists);
    }
    return exists;
  }

  private refresh(): void {
    let modified: number;
    try {
      modified = this.history.query_info(Gio.FILE_ATTRIBUTE_TIME_MODIFIED, Gio.FileQueryInfoFlags.NONE, null)
        .get_attribute_uint64(Gio.FILE_ATTRIBUTE_TIME_MODIFIED);
    } catch {
      this.files = [];
      return;
    }
    if (modified === this.loadedAt) return;
    this.loadedAt = modified;
    this.existing.clear();
    const bookmarks = new GLib.BookmarkFile();
    try {
      bookmarks.load_from_file(this.history.get_path()!);
    } catch (error) {
      console.warn(`Recent files could not be read: ${error}`);
      this.files = [];
      return;
    }
    const home = GLib.get_home_dir();
    this.files = bookmarks.get_uris()
      .filter(uri => uri.startsWith('file://'))
      .map(uri => ({ uri, modified: bookmarks.get_modified_date_time(uri).to_unix() }))
      .sort((a, b) => b.modified - a.modified)
      .slice(0, HISTORY_LIMIT)
      .map(({ uri }) => {
        const file = Gio.File.new_for_uri(uri);
        const name = file.get_basename() ?? uri;
        const path = file.get_parent()?.get_path() ?? '';
        const mime = bookmarks.get_mime_type(uri);
        return {
          uri, name, key: name.toLocaleLowerCase(),
          folder: path.startsWith(home) ? `~${path.slice(home.length)}` : path,
          icon: Gio.content_type_get_symbolic_icon(Gio.content_type_from_mime_type(mime) ?? mime),
        };
      });
  }
}
