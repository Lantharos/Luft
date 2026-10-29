import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

const MAX_LINKS = 40;

export type Identity = { app: string } | { program: string };

export function identifyProcess(pid: number): Identity | null {
  if (pid <= 0) return null;
  const [judged, app, program] = Meta.process_identify_pid(pid);
  if (!judged) return null;
  return app ? { app } : { program: program! };
}

function realPath(path: string): string {
  for (let links = 0; links < MAX_LINKS && GLib.file_test(path, GLib.FileTest.IS_SYMLINK); links++)
    path = GLib.canonicalize_filename(GLib.file_read_link(path), GLib.path_get_dirname(path));
  return path;
}

function appRunning(program: string): Shell.App | null {
  const appSystem = Shell.AppSystem.get_default();
  const info = appSystem.get_installed().find(candidate => {
    const executable = GLib.find_program_in_path(candidate.get_executable());
    return !!executable && realPath(executable) === program;
  });
  return info ? appSystem.lookup_app(info.get_id()!) : null;
}

export interface VerifiedApp {
  name: string;
  app: Shell.App | null;
}

export function verifiedApp(identity: Identity): VerifiedApp {
  if ('app' in identity) {
    const app = Shell.AppSystem.get_default().lookup_app(`${identity.app}.desktop`);
    return { name: app?.get_name() ?? identity.app, app };
  }
  const app = appRunning(identity.program);
  return { name: app?.get_name() ?? GLib.path_get_basename(identity.program), app };
}

export function verifiedName(pid: number): string | null {
  const identity = identifyProcess(pid);
  return identity && verifiedApp(identity).name;
}
