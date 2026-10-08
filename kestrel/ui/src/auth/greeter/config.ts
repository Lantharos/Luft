import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

export interface GreeterConfig {
  showUsers: boolean;
  hiddenUsers: string[];
  defaultSession: string;
  numLock: boolean;
}

const DEFAULTS: GreeterConfig = { showUsers: true, hiddenUsers: [], defaultSession: '', numLock: true };

export const STATE_DIRECTORY = GLib.getenv('KESTREL_GREETER_STATE_DIR') ?? '/var/lib/kestrel-greeter';

export function stateFile(...path: string[]): Gio.File {
  return Gio.File.new_for_path(GLib.build_filenamev([STATE_DIRECTORY, ...path]));
}

export function readConfig(): GreeterConfig {
  try {
    const [, contents] = stateFile('config.json').load_contents(null);
    return { ...DEFAULTS, ...JSON.parse(new TextDecoder().decode(contents)) };
  } catch {
    return DEFAULTS;
  }
}
