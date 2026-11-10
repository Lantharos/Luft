import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { elementTo, islandTo, mainEdge, moveBar, type Arrangement } from '../../../../../../packages/web/ui/src/taskbar/arrangement/index';
import * as Main from '../../../core/main.js';
import { localized, t } from '../../../shared/i18n/index.js';
import { animateActor, Curve, Duration, Spring } from '../../../shared/motion/motion.js';
import { blurSurface } from '../../../shared/layout/surface.js';
import type { KestrelPanel } from '../panel.js';
import type { PanelSet } from '../panels.js';
import { taskbarArrangement } from '../preferences/arrangement.js';
import { Dragging } from './drag.js';
import { Handles } from './handles.js';
import { EditorKeys } from './keys.js';
import { SpotTargets } from './targets.js';

interface ChromeHost {
  addChrome(actor: Clutter.Actor): void;
  addTopChrome(actor: Clutter.Actor): void;
  readonly uiGroup: Clutter.Actor;
}

const RISE = 16;

export class TaskbarEditor {
  readonly panel: KestrelPanel;
  readonly layer = new St.Widget({ name: 'kestrel-arrange', reactive: true, can_focus: true, layout_manager: new Clutter.FixedLayout() });
  readonly targets: SpotTargets;
  readonly handles: Handles;
  readonly bar = new St.BoxLayout({ name: 'kestrel-arrange-bar', style_class: 'kestrel-popover kestrel-arrange-bar', reactive: true });
  readonly reset = new St.Button({ name: 'kestrel-arrange-reset', style_class: 'kestrel-arrange-button', can_focus: true });
  readonly done = new St.Button({ name: 'kestrel-arrange-done', style_class: 'kestrel-arrange-button kestrel-arrange-done', can_focus: true });
  private readonly backdrop = new St.Widget({ name: 'kestrel-arrange-backdrop', style_class: 'kestrel-arrange-backdrop', opacity: 0 });
  private readonly dragging: Dragging;
  private readonly keys: EditorKeys;
  readonly joined: boolean;
  private readonly grab: Clutter.Grab;
  private readonly unwatch: () => void;
  private current: Arrangement;
  private closing = false;

  constructor(host: ChromeHost, private readonly panels: PanelSet, private readonly closed: () => void) {
    this.panel = panels.primary;
    const monitor = this.panel.monitor!;
    const screen = this.panel.screen;
    this.joined = screen.joined;
    this.current = this.joined ? moveBar(taskbarArrangement.current, screen.edge) : taskbarArrangement.current;
    this.targets = new SpotTargets(monitor, screen);
    this.backdrop.set_position(0, 0);
    this.backdrop.set_size(global.stage.width, global.stage.height);
    this.backdrop.add_child(this.targets.actor);
    host.addChrome(this.backdrop);
    const lowest = panels.all.map(panel => panel.actor).reduce((low, actor) =>
      host.uiGroup.get_children().indexOf(actor) < host.uiGroup.get_children().indexOf(low) ? actor : low);
    host.uiGroup.set_child_below_sibling(this.backdrop, lowest);

    this.layer.set_position(0, 0);
    this.layer.set_size(global.stage.width, global.stage.height);
    host.addTopChrome(this.layer);
    this.handles = new Handles(this.layer);
    this.buildBar(monitor);
    this.dragging = new Dragging({
      panel: this.panel,
      targets: this.targets,
      layer: this.layer,
      draft: () => this.current,
      islandTo: (arrangement, from, spot) => islandTo(arrangement, from, spot, this.joined),
      elementTo: (arrangement, element, spot, index) => elementTo(arrangement, element, spot, index, this.joined),
      preview: arrangement => this.preview(arrangement),
    });
    this.keys = new EditorKeys(this);
    this.layer.connect('captured-event', (_actor, event: Clutter.Event) => this.pointer(event));
    this.layer.connect('key-press-event', (_actor, event: Clutter.Event) => this.keys.press(event));
    for (const panel of panels.all) panel.autoHide.arrange(true);
    this.unwatch = taskbarArrangement.watch(() => this.handles.sync(this.panel.islandSet.islands));
    this.grab = Main.pushModal(this.layer, { dismissShell: false });
    taskbarArrangement.preview(this.current);
    this.handles.sync(this.panel.islandSet.islands);
    this.keys.focusFirst();
    this.open();
  }

  get draft(): Arrangement {
    return this.current;
  }

