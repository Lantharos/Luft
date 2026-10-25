import Clutter from 'gi://Clutter';
import Cogl from 'gi://Cogl';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import St from 'gi://St';

import type { Monitor } from '../panel/panel.js';
import { visibleWallpaperMonitors } from '../panel/coverage.js';
import { PlaybackConditions } from '../wallpaper/conditions.js';
import { animateActor, reducedMotion } from '../../shared/motion/motion.js';
import { DECLARATIONS, MAIN, MAX_SURFACES } from './shader.js';
import { WEATHER, type Intensity } from './weather.js';

export type Rect = Omit<Monitor, 'index'>;

export interface RainHost {
  monitors(): Monitor[];
  taskbar(monitor: Monitor): Rect | null;
}

const SURFACE_TYPES = [Meta.WindowType.NORMAL, Meta.WindowType.DIALOG, Meta.WindowType.MODAL_DIALOG];
const FADE_DURATION = 600;
const TIME_WRAP_S = 3600;
const SNIPPET = (() => {
  const snippet = Cogl.Snippet.new(Cogl.SnippetHook.FRAGMENT, DECLARATIONS, null);
  snippet.set_replace(MAIN);
  return snippet;
})();

const RainActor = GObject.registerClass(class RainActor extends Clutter.Actor {
  readonly pipeline: Cogl.Pipeline;

  constructor() {
    super({ reactive: false });
    const context = global.stage.context.get_backend().get_cogl_context();
    this.pipeline = Cogl.Pipeline.new(context);
    this.pipeline.set_layer_texture(0, Cogl.Texture2D.new_with_size(context, 1, 1));
    this.pipeline.add_snippet(SNIPPET);
  }

  uniform(name: string, values: number[], components = values.length): void {
    const location = this.pipeline.get_uniform_location(name);
    if (components === 1 && values.length === 1) this.pipeline.set_uniform_1f(location, values[0]);
    else this.pipeline.set_uniform_float(location, components, values.length / components, values);
  }

  vfunc_paint_node(root: Clutter.PaintNode): void {
    const node = Clutter.PipelineNode.new(this.pipeline);
    root.add_child(node);
    node.add_rectangle(Clutter.ActorBox.new(0, 0, this.width, this.height));
  }
});
type RainActor = InstanceType<typeof RainActor>;

function onScreen(window: Meta.Window, workspace: Meta.Workspace): boolean {
  const actor = window.get_compositor_private() as Meta.WindowActor | null;
  return !window.minimized && window.showing_on_its_workspace() && window.located_on_workspace(workspace) &&
    SURFACE_TYPES.includes(window.window_type) && !!actor?.visible && actor.opacity > 0;
}

class Sheet {
  readonly actor = new RainActor();
  destroyed = false;

  constructor(readonly monitor: Monitor) {
    this.actor.connect('destroy', () => (this.destroyed = true));
    this.actor.set_position(monitor.x, monitor.y);
    this.actor.set_size(monitor.width, monitor.height);
    this.actor.uniform('rain_size', [monitor.width, monitor.height]);
  }

  paint(time: number, density: number, wind: number, windows: Rect[], taskbar: Rect | null): void {
    const { x, y, width, height } = this.monitor;
    const rects = windows
      .filter(rect => rect.x < x + width && rect.x + rect.width > x && rect.y < y + height && rect.y + rect.height > y)
      .slice(0, MAX_SURFACES);
    const values = new Array<number>(MAX_SURFACES * 4).fill(0);
    rects.forEach((rect, index) => values.splice(index * 4, 4, rect.x - x, rect.y - y, rect.width, rect.height));
    this.actor.uniform('rain_time', [time]);
    this.actor.uniform('rain_density', [density]);
    this.actor.uniform('rain_wind', [wind]);
    this.actor.uniform('rain_count', [rects.length]);
    this.actor.uniform('rain_rects', values, 4);
    this.actor.uniform('rain_bar', taskbar ? [taskbar.x - x, taskbar.y - y, taskbar.width, taskbar.height] : [0, 0, 0, 0]);
    this.actor.queue_redraw();
  }

