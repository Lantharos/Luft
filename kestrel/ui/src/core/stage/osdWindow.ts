import { styleSurface, PILL } from '../../appearance/kestrelGlass.js';
import Clutter from 'gi://Clutter';
import type Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import St from 'gi://St';

import * as BarLevel from '../../shared/widgets/barLevel.js';
import * as Layout from './layout.js';
import * as KestrelUi from '../../kestrelUi.js';
import * as Main from '../main.js';

const HIDE_TIMEOUT = 1500;
const TASKBAR_GAP = 24;
const FADE_TIME = 100;
export const LEVEL_ANIMATION_TIME = 100;

export interface OsdLevel {
  level?: number | null;
  maxLevel?: number;
}

export class OsdWindow extends Clutter.Actor {
  static {
    GObject.registerClass(this);
  }

  private readonly hbox = new St.BoxLayout({ style_class: 'osd-window' });
  private readonly icon = new St.Icon({ y_expand: true });
  private readonly vbox = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, y_align: Clutter.ActorAlign.CENTER });
  private readonly caption = new St.Label();
  private readonly level = new BarLevel.BarLevel({ style_class: 'level' });
  private hideTimeoutId = 0;

  constructor(monitorIndex: number) {
    super({
      x_expand: true,
      y_expand: true,
      x_align: Clutter.ActorAlign.CENTER,
      y_align: Clutter.ActorAlign.END,
    });

    this.add_constraint(new Layout.MonitorConstraint({ index: monitorIndex }));

    styleSurface(this.hbox, PILL);
    this.add_child(this.hbox);
    this.hbox.add_child(this.icon);
    this.hbox.add_child(this.vbox);
    this.vbox.add_child(this.caption);
    this.vbox.add_child(this.level);

    this.reset();
    Main.uiGroup.add_child(this);
  }

  private updateBoxVisibility(): void {
    this.vbox.visible = [...this.vbox].some(child => child.visible);
  }

  setIcon(icon: Gio.Icon): void {
    this.icon.gicon = icon;
  }

  setLabel(label: string | null): void {
    this.caption.visible = label != null;
    if (label != null) this.caption.text = label;
    this.updateBoxVisibility();
  }

  setLevel(value: number | null | undefined): void {
    this.level.visible = value != null;
    if (value != null) {
      if (this.visible) {
        this.level.ease_property('value', value, {
          mode: Clutter.AnimationMode.EASE_OUT_QUAD,
          duration: LEVEL_ANIMATION_TIME,
        });
      } else {
        this.level.value = value;
      }
    }
    this.updateBoxVisibility();
  }

  setMaxLevel(maxLevel = 1): void {
    this.level.maximumValue = maxLevel;
  }

  show(): void {
    if (!this.icon.gicon) return;

    if (!this.visible) {
      this.hbox.style = `margin-bottom: ${KestrelUi.taskbarClearance() + TASKBAR_GAP}px;`;
      global.compositor.disable_unredirect();
      super.show();
      this.opacity = 0;
      this.get_parent()!.set_child_above_sibling(this, null);
    }

    if (this.hideTimeoutId) {
      GLib.source_remove(this.hideTimeoutId);
    } else {
      this.ease({
        opacity: 255,
        duration: FADE_TIME,
        mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      });
    }
    this.hideTimeoutId = GLib.timeout_add_once(GLib.PRIORITY_DEFAULT, HIDE_TIMEOUT, () => this.fadeOut());
    GLib.Source.set_name_by_id(this.hideTimeoutId, '[kestrel] this._hide');
  }

  cancel(): void {
    if (!this.hideTimeoutId) return;

    GLib.source_remove(this.hideTimeoutId);
    this.fadeOut();
  }

  private fadeOut(): void {
    this.hideTimeoutId = 0;
    this.ease({
      opacity: 0,
      duration: FADE_TIME,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      onComplete: () => {
        this.reset();
        global.compositor.enable_unredirect();
      },
    });
  }

  private reset(): void {
    super.hide();
    this.setLabel(null);
    this.setMaxLevel();
    this.setLevel(null);
  }
}

export class OsdWindowManager {
  private readonly osdWindows: OsdWindow[] = [];

  constructor() {
    Main.layoutManager.connect('monitors-changed', () => this.monitorsChanged());
    this.monitorsChanged();
  }

  private monitorsChanged(): void {
    const count = Main.layoutManager.monitors.length;
    for (let i = this.osdWindows.length; i < count; i++) this.osdWindows[i] = new OsdWindow(i);
    for (const osdWindow of this.osdWindows.splice(count)) osdWindow.destroy();
  }

  private showOsdWindow(monitorIndex: number, icon: Gio.Icon, label: string | null, level: number | null | undefined, maxLevel: number | undefined): void {
    const osdWindow = this.osdWindows[monitorIndex];
    osdWindow.setIcon(icon);
    osdWindow.setLabel(label);
    osdWindow.setMaxLevel(maxLevel);
    osdWindow.setLevel(level);
    osdWindow.show();
  }

  show(icon: Gio.Icon, label: string | null, levels: Record<number, OsdLevel>): void {
    this.osdWindows.forEach((osdWindow, i) => {
      const monitor = levels[i];
      if (monitor) this.showOsdWindow(i, icon, label, monitor.level, monitor.maxLevel ?? -1);
      else osdWindow.cancel();
    });
  }

  showOne(monitorIndex: number, icon: Gio.Icon, label: string | null, level?: number | null, maxLevel?: number): void {
    this.show(icon, label, { [monitorIndex]: { level, maxLevel } });
  }

  showAll(icon: Gio.Icon, label: string | null, level: number | null, maxLevel?: number): void {
    this.osdWindows.forEach((_osdWindow, i) => this.showOsdWindow(i, icon, label, level, maxLevel));
  }

  hideAll(): void {
    for (const osdWindow of this.osdWindows) osdWindow.cancel();
  }
}
