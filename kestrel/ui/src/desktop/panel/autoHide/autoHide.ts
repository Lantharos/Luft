import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Mtk from 'gi://Mtk';
import St from 'gi://St';

import { animateActor, Curve, Duration } from '../../../shared/motion/motion.js';
import { band, toward, type Edge } from '../../../shared/layout/edge.js';
import { EDGES } from '../../../../../../packages/web/ui/src/taskbar/arrangement/index';
import { taskbarPreferences, type TaskbarLayout } from '../preferences/taskbarPreferences.js';
import type { Monitor } from '../panel.js';
import type { WindowOverlap } from './windowOverlap.js';

const HIDE_DELAY = 450;

function settleAt(actor: Clutter.Actor, property: 'translation-x' | 'translation-y', value: number): void {
  if (actor.get_transition(property)?.get_interval().peek_final_value() === value) return;
  actor.remove_transition(property);
  actor.set_property(property, value);
}

export interface Slider {
  actor: St.Widget;
  edge: Edge;
}

class EdgeState {
  revealed = true;
  timer = 0;

  cancel(): void {
    if (this.timer) GLib.Source.remove(this.timer);
    this.timer = 0;
  }
}

export class AutoHide {
  readonly sensors = new Map<Edge, St.Widget>(EDGES.map(edge =>
    [edge, new St.Widget({ name: `kestrel-taskbar-edge-${edge}`, reactive: true, track_hover: true, visible: false })]));
  private readonly states = new Map<Edge, EdgeState>(EDGES.map(edge => [edge, new EdgeState()]));
  private allowed = false;
  private activeEdge: Edge | null = null;
  private held = false;
  private suppressed = false;
  private arriving = false;
  private arranging = false;
  private overlap: WindowOverlap | null = null;
  private readonly hovered = new WeakSet<St.Widget>();
  private readonly focusSignal: number;

  constructor(private readonly panel: St.Widget, private readonly monitor: () => Monitor | null, private readonly rest: () => number,
    private readonly sliders: () => Slider[]) {
    panel.connect('notify::hover', () => this.sync());
    for (const sensor of this.sensors.values()) sensor.connect('notify::hover', () => this.sync());
    const stage = global.stage;
    this.focusSignal = stage.connect('notify::key-focus', () => this.sync());
    panel.connect('destroy', () => {
      for (const state of this.states.values()) state.cancel();
      stage.disconnect(this.focusSignal);
      for (const sensor of this.sensors.values()) sensor.destroy();
    });
  }

  follow(island: St.Widget): void {
    if (this.hovered.has(island)) return;
    this.hovered.add(island);
    island.connect('notify::hover', () => this.sync());
  }

  get shown(): boolean {
    return this.allowed && this.states.get(this.screen.edge)!.revealed;
  }

  setAllowed(allowed: boolean): void {
    if (allowed === this.allowed) return;
    this.allowed = allowed;
    this.sync(true);
  }

  setActive(edge: Edge | null): void {
    this.activeEdge = edge;
    this.sync();
  }

  arrange(arranging: boolean): void {
    this.arranging = arranging;
    this.sync();
  }

  suppress(suppressed: boolean): void {
    this.suppressed = suppressed;
    this.sync();
  }

  holdBack(): void {
    this.arriving = true;
    this.sync(true);
  }

  arrive(): void {
    this.arriving = false;
    this.sync();
  }

  hold(held: boolean): void {
    this.held = held;
    this.sync();
  }

  watch(overlap: WindowOverlap | null): void {
    this.overlap = overlap;
    this.sync();
  }

  private get screen(): TaskbarLayout {
    return taskbarPreferences.on(this.monitor()?.index);
  }

  private get edges(): Map<Edge, St.Widget[]> {
    const edges = new Map<Edge, St.Widget[]>();
    for (const { actor, edge } of this.sliders()) edges.set(edge, [...edges.get(edge) ?? [], actor]);
    return edges;
  }

