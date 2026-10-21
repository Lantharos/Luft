import type Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import { isGame } from '../../desktop/windows/games.js';

export interface SessionMode {
  readonly isLocked: boolean;
  readonly isGreeter: boolean;
  readonly isSetup: boolean;
}

const RECENT_INPUT_MS = 3000;

let session: SessionMode | null = null;
const sharing = new Set<Meta.RemoteAccessHandle>();

export function followSession(mode: SessionMode): void {
  session = mode;
  global.backend.get_remote_access_controller()?.connect('new-handle', (_controller, handle: Meta.RemoteAccessHandle) => {
    if (handle.is_recording) return;
    sharing.add(handle);
    handle.connect('stopped', () => sharing.delete(handle));
  });
}

export function onlyErrors(): boolean {
  return !session || session.isLocked || session.isGreeter || session.isSetup;
}

function playingFullscreenGame(): boolean {
  const window = global.display.focus_window;
  return window !== null && window.is_fullscreen() && isGame(window);
}

export function busy(): boolean {
  return sharing.size > 0 || playingFullscreenGame();
}

export function interactingWith(appId: string): boolean {
  const focused = Shell.WindowTracker.get_default().focus_app?.get_id();
  if (focused !== appId && focused !== `${appId}.desktop`) return false;
  return global.backend.get_core_idle_monitor().get_idletime() < RECENT_INPUT_MS;
}
