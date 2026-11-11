import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import { LIBEXECDIR } from '../../core/config.js';
import { developmentPath } from './development.js';

const BUILD_DIRECTORY = developmentPath('KESTREL_BUILDDIR');

export function helperProgram(name: string, inBuild: string): string {
  return BUILD_DIRECTORY ? GLib.build_filenamev([BUILD_DIRECTORY, inBuild]) : GLib.build_filenamev([LIBEXECDIR, name]);
}

export function helperLauncher(flags = Gio.SubprocessFlags.NONE): Gio.SubprocessLauncher {
  const launcher = new Gio.SubprocessLauncher({ flags });
  launcher.set_environ(global.get_luft_environment());
  return launcher;
}
