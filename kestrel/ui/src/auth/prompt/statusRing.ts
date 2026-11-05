import Cairo from 'cairo';
import Clutter from 'gi://Clutter';
import type Cogl from 'gi://Cogl';
import GObject from 'gi://GObject';
import Graphene from 'gi://Graphene';
import St from 'gi://St';

import { Curve, Duration } from '../../shared/motion/motion.js';

const RADIUS = 44;
const SIZE = 94;
const AVATAR_RADIUS = 38;
const STROKE = 2.5;
const PULSE_STROKE = 3;
const SWEEP = 0.24;
const SWEEP_TIME = 950;
const PULSE_TIME = 640;
const PULSE_SCALE = 1.16;

type Paint = (cr: Cairo.Context, ink: Cogl.Color, scale: number) => void;

export function setColor(cr: Cairo.Context, color: Cogl.Color, alpha: number): void {
  cr.setSourceRGBA(color.red / 255, color.green / 255, color.blue / 255, alpha);
}

/** Traces the ring clockwise from the top, around the avatar and rounded like it, and returns its length. */
function traceRing(cr: Cairo.Context, avatarRadius: number): number {
  const corner = avatarRadius > 0 ? avatarRadius + RADIUS - AVATAR_RADIUS : 0;
  const straight = RADIUS - corner;
  const [near, far] = [SIZE / 2 - straight, SIZE / 2 + straight];
  cr.newPath();
  cr.moveTo(SIZE / 2, SIZE / 2 - RADIUS);
  cr.arc(far, near, corner, -Math.PI / 2, 0);
  cr.arc(far, far, corner, 0, Math.PI / 2);
  cr.arc(near, far, corner, Math.PI / 2, Math.PI);
  cr.arc(near, near, corner, Math.PI, 3 * Math.PI / 2);
  cr.closePath();
  return 8 * straight + 2 * Math.PI * corner;
}

function ringArea(styleClass: string, paint: Paint): St.DrawingArea {
  const area = new St.DrawingArea({ style_class: styleClass, pivot_point: new Graphene.Point({ x: 0.5, y: 0.5 }) });
  area.connect('repaint', () => {
    const cr = area.get_context();
    const scale = area.get_width() / SIZE;
    cr.scale(scale, scale);
    paint(cr, area.get_theme_node().get_foreground_color(), scale);
    cr.$dispose();
  });
  return area;
}

export class StatusRing extends St.Widget {
  static [GObject.properties] = {
    'progress': GObject.ParamSpec.double('progress', null, null, GObject.ParamFlags.READWRITE, 0, 1, 0),
    'turn': GObject.ParamSpec.double('turn', null, null, GObject.ParamFlags.READWRITE, 0, 1, 0),
  };

  static {
    GObject.registerClass(this);
  }

  private progressValue = 0;
  private turnValue = 0;
  private readonly arc: St.DrawingArea;
  private readonly pulse: St.DrawingArea;

  constructor(private readonly avatar: St.Widget) {
    super({ style_class: 'kestrel-auth-who', x_align: Clutter.ActorAlign.START });
    this.add_child(avatar);

    this.arc = ringArea('kestrel-auth-ring', (cr, ink, scale) => {
      cr.setLineWidth(STROKE);
      cr.setLineCap(Cairo.LineCap.ROUND);
      const length = traceRing(cr, this.avatarRadius(scale));
      setColor(cr, ink, 0.14);
      cr.strokePreserve();
      if (this.progressValue <= 0) return;
      setColor(cr, ink, 0.92);
      if (this.progressValue < 1) cr.setDash([this.progressValue * length, (1 - this.progressValue) * length], -this.turnValue * length);
      cr.stroke();
    });
    this.arc.opacity = 0;
    this.add_child(this.arc);

    this.pulse = ringArea('kestrel-auth-ring-pulse', (cr, danger, scale) => {
      cr.setLineWidth(PULSE_STROKE);
      setColor(cr, danger, 1);
      traceRing(cr, this.avatarRadius(scale));
      cr.stroke();
    });
    this.pulse.opacity = 0;
    this.add_child(this.pulse);
  }

  private avatarRadius(scale: number): number {
    return Math.min(this.avatar.get_theme_node().get_border_radius(St.Corner.TOPLEFT) / scale, AVATAR_RADIUS);
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

  get turn(): number {
    return this.turnValue;
  }

  set turn(value: number) {
    if (this.turnValue === value) return;
    this.turnValue = value;
    this.arc.queue_repaint();
    this.notify('turn');
  }

  sweep(): void {
    this.remove_transition('progress');
    this.progress = SWEEP;
    this.arc.ease({ opacity: 255, duration: Duration.quick, curve: Curve.decelerate });
    this.turn = 0;
    this.ease({ turn: 1, duration: SWEEP_TIME, mode: Clutter.AnimationMode.LINEAR, repeatCount: -1 });
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
    this.remove_transition('turn');
    this.turn = 0;
  }
}
