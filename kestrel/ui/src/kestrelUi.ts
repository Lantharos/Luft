import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import Meta from 'gi://Meta';
import St from 'gi://St';

import { ContextMenus } from './contextMenus.js';
import { KestrelPanel, type Monitor } from './panel.js';
import { StartMenu } from './startMenu.js';
import { QuickSettings } from './quickSettings.js';
import { NotificationCenter, type MessageTray } from './notificationCenter.js';
import { PowerMenu } from './powerMenu.js';
import { PANEL_HEIGHT, SURFACE_GAP } from './surface.js';
import { animateActor } from './motion.js';
import type { QuickSettingsSource } from './quickControls.js';

type Surface = 'start' | 'quick' | 'notifications' | 'power';

interface LayoutManager {
  primaryMonitor: Monitor | null;
  panelBox: St.Widget;
  addChrome(actor: Clutter.Actor, params?: Record<string, boolean>): void;
  addTopChrome(actor: Clutter.Actor, params?: Record<string, boolean>): void;
  removeChrome(actor: Clutter.Actor): void;
  connect(signal: string, callback: () => void): number;
}

interface Context {
  layoutManager: LayoutManager;
  messageTray: MessageTray;
  quickSettings: QuickSettingsSource;
}

class KestrelUi {
  private readonly menus: ContextMenus;
  private readonly panel: KestrelPanel;
  private readonly start: StartMenu;
  private readonly quick: QuickSettings;
  private readonly notifications: NotificationCenter;
  private readonly power: PowerMenu;
  private readonly cover = new St.Widget({ reactive: true, visible: false });
  private stylesheetMonitor: Gio.FileMonitor | null = null;
  private active: Surface | null = null;
  private powerOpen = false;
  private desktopMenuSignal = 0;

  constructor(private readonly context: Context) {
    const shellGlobal = global as unknown as Shell.Global;
    const theme = St.ThemeContext.get_for_stage(shellGlobal.stage).get_theme();
    const cssPath = GLib.getenv('KESTREL_CSS_PATH');
    const stylesheet = cssPath
      ? Gio.File.new_for_path(cssPath)
      : Gio.File.new_for_uri('resource:///org/gnome/shell/theme/kestrel.css');
    theme.load_stylesheet(stylesheet);
    if (cssPath) {
      this.stylesheetMonitor = stylesheet.monitor_file(Gio.FileMonitorFlags.NONE, null);
      this.stylesheetMonitor.connect('changed', (_monitor, _file, _otherFile, event) => {
        if (event !== Gio.FileMonitorEvent.CHANGES_DONE_HINT)
          return;
        theme.unload_stylesheet(stylesheet);
        theme.load_stylesheet(stylesheet);
      });
    }

    this.menus = new ContextMenus(() => context.layoutManager.primaryMonitor, () => this.close());
    this.panel = new KestrelPanel({
      start: () => this.toggle('start'),
      quickSettings: () => this.toggle('quick'),
      notifications: () => this.toggle('notifications'),
    }, this.menus);
    this.start = new StartMenu(() => this.close(), () => this.openPowerMenu(), this.menus);
    this.quick = new QuickSettings(context.quickSettings, () => this.place(), () => this.close(),
      (network, volume) => this.panel.updateStatus(network, volume), this.menus);
    this.notifications = new NotificationCenter(context.messageTray, this.menus);
    this.power = new PowerMenu(() => this.close());

    context.layoutManager.addTopChrome(this.menus.shield);
    context.layoutManager.addTopChrome(this.menus.actor);

    const panelParent = context.layoutManager.panelBox.get_parent()!;
    context.layoutManager.removeChrome(context.layoutManager.panelBox);
    panelParent.insert_child_at_index(context.layoutManager.panelBox, 0);
    context.layoutManager.panelBox.hide();
    context.layoutManager.addChrome(this.panel.actor, {
      affectsStruts: true,
      trackFullscreen: true,
    });

    context.layoutManager.addTopChrome(this.cover);
    context.layoutManager.addTopChrome(this.start.actor);
    context.layoutManager.addTopChrome(this.quick.actor);
    context.layoutManager.addTopChrome(this.notifications.actor);
    context.layoutManager.addTopChrome(this.power.actor);
    for (const actor of [this.start.actor, this.quick.actor, this.notifications.actor, this.power.actor]) {
      const updateClip = () => actor.set_clip(0, 0, actor.width,
        Math.max(0, (actor === this.power.actor
          ? Math.min(this.panel.actor.y, this.start.powerButton.get_transformed_position()[1])
          : this.panel.actor.y) - actor.y - actor.translation_y));
      for (const signal of ['notify::translation-y', 'notify::width', 'notify::height', 'notify::y'] as const)
        actor.connect(signal, updateClip);
    }

    this.cover.connect('button-press-event', () => {
      this.close();
      return Clutter.EVENT_STOP;
    });
    shellGlobal.stage.connect('key-press-event', (_stage, event) => {
      if (this.active && event.get_key_symbol() === Clutter.KEY_Escape) {
        if (this.powerOpen) this.closePower();
        else if (this.active !== 'quick' || !this.quick.closeSubmenu()) this.close();
        return Clutter.EVENT_STOP;
      }
      return Clutter.EVENT_PROPAGATE;
    });
    this.desktopMenuSignal = shellGlobal.stage.connect('captured-event', (_stage, event) => {
      if (event.type() !== Clutter.EventType.BUTTON_PRESS || event.get_button() !== Clutter.BUTTON_SECONDARY)
        return Clutter.EVENT_PROPAGATE;
      const [x, y] = event.get_coords();
      const target = shellGlobal.stage.get_actor_at_pos(Clutter.PickMode.REACTIVE, x, y);
      if (!(target instanceof Meta.BackgroundActor)) return Clutter.EVENT_PROPAGATE;
      this.menus.open(target, [
        { label: 'Change wallpaper', run: () => this.menus.settings('background') },
        { label: 'Display settings', run: () => this.menus.settings('display') },
        { label: 'Settings', run: () => this.menus.settings() },
      ], x, y);
      return Clutter.EVENT_STOP;
    });
    shellGlobal.display.connect('overlay-key' , () => this.toggle('start'));
    context.layoutManager.connect('monitors-changed', () => this.place());
    this.place();
  }

