import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {property} from '../../lib/dbus.js';
import {outcome, scratch} from '../../lib/processes.js';
import {install, removeFolder, rewrite} from './extensions.js';

const PACKAGES = 'com.lantharos.Packages1';
const PACKAGES_PATH = '/com/lantharos/Packages1';
const KESTREL = 'com.lantharos.Kestrel';
const EXTENSIONS_PATH = '/com/lantharos/Kestrel/Extensions';
const EXTENSIONS = 'com.lantharos.Kestrel.Extensions';

export interface Release {
  version: string;
  approved: boolean;
  permissions?: string[];
}

export const sandboxedStoreFolder = (id: string) => GLib.build_filenamev([GLib.getenv('KESTREL_SANDBOXED_STORE_EXTENSIONS')!, id]);

async function pack(fixture: string, id: string, {version, permissions}: Release): Promise<string> {
  const folder = scratch('store-extensions', version);
  const extension = GLib.build_filenamev([folder, id]);
  if (GLib.file_test(folder, GLib.FileTest.IS_DIR)) removeFolder(Gio.File.new_for_path(folder));
  install(fixture, id, () => extension);
  rewrite(GLib.build_filenamev([extension, 'extension.toml']), text =>
    `${text.replace(/^id = ".*"$/m, `id = "${id}"`).replace(/^version = ".*"$/m, `version = "${version}"`)}${permissions ? `permissions = ${JSON.stringify(permissions)}\n` : ''}`);
  const archive = GLib.build_filenamev([folder, 'extension.tar.zst']);
  const packed = await outcome(['tar', '--zstd', '-cf', archive, '-C', folder, id]);
  if (!packed.ok) throw new Error(`${id} couldn't be packed: ${packed.stderr}`);
  return archive;
}

function listing(id: string, archive: string, {version, approved}: Release): Uint8Array {
  const bytes = new GLib.Bytes(GLib.file_get_contents(archive)[1]);
  const artifact = {format: 'luft-extension', kind: 'extension', size: bytes.get_size(), sha256: GLib.compute_checksum_for_bytes(GLib.ChecksumType.SHA256, bytes)};
  return new TextEncoder().encode(JSON.stringify({id, kind: 'extension', publisher: {verified: true}, releases: [{version, runs_in_shell: approved, artifacts: [artifact]}]}));
}

export async function installFromStore(fixture: string, id: string, release: Release): Promise<void> {
  const archive = await pack(fixture, id, release);
  const fds = new Gio.UnixFDList();
  const fd = GLib.open(archive, 0, 0);
  const handle = fds.append(fd);
  GLib.close(fd);
  const empty = new Uint8Array();
  await new Promise((resolve, reject) => Gio.DBus.system.call_with_unix_fd_list(PACKAGES, PACKAGES_PATH, PACKAGES, 'InstallExtension',
    new GLib.Variant('(sayayayayh)', [id, listing(id, archive, release), empty, empty, empty, handle]), null, Gio.DBusCallFlags.NONE, -1, fds, null,
    (connection, result) => {
      try {
        resolve(connection!.call_with_unix_fd_list_finish(result));
      } catch (error) {
        reject(error as Error);
      }
    }));
}

export const sandboxLeavesOut = () => property<string[]>(KESTREL, EXTENSIONS_PATH, EXTENSIONS, 'SandboxLeavesOut');
