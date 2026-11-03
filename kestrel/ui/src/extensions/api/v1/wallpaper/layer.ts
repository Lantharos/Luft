import Clutter from 'gi://Clutter';
import type Cogl from 'gi://Cogl';
import GLib from 'gi://GLib';

import { animateActor } from '../../../../shared/motion/motion.js';
import type { Scope } from '../../../runtime/scope.js';
import type { LayerDisplay, LayerOptions, Rect } from '../types.js';
import { layerSnippet, Sheet } from './sheet.js';
import { type LayerStage, stackedWindows } from './stage.js';

const FADE_DURATION = 600;
const TIME_WRAP_S = 3600;

function relative(rect: Rect, sheet: Sheet): Rect {
  return { x: rect.x - sheet.monitor.x, y: rect.y - sheet.monitor.y, width: rect.width, height: rect.height };
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
  private wanted: boolean;
  private gone = false;
  private lastFrame = 0;

  constructor(private readonly options: LayerOptions, private readonly stage: LayerStage, private readonly scope: Scope, private readonly name: string) {
    this.snippet = layerSnippet(options.declarations ?? '', options.shader);
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
    const visible = this.wanted ?this.stage.visibleMonitors() : new Set<number>();
    if (visible.size && !this.sheets.length) this.build();
    for (const sheet of this.sheets.filter(sheet => !sheet.destroyed)) this.show(sheet, visible.has(sheet.monitor.index));
    if (visible.size && !this.timeline.is_playing()) {
      this.lastFrame = 0;
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
    this.sheets = this.stage.monitors().map(monitor => {
      const sheet = new Sheet(monitor, this.snippet, this.name);
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
    let windows: Rect[] | null = null;
    const displays = shown.map((sheet): LayerDisplay => ({
      width: sheet.monitor.width,
      height: sheet.monitor.height,
      get windows() {
        windows ??= stackedWindows();
        return windows.filter(rect => overlaps(rect, sheet.monitor)).map(rect => relative(rect, sheet));
      },
      taskbar: (rect => rect && relative(rect, sheet))(this.stage.taskbar(sheet.monitor)),
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
  }

  destroy(): void {
    this.gone = true;
    this.unstage();
    this.clear();
  }
}
