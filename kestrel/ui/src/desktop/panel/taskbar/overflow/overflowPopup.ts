import Clutter from 'gi://Clutter';
import St from 'gi://St';

import type { ContextMenus } from '../../../menus/contextMenus.js';
import type { Monitor } from '../../panel.js';
import { taskbarPreferences } from '../../preferences/taskbarPreferences.js';
import { blurSurface, raiseSurface, SURFACE_GAP } from '../../../../shared/layout/surface.js';
import { freezeSelection } from '../../../../appearance/glass/kestrelGlass.js';
import { animateActor, Curve, Duration } from '../../../../shared/motion/motion.js';
import { isVertical, outward, toward, type Edge } from '../../../../shared/layout/edge.js';
import { clamp } from '../../../../shared/math.js';
import { overflowRow, type OverflowApps } from './overflowRow.js';

const SCREEN_MARGIN = 12;
const MIN_WIDTH = 200;
const MAX_WIDTH = 320;
const RISE = 8;
const BLUR = 18;

export class OverflowPopup {
  readonly shield = new St.Widget({ reactive: true, visible: false });
  readonly actor = new St.BoxLayout({
    name: 'kestrel-app-overflow', style_class: 'kestrel-app-overflow', orientation: Clutter.Orientation.VERTICAL, reactive: true, visible: false,
  });
  private readonly list = new St.BoxLayout({ style_class: 'kestrel-overflow-list', orientation: Clutter.Orientation.VERTICAL, x_expand: true });
  private readonly scroll = new St.ScrollView({ hscrollbar_policy: St.PolicyType.NEVER, child: this.list });
  private source: St.Button | null = null;
  private sourceSignal = 0;
  private focusSignal = 0;
  private edge: Edge = 'bottom';
  private clearSelection: (() => void) | null = null;

  constructor(private readonly menus: ContextMenus, private readonly monitorFor: (actor: Clutter.Actor) => Monitor | null,
    private readonly beforeOpen: () => void) {
    blurSurface(this.actor, BLUR);
    this.actor.add_child(this.scroll);
    this.shield.connect('button-press-event', () => { this.close(); return Clutter.EVENT_STOP; });
    this.shield.connect('touch-event', (_shield, event) => {
      if (event.type() === Clutter.EventType.TOUCH_BEGIN) this.close();
      return Clutter.EVENT_STOP;
    });
    this.actor.connect('key-press-event', (_actor, event) => {
      if (event.get_key_symbol() !== Clutter.KEY_Escape) return Clutter.EVENT_PROPAGATE;
      const source = this.source;
      this.close();
      source?.grab_key_focus();
      return Clutter.EVENT_STOP;
    });
  }

  toggle(source: St.Button, apps: OverflowApps): void {
    if (this.source === source) this.close();
    else this.open(source, apps);
  }

  update(source: St.Button, apps: OverflowApps): void {
    if (this.source !== source) return;
    if (apps.apps.length) this.show(apps);
    else this.close();
  }

  forget(source: St.Button): void {
    if (this.source === source) this.close(true);
  }

  private open(source: St.Button, apps: OverflowApps): void {
    if (!this.monitorFor(source)) return;
    this.close(true);
    this.beforeOpen();
    this.source = source;
    source.add_style_pseudo_class('active');
    this.sourceSignal = source.connect('notify::mapped', () => { if (!source.mapped) this.close(true); });
    this.show(apps);
    this.shield.set_position(0, 0);
    this.shield.set_size(global.stage.width, global.stage.height);
    raiseSurface(this.shield);
    raiseSurface(this.actor);
    this.shield.show();
    this.actor.opacity = 0;
    this.actor.set(toward(this.edge, RISE));
    animateActor(this.actor, { opacity: 255, ...toward(this.edge, 0), duration: Duration.brisk, curve: Curve.gentle });
    this.actor.grab_key_focus();
    this.focusSignal = global.stage.connect('notify::key-focus', () => {
      const focus = global.stage.get_key_focus();
      if (!focus || (!this.actor.contains(focus) && !this.menus.actor.contains(focus))) this.close();
    });
  }

  private show(apps: OverflowApps): void {
    const source = this.source!;
    const monitor = this.monitorFor(source)!;
    const screen = taskbarPreferences.on(monitor.index);
    this.edge = screen.edge;
    this.clearSelection?.();
    this.clearSelection = null;
    const focus = global.stage.get_key_focus();
    if (focus && this.actor.contains(focus)) this.actor.grab_key_focus();
    this.list.destroy_all_children();
    for (const app of apps.apps) this.list.add_child(overflowRow(app, apps, this.menus, () => this.close(true)));
    if (screen.touch) this.actor.add_style_class_name('kestrel-app-overflow-touch');
    else this.actor.remove_style_class_name('kestrel-app-overflow-touch');
    this.actor.show();
    const theme = this.actor.get_theme_node();
    const room = isVertical(this.edge) ? monitor.height - 2 * SCREEN_MARGIN : monitor.height - screen.clearance - SURFACE_GAP - SCREEN_MARGIN;
    this.scroll.set_size(-1, -1);
    const tallest = room - theme.get_vertical_padding();
    const height = this.list.get_preferred_height(-1)[1];
    this.scroll.vscrollbar_policy = height > tallest ? St.PolicyType.AUTOMATIC : St.PolicyType.NEVER;
    const width = clamp(this.scroll.get_preferred_width(-1)[1], MIN_WIDTH, MAX_WIDTH);
    this.scroll.set_size(width, Math.min(height, tallest));
    this.actor.set_position(...this.beside(source, monitor, screen.clearance, width + theme.get_horizontal_padding(),
      this.scroll.height + theme.get_vertical_padding()));
  }

  private beside(source: St.Button, monitor: Monitor, clearance: number, width: number, height: number): [number, number] {
    const [x, y] = source.get_transformed_position();
    const [sourceWidth, sourceHeight] = source.get_transformed_size();
    const reach = clearance + SURFACE_GAP;
    const across = (start: number, length: number, size: number) => outward(this.edge) > 0 ? start + length - reach - size : start + reach;
    const along = (start: number, length: number, center: number, size: number) =>
      Math.round(clamp(center - size / 2, start + SCREEN_MARGIN, start + length - size - SCREEN_MARGIN));
    if (isVertical(this.edge)) return [across(monitor.x, monitor.width, width), along(monitor.y, monitor.height, y + sourceHeight / 2, height)];
    return [along(monitor.x, monitor.width, x + sourceWidth / 2, width), across(monitor.y, monitor.height, height)];
  }

  close(immediate = false): void {
    const source = this.source;
    if (!source) return;
    this.source = null;
    source.disconnect(this.sourceSignal);
    global.stage.disconnect(this.focusSignal);
    source.remove_style_pseudo_class('active');
    this.shield.hide();
    if (immediate) {
      this.actor.remove_all_transitions();
      this.actor.hide();
      return;
    }
    this.clearSelection = freezeSelection(this.actor);
    animateActor(this.actor, {
      opacity: 0, ...toward(this.edge, RISE / 2), duration: Duration.tap, curve: Curve.accelerate,
      onComplete: () => { if (!this.source) this.actor.hide(); },
    });
  }
}
