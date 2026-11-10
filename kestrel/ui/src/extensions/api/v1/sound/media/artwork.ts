import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Soup from 'gi://Soup';

import { readAll } from '../../services/network.js';

Gio._promisify(Soup.Session.prototype, 'send_async');
Gio._promisify(Gio.Resolver.prototype, 'lookup_by_name_async');
Gio._promisify(Gio.File.prototype, 'replace_contents_bytes_async', 'replace_contents_finish');
Gio._promisify(Gio.File.prototype, 'enumerate_children_async');
Gio._promisify(Gio.File.prototype, 'delete_async');
Gio._promisify(Gio.FileEnumerator.prototype, 'next_files_async');

const KEPT = 64;
const LISTED = 1024;
const MAX_BYTES = 16 * 1024 * 1024;
const MAX_REDIRECTS = 5;
const REDIRECTS = new Set([301, 302, 303, 307, 308]);
const RESERVED = /^(?:f[cd][0-9a-f]{2}:|::ffff:|100\.(?:6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.)/;

async function onTheInternet(host: string): Promise<boolean> {
  const addresses = await Gio.Resolver.get_default().lookup_by_name_async(host, null);
  return addresses.length > 0 && addresses.every(address => !address.get_is_loopback() && !address.get_is_site_local() &&
    !address.get_is_link_local() && !address.get_is_any() && !address.get_is_multicast() && !RESERVED.test(address.to_string()));
}

class Artwork {
  readonly folder = GLib.build_filenamev([GLib.get_user_cache_dir(), 'kestrel', 'media-art']);
  private readonly session = new Soup.Session({ timeout: 20 });
  private readonly pending = new Map<string, Promise<string | null>>();
  private readonly players = new Set<string>();

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

  holds(path: string): boolean {
    return this.players.has(path) || Gio.File.new_for_path(path).has_prefix(Gio.File.new_for_path(this.folder));
  }

  private async fetch(url: string, path: string): Promise<string | null> {
    for (let hops = 0; hops <= MAX_REDIRECTS; hops++) {
      const uri = GLib.Uri.parse(url, GLib.UriFlags.NONE);
      if (!/^https?$/.test(uri.get_scheme()) || !await onTheInternet(uri.get_host() ?? '')) return null;
      const message = Soup.Message.new_from_uri('GET', uri);
      message.add_flags(Soup.MessageFlags.NO_REDIRECT);
      const stream = await this.session.send_async(message, GLib.PRIORITY_LOW, null);
      try {
        if (message.get_status() === Soup.Status.OK) {
          await this.keep(path, await readAll(stream, MAX_BYTES, null));
          return path;
        }
        const location = message.get_response_headers().get_one('Location');
        if (!REDIRECTS.has(message.get_status()) || !location) return null;
        url = GLib.Uri.resolve_relative(url, location, GLib.UriFlags.NONE);
      } finally {
        stream.close(null);
      }
    }
    return null;
  }

  private async keep(path: string, picture: Uint8Array): Promise<void> {
    GLib.mkdir_with_parents(this.folder, 0o700);
    await Gio.File.new_for_path(path).replace_contents_bytes_async(new GLib.Bytes(picture), null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null);
    await this.prune();
  }

  private async prune(): Promise<void> {
    const folder = Gio.File.new_for_path(this.folder);
    const listing = await folder.enumerate_children_async('standard::name,time::modified', Gio.FileQueryInfoFlags.NONE, GLib.PRIORITY_LOW, null);
    const files = (await listing.next_files_async(LISTED, GLib.PRIORITY_LOW, null))
      .sort((a, b) => b.get_modification_date_time()!.compare(a.get_modification_date_time()!));
    listing.close(null);
    await Promise.all(files.slice(KEPT).map(info => folder.get_child(info.get_name()).delete_async(GLib.PRIORITY_LOW, null)));
  }
}

export const artwork = new Artwork();
