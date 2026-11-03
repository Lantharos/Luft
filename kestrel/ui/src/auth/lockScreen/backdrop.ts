import Clutter from 'gi://Clutter';
import Cogl from 'gi://Cogl';
import Gio from 'gi://Gio';
import St from 'gi://St';

import { FrostedWallpaper, type Frost, type FrostMonitor } from '../../core/stage/background/frost.js';
import * as Main from '../../core/main.js';

const FROSTS: Record<'dark' | 'light', Frost> = {
  dark: { name: 'dark', radius: 90, downscale: 4, brightness: 0.65, saturation: 1, wash: null },
  light: { name: 'light', radius: 90, downscale: 4, brightness: 1, saturation: 1.5, wash: new Cogl.Color({ red: 250, green: 250, blue: 252, alpha: 77 }) },
};

interface LockBackdropOptions {
  offscreen?: boolean;
}

class MonitorBackdrop extends FrostedWallpaper {
  constructor(private readonly display: Clutter.Actor, monitor: FrostMonitor, monitorIndex: number, frost: Frost) {
    super(display.get_parent()!, monitor, monitorIndex, frost, texture => display.set_content(Clutter.TextureContent.new_from_texture(texture, null)));
  }

  override destroy(): void {
    super.destroy();
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
    this.backdrops = Main.layoutManager.monitors.map((monitor: FrostMonitor, monitorIndex: number) => {
      const display = new Clutter.Actor({ x: monitor.x, y: monitor.y, width: monitor.width, height: monitor.height, visible: !this.offscreen });
      this.actor.add_child(display);
      return new MonitorBackdrop(display, monitor, monitorIndex, frost);
    });
    this.loaded = Promise.all(this.backdrops.map(monitor => monitor.shown));
    void this.loaded.then(() => this.retire(previous));
  }
}
