import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import type St from 'gi://St';

import { animateActor, Curve, Duration, rubberband, Spring, type SpringToken } from '../../../shared/motion/motion.js';
import { STRIP_HEIGHT, taskbarPreferences } from '../preferences/taskbarPreferences.js';
import { clampUnit } from '../../../shared/math.js';
import { TabletStrip } from './strip.js';

const IDLE_COLLAPSE = 5000;
const FLICK_SPEED = 300;
const LAYER_SCALE = 0.94;
const OUTSIDE_EVENTS = [Clutter.EventType.BUTTON_PRESS, Clutter.EventType.TOUCH_BEGIN];


export class TabletTaskbar {
  private strip: TabletStrip | null = null;
  private expanded = false;
  private following = false;
  private active = false;
  private holding = false;
  private idleTimer = 0;
  private outsideSignal = 0;
  private statusIcons: string[] = [];
  private fit: (() => void) | null = null;
  private stretched = false;

  constructor(private readonly panel: St.Widget, private readonly layers: Clutter.Actor[], private readonly primary: boolean,
    private readonly available: () => boolean) {
    for (const layer of layers) layer.set_pivot_point(0.5, 0.5);
    panel.connect('notify::translation-y', () => this.anchorBottom());
  }

  get shown(): boolean {
    return this.strip !== null;
  }

  get rest(): number {
    return this.strip && !this.expanded ? this.travel : 0;
  }

  get canFollow(): boolean {
    return this.shown && !this.expanded && this.available();
  }

  private get travel(): number {
    return taskbarPreferences.metrics.height - STRIP_HEIGHT;
  }

  private get held(): boolean {
    return this.active || this.holding;
  }

  enter(fit: () => void, immediate: boolean): void {
    if (this.strip) return;
    this.strip = new TabletStrip(() => this.expand(), this.primary);
    this.strip.updateStatus(this.statusIcons);
    this.panel.add_child(this.strip.actor);
    this.expanded = this.held;
    this.fit = fit;
    if (this.expanded || immediate) this.fitContents();
    if (immediate) this.snap();
    else {
      this.strip.actor.opacity = 0;
      this.settle(0, null);
    }
  }

  leave(immediate: boolean): void {
    const strip = this.strip;
    if (!strip) return;
    this.strip = null;
    this.fit = null;
    this.expanded = false;
    this.following = false;
    this.stopWatching();
    if (immediate) strip.actor.destroy();
    else animateActor(strip.actor, { opacity: 0, duration: Duration.quick, curve: Curve.decelerate, onStopped: () => strip.actor.destroy() });
    for (const layer of this.layers) {
      layer.show();
      if (immediate) layer.set({ opacity: 255, scale_x: 1, scale_y: 1 });
      else this.reveal(layer, Duration.tap);
    }
  }

  updateStatus(iconNames: string[]): void {
    this.statusIcons = iconNames;
    this.strip?.updateStatus(iconNames);
  }

  setActive(active: boolean): void {
    this.active = active;
    this.syncHeld();
  }

  hold(holding: boolean): void {
    this.holding = holding;
    this.syncHeld();
  }

  follow(distance: number): void {
    if (!this.strip) return;
    this.following = true;
    const travel = this.travel;
    const over = Math.max(0, distance - travel);
    this.panel.remove_transition('translation-y');
    for (const actor of [this.strip.actor, ...this.layers]) actor.remove_all_transitions();
    this.panel.translation_y = travel - Math.min(distance, travel) - rubberband(over, travel);
    this.fitContents();
    this.paint(clampUnit(distance / travel));
  }

  release(distance: number, speed: number, completed: boolean): void {
    if (!this.following) return;
    this.following = false;
    const expand = completed || speed > FLICK_SPEED || (speed > -FLICK_SPEED && distance > this.travel / 2);
    if (expand) this.expand(-speed);
    else this.collapse(-speed);
  }

  expand(velocity = 0): void {
    if (!this.strip || !this.available()) return;
    this.expanded = true;
    this.settle(velocity);
  }

  collapse(velocity = 0): void {
    if (!this.strip || this.held || (!this.expanded && !this.following)) return;
    this.expanded = false;
    this.following = false;
    this.settle(velocity);
  }