  place(): void {
    const monitor = this.monitor();
    if (!monitor) return;
    for (const [edge, sensor] of this.sensors) {
      const { x, y, width, height } = band(monitor, edge, 1);
      sensor.set_position(x, y);
      sensor.set_size(width, height);
    }
    for (const [edge, actors] of this.edges) {
      if (this.states.get(edge)!.revealed) continue;
      for (const actor of actors) actor.set(this.offset(edge, false));
    }
  }

  private offset(edge: Edge, revealed: boolean) {
    return revealed ? { translation_x: 0, translation_y: this.rest() } : toward(edge, this.screen.clearance);
  }

  sync(immediate = false): void {
    const mode = this.screen.autoHide;
    this.panel.track_hover = mode !== 'never';
    const edges = this.edges;
    for (const [edge, sensor] of this.sensors) {
      const actors = edges.get(edge);
      const state = this.states.get(edge)!;
      for (const actor of actors ?? []) actor.track_hover = mode !== 'never';
      const reveal = !this.suppressed && !this.arriving && (mode === 'never' || this.wanted(edge, actors ?? [], mode === 'windows'));
      sensor.visible = !!actors && this.allowed && !this.suppressed && !this.arriving && mode !== 'never' && !reveal;
      if (!actors) {
        state.cancel();
        state.revealed = true;
      } else if (reveal) {
        state.cancel();
        this.slide(edge, actors, true, immediate);
      } else if (immediate || !this.allowed) {
        state.cancel();
        this.slide(edge, actors, false, true);
      } else if (this.suppressed) {
        state.cancel();
        this.slide(edge, actors, false, false);
      } else if (state.revealed && !state.timer) {
        state.timer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, HIDE_DELAY, () => {
          const now = this.edges.get(edge) ?? [];
          if (this.wanted(edge, now, this.screen.autoHide === 'windows')) {
            state.timer = 0;
            return GLib.SOURCE_REMOVE;
          }
          if (this.pointerWithin(edge)) return GLib.SOURCE_CONTINUE;
          state.timer = 0;
          this.slide(edge, now, false, false);
          return GLib.SOURCE_REMOVE;
        });
      }
    }
  }

  private wanted(edge: Edge, actors: St.Widget[], whenClear: boolean): boolean {
    const focus = global.stage.get_key_focus();
    const state = this.states.get(edge)!;
    return this.arranging || this.activeEdge === edge || actors.some(actor => actor.hover || (!!focus && actor.contains(focus))) || this.sensors.get(edge)!.hover ||
      (this.held && state.revealed) || (whenClear && !this.touched(edge));
  }

  private pointerWithin(edge: Edge): boolean {
    const monitor = this.monitor();
    if (!monitor) return false;
    const [x, y] = global.get_pointer();
    const area = band(monitor, edge, this.screen.clearance + this.screen.gap);
    return x >= area.x && x < area.x + area.width && y >= area.y && y < area.y + area.height;
  }

  private touched(edge: Edge): boolean {
    const monitor = this.monitor();
    if (!monitor || !this.overlap) return false;
    return this.overlap.touches(new Mtk.Rectangle(band(monitor, edge, this.screen.clearance)));
  }

  private slide(edge: Edge, actors: St.Widget[], revealed: boolean, immediate: boolean): void {
    const state = this.states.get(edge)!;
    const changed = revealed !== state.revealed;
    state.revealed = revealed;
    if (immediate || !this.allowed) {
      for (const actor of actors) this.settle(edge, actor);
      return;
    }
    if (!changed) return;
    for (const actor of actors) {
      actor.show();
      animateActor(actor, {
        ...this.offset(edge, revealed),
        duration: Duration.moderate,
        curve: revealed ? Curve.settle : Curve.depart,
        onComplete: () => { if (!this.states.get(edge)!.revealed) actor.hide(); },
      });
    }
  }

  private settle(edge: Edge, actor: St.Widget): void {
    const revealed = this.states.get(edge)!.revealed;
    const { translation_x, translation_y } = this.offset(edge, revealed);
    settleAt(actor, 'translation-x', translation_x);
    settleAt(actor, 'translation-y', translation_y);
    actor.visible = this.allowed && revealed;
  }
}
