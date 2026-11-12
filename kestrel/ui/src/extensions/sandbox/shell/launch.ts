import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

import { PKGDATADIR } from '../../../core/config.js';
import { developmentPath } from '../../../shared/apps/development.js';

const HOST = 'kestrel-extension-host.js';
const INSIDE_HOST = '/host.js';
const FILTER_FD = 3;
const MOST_MEMORY = 512 * 1024 * 1024;
const SHARED_ROOT_LINKS = ['/bin', '/lib', '/lib64', '/sbin'];

const build = developmentPath('KESTREL_BUILDDIR');

const hostScript = () => build ? GLib.build_filenamev([build, '..', 'ui', HOST]) : GLib.build_filenamev([PKGDATADIR, HOST]);

function rootLinks(): string[] {
  return SHARED_ROOT_LINKS.flatMap(link => {
    const target = GLib.file_test(link, GLib.FileTest.IS_SYMLINK) ? GLib.file_read_link(link) : null;
    return target ? ['--symlink', target, link] : ['--ro-bind-try', link, link];
  });
}

const environment = (variables: Record<string, string>) => Object.entries(variables).flatMap(([name, value]) => ['--setenv', name, value]);

export interface Folders {
  path: string;
  dataPath: string;
}

function sandboxArguments({ path, dataPath }: Folders, binds: string[], command: string[]): string[] {
  return [
    '/usr/bin/prlimit', `--data=${MOST_MEMORY}`, '--',
    '/usr/bin/bwrap', '--unshare-all', '--unshare-user', '--disable-userns', '--die-with-parent', '--new-session', '--clearenv',
    '--ro-bind', '/usr', '/usr', ...rootLinks(),
    '--proc', '/proc', '--dev', '/dev', '--tmpfs', '/tmp',
    '--ro-bind', path, path,
    '--bind', dataPath, dataPath,
    ...binds,
    '--seccomp', `${FILTER_FD}`,
    '--chdir', path,
    ...environment({
      HOME: GLib.get_home_dir(), PATH: '/usr/bin', LANG: 'C.UTF-8', GIO_USE_VFS: 'local', GSETTINGS_BACKEND: 'memory', LUFT_EXTENSION_DIR: path,
    }),
    '--', ...command,
  ];
}

export function spawnSandboxed(folders: Folders, command: string[], flags = Gio.SubprocessFlags.NONE, binds: string[] = []): Gio.Subprocess {
  GLib.mkdir_with_parents(folders.dataPath, 0o700);
  const launcher = new Gio.SubprocessLauncher({ flags });
  launcher.take_fd(Shell.sandbox_filter(), FILTER_FD);
  return launcher.spawnv(sandboxArguments(folders, binds, command));
}

export const spawnHost = (folders: Folders): Gio.Subprocess =>
  spawnSandboxed(folders, ['/usr/bin/gjs', '-m', INSIDE_HOST], Gio.SubprocessFlags.STDIN_PIPE | Gio.SubprocessFlags.STDOUT_PIPE, ['--ro-bind', hostScript(), INSIDE_HOST]);
