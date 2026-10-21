import GLib from 'gi://GLib';
import { LIBEXECDIR } from 'resource:///com/lantharos/kestrel/misc/config.js';

const BUILD_DIRECTORY = GLib.getenv('KESTREL_BUILDDIR');

export function helperProgram(name: string, inBuild: string): string {
  return BUILD_DIRECTORY ? GLib.build_filenamev([BUILD_DIRECTORY, inBuild]) : GLib.build_filenamev([LIBEXECDIR, name]);
}
