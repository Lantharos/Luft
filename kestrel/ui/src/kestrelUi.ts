import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import St from 'gi://St';

import { KestrelPanel, type Monitor } from './panel.js';
import { StartMenu } from './startMenu.js';
import { QuickSettings, type BrightnessManager } from './quickSettings.js';
import { NotificationCenter, type MessageTray } from './notificationCenter.js';
import { PowerMenu } from './powerMenu.js';
import { PANEL_HEIGHT, SURFACE_GAP } from './surface.js';
import { animateActor } from './motion.js';

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
  brightnessManager: BrightnessManager;
}

class KestrelUi {
  private readonly panel: KestrelPanel;
  private readonly start: StartMenu;
  private readonly quick: QuickSettings;
  private readonly notifications: NotificationCenter;
  private readonly power: PowerMenu;
  private readonly cover = new St.Widget({ reactive: true, visible: false });
  private stylesheetMonitor: Gio.FileMonitor | null = null;
  private active: Surface | null = null;

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

    this.panel = new KestrelPanel({
      start: () => this.toggle('start'),
      quickSettings: () => this.toggle('quick'),
      notifications: () => this.toggle('notifications'),
    });
    this.start = new StartMenu(() => this.close(), () => this.openPowerMenu());
    this.quick = new QuickSettings(context.brightnessManager,
      (network, volume) => this.panel.updateStatus(network, volume));
    this.notifications = new NotificationCenter(context.messageTray);
    this.power = new PowerMenu(() => this.close());

    context.layoutManager.removeChrome(context.layoutManager.panelBox);
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
        Math.max(0, actor.height + SURFACE_GAP - actor.translation_y));
      for (const signal of ['notify::translation-y', 'notify::width', 'notify::height'] as const)
        actor.connect(signal, updateClip);
    }

    this.cover.connect('button-press-event', () => {
      this.close();
      return Clutter.EVENT_STOP;
    });
    shellGlobal.stage.connect('key-press-event', (_stage, event) => {
      if (this.active && event.get_key_symbol() === Clutter.KEY_Escape) {
        this.close();
        return Clutter.EVENT_STOP;
      }
      return Clutter.EVENT_PROPAGATE;
    });
    shellGlobal.display.connect('overlay-key', () => this.toggle('start'));
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
      [this.quick.actor, 360, 0],
      [this.notifications.actor, 380, Math.min(520, startHeight)],
      [this.power.actor, 216, 0],
    ] as const) {
      actor.width = width;
      actor.height = -1;
      const height = fixedHeight || actor.get_preferred_height(width)[1];
      actor.height = height;
      const right = actor === this.power.actor
        ? this.start.actor.x + startWidth
        : monitor.x + monitor.width - 12;
      actor.set_position(Math.round(right - width), bottom - height);
    }
  }

  private toggle(surface: Surface): void {
    if (this.active === surface) {
      this.close();
      return;
    }

    this.close();
    this.active = surface;
    this.panel.setActive(surface);
    this.cover.show();

    const actor = this.actorFor(surface);
    if (!actor.visible) {
      actor.opacity = 0;
      actor.translation_y = 48;
    }
    actor.show();
    this.animate(actor, 255, 0, 280);

    if (surface === 'start') {
      this.start.clearSearch();
      this.start.focus();
    } else if (surface === 'quick') {
      this.quick.refresh();
      this.place();
    } else if (surface === 'notifications') {
      this.notifications.refresh();
    }
  }

  private close(): void {
    const surface = this.active;
    this.active = null;
    this.panel.setActive(null);
    this.cover.hide();
    if (!surface)
      return;

    const actor = this.actorFor(surface);
    this.animate(actor, 0, 32, 180, () => {
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
    opacity: number,
    translationY: number,
    duration: number,
    onStopped?: () => void,
  ): void {
    animateActor(actor, {
      opacity,
      translation_y: translationY,
      duration,
      mode: Clutter.AnimationMode.EASE_OUT_QUART,
      onStopped,
    });
  }

  private openPowerMenu(): void {
    this.toggle('power');
  }

  shutdown(): void {
    this.panel.shutdown();
    this.stylesheetMonitor?.cancel();
    this.context.layoutManager.panelBox.destroy();
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