  private syncHeld(): void {
    if (!this.strip) return;
    if (this.held) this.expand();
    else this.collapse();
  }

  private anchorBottom(): void {
    const lift = Math.max(0, -this.panel.translation_y);
    if (!lift && !this.stretched) return;
    this.stretched = lift > 0;
    this.panel.height = taskbarPreferences.metrics.height + lift;
  }

  private paint(progress: number): void {
    const strip = this.strip!;
    strip.actor.show();
    strip.actor.opacity = Math.round(255 * clampUnit(1 - progress * 2));
    strip.pull(progress);
    const shown = clampUnit((progress - 0.25) / 0.75);
    for (const layer of this.layers) {
      layer.show();
      const scale = LAYER_SCALE + (1 - LAYER_SCALE) * shown;
      layer.set({ opacity: Math.round(255 * shown), scale_x: scale, scale_y: scale });
    }
  }

  private settle(velocity: number, spring: SpringToken | null = Spring.snappy): void {
    const strip = this.strip!;
    const expanded = this.expanded;
    if (spring && this.available()) animateActor(this.panel, { translation_y: this.rest, spring, velocity });
    strip.settle(!expanded);
    if (expanded) {
      this.fitContents();
      this.layers.forEach(layer => this.reveal(layer));
      this.conceal(strip.actor, expanded, 1);
      this.watch();
    } else {
      strip.actor.show();
      animateActor(strip.actor, { opacity: 255, duration: Duration.standard, delay: Duration.tap, curve: Curve.decelerate });
      this.layers.forEach(layer => this.conceal(layer, expanded, LAYER_SCALE));
      this.stopWatching();
    }
  }

  private snap(): void {
    if (this.available()) this.panel.translation_y = this.rest;
    const [shown, hidden] = this.expanded ? [this.layers, [this.strip!.actor]] : [[this.strip!.actor], this.layers];
    for (const actor of shown) actor.set({ visible: true, opacity: 255, scale_x: 1, scale_y: 1 });
    for (const actor of hidden) actor.set({ visible: false, opacity: 0 });
    this.strip!.settle(!this.expanded);
    if (this.expanded) this.watch();
    else this.stopWatching();
  }

  private reveal(layer: Clutter.Actor, delay = 0): void {
    layer.show();
    animateActor(layer, { opacity: 255, scale_x: 1, scale_y: 1, duration: Duration.standard, delay, curve: Curve.decelerate });
  }

  private conceal(actor: Clutter.Actor, expanded: boolean, scale: number): void {
    animateActor(actor, {
      opacity: 0, scale_x: scale, scale_y: scale, duration: Duration.quick, curve: Curve.decelerate,
      onStopped: (finished: boolean) => {
        if (!finished || !this.strip || this.expanded !== expanded) return;
        actor.hide();
        if (!expanded) this.fitContents();
      },
    });
  }

  private fitContents(): void {
    this.fit?.();
    this.fit = null;
  }

  private watch(): void {
    this.restartIdle();
    if (this.outsideSignal) return;
    this.outsideSignal = global.stage.connect('captured-event', (_stage, event: Clutter.Event) => {
      if (!OUTSIDE_EVENTS.includes(event.type())) return Clutter.EVENT_PROPAGATE;
      const [x, y] = event.get_coords();
      const target = global.stage.get_actor_at_pos(Clutter.PickMode.REACTIVE, x, y);
      if (target && this.panel.contains(target)) this.restartIdle();
      else this.collapse();
      return Clutter.EVENT_PROPAGATE;
    });
  }

  private restartIdle(): void {
    if (this.idleTimer) GLib.Source.remove(this.idleTimer);
    this.idleTimer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, IDLE_COLLAPSE, () => {
      this.idleTimer = 0;
      this.collapse();
      return GLib.SOURCE_REMOVE;
    });
  }

  private stopWatching(): void {
    if (this.idleTimer) GLib.Source.remove(this.idleTimer);
    this.idleTimer = 0;
    if (this.outsideSignal) global.stage.disconnect(this.outsideSignal);
    this.outsideSignal = 0;
  }

  destroy(): void {
    this.stopWatching();
  }
}
