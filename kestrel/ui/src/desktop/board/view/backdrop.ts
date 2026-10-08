import Clutter from 'gi://Clutter';
import Cogl from 'gi://Cogl';
import Shell from 'gi://Shell';
import St from 'gi://St';

import type { Monitor } from '../../panel/panel.js';
import type { Box } from '../../../shared/placement.js';
import type { View } from './geometry.js';

export type BackgroundFactory = (container: Clutter.Actor, monitorIndex: number) => { destroy(): void };

const TILE = 32;
const DOT_RADIUS = 1.25;
const FINEST_SPACING = 32;
const GRID_OVERSCAN = TILE * 2;
const BLUR_RADIUS = 56;

function dotTile(alpha: number, white: boolean): St.ImageContent {
  const pixels = new Uint8Array(TILE * TILE * 4);
  const center = TILE / 2 - 0.5;
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const coverage = Math.max(0, Math.min(1, DOT_RADIUS + 0.5 - Math.hypot(x - center, y - center)));
      const value = Math.round(alpha * coverage * 255);
      const offset = (y * TILE + x) * 4;
      const channel = white ? value : 0;
      pixels[offset] = channel;
      pixels[offset + 1] = channel;
      pixels[offset + 2] = channel;
      pixels[offset + 3] = value;
    }
  }
  const content = St.ImageContent.new_with_preferred_size(TILE, TILE) as St.ImageContent;
  const context = (global as unknown as Shell.Global).stage.context.get_backend().get_cogl_context();
  content.set_data(context, pixels, Cogl.PixelFormat.RGBA_8888_PRE, TILE, TILE, TILE * 4);
  return content;
}

class Grid {
  readonly actor: Clutter.Actor;

  constructor(content: St.ImageContent, monitor: Monitor) {
    const reach = TILE / FINEST_SPACING;
    this.actor = new Clutter.Actor({
      content,
      content_gravity: Clutter.ContentGravity.RESIZE_FILL,
      content_repeat: Clutter.ContentRepeat.BOTH,
      width: Math.ceil(monitor.width * reach) + GRID_OVERSCAN,
      height: Math.ceil(monitor.height * reach) + GRID_OVERSCAN,
    });
    this.actor.set_content_scaling_filters(Clutter.ScalingFilter.LINEAR, Clutter.ScalingFilter.LINEAR);
    this.actor.set_pivot_point(0, 0);
  }

  place(originX: number, originY: number, spacing: number, opacity: number): void {
    const scale = spacing / TILE;
    const shiftX = ((originX - spacing / 2) % spacing + spacing) % spacing - spacing;
    const shiftY = ((originY - spacing / 2) % spacing + spacing) % spacing - spacing;
    this.actor.set_scale(scale, scale);
    this.actor.set_translation(shiftX, shiftY, 0);
    this.actor.opacity = Math.round(255 * opacity);
  }
}

class MonitorBackdrop {
  readonly actor: St.Widget;
  private readonly wallpaper = new Clutter.Actor();
  private readonly blur: Shell.BlurEffect;
  private readonly background: { destroy(): void };
  private readonly fine: Grid;
  private readonly coarse: Grid;

  constructor(readonly monitor: Monitor, createBackground: BackgroundFactory, tile: St.ImageContent) {
    this.actor = new St.Widget({ x: monitor.x, y: monitor.y, width: monitor.width, height: monitor.height, clip_to_allocation: true });
    this.wallpaper.set_size(monitor.width, monitor.height);
    this.background = createBackground(this.wallpaper, monitor.index);
    this.actor.connect('destroy', () => this.background.destroy());
    this.blur = new Shell.BlurEffect({ mode: Shell.BlurMode.ACTOR, radius: BLUR_RADIUS, brightness: 1 });
    this.wallpaper.add_effect(this.blur);
    this.actor.add_child(this.wallpaper);
    this.actor.add_child(new St.Widget({ style_class: 'kestrel-board-tint', width: monitor.width, height: monitor.height }));
    this.fine = new Grid(tile, monitor);
    this.coarse = new Grid(tile, monitor);
    this.actor.add_child(this.fine.actor);
    this.actor.add_child(this.coarse.actor);
  }

  setTile(tile: St.ImageContent, brightness: number): void {
    this.fine.actor.content = tile;
    this.coarse.actor.content = tile;
    this.blur.brightness = brightness;
  }

  update(view: View, viewport: Box): void {
    const originX = viewport.x - view.x * view.scale - this.monitor.x;
    const originY = viewport.y - view.y * view.scale - this.monitor.y;
    let spacing = TILE * view.scale;
    while (spacing < FINEST_SPACING) spacing *= 2;
    while (spacing >= FINEST_SPACING * 2) spacing /= 2;
    const detail = (spacing - FINEST_SPACING) / FINEST_SPACING;
    this.fine.place(originX, originY, spacing, detail);
    this.coarse.place(originX, originY, spacing * 2, 1 - detail);
  }

  destroy(): void {
    this.actor.destroy();
  }
}

export class Backdrop {
  readonly actor = new St.Widget({ name: 'kestrel-board', reactive: true, visible: false });
  private monitors: MonitorBackdrop[] = [];
  private tile!: St.ImageContent;
  private brightness = 1;

  constructor(private readonly createBackground: BackgroundFactory, light: boolean) {
    this.setLight(light);
  }

  setLight(light: boolean): void {
    this.tile = dotTile(light ? 0.16 : 0.2, !light);
    this.brightness = light ? 0.96 : 0.7;
    if (light) this.actor.add_style_class_name('kestrel-board-light');
    else this.actor.remove_style_class_name('kestrel-board-light');
    for (const monitor of this.monitors) monitor.setTile(this.tile, this.brightness);
  }

  build(monitors: Monitor[]): void {
    for (const monitor of this.monitors) monitor.destroy();
    this.monitors = monitors.map(monitor => {
      const backdrop = new MonitorBackdrop(monitor, this.createBackground, this.tile);
      backdrop.setTile(this.tile, this.brightness);
      this.actor.add_child(backdrop.actor);
      return backdrop;
    });
  }

  update(view: View, viewport: Box): void {
    for (const monitor of this.monitors) monitor.update(view, viewport);
  }

  snapshot(monitor: Monitor, view: View, viewport: Box): St.Widget {
    const backdrop = new MonitorBackdrop(monitor, this.createBackground, this.tile);
    backdrop.setTile(this.tile, this.brightness);
    backdrop.update(view, viewport);
    backdrop.actor.set_position(0, 0);
    if (this.actor.has_style_class_name('kestrel-board-light')) backdrop.actor.add_style_class_name('kestrel-board-light');
    return backdrop.actor;
  }

  destroy(): void {
    for (const monitor of this.monitors) monitor.destroy();
    this.monitors = [];
    this.actor.destroy();
  }
}