  destroy(): void {
    if (!this.destroyed) this.actor.destroy();
  }
}

export class Rain {
  private readonly settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });
  private readonly shell = St.Settings.get();
  private readonly conditions = new PlaybackConditions(() => this.sync(), null);
  private readonly settingsSignals: number[];
  private readonly shellSignals: number[];
  private readonly started = GLib.get_monotonic_time();
  private readonly timeline = new Clutter.Timeline({ actor: global.stage, duration: 1000, repeat_count: -1 });
  private sheets: Sheet[] = [];
  private desktopVisible = false;

  constructor(private readonly host: RainHost) {
    this.settingsSignals = ['rain', 'rain-visible', 'rain-intensity'].map(key => this.settings.connect(`changed::${key}`, () => this.sync()));
    this.shellSignals = [
      this.shell.connect('notify::enable-animations', () => this.sync()),
      this.shell.connect('notify::reduced-motion', () => this.sync()),
    ];
    this.timeline.connect('new-frame', () => this.frame());
  }

  private get allowed(): boolean {
    return this.settings.get_boolean('rain') && this.settings.get_boolean('rain-visible') && this.desktopVisible && this.conditions.allowed &&
      this.shell.enable_animations && !reducedMotion();
  }

  sync(desktopVisible = this.desktopVisible): void {
    this.desktopVisible = desktopVisible;
    const visible = this.allowed ? visibleWallpaperMonitors(this.host.monitors()) : new Set<number>();
    if (visible.size && !this.sheets.length) this.build();
    for (const sheet of this.sheets.filter(sheet => !sheet.destroyed)) this.show(sheet, visible.has(sheet.monitor.index));
    if (visible.size && !this.timeline.is_playing()) {
      this.frame();
      this.timeline.start();
    }
  }

  monitorsChanged(): void {
    if (!this.sheets.length) return;
    this.clear();
    this.sync();
  }

  private build(): void {
    const uiGroup = global.window_group.get_parent()!;
    this.sheets = this.host.monitors().map(monitor => {
      const sheet = new Sheet(monitor);
      sheet.actor.opacity = 0;
      sheet.actor.visible = false;
      uiGroup.insert_child_above(sheet.actor, global.window_group);
      return sheet;
    });
  }

  private show(sheet: Sheet, shown: boolean): void {
    const { actor } = sheet;
    if (shown) actor.show();
    animateActor(actor, {
      opacity: shown ? 255 : 0,
      duration: FADE_DURATION,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      onStopped: () => {
        if (actor.opacity !== 0) return;
        actor.hide();
        if (this.sheets.every(other => other.destroyed || !other.actor.visible)) this.timeline.stop();
      },
    });
  }

  private frame(): void {
    const time = ((GLib.get_monotonic_time() - this.started) / GLib.USEC_PER_SEC) % TIME_WRAP_S;
    const weather = WEATHER[this.settings.get_string('rain-intensity') as Intensity] ?? WEATHER.rain;
    const gust = 1 + 0.35 * Math.sin(time * 0.21) + 0.15 * Math.sin(time * 0.73 + 1.3);
    const workspace = global.workspace_manager.get_active_workspace();
    const windows = global.display.sort_windows_by_stacking(workspace.list_windows().filter(window => onScreen(window, workspace)))
      .reverse()
      .map(window => {
        const { x, y, width, height } = window.get_frame_rect();
        return { x, y, width, height };
      });
    for (const sheet of this.sheets) {
      if (!sheet.destroyed && sheet.actor.visible) sheet.paint(time, weather.density, weather.wind * gust, windows, this.host.taskbar(sheet.monitor));
    }
  }

  private clear(): void {
    this.timeline.stop();
    for (const sheet of this.sheets) sheet.destroy();
    this.sheets = [];
  }

  destroy(): void {
    for (const id of this.settingsSignals) this.settings.disconnect(id);
    for (const id of this.shellSignals) this.shell.disconnect(id);
    this.conditions.destroy();
    this.clear();
  }
}
