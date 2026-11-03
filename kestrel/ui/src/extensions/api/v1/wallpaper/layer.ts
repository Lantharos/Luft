import Clutter from 'gi://Clutter';
import type Cogl from 'gi://Cogl';
import GLib from 'gi://GLib';

import { animateActor } from '../../../../shared/motion/motion.js';
import type { Scope } from '../../../runtime/scope.js';
import type { Monitor } from '../../../../desktop/panel/panel.js';
import type { LayerDisplay, LayerOptions, Outline, Rect } from '../types.js';
import { type Atlas, atlasDeclarations, packAtlas } from './atlas.js';
import { layerSnippet, Sheet } from './sheet.js';
import { type LayerStage, stackedWindows } from './stage.js';

const FADE_DURATION = 600;
const TIME_WRAP_S = 3600;

function clamped(area: Rect, monitor: { width: number; height: number }): Rect {
  const x = Math.max(0, Math.min(Math.round(area.x), monitor.width - 1));
  const y = Math.max(0, Math.min(Math.round(area.y), monitor.height - 1));
  return {
    x, y,
    width: Math.max(1, Math.min(Math.round(area.width), monitor.width - x)),
    height: Math.max(1, Math.min(Math.round(area.height), monitor.height - y)),
  };
}

function relative<Shape extends Rect>(shape: Shape, sheet: Sheet): Shape {
  return { ...shape, x: shape.x - sheet.monitor.x, y: shape.y - sheet.monitor.y };
}

function overlaps(rect: Rect, { x, y, width, height }: Rect): boolean {
  return rect.x < x + width && rect.x + rect.width > x && rect.y < y + height && rect.y + rect.height > y;
}

export class WallpaperLayer {
  private readonly snippet: Cogl.Snippet;
  private readonly started = GLib.get_monotonic_time();
  private readonly timeline = new Clutter.Timeline({ actor: global.stage, duration: 1000, repeat_count: -1 });
  private readonly unstage: () => void;
  private sheets: Sheet[] = [];
  private built = false;
  private wanted: boolean;
  private gone = false;
  private lastFrame = 0;
  private readonly atlases = new Map<string, Atlas>();

  constructor(private readonly options: LayerOptions, private readonly stage: LayerStage, private readonly scope: Scope, private readonly name: string) {
    this.snippet = layerSnippet(atlasDeclarations(options.atlases ?? []) + (options.declarations ?? ''), options.shader);
    this.wanted = options.active ?? true;
    this.timeline.connect('new-frame', () => this.frame());
    this.unstage = stage.add(this);
    this.sync();
  }

  get active(): boolean {
    return this.wanted;
  }

  set active(active: boolean) {
    if (active === this.wanted) return;
    this.wanted = active;
    this.sync();
  }

  sync(): void {
    if (this.gone) return;
    const visible = this.wanted ? this.stage.visibleMonitors() : new Set<number>();
    if (visible.size && !this.built) this.build();
    const sheets = this.sheets.filter(sheet => !sheet.destroyed);
    for (const sheet of sheets) this.show(sheet, visible.has(sheet.monitor.index));
    if (sheets.some(sheet => visible.has(sheet.monitor.index)) && !this.timeline.is_playing()) {
      this.lastFrame = 0;
      this.timeline.start();
    }
  }

  monitorsChanged(): void {
    if (!this.built) return;
    this.clear();
    this.sync();
  }

  reshape(): void {
    this.monitorsChanged();
  }

  setPictures(name: string, paths: readonly string[]): number {
    if (!this.options.atlases?.includes(name)) throw new Error(`${name} isn't one of the layer's atlases`);
    const atlas = packAtlas(paths);
    this.atlases.set(name, atlas);
    for (const sheet of this.sheets.filter(sheet => !sheet.destroyed)) this.applyAtlas(sheet, name, atlas);
    return atlas.count;
  }

  private applyAtlas(sheet: Sheet, name: string, atlas: Atlas): void {
    sheet.actor.picture(name, this.options.atlases!.indexOf(name) + 1, atlas.texture);
    sheet.actor.uniform(`${name}_grid`, 2, atlas.grid);
    sheet.actor.uniform(`${name}_count`, 1, [atlas.count]);
    sheet.actor.uniform(`${name}_pictures`, 4, atlas.pictures);
  }

  private areaOf(monitor: Monitor, primary: boolean): Rect | null {
    const full = { x: 0, y: 0, width: monitor.width, height: monitor.height };
    if (!this.options.area) return full;
    const area = this.scope.run(() => this.options.area!({ index: monitor.index, primary, width: monitor.width, height: monitor.height }));
    return area ? clamped(area, monitor) : null;
  }

  private build(): void {
    this.built = true;
    const primary = this.stage.primaryIndex();
    this.sheets = this.stage.monitors().flatMap(monitor => {
      const area = this.areaOf(monitor, monitor.index === primary);
      if (!area) return [];
      const sheet = new Sheet(monitor, monitor.index === primary, area, this.snippet, this.name);
      for (const [name, atlas] of this.atlases) this.applyAtlas(sheet, name, atlas);
      sheet.actor.opacity = 0;
      sheet.actor.visible = false;
      this.stage.place(sheet.actor, this.options.depth ?? 'above-windows');
      return [sheet];
    });
  }

  private show(sheet: Sheet, shown: boolean): void {
    const { actor } = sheet;
    if (shown) actor.show();
    animateActor(actor, {
      opacity: shown ? 255 : 0,
      duration: FADE_DURATION,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      onStopped: (finished: boolean) => {
        if (!finished || actor.opacity !== 0) return;
        actor.hide();
        if (this.sheets.some(other => !other.destroyed && other.actor.visible)) return;
        this.timeline.stop();
        if (!this.wanted) this.clear();
      },
    });
  }

  private frame(): void {
    const now = GLib.get_monotonic_time();
    const elapsed = this.lastFrame ? (now - this.lastFrame) / GLib.USEC_PER_SEC : 0;
    this.lastFrame = now;
    const shown = this.sheets.filter(sheet => !sheet.destroyed && sheet.actor.visible);
    let windows: Outline[] | null = null;
    const displays = shown.map((sheet): LayerDisplay => ({
      index: sheet.monitor.index,
      primary: sheet.primary,
      width: sheet.monitor.width,
      height: sheet.monitor.height,
      get windows() {
        windows ??= stackedWindows();
        return windows.filter(rect => overlaps(rect, sheet.monitor)).map(rect => relative(rect, sheet));
      },
      taskbar: (rect => rect && relative(rect, sheet))(this.stage.taskbar(sheet.monitor)),
      taskbarOutlines: this.stage.taskbarOutlines(sheet.monitor).map(outline => relative(outline, sheet)),
      uniform: (name, ...values) => sheet.actor.uniform(name, values.length, values),
      uniformArray: (name, components, values) => sheet.actor.uniform(name, components, values),
    }));
    this.scope.run(() => this.options.frame({ time: ((now - this.started) / GLib.USEC_PER_SEC) % TIME_WRAP_S, elapsed, displays }));
    for (const sheet of shown) sheet.actor.queue_redraw();
  }

  private clear(): void {
    this.timeline.stop();
    for (const sheet of this.sheets) sheet.destroy();
    this.sheets = [];
    this.built = false;
  }

  destroy(): void {
    this.gone = true;
    this.unstage();
    this.clear();
  }
}
