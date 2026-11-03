import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Soup from 'gi://Soup?version=3.0';

Gio._promisify(Soup.Session.prototype, 'send_and_read_async');

const KEPT = 64;

/** Album art as local files: a player's own file as it is, a web address downloaded once into Kestrel's cache. */
class Artwork {
  readonly folder = GLib.build_filenamev([GLib.get_user_cache_dir(), 'kestrel', 'media-art']);
  private readonly session = new Soup.Session({ timeout: 20 });
  private readonly pending = new Map<string, Promise<string | null>>();
  private readonly players = new Set<string>();

  /** The file for `url` if it's at hand, or `null` while it's fetched; `ready` runs once it is. */
  local(url: string, ready: () => void): string | null {
    if (!url) return null;
    const file = Gio.File.new_for_uri(url);
    if (file.is_native()) {
      const path = file.get_path()!;
      this.players.add(path);
      return path;
    }
    if (!/^https?:/.test(url)) return null;
    const path = GLib.build_filenamev([this.folder, GLib.compute_checksum_for_string(GLib.ChecksumType.SHA256, url, -1)!]);
    if (GLib.file_test(path, GLib.FileTest.EXISTS)) return path;
    let fetching = this.pending.get(url);
    if (!fetching) {
      fetching = this.fetch(url, path).catch(() => null).finally(() => this.pending.delete(url));
      this.pending.set(url, fetching);
    }
    void fetching.then(found => found && ready());
    return null;
  }

  /** Whether the API handed out this picture, so views may show it. */
  holds(path: string): boolean {
    return this.players.has(path) || Gio.File.new_for_path(path).has_prefix(Gio.File.new_for_path(this.folder));
  }

  private async fetch(url: string, path: string): Promise<string | null> {
    const message = Soup.Message.new('GET', url);
    if (!message) return null;
    const bytes = await this.session.send_and_read_async(message, GLib.PRIORITY_LOW, null);
    if (message.get_status() !== Soup.Status.OK) return null;
    GLib.mkdir_with_parents(this.folder, 0o700);
    GLib.file_set_contents(path, bytes.toArray());
    this.prune();
    return path;
  }

  private prune(): void {
    const folder = Gio.File.new_for_path(this.folder);
    const files = [...folder.enumerate_children('standard::name,time::modified', Gio.FileQueryInfoFlags.NONE, null)]
      .sort((a, b) => b.get_modification_date_time()!.compare(a.get_modification_date_time()!));
    for (const info of files.slice(KEPT)) folder.get_child(info.get_name()).delete(null);
  }
}

export const artwork = new Artwork();
