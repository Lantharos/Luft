import Clutter from 'gi://Clutter';
import type Cogl from 'gi://Cogl';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import St from 'gi://St';

import { BackgroundManager } from '../background.js';
import * as BackgroundStore from '../backgroundStore.js';

export interface Frost {
  name: string;
  radius: number;
  downscale: number;
  brightness: number;
  saturation: number;
  wash: Cogl.Color | null;
}

export interface FrostMonitor {
  x: number;
  y: number;
  width: number;
  height: number;
  geometry_scale: number;
}

interface Kept {
  key: string;
  texture: Cogl.Texture;
}

const kept = new Map<string, Kept>();

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

export class FrostedWallpaper {
  readonly shown: Promise<void>;
  private readonly cancellable = new Gio.Cancellable();
  private readonly radius: number;
  private readonly source: Clutter.Actor;
  private readonly widget: St.Widget;
  private readonly blur: Shell.BlurEffect | null;
  private readonly manager: BackgroundManager;
  private generation = 0;

  constructor(parent: Clutter.Actor, private readonly monitor: FrostMonitor, monitorIndex: number, private readonly frost: Frost, private readonly show: (texture: Cogl.Texture) => void) {
    const { scaleFactor } = St.ThemeContext.get_for_stage(global.stage);
    const { x, y, width, height } = monitor;
    this.radius = frost.radius * scaleFactor;
    this.blur = this.radius ? new Shell.BlurEffect({ brightness: frost.brightness, saturation: frost.saturation, radius: this.radius }) : null;

    this.source = new Clutter.Actor({ x, y, width, height, opacity: 0 });
    this.widget = new St.Widget({ width, height });
    this.source.add_child(this.widget);
    if (frost.wash) this.source.add_child(new Clutter.Actor({ width, height, background_color: frost.wash }));
    parent.add_child(this.source);
    parent.set_child_below_sibling(this.source, null);

    this.manager = new BackgroundManager({ container: this.widget, monitorIndex, controlPosition: false });
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
      return source && `${source} ${background.focus} frost ${x},${y} ${width}x${height}@${scale} ${this.radius} ${this.frost.name} /${this.frost.downscale}`;
    } catch {
      return null;
    }
  }

  private async refresh(): Promise<void> {
    const generation = ++this.generation;
    const key = await this.key();
    const known = kept.get(this.slot);
    if (key && known?.key === key) {
      this.reveal(known.texture);
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
    if (this.blur) this.widget.add_effect(this.blur);
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
    else this.reveal(texture);
    if (key && !BackgroundStore.has(key)) BackgroundStore.store(key, () => texture);
  }

  private paintSmall(): Cogl.Texture | null {
    const painted = Shell.texture_file_paint_actor(this.source);
    const { downscale } = this.frost;
    if (!painted || downscale === 1) return painted;
    const { x, y, width, height } = this.monitor;
    const small = new Clutter.Actor({ x, y, width: Math.ceil(width / downscale), height: Math.ceil(height / downscale), opacity: 0 });
    small.set_content(Clutter.TextureContent.new_from_texture(painted, null));
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
    this.reveal(texture);
  }

  private reveal(texture: Cogl.Texture): void {
    this.show(texture);
    if (this.blur?.get_actor()) this.widget.remove_effect(this.blur);
    this.source.opacity = 0;
  }

  destroy(): void {
    this.generation++;
    this.cancellable.cancel();
    this.manager.destroy();
    this.source.destroy();
  }
}
