import Clutter from 'gi://Clutter';
import Cogl from 'gi://Cogl';
import Gio from 'gi://Gio';
import Shell from 'gi://Shell';
import St from 'gi://St';
import GLib from 'gi://GLib';

import * as Background from '../../core/stage/background.js';
import * as BackgroundStore from '../../core/stage/backgroundStore.js';
import * as Main from '../../core/main.js';

const DOWNSCALE = 4;
const BLUR_RADIUS = 90;

interface Frost {
  name: string;
  brightness: number;
  saturation: number;
  wash: Cogl.Color | null;
}

const FROSTS: Record<'dark' | 'light', Frost> = {
  dark: { name: 'dark', brightness: 0.65, saturation: 1, wash: null },
  light: { name: 'light', brightness: 1, saturation: 1.5, wash: new Cogl.Color({ red: 250, green: 250, blue: 252, alpha: 77 }) },
};

interface Kept {
  key: string;
  texture: Cogl.Texture;
}

const kept = new Map<string, Kept>();

interface Monitor {
  x: number;
  y: number;
  width: number;
  height: number;
  geometry_scale: number;
}

interface LockBackdropOptions {
  offscreen?: boolean;
}

function mapped(actor: Clutter.Actor): Promise<void> {
  if (actor.mapped) return Promise.resolve();
  return new Promise(resolve => {
    const id = actor.connect('notify::mapped', () => {
      if (!actor.mapped) return;
      actor.disconnect(id);
      resolve();
    });
  });
}

function painted(): Promise<void> {
  return new Promise(resolve => {
    const id = global.stage.connect('after-paint', () => {
      global.stage.disconnect(id);
      resolve();
    });
  });
}

function settled(container: Clutter.Actor): Promise<void> {
  if (container.get_n_children() === 1) return Promise.resolve();
  return new Promise(resolve => {
    const id = container.connect('child-removed', () => {
      if (container.get_n_children() > 1) return;
      container.disconnect(id);
      resolve();
    });
  });
}

class MonitorBackdrop {
  readonly shown: Promise<void>;
  private readonly cancellable = new Gio.Cancellable();
  private readonly radius: number;
  private readonly source: Clutter.Actor;
  private readonly widget: St.Widget;
  private readonly blur: Shell.BlurEffect;
  private readonly manager: Background.BackgroundManager;
  private generation = 0;

  constructor(private readonly display: Clutter.Actor, private readonly monitor: Monitor, monitorIndex: number, private readonly frost: Frost) {
    const { scaleFactor } = St.ThemeContext.get_for_stage(global.stage);
    const { x, y, width, height } = monitor;
    this.radius = BLUR_RADIUS * scaleFactor;
    this.blur = new Shell.BlurEffect({ brightness: frost.brightness, saturation: frost.saturation, radius: this.radius });

    this.source = new Clutter.Actor({ x, y, width, height, opacity: 0 });
    this.widget = new St.Widget({ width, height });
    this.source.add_child(this.widget);
    if (frost.wash) this.source.add_child(new Clutter.Actor({ width, height, background_color: frost.wash }));
    display.get_parent()!.add_child(this.source);

    this.manager = new Background.BackgroundManager({ container: this.widget, monitorIndex, controlPosition: false });
    const loaded = new Promise<void>(resolve => {
      const id = this.manager.connect('loaded', () => {
        this.manager.disconnect(id);
        resolve();
      });
    });
    this.shown = loaded.then(() => this.refresh());
    this.manager.connect('changed', () => void this.refresh());
  }

  async key(): Promise<string | null> {
    try {
      const { background } = this.manager.backgroundActor.content;
      const source = await background.storeKey(this.cancellable);
      const { x, y, width, height, geometry_scale: scale } = this.monitor;
      return source && `${source} ${background.focus} frost ${x},${y} ${width}x${height}@${scale} ${this.radius} ${this.frost.name} /${DOWNSCALE}`;
    } catch {
      return null;
    }
  }

  private async refresh(): Promise<void> {
    const generation = ++this.generation;
    const key = await this.key();
    const known = kept.get(this.slot);
    if (key && known?.key === key) {
      this.show(known.texture);
      return;
    }
    const stored = key && await BackgroundStore.load(key, GLib.PRIORITY_DEFAULT, this.cancellable);
    if (generation !== this.generation) return;
    if (stored) {
      this.keep(key, stored.texture);
      return;
    }
    await settled(this.widget);
    if (generation !== this.generation) return;
    this.widget.add_effect(this.blur);
    this.source.opacity = 255;
    void this.freeze(generation, key);
  }

