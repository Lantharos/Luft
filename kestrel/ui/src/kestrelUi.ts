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

interface AnimatedActor extends Clutter.Actor {
  ease(params: Record<string, unknown>): void;
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
    this.quick = new QuickSettings(context.brightnessManager);
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
    this.cover.set_size(monitor.width, monitor.height);
    this.start.actor.set_position(
      Math.round(monitor.x + (monitor.width - 630) / 2),
      monitor.y + monitor.height - 64 - 600 - 12,
    );
    this.start.actor.set_size(630, 600);
    this.quick.actor.set_position(
      monitor.x + monitor.width - 405 - 14,
      monitor.y + monitor.height - 64 - 290 - 12,
    );
    this.quick.actor.set_size(405, 290);
    this.notifications.actor.set_position(
      monitor.x + monitor.width - 405 - 14,
      monitor.y + monitor.height - 64 - 550 - 12,
    );
    this.notifications.actor.set_size(405, 550);
    this.power.actor.set_position(
      Math.round(monitor.x + (monitor.width - 630) / 2 + 630 - 220),
      monitor.y + monitor.height - 64 - 325 - 12,
    );
    this.power.actor.set_size(220, 325);
  }

  private toggle(surface: Surface): void {
    if (this.active === surface) {
      this.close();
      return;
    }

    this.close();
    this.active = surface;
    this.cover.show();

    const actor = this.actorFor(surface);
    actor.opacity = 0;
    actor.translation_y = 32;
    actor.show();
    this.animate(actor, 255, 0, 250);

    if (surface === 'start') {
      this.start.clearSearch();
      this.start.focus();
    } else if (surface === 'quick') {
      this.quick.refresh();
    } else if (surface === 'notifications') {
      this.notifications.refresh();
    }
  }

  private close(): void {
    const surface = this.active;
    this.active = null;
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
    (actor as AnimatedActor).ease({
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
