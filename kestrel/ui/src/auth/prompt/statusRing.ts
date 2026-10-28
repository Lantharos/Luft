import Cairo from 'cairo';
import Clutter from 'gi://Clutter';
import type Cogl from 'gi://Cogl';
import GObject from 'gi://GObject';
import Graphene from 'gi://Graphene';
import St from 'gi://St';

import { Curve, Duration } from '../../shared/motion/motion.js';

const RADIUS = 44;
const SIZE = 94;
const STROKE = 2.5;
const PULSE_STROKE = 3;
const SWEEP = 0.24;
const SWEEP_TIME = 950;
const PULSE_TIME = 640;
const PULSE_SCALE = 1.16;

type Paint = (cr: Cairo.Context, ink: Cogl.Color) => void;

export function setColor(cr: Cairo.Context, color: Cogl.Color, alpha: number): void {
  cr.setSourceRGBA(color.red / 255, color.green / 255, color.blue / 255, alpha);
}

function circle(styleClass: string, paint: Paint): St.DrawingArea {
  const area = new St.DrawingArea({ style_class: styleClass, pivot_point: new Graphene.Point({ x: 0.5, y: 0.5 }) });
  area.connect('repaint', () => {
    const cr = area.get_context();
    const scale = area.get_width() / SIZE;
    cr.scale(scale, scale);
    paint(cr, area.get_theme_node().get_foreground_color());
    cr.$dispose();
  });
  return area;
}

export class StatusRing extends St.Widget {
  static [GObject.properties] = {
    'progress': GObject.ParamSpec.double('progress', null, null, GObject.ParamFlags.READWRITE, 0, 1, 0),
  };

  static {
    GObject.registerClass(this);
  }

  private progressValue = 0;
  private readonly arc: St.DrawingArea;
  private readonly pulse: St.DrawingArea;

  constructor(avatar: Clutter.Actor) {
    super({ style_class: 'kestrel-auth-who', x_align: Clutter.ActorAlign.START });
    this.add_child(avatar);

    this.arc = circle('kestrel-auth-ring', (cr, ink) => {
      cr.setLineWidth(STROKE);
      cr.setLineCap(Cairo.LineCap.ROUND);
      setColor(cr, ink, 0.14);
      cr.arc(SIZE / 2, SIZE / 2, RADIUS, 0, 2 * Math.PI);
      cr.stroke();
      if (this.progressValue <= 0) return;
      setColor(cr, ink, 0.92);
      cr.arc(SIZE / 2, SIZE / 2, RADIUS, -Math.PI / 2, -Math.PI / 2 + this.progressValue * 2 * Math.PI);
      cr.stroke();
    });
    this.arc.opacity = 0;
    this.add_child(this.arc);

    this.pulse = circle('kestrel-auth-ring-pulse', (cr, danger) => {
      cr.setLineWidth(PULSE_STROKE);
      setColor(cr, danger, 1);
      cr.arc(SIZE / 2, SIZE / 2, RADIUS, 0, 2 * Math.PI);
      cr.stroke();
    });
    this.pulse.opacity = 0;
    this.add_child(this.pulse);
  }

  vfunc_allocate(box: Clutter.ActorBox): void {
    this.set_allocation(box);
    const [width, height] = box.get_size();
    const content = new Clutter.ActorBox({ x1: 0, y1: 0, x2: width, y2: height });
    this.get_first_child()!.allocate(content);
    for (const ring of [this.arc, this.pulse]) {
      const [, , ringWidth, ringHeight] = ring.get_preferred_size();
      const x = (width - ringWidth) / 2;
      const y = (height - ringHeight) / 2;
      ring.allocate(new Clutter.ActorBox({ x1: x, y1: y, x2: x + ringWidth, y2: y + ringHeight }));
    }
  }

  get progress(): number {
    return this.progressValue;
  }

  set progress(value: number) {
    if (this.progressValue === value) return;
    this.progressValue = value;
    this.arc.queue_repaint();
    this.notify('progress');
  }

  sweep(): void {
    this.remove_transition('progress');
    this.progress = SWEEP;
    this.arc.ease({ opacity: 255, duration: Duration.quick, curve: Curve.decelerate });
    this.arc.rotation_angle_z = 0;
    this.arc.ease({ rotation_angle_z: 360, duration: SWEEP_TIME, mode: Clutter.AnimationMode.LINEAR, repeatCount: -1 });
  }

  fill(progress: number, duration: number): void {
    this.stopSweeping();
    this.arc.ease({ opacity: 255, duration: Duration.quick, curve: Curve.decelerate });
    this.ease({ progress, duration, curve: Curve.decelerate });
  }

  clear(): void {
    this.stopSweeping();
    this.remove_transition('progress');
    this.arc.ease({ opacity: 0, duration: Duration.quick, curve: Curve.decelerate, onStopped: finished => finished && (this.progress = 0) });
  }

  fail(): void {
    this.pulse.remove_all_transitions();
    this.pulse.set({ opacity: 242, scale_x: 1, scale_y: 1 });
    this.pulse.ease({ opacity: 0, scale_x: PULSE_SCALE, scale_y: PULSE_SCALE, duration: PULSE_TIME, curve: Curve.decelerate });
    this.clear();
  }

  private stopSweeping(): void {
    this.arc.remove_transition('rotation-angle-z');
    this.arc.rotation_angle_z = 0;
  }
}
