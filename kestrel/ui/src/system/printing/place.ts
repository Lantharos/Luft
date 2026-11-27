import Clutter from 'gi://Clutter';
import St from 'gi://St';

import * as KestrelUi from '../../kestrelUi.js';
import * as Layout from '../../core/stage/layout.js';
import * as Main from '../../core/main.js';
import { isVertical, toward, type Edge } from '../../shared/layout/edge.js';
import { Curve, Duration, Spring, stillMotion } from '../../shared/motion/motion.js';

const SLIDE = 48;

export class PanelPlace {
  private readonly bin = new St.Widget({ layout_manager: new Clutter.BinLayout(), visible: false });
  private edge: Edge = 'bottom';
  private open = false;
  private allowed = true;
  private shown = false;

  constructor(private readonly panel: St.Widget) {
    this.bin.add_constraint(new Layout.MonitorConstraint({ primary: true, work_area: true }));
    panel.x_expand = panel.y_expand = true;
    this.bin.add_child(panel);
    Main.layoutManager.addChrome(this.bin);
  }

  setOpen(open: boolean): void {
    this.open = open;
    this.sync();
  }

  setAllowed(allowed: boolean): void {
    this.allowed = allowed;
    this.sync();
  }

  destroy(): void {
    this.bin.destroy();
  }

  private sync(): void {
    const show = this.open && this.allowed;
    if (show === this.shown) return;
    this.shown = show;
    if (show) this.slideIn();
    else this.slideOut();
  }

  private corner(): void {
    const { edge, target, align } = KestrelUi.taskbarAnchor('notifications');
    this.edge = edge;
    const monitor = global.display.get_monitor_geometry(global.display.get_primary_monitor());
    const towardEnd = isVertical(edge) ? target > monitor.y + monitor.height / 2 : align >= 0;
    const near = (start: boolean) => (start ? Clutter.ActorAlign.START : Clutter.ActorAlign.END);
    this.panel.x_align = isVertical(edge) ? near(edge === 'left') : near(!towardEnd);
    this.panel.y_align = isVertical(edge) ? near(!towardEnd) : near(edge === 'top');
  }

  private slideIn(): void {
    this.corner();
    this.panel.remove_all_transitions();
    this.panel.reactive = true;
    if (!this.bin.visible) {
      this.panel.opacity = 0;
      this.panel.set(toward(this.edge, stillMotion() ? 0 : SLIDE));
    }
    this.bin.show();
    this.panel.ease({ opacity: 255, duration: Duration.quick, curve: Curve.decelerate });
    this.panel.ease({ translation_x: 0, translation_y: 0, spring: Spring.arrive });
  }

  private slideOut(): void {
    this.panel.remove_all_transitions();
    this.panel.reactive = false;
    this.panel.ease({
      opacity: 0, ...toward(this.edge, stillMotion() ? 0 : SLIDE), duration: Duration.moderate, curve: Curve.accelerate,
      onComplete: () => this.bin.hide(),
    });
  }
}
