import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import type Shell from 'gi://Shell';
import type St from 'gi://St';

import { animateActor, Curve, Duration, rubberband, Spring } from '../../../shared/motion.js';
import { STRIP_HEIGHT, taskbarPreferences } from '../preferences/taskbarPreferences.js';
import { TabletStrip } from './strip.js';

const IDLE_COLLAPSE = 5000;
const FLICK_SPEED = 300;
const OUTSIDE_EVENTS = [Clutter.EventType.BUTTON_PRESS, Clutter.EventType.TOUCH_BEGIN];

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const stage = () => (global as unknown as Shell.Global).stage;

export class TabletTaskbar {
  private strip: TabletStrip | null = null;
  private expanded = false;
  private following = false;
  private active = false;
  private holding = false;
  private idleTimer = 0;
  private outsideSignal = 0;
  private statusIcons: string[] = [];

  constructor(private readonly panel: St.Widget, private readonly layers: Clutter.Actor[], private readonly primary: boolean,
    private readonly available: () => boolean) {}

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

  enter(translation: number): void {
    if (this.strip) return;
    this.strip = new TabletStrip(() => this.expand(), this.primary);
    this.strip.updateStatus(this.statusIcons);
    this.strip.actor.opacity = 0;
    this.panel.add_child(this.strip.actor);
    this.expanded = this.held;
    if (this.available()) this.panel.translation_y = translation;
    this.settle(0, Duration.tap);
  }

  leave(): void {
    const strip = this.strip;
    if (!strip) return;
    this.strip = null;
    this.expanded = false;
    this.following = false;
    this.stopWatching();
    animateActor(strip.actor, { opacity: 0, duration: Duration.quick, curve: Curve.decelerate, onStopped: () => strip.actor.destroy() });
    for (const layer of this.layers) {
      layer.show();
      animateActor(layer, { opacity: 255, duration: Duration.standard, curve: Curve.decelerate });
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
    for (const actor of [this.panel, this.strip.actor, ...this.layers]) actor.remove_all_transitions();
    this.panel.translation_y = travel - Math.min(distance, travel) - rubberband(over, travel);
    this.paint(clamp(distance / travel));
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

  private paint(progress: number): void {
    const strip = this.strip!.actor;
    strip.show();
    strip.opacity = Math.round(255 * clamp(1 - progress * 2));
    for (const layer of this.layers) {
      layer.show();
      layer.opacity = Math.round(255 * clamp((progress - 0.25) / 0.75));
    }
  }

  private settle(velocity: number, fadeOut: number = Duration.quick): void {
    const strip = this.strip!.actor;
    const expanded = this.expanded;
    if (this.available()) animateActor(this.panel, { translation_y: this.rest, spring: Spring.snappy, velocity });
    const [shown, hidden] = expanded ? [this.layers, [strip]] : [[strip], this.layers];
    for (const actor of shown) {
      actor.show();
      animateActor(actor, { opacity: 255, duration: Duration.standard, curve: Curve.decelerate });
    }
    for (const actor of hidden) {
      animateActor(actor, {
        opacity: 0, duration: fadeOut, curve: Curve.decelerate,
        onStopped: (finished: boolean) => { if (finished && this.strip && this.expanded === expanded) actor.hide(); },
      });
    }
    if (expanded) this.watch();
    else this.stopWatching();
  }

  private watch(): void {
    this.restartIdle();
    if (this.outsideSignal) return;
    this.outsideSignal = stage().connect('captured-event', (_stage, event: Clutter.Event) => {
      if (!OUTSIDE_EVENTS.includes(event.type())) return Clutter.EVENT_PROPAGATE;
      const [x, y] = event.get_coords();
      const target = stage().get_actor_at_pos(Clutter.PickMode.REACTIVE, x, y);
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
    if (this.outsideSignal) stage().disconnect(this.outsideSignal);
    this.outsideSignal = 0;
  }

  destroy(): void {
    this.stopWatching();
  }
}
