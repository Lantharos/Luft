import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import { LIBEXECDIR } from 'resource:///org/gnome/shell/misc/config.js';

import type { Monitor } from '../panel/panel.js';
import { animateActor } from '../shared/motion.js';

const FADE_DURATION = 400;
const SIGTERM = 15;
const BUILD_DIRECTORY = GLib.getenv('GNOME_SHELL_BUILDDIR');

export const RENDERER = BUILD_DIRECTORY ? `${BUILD_DIRECTORY}/wallpaper/kestrel-wallpaper` : `${LIBEXECDIR}/kestrel-wallpaper`;

function shell(): Shell.Global {
  return global as unknown as Shell.Global;
}

export class Renderer {
  private readonly client: Meta.WaylandClient;
  private readonly commands: Gio.OutputStream;
  private readonly windows = new Set<Meta.Window>();
  private readonly createdId: number;
  private readonly mapId: number;
  private sent: string | null = null;
  private pending: string | null = null;
  private writing = false;

  constructor(readonly uri: string, private readonly monitors: () => Monitor[], private readonly windowsChanged: () => void) {
    const launcher = new Gio.SubprocessLauncher({ flags: Gio.SubprocessFlags.STDIN_PIPE });
    this.client = Meta.WaylandClient.new_subprocess(shell().context, launcher, [RENDERER, uri]);
    this.commands = this.client.get_subprocess().get_stdin_pipe()!;
    this.createdId = shell().display.connect('window-created', (_display, window: Meta.Window) => {
      if (this.client.owns_window(window)) this.adopt(window);
    });
    this.mapId = shell().window_manager.connect('map', (_wm, actor: Meta.WindowActor) => {
      if (!this.windows.has(actor.meta_window!)) return;
      this.place(actor.meta_window!);
      actor.opacity = 0;
      animateActor(actor, { opacity: 255, duration: FADE_DURATION, mode: Clutter.AnimationMode.EASE_OUT_QUAD });
    });
  }

  private adopt(window: Meta.Window): void {
    window.set_type(Meta.WindowType.DESKTOP);
    window.connect('unmanaged', () => {
      this.windows.delete(window);
      this.windowsChanged();
    });
    this.windows.add(window);
    this.windowsChanged();
  }

  private monitorOf(window: Meta.Window): Monitor | undefined {
    const index = shell().backend.get_monitor_manager().get_monitor_for_connector(window.title ?? '');
    return this.monitors().find(monitor => monitor.index === index);
  }

  private place(window: Meta.Window): void {
    const monitor = this.monitorOf(window);
    if (!monitor) return;
    window.move_resize_frame(false, monitor.x, monitor.y, monitor.width, monitor.height);
  }

  placeAll(): void {
    for (const window of this.windows) this.place(window);
  }

  play(visibleMonitors: Set<number>): void {
    const connectors = [...this.windows]
      .filter(window => {
        const monitor = this.monitorOf(window);
        return !!monitor && visibleMonitors.has(monitor.index);
      })
      .map(window => window.title);
    const line = connectors.join(' ');
    if (line === (this.pending ?? this.sent)) return;
    this.pending = line;
    this.send();
  }

  private send(): void {
    if (this.writing || this.pending === null) return;
    const line = this.pending;
    this.pending = null;
    this.writing = true;
    this.commands.write_all_async(new TextEncoder().encode(`${line}\n`), GLib.PRIORITY_DEFAULT, null, (stream, result) => {
      this.writing = false;
      try {
        stream!.write_all_finish(result);
      } catch {
        return;
      }
      this.sent = line;
      this.send();
    });
  }

  stop(): void {
    shell().display.disconnect(this.createdId);
    shell().window_manager.disconnect(this.mapId);
    const actors = [...this.windows].map(window => window.get_compositor_private() as Meta.WindowActor);
    const quit = () => this.client.get_subprocess().send_signal(SIGTERM);
    if (!actors.length) {
      quit();
      return;
    }
    actors.forEach((actor, index) => animateActor(actor, {
      opacity: 0,
      duration: FADE_DURATION,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      onStopped: index === 0 ? quit : undefined,
    }));
  }
}
