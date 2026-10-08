import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';
import Shell from 'gi://Shell';

const LAUNCHER_VARIABLES = ['SteamGameId=', 'LUTRIS_GAME_UUID=', 'HEROIC_APP_NAME='];
const GAME_CLASS = /^(steam_app_.*|gamescope)$/i;

function launchedByGameLauncher(pid: number): boolean {
  if (pid <= 0) return false;
  try {
    const [, contents] = GLib.file_get_contents(`/proc/${pid}/environ`);
    return new TextDecoder().decode(contents).split('\0')
      .some(variable => LAUNCHER_VARIABLES.some(prefix => variable.startsWith(prefix)));
  } catch {
    return false;
  }
}

export function isGame(window: Meta.Window): boolean {
  if (GAME_CLASS.test(window.get_wm_class() ?? '')) return true;
  const categories = Shell.WindowTracker.get_default().get_window_app(window)?.get_app_info()?.get_categories() ?? '';
  return categories.split(';').includes('Game') || launchedByGameLauncher(window.get_pid());
}
