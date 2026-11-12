import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const NOT_AUTHORIZED = 'com.lantharos.Packages1.Error.NotAuthorized';
const FAILED = 'com.lantharos.Packages1.Error.Failed';
const FOLDERS = '.folders.json';

class Refusal extends Error {
  constructor(readonly dbusName: string, message: string) {
    super(message);
  }
}

const folder = () => GLib.getenv('KESTREL_UNREVIEWED_EXTENSIONS')!;
const folders = () => GLib.build_filenamev([folder(), FOLDERS]);

function removeTree(file: Gio.File) {
  if (file.query_file_type(Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null) === Gio.FileType.DIRECTORY) {
    const children = file.enumerate_children('standard::name', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);
    for (let info = children.next_file(null); info; info = children.next_file(null)) removeTree(file.get_child(info.get_name()));
  }
  file.delete(null);
}

function copyTree(from: Gio.File, to: Gio.File) {
  to.make_directory(null);
  const children = from.enumerate_children('standard::name,standard::type', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);
  for (let info = children.next_file(null); info; info = children.next_file(null)) {
    const source = from.get_child(info.get_name());
    const target = to.get_child(info.get_name());
    if (info.get_file_type() === Gio.FileType.DIRECTORY) copyTree(source, target);
    else if (info.get_file_type() === Gio.FileType.REGULAR) source.copy(target, Gio.FileCopyFlags.NOFOLLOW_SYMLINKS, null, null);
    else throw new Refusal(FAILED, `${info.get_name()} is a link, and links can't be copied`);
  }
}

function readFolders(): Record<string, string> {
  try {
    return JSON.parse(new TextDecoder().decode(GLib.file_get_contents(folders())[1])) as Record<string, string>;
  } catch {
    return {};
  }
}

const writeFolders = (approved: Record<string, string>) => GLib.file_set_contents(folders(), JSON.stringify(approved));

export function unreviewedExtensions(calls: string[], developerTools: () => boolean) {
  const answer = (invocation: Gio.DBusMethodInvocation, approving: boolean, call: string, work: () => void) => {
    try {
      if (approving && !developerTools())
        throw new Refusal(NOT_AUTHORIZED, 'Extensions nobody reviewed only run inside Luft while Developer tools is on.');
      work();
      calls.push(`Packages ${call}`);
      invocation.return_value(null);
    } catch (error) {
      invocation.return_dbus_error(error instanceof Refusal ? error.dbusName : FAILED, (error as Error).message);
    }
  };
  return {
    InstallUnreviewedExtensionAsync([id, handle]: [string, number], invocation: Gio.DBusMethodInvocation) {
      const fd = invocation.get_message().get_unix_fd_list()!.get(handle);
      answer(invocation, true, `InstallUnreviewedExtension ${id}`, () => {
        const target = Gio.File.new_for_path(GLib.build_filenamev([folder(), id]));
        const staging = Gio.File.new_for_path(GLib.build_filenamev([folder(), `.${id}.unpacking`]));
        try {
          copyTree(Gio.File.new_for_path(GLib.file_read_link(`/proc/self/fd/${fd}`)), staging);
          if (target.query_exists(null)) removeTree(target);
          staging.move(target, Gio.FileCopyFlags.NONE, null, null);
        } finally {
          if (staging.query_exists(null)) removeTree(staging);
          GLib.close(fd);
        }
      });
    },
    AllowExtensionFolderAsync([id, path]: [string, string], invocation: Gio.DBusMethodInvocation) {
      answer(invocation, true, `AllowExtensionFolder ${id} ${path}`, () => {
        if (GLib.path_get_basename(path) !== id || !GLib.path_is_absolute(path)) throw new Refusal(FAILED, `${path} isn't the folder of ${id}`);
        writeFolders({...readFolders(), [id]: path});
      });
    },
    RemoveUnreviewedExtensionAsync([id]: [string], invocation: Gio.DBusMethodInvocation) {
      answer(invocation, false, `RemoveUnreviewedExtension ${id}`, () => {
        const copy = Gio.File.new_for_path(GLib.build_filenamev([folder(), id]));
        if (copy.query_exists(null)) removeTree(copy);
        const {[id]: _removed, ...rest} = readFolders();
        writeFolders(rest);
      });
    },
  };
}
