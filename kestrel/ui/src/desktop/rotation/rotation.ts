import Clutter from 'gi://Clutter';
import Cogl from 'gi://Cogl';
import Mtk from 'gi://Mtk';

import type { Monitor } from '../panel/panel.js';
import { animateActor, Curve, Duration, reducedMotion } from '../../shared/motion/motion.js';
import { TurningLayer } from './turningLayer.js';

const QUARTER = 90;
const TRANSFORMS = 4;

interface Snapshot {
  index: number;
  content: Clutter.Content;
  width: number;
  height: number;
  angle: number;
}

interface Background {
  destroy(): void;
}

interface MonitorSource {
  monitors: Monitor[];
  uiGroup: Clutter.Actor;
  connect(signal: string, callback: () => void): number;
  disconnect(id: number): void;
}

function turn(from: number, to: number): number {
  const quarters = ((to % TRANSFORMS) - (from % TRANSFORMS) + TRANSFORMS) % TRANSFORMS;
  return (quarters > TRANSFORMS / 2 ? quarters - TRANSFORMS : quarters) * QUARTER;
}

export class RotationAnimation {
  private readonly manager = global.backend.get_monitor_manager();
  private readonly signals: [{ disconnect(id: number): void }, number][];
  private snapshots: Snapshot[] = [];
  private readonly playing = new Set<Clutter.Actor>();
  private hiddenScene: number | null = null;

  constructor(
    private readonly layout: MonitorSource,
    private readonly createBackground: (container: Clutter.Actor, monitorIndex: number) => Background,
  ) {
    this.signals = [
      [this.manager, this.manager.connect('rotating', (_manager, index, from, to) => this.capture(index, from, to))],
      [layout, layout.connect('monitors-changed', () => this.play())],
    ];
  }

  destroy(): void {
    for (const [object, id] of this.signals) object.disconnect(id);
    for (const actor of this.playing) actor.destroy();
    if (this.hiddenScene !== null) this.layout.uiGroup.opacity = this.hiddenScene;
  }

  private capture(index: number, from: number, to: number): void {
    const monitor = this.layout.monitors[index];
    const angle = turn(from, to);
    if (!monitor || !angle) return;
    const { stage } = global;
    const area = new Mtk.Rectangle({ x: monitor.x, y: monitor.y, width: monitor.width, height: monitor.height });
    const [, , , scale] = stage.get_capture_final_size(area);
    const content = stage.paint_to_content(area, scale, null, Clutter.PaintFlag.NO_CURSORS);
    this.snapshots.push({ index, content, width: monitor.width, height: monitor.height, angle });
  }

  private play(): void {
    const snapshots = this.snapshots;
    this.snapshots = [];
    const turning = snapshots.flatMap(snapshot => {
      const monitor = this.layout.monitors[snapshot.index];
      return monitor ? [{ snapshot, monitor }] : [];
    });
    if (!turning.length) return;
    if (reducedMotion()) {
      for (const { snapshot, monitor } of turning) this.fade(snapshot, monitor);
      return;
    }
    if (turning.length === this.layout.monitors.length) this.hideScene();
    for (const { snapshot, monitor } of turning) this.turn(snapshot, monitor);
  }

  private hideScene(): void {
    const scene = this.layout.uiGroup;
    this.hiddenScene ??= scene.opacity;
    scene.opacity = 0;
  }

  private finish(frame: Clutter.Actor): void {
    this.playing.delete(frame);
    frame.destroy();
    if (this.playing.size || this.hiddenScene === null) return;
    this.layout.uiGroup.opacity = this.hiddenScene;
    this.hiddenScene = null;
  }

  private overlay(monitor: Monitor): Clutter.Actor {
    const frame = new Clutter.Actor({ name: 'kestrel-rotation', x: monitor.x, y: monitor.y, width: monitor.width, height: monitor.height, clip_to_allocation: true });
    global.stage.add_child(frame);
    this.playing.add(frame);
    return frame;
  }

  private turn(snapshot: Snapshot, monitor: Monitor): void {
    const frame = this.overlay(monitor);
    frame.background_color = new Cogl.Color({ red: 0, green: 0, blue: 0, alpha: 255 });
    const wallpaper = new Clutter.Actor({ width: monitor.width, height: monitor.height });
    const background = this.createBackground(wallpaper, monitor.index);
    frame.connect('destroy', () => background.destroy());
    frame.add_child(wallpaper);
    const layer = new TurningLayer(snapshot, monitor, this.layout.uiGroup);
    frame.add_child(layer.actor);
    layer.play(() => this.finish(frame));
  }

  private fade({ content, width, height, angle }: Snapshot, monitor: Monitor): void {
    const frame = this.overlay(monitor);
    const picture = new Clutter.Actor({
      content, width, height, rotation_angle_z: angle,
      x: Math.round((monitor.width - width) / 2), y: Math.round((monitor.height - height) / 2),
    });
    picture.set_pivot_point(0.5, 0.5);
    frame.add_child(picture);
    animateActor(picture, { opacity: 0, duration: Duration.standard, curve: Curve.decelerate, onStopped: () => this.finish(frame) });
  }
}
