import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import { boxOf } from '../frames.js';
import type { Placement } from './placement.js';

export interface SavedWindow extends Placement {
  pid: number;
  app: string;
  appId: string;
  title: string;
  tag: string;
  monitor: number;
  sequence: number;
  focused: boolean;
}

const file = () => Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_runtime_dir(), 'kestrel', GLib.getenv('WAYLAND_DISPLAY')!, 'windows.json']));

export const appOf = (window: Meta.Window) => window.get_wm_class() ?? '';

export function appIdOf(window: Meta.Window): string {
  const app = Shell.WindowTracker.get_default().get_window_app(window);
  return app && !app.is_window_backed() ? app.get_id() : '';
}

export function remembered(window: Meta.Window): boolean {
  return window.window_type === Meta.WindowType.NORMAL && !window.is_override_redirect() && (window.get_pid() as number) > 0;
}

function save(window: Meta.Window, lastFocused: Meta.Window | undefined): SavedWindow {
  return {
    pid: window.get_pid() as number,
    app: appOf(window),
    appId: appIdOf(window),
    title: window.get_title() ?? '',
    tag: window.get_tag() ?? '',
    frame: boxOf(window.get_frame_rect()),
    monitor: window.get_monitor(),
    sequence: window.get_stable_sequence(),
    workspace: window.is_on_all_workspaces() ? -1 : window.get_workspace()?.index() ?? 0,
    maximized: window.maximized_horizontally && window.maximized_vertically,
    fullscreen: window.fullscreen,
    minimized: window.minimized,
    above: window.above,
    edges: window.get_tiled_edges(),
    focused: window === lastFocused,
  };
}

export function capture(): SavedWindow[] {
  const [lastFocused] = global.display.get_tab_list(Meta.TabList.NORMAL_ALL, null);
  return global.display.sort_windows_by_stacking(global.display.list_all_windows().filter(remembered)).map(window => save(window, lastFocused));
}

export function write(windows: string, written: () => void): void {
  const target = file();
  GLib.mkdir_with_parents(target.get_parent()!.get_path()!, 0o700);
  target.replace_contents_bytes_async(new GLib.Bytes(new TextEncoder().encode(windows)), null, false,
    Gio.FileCreateFlags.PRIVATE | Gio.FileCreateFlags.REPLACE_DESTINATION, null, (source, result) => {
      try {
        source!.replace_contents_finish(result);
      } catch (error) {
        console.warn(`The open windows could not be noted: ${error}`);
      }
      written();
    });
}

export const alive = (saved: SavedWindow) => GLib.file_test(`/proc/${saved.pid}`, GLib.FileTest.EXISTS);

export function read(): SavedWindow[] {
  try {
    const [, contents] = file().load_contents(null);
    return JSON.parse(new TextDecoder().decode(contents)) as SavedWindow[];
  } catch (error) {
    if (!(error instanceof GLib.Error && error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND)))
      console.warn(`The windows open before Kestrel restarted could not be read: ${error}`);
    return [];
  }
}
