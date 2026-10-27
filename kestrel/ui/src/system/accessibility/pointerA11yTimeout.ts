import Cairo from 'cairo';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

import { setSourceColor } from '../../shared/display/cairo.js';
import * as Main from '../../core/main.js';

const SUCCESS_ZOOM_OUT_DURATION = 150;
const FULL_CIRCLE = 2 * Math.PI;

class PieTimer extends St.DrawingArea {
  static [GObject.properties] = {
    'angle': GObject.ParamSpec.double('angle', null, null, GObject.ParamFlags.READWRITE, 0, FULL_CIRCLE, 0),
  };

  static {
    GObject.registerClass(this);
  }

  private angleValue = 0;

  constructor() {
    super({
      style_class: 'pie-timer',
      opacity: 0,
      visible: false,
      can_focus: false,
      reactive: false,
    });

    this.set_pivot_point(0.5, 0.5);
  }

  get angle(): number {
    return this.angleValue;
  }

  set angle(angle: number) {
    if (this.angleValue === angle) return;

    this.angleValue = angle;
    this.notify('angle');
    this.queue_repaint();
  }

  vfunc_repaint(): void {
    const node = this.get_theme_node();
    const backgroundColor = node.get_color('-pie-background-color');
    const borderColor = node.get_color('-pie-border-color');
    const borderWidth = node.get_length('-pie-border-width');
    const [width, height] = this.get_surface_size();
    const radius = Math.min(width / 2, height / 2);
    const partial = this.angleValue < FULL_CIRCLE;

    const startAngle = 3 * Math.PI / 2;
    const endAngle = startAngle + this.angleValue;

    const cr = this.get_context();
    cr.setLineCap(Cairo.LineCap.ROUND);
    cr.setLineJoin(Cairo.LineJoin.ROUND);
    cr.translate(width / 2, height / 2);

    if (partial) cr.moveTo(0, 0);

    cr.arc(0, 0, radius - borderWidth, startAngle, endAngle);

    if (partial) cr.lineTo(0, 0);

    cr.closePath();

    cr.setLineWidth(0);
    setSourceColor(cr, backgroundColor);
    cr.fillPreserve();

    cr.setLineWidth(borderWidth);
    setSourceColor(cr, borderColor);
    cr.stroke();

    cr.$dispose();
  }

  start(x: number, y: number, duration: number): void {
    this.x = x - this.width / 2;
    this.y = y - this.height / 2;
    this.show();

    this.ease({
      opacity: 255,
      duration: duration / 4,
      mode: Clutter.AnimationMode.EASE_IN_QUAD,
    });

    this.ease_property('angle', FULL_CIRCLE, {
      duration,
      mode: Clutter.AnimationMode.LINEAR,
      onComplete: () => this.zoomOut(),
    });
  }

  private zoomOut(): void {
    this.ease({
      scale_x: 2,
      scale_y: 2,
      opacity: 0,
      duration: SUCCESS_ZOOM_OUT_DURATION,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      onStopped: () => this.destroy(),
    });
  }
}

export class PointerA11yTimeout {
  private pieTimer: PieTimer | null = null;

  constructor() {
    const seat = global.stage.context.get_backend().get_default_seat();

    seat.connect('ptr-a11y-timeout-started', (_seat, _type, timeout) => {
      const [x, y] = global.get_pointer();

      const pieTimer = new PieTimer();
      this.pieTimer = pieTimer;
      Main.uiGroup.add_child(pieTimer);
      Main.uiGroup.set_child_above_sibling(pieTimer, null);
      pieTimer.connect('destroy', () => (this.pieTimer = null));

      pieTimer.start(x, y, timeout);
    });

    seat.connect('ptr-a11y-timeout-stopped', (_seat, _type, clicked) => {
      if (!clicked) this.pieTimer?.destroy();
    });
  }
}
