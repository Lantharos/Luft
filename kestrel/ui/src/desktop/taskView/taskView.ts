import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import type GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import St from 'gi://St';

import { animateActor, animateAdjustment, Curve, Duration, reducedMotion, Spring } from '../../shared/motion/motion.js';
import type { Monitor } from '../panel/panel.js';
import { blurSurface, raiseSurface } from '../../shared/layout/surface.js';
import { warmHidden } from '../../surfaces/prewarm/hidden.js';
import { prewarmSoon, type Work } from '../../surfaces/prewarm/queue.js';
import { clampUnit } from '../../shared/math.js';
import { windowSlots } from './grid.js';
import { CARD_HEADER, WindowCard } from './windowCard.js';
import { WorkspaceStrip, type BackgroundFactory, type BoardFrames } from './workspaceStrip.js';

const MARGIN = 40;
const SPACING = 28;
const STRETCH = 0.5;

const opacityAt = (shown: number) => Math.round(255 * clampUnit(shown));

export class TaskView {
  readonly actor = new St.Widget({ name: 'kestrel-task-view', style_class: 'kestrel-task-view', reactive: true, visible: false });
  private readonly scrim = new St.Widget({ style_class: 'kestrel-task-scrim' });
  private readonly windowLayer = new St.Widget({ name: 'kestrel-task-windows' });
  private readonly shown = new St.Adjustment({ actor: this.actor, lower: -STRETCH, upper: 1 + STRETCH, value: 0 });
  private readonly strip: WorkspaceStrip;
  private readonly hidden = new Map<Meta.WindowActor, { opacity: number; destroyed: number }>();
  private readonly cards = new Map<Meta.Window, WindowCard>();
  private monitor: Monitor | null = null;
  private signals: [GObject.Object, number][] = [];
  private syncSource = 0;

  constructor(background: BackgroundFactory, boardFrame: BoardFrames, private readonly dismiss: () => void, private readonly activateWindow: (window: Meta.Window) => void) {
    blurSurface(this.scrim, 0);
    this.strip = new WorkspaceStrip(background, boardFrame);
    this.actor.add_child(this.scrim);
    this.actor.add_child(this.windowLayer);
    this.actor.add_child(this.strip.actor);
    this.actor.connect('button-press-event', (_actor, event: Clutter.Event) => {
      if (event.get_source() !== this.actor && event.get_source() !== this.windowLayer) return Clutter.EVENT_PROPAGATE;
      this.dismiss();
      return Clutter.EVENT_STOP;
    });
    this.shown.connect('notify::value', () => this.morph());
  }

  get visible(): boolean {
    return !!this.monitor;
  }

  get progress(): number {
    return this.shown.value;
  }

  open(monitor: Monitor): void {
    this.prepare(monitor);
    if (reducedMotion()) animateActor(this.actor, { opacity: 255, duration: Duration.standard, curve: Curve.decelerate });
    else this.reveal(1);
  }

  prepare(monitor: Monitor): void {
    this.cover(monitor);
    const manager = global.workspace_manager;
    const sync = () => this.scheduleSync();
    this.signals = [
      [manager, manager.connect('active-workspace-changed', sync)],
      [manager, manager.connect('workspace-added', sync)],
      [manager, manager.connect('workspace-removed', sync)],
      [global.display, global.display.connect('window-created', sync)],
      [global.display, global.display.connect('restacked', () => this.restack())],
    ];
    this.sync();
    if (!reducedMotion()) this.hideWindows();
    raiseSurface(this.actor);
    if (!this.actor.visible) {
      const reduced = reducedMotion();
      this.actor.opacity = reduced ? 0 : 255;
      this.shown.remove_transition('value');
      this.shown.value = reduced ? 1 : 0;
      this.actor.show();
    }
    this.actor.grab_key_focus();
  }

  follow(shown: number): void {
    if (reducedMotion()) {
      this.actor.remove_transition('opacity');
      this.actor.opacity = opacityAt(shown);
      return;
    }
    this.shown.remove_transition('value');
    this.shown.value = shown;
  }

  settle(velocity: number): void {
    if (reducedMotion()) animateActor(this.actor, { opacity: 255, spring: Spring.snappy, velocity: 255 * velocity });
    else this.reveal(1, velocity);
  }

  *prewarm(monitor: Monitor): Work {
    if (this.monitor) return;
    if (!this.activeWindows().length) {
      this.prewarmOnceWindowShows(monitor);
      return;
    }
    this.cover(monitor);
    this.sync();
    this.monitor = null;
    try {
      yield* warmHidden(this.actor, { focused: this.actor });
    } finally {
      if (!this.monitor) {
        this.clearCards();
        this.strip.clear();
      }
    }
  }

