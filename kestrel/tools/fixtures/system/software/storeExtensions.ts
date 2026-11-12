import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const FAILED = 'com.lantharos.Packages1.Error.Failed';

interface Listing {
  id: string;
  kind: string;
  publisher: {verified: boolean};
  releases: {version: string; runs_in_shell?: boolean; artifacts: {format: string; kind: string; size: number; sha256: string}[]}[];
}

const inShellFolder = () => GLib.getenv('KESTREL_STORE_EXTENSIONS')!;
const sandboxedFolder = () => GLib.getenv('KESTREL_SANDBOXED_STORE_EXTENSIONS')!;

function removeTree(file: Gio.File) {
  if (file.query_file_type(Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null) === Gio.FileType.DIRECTORY) {
    const children = file.enumerate_children('standard::name', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);
    for (let info = children.next_file(null); info; info = children.next_file(null)) removeTree(file.get_child(info.get_name()));
  }
  file.delete(null);
}

function removeFrom(folder: string, id: string) {
  const installed = Gio.File.new_for_path(GLib.build_filenamev([folder, id]));
  if (installed.query_exists(null)) removeTree(installed);
}

function listed(listing: Listing, id: string, archive: GLib.Bytes) {
  if (listing.id !== id || listing.kind !== 'extension') throw new Error(`schelf.store doesn't list ${id} as an extension.`);
  const sha256 = GLib.compute_checksum_for_bytes(GLib.ChecksumType.SHA256, archive);
  const release = listing.releases.find(candidate => candidate.artifacts.some(artifact =>
    artifact.format === 'luft-extension' && artifact.kind === 'extension' && artifact.size === archive.get_size() && artifact.sha256 === sha256));
  if (!release) throw new Error(`schelf.store doesn't list this file as a release of ${id}.`);
  return {version: release.version, inShell: listing.publisher.verified && !!release.runs_in_shell};
}

function unpack(archive: string, folder: string, id: string) {
  const staging = GLib.build_filenamev([folder, `.${id}.unpacking`]);
  GLib.mkdir_with_parents(staging, 0o755);
  try {
    const [, , , status] = GLib.spawn_sync(null, ['tar', '--zstd', '-xf', archive, '-C', staging], null, GLib.SpawnFlags.SEARCH_PATH, null);
    if (!GLib.spawn_check_wait_status(status)) throw new Error(`${id} couldn't be unpacked`);
    removeFrom(folder, id);
    Gio.File.new_for_path(GLib.build_filenamev([staging, id])).move(Gio.File.new_for_path(GLib.build_filenamev([folder, id])), Gio.FileCopyFlags.NONE, null, null);
  } finally {
    removeFrom(folder, `.${id}.unpacking`);
  }
}

function install(id: string, listing: Listing, fd: number) {
  const archive = GLib.file_read_link(`/proc/self/fd/${fd}`);
  const release = listed(listing, id, new GLib.Bytes(GLib.file_get_contents(archive)[1]));
  const [folder, other] = release.inShell ? [inShellFolder(), sandboxedFolder()] : [sandboxedFolder(), inShellFolder()];
  if (!release.inShell && GLib.file_test(GLib.build_filenamev([inShellFolder(), id]), GLib.FileTest.IS_DIR))
    throw new Error(`${id} ${release.version} isn't approved to run inside Luft yet, so the approved version stays.`);
  unpack(archive, folder, id);
  removeFrom(other, id);
}

export function storeExtensions(calls: string[]) {
  return {
    InstallExtensionAsync([id, listing, , , , handle]: [string, Uint8Array, Uint8Array, Uint8Array, Uint8Array, number], invocation: Gio.DBusMethodInvocation) {
      const fd = invocation.get_message().get_unix_fd_list()!.get(handle);
      try {
        install(id, JSON.parse(new TextDecoder().decode(listing)) as Listing, fd);
        calls.push(`Packages InstallExtension ${id}`);
        invocation.return_value(null);
      } catch (error) {
        invocation.return_dbus_error(FAILED, (error as Error).message);
      } finally {
        GLib.close(fd);
      }
    },
  };
}
