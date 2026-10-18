import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import type GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';

import { animateActor, animateAdjustment, Curve, Duration, reducedMotion, Spring } from '../../shared/motion.js';
import type { Monitor } from '../panel/panel.js';
import { blurSurface } from '../../shared/surface.js';
import { paintHidden } from '../../surfaces/prewarm.js';
import { windowSlots } from './grid.js';
import { CARD_HEADER, WindowCard } from './windowCard.js';
import { WorkspaceStrip, type BackgroundFactory, type BoardFrames } from './workspaceStrip.js';

const MARGIN = 40;
const SPACING = 28;
const STRETCH = 0.5;

const opacityAt = (shown: number) => Math.round(255 * Math.min(1, Math.max(0, shown)));

export class TaskView {
  readonly actor = new St.Widget({ name: 'kestrel-task-view', style_class: 'kestrel-task-view', reactive: true, visible: false });
  private readonly scrim = new St.Widget({ style_class: 'kestrel-task-scrim' });
  private readonly windowLayer = new St.Widget({ name: 'kestrel-task-windows' });
  private readonly shown = new St.Adjustment({ actor: this.actor, lower: -STRETCH, upper: 1 + STRETCH, value: 0 });
  private readonly strip: WorkspaceStrip;
  private readonly hidden = new Map<Meta.WindowActor, { opacity: number; destroyed: number }>();
  private cards: WindowCard[] = [];
  private monitor: Monitor | null = null;
  private signals: [GObject.Object, number][] = [];
  private rebuildSource = 0;

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
    const shell = global as unknown as Shell.Global;
    const manager = shell.workspace_manager;
    const rebuild = () => this.scheduleRebuild();
    this.signals = [
      [manager, manager.connect('active-workspace-changed', rebuild)],
      [manager, manager.connect('workspace-added', rebuild)],
      [manager, manager.connect('workspace-removed', rebuild)],
      [shell.display, shell.display.connect('window-created', rebuild)],
      [shell.display, shell.display.connect('restacked', () => this.restack())],
    ];
    this.rebuild();
    if (!reducedMotion()) this.hideWindows();
    this.actor.get_parent()!.set_child_above_sibling(this.actor, null);
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

  prewarm(monitor: Monitor): void {
    if (this.monitor) return;
    if (!this.activeWindows().length) {
      this.prewarmOnceWindowShows(monitor);
      return;
    }
    this.cover(monitor);
    this.rebuild();
    this.monitor = null;
    paintHidden(this.actor, this.actor);
    this.clearCards();
    this.strip.clear();
  }

  close(immediate = false, velocity?: number): void {
    if (!this.monitor) return;
    this.monitor = null;
    for (const [object, id] of this.signals) object.disconnect(id);
    this.signals = [];
    if (this.rebuildSource) GLib.Source.remove(this.rebuildSource);
    this.rebuildSource = 0;
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
    for (const card of this.cards) card.morph(shown);
  }

  private restack(): void {
    const order = new Map((global as unknown as Shell.Global).get_window_actors().map((actor, index) => [actor.meta_window, index]));
    const stacked = [...this.cards].sort((a, b) => (order.get(a.window) ?? 0) - (order.get(b.window) ?? 0));
    for (const card of stacked) this.windowLayer.set_child_above_sibling(card.actor, null);
  }

  private hideWindows(): void {
    for (const card of this.cards) {
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
    const wm = (global as unknown as Shell.Global).window_manager;
    const mapped = wm.connect('map', (_wm, actor: Meta.WindowActor) => {
      wm.disconnect(mapped);
      const shown = actor.connect('effects-completed', () => {
        actor.disconnect(shown);
        GLib.idle_add(GLib.PRIORITY_LOW, () => {
          this.prewarm(monitor);
          return GLib.SOURCE_REMOVE;
        });
      });
    });
  }

  private activeWindows(): Meta.Window[] {
    const shell = global as unknown as Shell.Global;
    const workspace = shell.workspace_manager.get_active_workspace();
    return shell.display.get_tab_list(Meta.TabList.NORMAL, workspace).filter(window => window.located_on_workspace(workspace));
  }

  private cover(monitor: Monitor): void {
    this.monitor = monitor;
    this.actor.set_position(monitor.x, monitor.y);
    this.actor.set_size(monitor.width, monitor.height);
    this.scrim.set_size(monitor.width, monitor.height);
  }

  private scheduleRebuild(): void {
    if (this.rebuildSource) return;
    this.rebuildSource = GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
      this.rebuildSource = 0;
      if (!this.monitor) return GLib.SOURCE_REMOVE;
      this.rebuild();
      if (!reducedMotion()) this.hideWindows();
      return GLib.SOURCE_REMOVE;
    });
  }

  private clearCards(): void {
    for (const card of this.cards) card.destroy();
    this.cards = [];
  }

  private rebuild(): void {
    const monitor = this.monitor!;
    const shell = global as unknown as Shell.Global;
    const focused = shell.stage.get_key_focus();
    const focusedWindow = this.cards.find(card => card.actor === focused)?.window;
    const focusInside = !!focused && this.actor.contains(focused);
    this.clearCards();
    const windows = this.activeWindows();
    this.cards = windows.map(window => new WindowCard(window, () => {
      this.dismiss();
      this.activateWindow(window);
    }, () => this.scheduleRebuild()));
    for (const card of this.cards) this.windowLayer.add_child(card.actor);
    this.strip.build(monitor);

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
    this.cards.forEach((card, index) => card.place(slots[index], monitor));
    this.restack();
    this.morph();
    const restore = this.cards.find(card => card.window === focusedWindow);
    if (restore) restore.actor.grab_key_focus();
    else if (focusInside) this.actor.grab_key_focus();
  }
}
