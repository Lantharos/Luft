import Clutter from 'gi://Clutter';
import Pango from 'gi://Pango';
import St from 'gi://St';

import type { Context } from '../../../context.js';
import { taskbarPreferences } from '../../../desktop/panel/preferences/taskbarPreferences.js';
import { animateActor, Curve, Duration, reducedMotion, Spring } from '../../../shared/motion/motion.js';
import { blurSurface, SURFACE_GAP } from '../../../shared/layout/surface.js';
import { Waveform } from './waveform.js';

const PILL = 999;
const HIDDEN_SCALE = 0.9;
const SPINNER_SCALE = 0.6;

type LayoutManager = Context['layoutManager'];

export class DictationPill {
  private readonly frame = new Clutter.Actor({ layout_manager: new Clutter.BinLayout(), visible: false });
  private readonly pill = new St.Widget({
    style_class: 'kestrel-dictation', layout_manager: new Clutter.BinLayout(), clip_to_allocation: true,
    x_align: Clutter.ActorAlign.CENTER, y_align: Clutter.ActorAlign.END, opacity: 0,
  });
  private readonly content = new St.BoxLayout({ style_class: 'kestrel-dictation-content', x_align: Clutter.ActorAlign.CENTER, y_expand: true });
  private readonly waveform = new Waveform();
  private readonly text = new St.Label({ style_class: 'kestrel-dictation-text', y_align: Clutter.ActorAlign.CENTER, visible: false });
  private readonly spinner = new St.Widget({
    style_class: 'kestrel-dictation-spinner', x_align: Clutter.ActorAlign.CENTER, y_align: Clutter.ActorAlign.CENTER, opacity: 0,
  });

  constructor(private readonly layoutManager: LayoutManager) {
    blurSurface(this.pill, PILL);
    this.text.clutter_text.ellipsize = Pango.EllipsizeMode.START;
    this.content.add_child(this.waveform.actor);
    this.content.add_child(this.text);
    this.pill.add_child(this.content);
    this.pill.add_child(this.spinner);
    this.pill.set_pivot_point(0.5, 0.5);
    this.spinner.set_pivot_point(0.5, 0.5);
    this.frame.add_child(this.pill);
    layoutManager.addTopChrome(this.frame);
  }

  listen(): void {
    const appearing = !this.frame.visible;
    this.text.text = '';
    this.text.visible = false;
    this.spinner.set_content(null);
    this.spinner.remove_all_transitions();
    this.spinner.opacity = 0;
    this.content.remove_all_transitions();
    this.content.opacity = 255;
    this.frame.show();
    this.place();
    this.waveform.start();
    this.resize(this.contentWidth(), appearing);
    const scale = reducedMotion() ? 1 : HIDDEN_SCALE;
    if (appearing) this.pill.set_scale(scale, scale);
    animateActor(this.pill, { opacity: 255, duration: Duration.quick, curve: Curve.decelerate });
    animateActor(this.pill, { scale_x: 1, scale_y: 1, spring: Spring.snappy });
  }

  level(level: number): void {
    this.waveform.push(level);
  }

  heard(text: string): void {
    this.text.text = text;
    this.text.visible = !!text;
    this.resize(this.contentWidth(), false);
  }

  processing(): void {
    this.waveform.stop();
    this.spinner.set_content(new St.SpinnerContent());
    animateActor(this.content, { opacity: 0, duration: Duration.tap, curve: Curve.decelerate });
    animateActor(this.spinner, { opacity: 255, duration: Duration.quick, curve: Curve.decelerate });
    const scale = reducedMotion() ? 1 : SPINNER_SCALE;
    this.spinner.set_scale(scale, scale);
    animateActor(this.spinner, { scale_x: 1, scale_y: 1, spring: Spring.snappy });
    this.resize(this.thickness(), false);
  }

  hide(): void {
    if (!this.frame.visible) return;
    this.waveform.stop();
    const scale = reducedMotion() ? 1 : HIDDEN_SCALE;
    animateActor(this.pill, { scale_x: scale, scale_y: scale, spring: Spring.snappy });
    animateActor(this.pill, {
      opacity: 0, duration: Duration.quick, curve: Curve.decelerate,
      onComplete: () => {
        if (this.pill.opacity > 0) return;
        this.spinner.set_content(null);
        this.frame.hide();
      },
    });
  }

  private thickness(): number {
    return this.pill.get_preferred_height(-1)[1];
  }

  private contentWidth(): number {
    return Math.max(this.content.get_preferred_width(-1)[1], this.thickness());
  }

  private resize(width: number, instantly: boolean): void {
    if (instantly || reducedMotion()) {
      this.pill.remove_transition('width');
      this.pill.width = width;
    } else {
      animateActor(this.pill, { width, spring: Spring.snappy });
    }
  }

  private place(): void {
    const display = global.display;
    const index = display.focus_window?.get_monitor() ?? display.get_current_monitor();
    const monitor = this.layoutManager.monitors[index] ?? this.layoutManager.primaryMonitor;
    if (!monitor) return;
    const taskbar = taskbarPreferences.displays === 'all' || monitor.index === this.layoutManager.primaryMonitor?.index;
    const height = this.thickness();
    const bottom = (taskbar ? taskbarPreferences.reserved : 0) + SURFACE_GAP;
    this.frame.set_position(monitor.x, monitor.y + monitor.height - bottom - height);
    this.frame.set_size(monitor.width, height);
  }

  destroy(): void {
    this.frame.destroy();
  }
}
