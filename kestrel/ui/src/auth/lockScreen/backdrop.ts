import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as Background from '../../core/stage/background.js';
import * as BackgroundStore from '../../core/stage/backgroundStore.js';
import * as Main from '../../core/main.js';

const BLUR_BRIGHTNESS = 0.65;
const BLUR_RADIUS = 90;

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
  private readonly radius: number;
  private readonly cancellable = new Gio.Cancellable();
  private generation = 0;
  private stored: Clutter.Actor | null = null;
  private readonly widget: St.Widget;
  private readonly manager: Background.BackgroundManager;

  constructor(private readonly parent: Clutter.Actor, private readonly monitor: Monitor, monitorIndex: number, offscreen: boolean) {
    const { scaleFactor } = St.ThemeContext.get_for_stage(global.stage);
    this.radius = BLUR_RADIUS * scaleFactor;

    this.widget = new St.Widget({
      style_class: 'screen-shield-background',
      x: monitor.x,
      y: monitor.y,
      width: monitor.width,
      height: monitor.height,
      effect: new Shell.BlurEffect({ brightness: BLUR_BRIGHTNESS, radius: this.radius }),
    });
    parent.add_child(this.widget);
    this.manager = new Background.BackgroundManager({
      container: this.widget,
      monitorIndex,
      controlPosition: false,
    });

    const live = new Promise<void>(resolve => {
      const id = this.manager.connect('loaded', () => {
        this.manager.disconnect(id);
        resolve();
      });
    });
    if (offscreen) {
      this.shown = live.then(() => this.store());
      this.manager.connect('changed', () => this.store());
    } else {
      this.shown = this.show(live);
      this.manager.connect('changed', () => {
        this.widget.show();
        this.dropStored();
      });
    }
  }

  async key(): Promise<string | null> {
    try {
      const { background } = this.manager.backgroundActor.content;
      const source = await background.storeKey(this.cancellable);
      const { x, y, width, height, geometry_scale: scale } = this.monitor;
      return source && `${source} ${background.focus} backdrop ${x},${y} ${width}x${height}@${scale} ${this.radius} ${BLUR_BRIGHTNESS}`;
    } catch {
      return null;
    }
  }

  private async show(live: Promise<void>): Promise<void> {
    const key = await this.key();
    const stored = key && await BackgroundStore.load(key, GLib.PRIORITY_DEFAULT, this.cancellable);
    if (!stored) {
      await live;
      return;
    }

    this.stored = new Clutter.Actor({
      x: this.monitor.x,
      y: this.monitor.y,
      width: this.monitor.width,
      height: this.monitor.height,
      content: Clutter.TextureContent.new_from_texture(stored.texture, null),
    });
    this.parent.add_child(this.stored);
    this.widget.hide();
    void live.then(() => {
      this.widget.show();
      const id = global.stage.connect('after-paint', () => {
        global.stage.disconnect(id);
        this.dropStored();
      });
    });
  }

  private dropStored(): void {
    this.stored?.destroy();
    this.stored = null;
  }

  private async store(): Promise<void> {
    const generation = ++this.generation;
    await settled(this.widget);
    const key = await this.key();
    if (!key || generation !== this.generation || BackgroundStore.has(key)) return;
    BackgroundStore.store(key, () => generation === this.generation
      ? Shell.texture_file_paint_actor(this.widget)
      : null);
  }

  destroy(): void {
    this.generation++;
    this.cancellable.cancel();
    this.manager.destroy();
  }
}

export class LockBackdrop {
  readonly actor: Clutter.Actor;
  loaded!: Promise<void[]>;
  private readonly offscreen: boolean;
  private backdrops: MonitorBackdrop[] = [];

  constructor({ offscreen = false }: LockBackdropOptions = {}) {
    this.actor = new Clutter.Actor({ opacity: offscreen ? 0 : 255 });
    this.offscreen = offscreen;

    St.ThemeContext.get_for_stage(global.stage).connectObject('notify::scale-factor',
      () => this.rebuild(), this.actor);
    Main.layoutManager.connectObject('monitors-changed', () => this.rebuild(), this.actor);
    this.actor.connect('destroy', () => this.destroyMonitors());

    this.rebuild();
  }

  get monitors(): readonly MonitorBackdrop[] {
    return this.backdrops;
  }

  private destroyMonitors(): void {
    for (const monitor of this.backdrops) monitor.destroy();
    this.backdrops = [];
  }

  private rebuild(): void {
    this.destroyMonitors();
    this.actor.destroy_all_children();
    this.backdrops = Main.layoutManager.monitors.map((monitor: Monitor, monitorIndex: number) =>
      new MonitorBackdrop(this.actor, monitor, monitorIndex, this.offscreen));
    this.loaded = Promise.all(this.backdrops.map(monitor => monitor.shown));
  }
}
