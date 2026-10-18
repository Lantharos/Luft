import Clutter from 'gi://Clutter';

import type { Monitor } from '../panel/panel.js';
import { animateActor, Curve, Duration, Spring } from '../../shared/motion.js';

interface Picture {
  content: Clutter.Content;
  width: number;
  height: number;
  angle: number;
}

const lerp = (from: number, to: number, progress: number) => from + (to - from) * progress;

export class TurningLayer {
  readonly actor: Clutter.Actor;
  private readonly before: Clutter.Actor;
  private readonly after: Clutter.Clone;

  constructor(private readonly picture: Picture, private readonly monitor: Monitor, scene: Clutter.Actor) {
    this.actor = new Clutter.Actor({ clip_to_allocation: true, rotation_angle_z: picture.angle });
    this.actor.set_pivot_point(0.5, 0.5);
    this.after = new Clutter.Clone({ source: scene });
    this.before = new Clutter.Actor({ content: picture.content, width: picture.width, height: picture.height });
    this.before.set_content_scaling_filters(Clutter.ScalingFilter.LINEAR, Clutter.ScalingFilter.LINEAR);
    this.actor.add_child(this.after);
    this.actor.add_child(this.before);
    this.actor.connect('notify::rotation-angle-z', () => this.follow());
    this.follow();
  }

  play(done: () => void): void {
    let running = 2;
    const finished = () => {
      if (--running === 0) done();
    };
    animateActor(this.actor, { rotation_angle_z: 0, spring: Spring.smooth, onStopped: finished });
    animateActor(this.before, { opacity: 0, duration: Duration.quick, delay: Duration.quick, curve: Curve.decelerate, onStopped: finished });
  }

  private follow(): void {
    const progress = 1 - this.actor.rotation_angle_z / this.picture.angle;
    const { width: endWidth, height: endHeight } = this.monitor;
    const width = Math.round(lerp(this.picture.width, endWidth, progress));
    const height = Math.round(lerp(this.picture.height, endHeight, progress));
    this.actor.set_size(width, height);
    this.actor.set_position(Math.round((endWidth - width) / 2), Math.round((endHeight - height) / 2));
    this.fill(this.before, this.picture.width, this.picture.height, width, height, 0, 0);
    this.fill(this.after, endWidth, endHeight, width, height, this.monitor.x, this.monitor.y);
  }

  private fill(actor: Clutter.Actor, sourceWidth: number, sourceHeight: number, width: number, height: number, originX: number, originY: number): void {
    const scale = Math.max(width / sourceWidth, height / sourceHeight);
    actor.set_scale(scale, scale);
    actor.set_position((width - sourceWidth * scale) / 2 - originX * scale, (height - sourceHeight * scale) / 2 - originY * scale);
  }
}