  private async freeze(generation: number, key: string | null): Promise<void> {
    await mapped(this.source);
    await painted();
    if (generation !== this.generation) return;
    const texture = this.paintSmall();
    if (!texture) return;
    if (key) this.keep(key, texture);
    else this.show(texture);
    if (key && !BackgroundStore.has(key)) BackgroundStore.store(key, () => texture);
  }

  private paintSmall(): Cogl.Texture | null {
    const blurred = Shell.texture_file_paint_actor(this.source);
    if (!blurred) return null;
    const { x, y, width, height } = this.monitor;
    const small = new Clutter.Actor({ x, y, width: Math.ceil(width / DOWNSCALE), height: Math.ceil(height / DOWNSCALE), opacity: 0 });
    small.set_content(Clutter.TextureContent.new_from_texture(blurred, null));
    small.set_content_scaling_filters(Clutter.ScalingFilter.TRILINEAR, Clutter.ScalingFilter.LINEAR);
    this.source.get_parent()!.add_child(small);
    small.allocate_preferred_size(x, y);
    const texture = Shell.texture_file_paint_actor(small);
    small.destroy();
    return texture;
  }

  private get slot(): string {
    const { x, y, width, height, geometry_scale: scale } = this.monitor;
    return `${x},${y} ${width}x${height}@${scale} ${this.frost.name}`;
  }

  private keep(key: string, texture: Cogl.Texture): void {
    kept.set(this.slot, { key, texture });
    this.show(texture);
  }

  private show(texture: Cogl.Texture): void {
    this.display.set_content(Clutter.TextureContent.new_from_texture(texture, null));
    if (this.blur.get_actor()) this.widget.remove_effect(this.blur);
    this.source.opacity = 0;
  }

  destroy(): void {
    this.generation++;
    this.cancellable.cancel();
    this.manager.destroy();
    this.source.destroy();
    this.display.destroy();
  }
}

export class LockBackdrop {
  readonly actor: Clutter.Actor;
  loaded!: Promise<void[]>;
  private readonly interfaceSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });
  private readonly offscreen: boolean;
  private backdrops: MonitorBackdrop[] = [];
  private retiring: MonitorBackdrop[] = [];

  constructor({ offscreen = false }: LockBackdropOptions = {}) {
    this.actor = new Clutter.Actor({ opacity: offscreen ? 0 : 255 });
    this.offscreen = offscreen;

    St.ThemeContext.get_for_stage(global.stage).connectObject('notify::scale-factor', () => this.rebuild(), this.actor);
    Main.layoutManager.connectObject('monitors-changed', () => this.rebuild(), this.actor);
    this.interfaceSettings.connectObject('changed::color-scheme', () => this.rebuild(), this.actor);
    this.actor.connect('destroy', () => this.destroyMonitors());

    this.rebuild();
  }

  get monitors(): readonly MonitorBackdrop[] {
    return this.backdrops;
  }

  private destroyMonitors(): void {
    for (const monitor of [...this.backdrops, ...this.retiring]) monitor.destroy();
    this.backdrops = [];
    this.retiring = [];
  }

  private retire(monitors: MonitorBackdrop[]): void {
    const retired = this.retiring.filter(monitor => monitors.includes(monitor));
    this.retiring = this.retiring.filter(monitor => !monitors.includes(monitor));
    for (const monitor of retired) monitor.destroy();
  }

  private rebuild(): void {
    const previous = this.backdrops;
    this.retiring.push(...previous);
    const frost = FROSTS[this.interfaceSettings.get_string('color-scheme') === 'prefer-dark' ? 'dark' : 'light'];
    this.backdrops = Main.layoutManager.monitors.map((monitor: Monitor, monitorIndex: number) => {
      const display = new Clutter.Actor({ x: monitor.x, y: monitor.y, width: monitor.width, height: monitor.height, visible: !this.offscreen });
      this.actor.add_child(display);
      return new MonitorBackdrop(display, monitor, monitorIndex, frost);
    });
    this.loaded = Promise.all(this.backdrops.map(monitor => monitor.shown));
    void this.loaded.then(() => this.retire(previous));
  }
}
