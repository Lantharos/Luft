import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';

import type { Box } from '../../../shared/layout/placement.js';
import { boxOf } from '../frames.js';

export interface SavedWindow {
  pid: number;
  app: string;
  title: string;
  frame: Box;
  workspace: number;
  maximized: boolean;
  fullscreen: boolean;
  minimized: boolean;
  above: boolean;
  edges: number;
  focused: boolean;
}

const file = () => Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_runtime_dir(), 'kestrel', GLib.getenv('WAYLAND_DISPLAY')!, 'windows.json']));

export const appOf = (window: Meta.Window) => window.get_wm_class() ?? '';

export function remembered(window: Meta.Window): boolean {
  return window.window_type === Meta.WindowType.NORMAL && !window.is_override_redirect() && (window.get_pid() as number) > 0;
}

function save(window: Meta.Window): SavedWindow {
  return {
    pid: window.get_pid() as number,
    app: appOf(window),
    title: window.get_title() ?? '',
    frame: boxOf(window.get_frame_rect()),
    workspace: window.is_on_all_workspaces() ? -1 : window.get_workspace()?.index() ?? 0,
    maximized: window.maximized_horizontally && window.maximized_vertically,
    fullscreen: window.fullscreen,
    minimized: window.minimized,
    above: window.above,
    edges: window.get_tiled_edges(),
    focused: window.has_focus(),
  };
}

export function capture(): SavedWindow[] {
  return global.display.sort_windows_by_stacking(global.display.list_all_windows().filter(remembered)).map(save);
}

export function write(windows: SavedWindow[], written: () => void): void {
  const target = file();
  GLib.mkdir_with_parents(target.get_parent()!.get_path()!, 0o700);
  target.replace_contents_bytes_async(new GLib.Bytes(new TextEncoder().encode(JSON.stringify(windows))), null, false,
    Gio.FileCreateFlags.PRIVATE | Gio.FileCreateFlags.REPLACE_DESTINATION, null, (source, result) => {
      try {
        source!.replace_contents_finish(result);
      } catch (error) {
        console.warn(`The open windows could not be noted: ${error}`);
      }
      written();
    });
}

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
