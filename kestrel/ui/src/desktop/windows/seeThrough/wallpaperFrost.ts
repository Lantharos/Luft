import type Cogl from 'gi://Cogl';
import St from 'gi://St';

import * as Main from '../../../core/main.js';
import { FrostedWallpaper, type Frost, type FrostMonitor } from '../../../core/stage/background/frost.js';

const BLURRED: Frost = { name: 'see-through', radius: 30, downscale: 4, brightness: 1, saturation: 1, wash: null };
const SHARP: Frost = { name: 'see-through-sharp', radius: 0, downscale: 1, brightness: 1, saturation: 1, wash: null };

export interface WallpaperPiece {
  monitor: FrostMonitor;
  texture: Cogl.Texture;
}

class MonitorFrost {
  texture: Cogl.Texture | null = null;
  readonly wallpaper: FrostedWallpaper;
  readonly ready: Promise<void>;

  constructor(readonly monitor: FrostMonitor, monitorIndex: number, frost: Frost, changed: (monitor: MonitorFrost) => void) {
    const { promise, resolve } = Promise.withResolvers<void>();
    this.ready = promise;
    this.wallpaper = new FrostedWallpaper(global.stage, monitor, monitorIndex, frost, texture => {
      this.texture = texture;
      resolve();
      changed(this);
    });
  }

  destroy(): void {
    this.wallpaper.destroy();
  }
}

export class WallpaperFrost {
  private monitors: MonitorFrost[] = [];
  private incoming: MonitorFrost[] = [];
  private readonly theme = St.ThemeContext.get_for_stage(global.stage);
  private readonly signals: [{ disconnect(id: number): void }, number][];

  constructor(private blurred: boolean, private readonly changed: () => void) {
    this.signals = [
      [this.theme, this.theme.connect('notify::scale-factor', () => this.rebuild())],
      [Main.layoutManager, Main.layoutManager.connect('monitors-changed', () => this.rebuild())],
    ];
    this.rebuild();
  }

  setBlurred(blurred: boolean): void {
    if (blurred === this.blurred) return;
    this.blurred = blurred;
    this.rebuild();
  }

  get pieces(): WallpaperPiece[] {
    return this.monitors.flatMap(({ monitor, texture }) => texture ? [{ monitor, texture }] : []);
  }

  private rebuild(): void {
    for (const monitor of this.incoming) monitor.destroy();
    const frost = this.blurred ? BLURRED : SHARP;
    const incoming = Main.layoutManager.monitors.map((monitor: FrostMonitor, index: number) =>
      new MonitorFrost(monitor, index, frost, changed => this.monitors.includes(changed) && this.changed()));
    this.incoming = incoming;
    void Promise.all(incoming.map(monitor => monitor.ready)).then(() => {
      if (this.incoming !== incoming) return;
      for (const monitor of this.monitors) monitor.destroy();
      this.monitors = incoming;
      this.incoming = [];
      this.changed();
    });
  }

  destroy(): void {
    for (const [source, id] of this.signals) source.disconnect(id);
    for (const monitor of [...this.monitors, ...this.incoming]) monitor.destroy();
    this.monitors = [];
    this.incoming = [];
  }
}
