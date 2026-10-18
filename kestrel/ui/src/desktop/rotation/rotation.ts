import Clutter from 'gi://Clutter';
import Mtk from 'gi://Mtk';
import type Meta from 'gi://Meta';
import type Shell from 'gi://Shell';

import type { Monitor } from '../panel/panel.js';
import { animateActor, Curve, Duration, reducedMotion, Spring } from '../../shared/motion.js';

const QUARTER = 90;
const TRANSFORMS = 4;

interface Snapshot {
  index: number;
  content: Clutter.Content;
  width: number;
  height: number;
  angle: number;
}

interface MonitorSource {
  monitors: Monitor[];
  connect(signal: string, callback: () => void): number;
  disconnect(id: number): void;
}

interface RotatingManager {
  connect(signal: 'rotating', callback: (manager: Meta.MonitorManager, index: number, from: number, to: number) => void): number;
  disconnect(id: number): void;
}

const shell = () => global as unknown as Shell.Global;

function turn(from: number, to: number): number {
  const quarters = ((to % TRANSFORMS) - (from % TRANSFORMS) + TRANSFORMS) % TRANSFORMS;
  return (quarters > TRANSFORMS / 2 ? quarters - TRANSFORMS : quarters) * QUARTER;
}

export class RotationAnimation {
  private readonly manager = shell().backend.get_monitor_manager() as unknown as RotatingManager;
  private readonly signals: [{ disconnect(id: number): void }, number][];
  private snapshots: Snapshot[] = [];
  private readonly playing = new Set<Clutter.Actor>();

  constructor(private readonly layout: MonitorSource) {
    this.signals = [
      [this.manager, this.manager.connect('rotating', (_manager, index, from, to) => this.capture(index, from, to))],
      [layout, layout.connect('monitors-changed', () => this.play())],
    ];
  }

  destroy(): void {
    for (const [object, id] of this.signals) object.disconnect(id);
    for (const actor of this.playing) actor.destroy();
  }

  private capture(index: number, from: number, to: number): void {
    const monitor = this.layout.monitors[index];
    const angle = turn(from, to);
    if (!monitor || !angle) return;
    const { stage } = shell();
    const area = new Mtk.Rectangle({ x: monitor.x, y: monitor.y, width: monitor.width, height: monitor.height });
    const [, , , scale] = stage.get_capture_final_size(area);
    const content = stage.paint_to_content(area, scale, null, Clutter.PaintFlag.NO_CURSORS);
    this.snapshots.push({ index, content, width: monitor.width, height: monitor.height, angle });
  }

  private play(): void {
    const snapshots = this.snapshots;
    this.snapshots = [];
    for (const snapshot of snapshots) {
      const monitor = this.layout.monitors[snapshot.index];
      if (monitor) this.turn(snapshot, monitor);
    }
  }

  private turn({ content, width, height, angle }: Snapshot, monitor: Monitor): void {
    const { stage } = shell();
    const frame = new Clutter.Actor({ name: 'kestrel-rotation', x: monitor.x, y: monitor.y, width: monitor.width, height: monitor.height, clip_to_allocation: true });
    const picture = new Clutter.Actor({
      content, width, height,
      x: Math.round((monitor.width - width) / 2), y: Math.round((monitor.height - height) / 2),
    });
    picture.set_pivot_point(0.5, 0.5);
    picture.set_content_scaling_filters(Clutter.ScalingFilter.LINEAR, Clutter.ScalingFilter.LINEAR);
    frame.add_child(picture);
    stage.add_child(frame);
    this.playing.add(frame);
    const done = () => {
      this.playing.delete(frame);
      frame.destroy();
    };
    if (reducedMotion()) {
      animateActor(picture, { opacity: 0, duration: Duration.standard, curve: Curve.decelerate, onStopped: done });
      return;
    }
    const fit = Math.min(monitor.width / width, monitor.height / height);
    picture.rotation_angle_z = angle;
    animateActor(picture, { rotation_angle_z: 0, scale_x: fit, scale_y: fit, spring: Spring.smooth });
    animateActor(picture, { opacity: 0, duration: Duration.standard, delay: Duration.quick, curve: Curve.decelerate, onStopped: done });
  }
}