  preview(arrangement: Arrangement): void {
    this.current = arrangement;
    taskbarArrangement.preview(arrangement);
  }


  resetToDefault(): void {
    const arrangement = taskbarArrangement.defaultArrangement;
    this.preview(this.joined ? moveBar(arrangement, mainEdge(arrangement)) : arrangement);
  }

  finish(): void {
    this.dragging.release();
    taskbarArrangement.save(this.current);
    this.close();
  }

  cancel(): void {
    this.dragging.cancel();
    taskbarArrangement.preview(null);
    this.close();
  }

  private open(): void {
    animateActor(this.backdrop, { opacity: 255, duration: Duration.standard, curve: Curve.decelerate });
    this.bar.opacity = 0;
    this.bar.translation_y = RISE;
    animateActor(this.bar, { opacity: 255, translation_y: 0, spring: Spring.smooth });
  }

  private close(): void {
    if (this.closing) return;
    this.closing = true;
    this.unwatch();
    Main.popModal(this.grab);
    for (const panel of this.panels.all) panel.autoHide.arrange(false);
    this.handles.destroy();
    this.closed();
    animateActor(this.bar, { opacity: 0, translation_y: RISE, duration: Duration.quick, curve: Curve.decelerate });
    animateActor(this.backdrop, {
      opacity: 0, duration: Duration.standard, curve: Curve.decelerate,
      onStopped: () => {
        this.backdrop.destroy();
        this.layer.destroy();
      },
    });
  }

  private buildBar(monitor: { x: number; y: number; width: number; height: number }): void {
    blurSurface(this.bar);
    const text = new St.BoxLayout({ style_class: 'kestrel-arrange-text', orientation: Clutter.Orientation.VERTICAL, x_expand: true, y_align: Clutter.ActorAlign.CENTER });
    const title = new St.Label({ style_class: 'kestrel-arrange-title' });
    const hint = new St.Label({ style_class: 'kestrel-arrange-hint' });
    text.add_child(title);
    text.add_child(hint);
    this.bar.add_child(text);
    for (const button of [this.reset, this.done]) this.bar.add_child(button);
    localized(this.bar, () => {
      title.text = t('taskbar-arrange-title');
      hint.text = t('taskbar-arrange-hint');
      this.reset.label = t('taskbar-arrange-reset');
      this.done.label = t('taskbar-arrange-done');
    });
    this.reset.connect('clicked', () => this.resetToDefault());
    this.done.connect('clicked', () => this.finish());
    this.layer.add_child(this.bar);
    const place = () => {
      const [, width] = this.bar.get_preferred_width(-1);
      const [, height] = this.bar.get_preferred_height(width);
      this.bar.set_position(Math.round(monitor.x + (monitor.width - width) / 2), Math.round(monitor.y + (monitor.height - height) / 2));
    };
    this.bar.connect('notify::width', place);
    place();
  }

  private onBar(x: number, y: number): boolean {
    const [barX, barY] = this.bar.get_transformed_position();
    const [width, height] = this.bar.get_transformed_size();
    return x >= barX && x < barX + width && y >= barY && y < barY + height;
  }

  private pointer(event: Clutter.Event): boolean {
    const type = event.type();
    const [x, y] = event.get_coords();
    if (type === Clutter.EventType.BUTTON_PRESS && event.get_button() === Clutter.BUTTON_PRIMARY) {
      if (this.onBar(x, y)) return Clutter.EVENT_PROPAGATE;
      const island = this.handles.islandAt(x, y);
      const grip = island ? { island } : this.dragging.elementAt(x, y);
      if (grip) {
        this.dragging.press(grip, x, y);
        this.keys.focusGrip(grip);
      }
      return Clutter.EVENT_STOP;
    }
    if (type === Clutter.EventType.MOTION) {
      this.handles.hover(this.dragging.active ? null : this.handles.islandAt(x, y));
      this.dragging.motion(x, y);
      return this.dragging.active ? Clutter.EVENT_STOP : Clutter.EVENT_PROPAGATE;
    }
    if (type === Clutter.EventType.BUTTON_RELEASE && event.get_button() === Clutter.BUTTON_PRIMARY) {
      const wasDragging = this.dragging.active;
      this.dragging.release();
      if (wasDragging) this.keys.refocus();
      return wasDragging ? Clutter.EVENT_STOP : Clutter.EVENT_PROPAGATE;
    }
    return Clutter.EVENT_PROPAGATE;
  }
}
