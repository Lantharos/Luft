import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';
import Shell from 'gi://Shell';

const LAUNCHER_VARIABLES = ['SteamGameId=', 'LUTRIS_GAME_UUID=', 'HEROIC_APP_NAME='];
const GAME_CLASS = /^(steam_app_.*|gamescope)$/i;
const START_TIME_FIELD = 19;

const launchedProcesses = new Map<number, { started: string; game: boolean }>();

function startTime(pid: number): string | null {
  try {
    const [, contents] = GLib.file_get_contents(`/proc/${pid}/stat`);
    const stat = new TextDecoder().decode(contents);
    return stat.slice(stat.lastIndexOf(')') + 2).split(' ')[START_TIME_FIELD];
  } catch {
    return null;
  }
}

function readLauncherVariables(pid: number): boolean {
  try {
    const [, contents] = GLib.file_get_contents(`/proc/${pid}/environ`);
    return new TextDecoder().decode(contents).split('\0')
      .some(variable => LAUNCHER_VARIABLES.some(prefix => variable.startsWith(prefix)));
  } catch {
    return false;
  }
}

function forgetExitedProcesses(): void {
  for (const [pid, process] of launchedProcesses)
    if (startTime(pid) !== process.started) launchedProcesses.delete(pid);
}

function launchedByGameLauncher(pid: number): boolean {
  if (pid <= 0) return false;
  const started = startTime(pid);
  if (started === null) return false;
  const known = launchedProcesses.get(pid);
  if (known?.started === started) return known.game;
  forgetExitedProcesses();
  const game = readLauncherVariables(pid);
  launchedProcesses.set(pid, { started, game });
  return game;
}

export function isGame(window: Meta.Window): boolean {
  if (GAME_CLASS.test(window.get_wm_class() ?? '')) return true;
  const categories = Shell.WindowTracker.get_default().get_window_app(window)?.get_app_info()?.get_categories() ?? '';
  return categories.split(';').includes('Game') || launchedByGameLauncher(window.get_pid());
}