  private place(): void {
    const monitor = this.context.layoutManager.primaryMonitor;
    if (!monitor)
      return;

    this.panel.place(monitor);
    this.cover.set_position(monitor.x, monitor.y);
    this.cover.set_size(monitor.width, monitor.height - PANEL_HEIGHT);
    const startWidth = Math.min(660, monitor.width - 24);
    const bottom = monitor.y + monitor.height - PANEL_HEIGHT - SURFACE_GAP;
    const startHeight = Math.min(600, monitor.height - PANEL_HEIGHT - 24);
    this.start.actor.set_size(startWidth, startHeight);
    this.start.actor.set_position(Math.round(monitor.x + (monitor.width - startWidth) / 2), bottom - startHeight);

    for (const [actor, width, fixedHeight] of [
      [this.quick.actor, 420, this.quick.preferredHeight(420, monitor.height - PANEL_HEIGHT - 24)],
      [this.notifications.actor, 380, Math.min(520, startHeight)],
      [this.power.actor, 216, 0],
    ] as const) {
      actor.width = width;
      actor.height = -1;
      const height = fixedHeight || actor.get_preferred_height(width)[1];
      actor.height = height;
      const right = actor === this.power.actor
        ? this.start.actor.x + startWidth - 24
        : monitor.x + monitor.width - 12;
      actor.set_position(Math.round(right - width), bottom - height - (actor === this.power.actor ? 82 : 0));
    }
  }

  private toggle(surface: Surface): void {
    if (surface === 'power') {
      this.openPowerMenu();
      return;
    }
    if (this.active === surface) {
      this.close();
      return;
    }

    this.close();
    this.active = surface;
    this.panel.setActive(surface);
    this.cover.show();

    if (surface === 'start') {
      this.start.clearSearch();

    } else if (surface === 'notifications') {
      this.notifications.refresh();
    }

    const actor = this.actorFor(surface);
    actor.get_parent()!.set_child_above_sibling(actor, null);
    const opening = !actor.visible;
    actor.show();
    this.place();
    if (opening) {
      actor.opacity = 255;
      actor.translation_y = this.slideDistance(actor);
    }
    this.animate(actor, 0, 300);

    if (surface === 'start') this.start.focus();
  }

  private close(): void {
    this.menus.close();
    this.closePower();
    this.quick.closeSubmenu();
    const surface = this.active;
    this.active = null;
    this.panel.setActive(null);
    this.cover.hide();
    if (!surface)
      return;

    const actor = this.actorFor(surface);
    this.animate(actor, this.slideDistance(actor), 230, () => {
      if (this.active !== surface)
        actor.hide();
    });
  }

  private actorFor(surface: Surface): St.BoxLayout {
    switch (surface) {
      case 'start': return this.start.actor;
      case 'quick': return this.quick.actor;
      case 'notifications': return this.notifications.actor;
      case 'power': return this.power.actor;
    }
  }

  private animate(
    actor: Clutter.Actor,
    translationY: number,
    duration: number,
    onStopped?: () => void,
  ): void {
    animateActor(actor, {
      translation_y: translationY,
      duration,
      mode: translationY === 0
        ? Clutter.AnimationMode.EASE_OUT_QUART
        : Clutter.AnimationMode.EASE_IN_QUART,
      onStopped,
    });
  }

  private slideDistance(actor: Clutter.Actor): number {
    const monitor = this.context.layoutManager.primaryMonitor!;
    return monitor.y + monitor.height - actor.y;
  }

  private openPowerMenu(): void {
    if (this.powerOpen) {
      this.closePower();
      return;
    }
    if (this.active !== 'start') this.toggle('start');
    this.powerOpen = true;
    const actor = this.power.actor;
    actor.get_parent()!.set_child_above_sibling(actor, null);
    if (!actor.visible) {
      actor.opacity = 255;
      actor.translation_y = this.powerDistance();
    }
    actor.show();
    this.animate(actor, 0, 200);
  }

  private powerDistance(): number {
    const [, y] = this.start.powerButton.get_transformed_position();
    return y - this.power.actor.y;
  }

  private closePower(): void {
    if (!this.powerOpen) return;
    this.powerOpen = false;
    const actor = this.power.actor;
    this.animate(actor, this.powerDistance(), 160, () => {
      if (!this.powerOpen) actor.hide();
    });
  }

  shutdown(): void {
    (global as unknown as Shell.Global).stage.disconnect(this.desktopMenuSignal);
    this.panel.shutdown();
    this.stylesheetMonitor?.cancel();
  }

  showSurfaceForCapture(surface: Surface): void {
    this.toggle(surface);
  }
}

let currentUi: KestrelUi;

export function initialize(context: Context): void {
  currentUi = new KestrelUi(context);
}

export function showSurfaceForCapture(surface: Surface): void {
  currentUi.showSurfaceForCapture(surface);
}

export function shutdown(): void {
  currentUi.shutdown();
}
