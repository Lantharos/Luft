import GLib from 'gi://GLib';

export interface Session {
  id: string;
  name: string;
  exec: string;
  desktopNames: string;
}

const GROUP = 'Desktop Entry';
const SESSIONS_DIRECTORY = 'wayland-sessions';

function programExists(command: string): boolean {
  return GLib.path_is_absolute(command) ? GLib.file_test(command, GLib.FileTest.IS_EXECUTABLE) : !!GLib.find_program_in_path(command);
}

function desktopFiles(path: string): string[] {
  const directory = GLib.Dir.open(path, 0);
  const names: string[] = [];
  for (let name = directory.read_name(); name; name = directory.read_name())
    if (name.endsWith('.desktop')) names.push(name);
  directory.close();
  return names;
}

function optional<T>(read: () => T): T | null {
  try {
    return read();
  } catch {
    return null;
  }
}

function readSession(path: string, id: string): Session | null {
  const file = new GLib.KeyFile();
  if (!optional(() => file.load_from_file(path, GLib.KeyFileFlags.NONE))) return null;
  if (optional(() => file.get_boolean(GROUP, 'Hidden')) || optional(() => file.get_boolean(GROUP, 'NoDisplay'))) return null;
  const tryExec = optional(() => file.get_string(GROUP, 'TryExec'));
  const exec = optional(() => file.get_string(GROUP, 'Exec'));
  if (!exec || (tryExec && !programExists(tryExec))) return null;
  return {
    id,
    name: optional(() => file.get_locale_string(GROUP, 'Name', null)) ?? id,
    exec: exec.replace(/%[a-zA-Z]/g, '').trim(),
    desktopNames: optional(() => file.get_string_list(GROUP, 'DesktopNames').join(':')) ?? id,
  };
}

export function availableSessions(): Session[] {
  const sessions = new Map<string, Session>();
  for (const dataDirectory of GLib.get_system_data_dirs()) {
    const path = GLib.build_filenamev([dataDirectory, SESSIONS_DIRECTORY]);
    let names: string[];
    try {
      names = desktopFiles(path);
    } catch {
      continue;
    }
    for (const name of names) {
      const id = name.slice(0, -'.desktop'.length);
      if (sessions.has(id)) continue;
      const session = readSession(GLib.build_filenamev([path, name]), id);
      if (session) sessions.set(id, session);
    }
  }
  return [...sessions.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function sessionCommand(session: Session): { command: string[]; environment: string[] } {
  return {
    command: ['systemd-cat', `--identifier=${session.id}`, session.exec],
    environment: [
      'XDG_SESSION_TYPE=wayland',
      `XDG_SESSION_DESKTOP=${session.id}`,
      `XDG_CURRENT_DESKTOP=${session.desktopNames}`,
    ],
  };
}