  close(immediate = false, velocity?: number): void {
    if (!this.monitor) return;
    this.monitor = null;
    for (const [object, id] of this.signals) object.disconnect(id);
    this.signals = [];
    if (this.syncSource) GLib.Source.remove(this.syncSource);
    this.syncSource = 0;
    const finish = () => {
      if (this.monitor) return;
      this.actor.hide();
      this.clearCards();
      this.strip.clear();
      this.showWindows();
    };
    if (immediate) {
      this.actor.remove_all_transitions();
      this.shown.remove_transition('value');
      finish();
      return;
    }
    this.restack();
    if (!reducedMotion()) {
      this.reveal(0, velocity, finish);
      return;
    }
    const fade = velocity === undefined
      ? { duration: Duration.quick, curve: Curve.decelerate }
      : { spring: Spring.snappy, velocity: 255 * velocity };
    animateActor(this.actor, { opacity: 0, ...fade, onStopped: finish });
  }

  private reveal(target: number, velocity = 0, onStopped?: () => void): void {
    animateAdjustment(this.shown, target, { spring: Spring.snappy, velocity, onStopped });
  }

  private morph(): void {
    const shown = this.shown.value;
    this.scrim.opacity = opacityAt(shown);
    this.strip.actor.opacity = opacityAt(shown);
    for (const card of this.cards.values()) card.morph(shown);
  }

  private restack(): void {
    const order = new Map(global.get_window_actors().map((actor, index) => [actor.meta_window, index]));
    const stacked = [...this.cards.values()].sort((a, b) => (order.get(a.window) ?? 0) - (order.get(b.window) ?? 0));
    for (const card of stacked) this.windowLayer.set_child_above_sibling(card.actor, null);
  }

  private hideWindows(): void {
    for (const card of this.cards.values()) {
      const actor = card.window.get_compositor_private() as Meta.WindowActor | null;
      if (!actor || this.hidden.has(actor)) continue;
      this.hidden.set(actor, { opacity: actor.opacity, destroyed: actor.connect('destroy', () => this.hidden.delete(actor)) });
      actor.opacity = 0;
    }
  }

  private showWindows(): void {
    for (const [actor, { opacity, destroyed }] of this.hidden) {
      actor.disconnect(destroyed);
      actor.opacity = opacity;
    }
    this.hidden.clear();
  }

  private prewarmOnceWindowShows(monitor: Monitor): void {
    const wm = global.window_manager;
    const mapped = wm.connect('map', (_wm, actor: Meta.WindowActor) => {
      wm.disconnect(mapped);
      const shown = actor.connect('effects-completed', () => {
        actor.disconnect(shown);
        prewarmSoon([() => this.prewarm(monitor)]);
      });
    });
  }

  private activeWindows(): Meta.Window[] {
    const workspace = global.workspace_manager.get_active_workspace();
    return global.display.get_tab_list(Meta.TabList.NORMAL, workspace).filter(window => window.located_on_workspace(workspace));
  }

  private cover(monitor: Monitor): void {
    this.monitor = monitor;
    this.actor.set_position(monitor.x, monitor.y);
    this.actor.set_size(monitor.width, monitor.height);
    this.scrim.set_size(monitor.width, monitor.height);
  }

  private scheduleSync(): void {
    if (this.syncSource) return;
    this.syncSource = GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
      this.syncSource = 0;
      if (!this.monitor) return GLib.SOURCE_REMOVE;
      this.sync();
      if (!reducedMotion()) this.hideWindows();
      return GLib.SOURCE_REMOVE;
    });
  }

  private clearCards(): void {
    for (const card of this.cards.values()) card.destroy();
    this.cards.clear();
  }

  private sync(): void {
    const monitor = this.monitor!;
    const stage = global.stage;
    const focused = stage.get_key_focus();
    const focusInside = !!focused && this.actor.contains(focused);
    const windows = this.activeWindows();
    for (const [window, card] of this.cards) {
      if (windows.includes(window)) continue;
      card.destroy();
      this.cards.delete(window);
    }
    for (const window of windows) {
      if (this.cards.has(window)) continue;
      const card = new WindowCard(window, () => {
        this.dismiss();
        this.activateWindow(window);
      }, () => this.scheduleSync());
      this.cards.set(window, card);
      this.windowLayer.add_child(card.actor);
    }
    this.strip.sync(monitor);

    const width = monitor.width;
    const height = monitor.height;
    const [, stripWidth] = this.strip.actor.get_preferred_width(-1);
    const [, stripHeight] = this.strip.actor.get_preferred_height(stripWidth);
    const stripY = height - stripHeight - 20;
    this.strip.actor.set_position(Math.round(Math.max(MARGIN, (width - stripWidth) / 2)), stripY);
    this.strip.actor.set_size(Math.min(stripWidth, width - 2 * MARGIN), stripHeight);
    this.windowLayer.set_size(width, stripY);
    const area = { x: MARGIN, y: MARGIN, width: width - 2 * MARGIN, height: stripY - 2 * MARGIN };
    const slots = windowSlots(windows.map(window => window.get_frame_rect()), area, SPACING, CARD_HEADER);
    windows.forEach((window, index) => this.cards.get(window)!.place(slots[index], monitor));
    this.restack();
    this.morph();
    const focus = stage.get_key_focus();
    if (focusInside && !(focus && this.actor.contains(focus))) this.actor.grab_key_focus();
  }
}
