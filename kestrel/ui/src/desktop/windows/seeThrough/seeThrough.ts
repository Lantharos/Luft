import type Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';

import { blurBackdrop } from '../../../appearance/glass/kestrelGlass.js';
import { SeeThroughEffect } from './seeThroughEffect.js';

const APPS = 'see-through-apps';
const LOOK_KEYS = ['see-through-opacity', 'see-through-keep-text', 'rounded-window-corners'];
const EFFECT = 'see-through';
const WINDOW_RADIUS = 15;
const SEE_THROUGH_TYPES = [Meta.WindowType.NORMAL, Meta.WindowType.DIALOG, Meta.WindowType.MODAL_DIALOG, Meta.WindowType.UTILITY];
const WINDOW_SIGNALS = ['size-changed', 'notify::maximized-horizontally', 'notify::maximized-vertically', 'notify::fullscreen'] as const;
const APP_SIGNALS = ['shown', 'notify::wm-class', 'notify::gtk-application-id'] as const;

const holdsSurfaces = (actor: Clutter.Actor) => (actor.constructor as typeof GObject.Object).$gtype.name.startsWith('MetaSurface');

const settings = () => new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });

function appIdOf(window: Meta.Window): string | null {
  const app = Shell.WindowTracker.get_default().get_window_app(window);
  return app && !app.is_window_backed() ? app.get_id() : null;
}

function chosenIn(chosen: Gio.Settings, window: Meta.Window): boolean {
  const appId = appIdOf(window);
  return appId !== null && chosen.get_strv(APPS).includes(appId);
}

export function isSeeThrough(window: Meta.Window): boolean {
  return chosenIn(settings(), window);
}

export function canBeSeeThrough(window: Meta.Window): boolean {
  return appIdOf(window) !== null && SEE_THROUGH_TYPES.includes(window.get_window_type());
}

export function toggleSeeThrough(window: Meta.Window): void {
  const appId = appIdOf(window);
  if (!appId) return;
  const chosen = settings();
  const apps = chosen.get_strv(APPS);
  chosen.set_strv(APPS, apps.includes(appId) ? apps.filter(app => app !== appId) : [...apps, appId]);
}

class SeeThroughWindow {
  private readonly effect = new SeeThroughEffect();
  private readonly backdrop = new St.Widget();
  private readonly blur = blurBackdrop(this.backdrop, 0, 'see-through');
  private readonly signals: number[];
  private readonly surfacesSignals: number[];
  private surfaces: Clutter.Actor | null = null;

  constructor(private readonly window: Meta.Window, private readonly actor: Meta.WindowActor, private readonly settings: Gio.Settings) {
    actor.insert_child_at_index(this.backdrop, 0);
    this.surfacesSignals = (['child-added', 'child-removed'] as const).map(signal => actor.connect(signal, () => this.followSurfaces()));
    this.followSurfaces();
    this.signals = WINDOW_SIGNALS.map(signal => window.connect(signal, () => this.place()));
    this.sync();
  }

  private followSurfaces(): void {
    const surfaces = this.actor.get_children().find(holdsSurfaces) ?? null;
    if (surfaces === this.surfaces) return;
    this.surfaces?.remove_effect_by_name(EFFECT);
    surfaces?.add_effect_with_name(EFFECT, this.effect);
    this.surfaces = surfaces;
  }

  sync(): void {
    this.effect.setLook(this.settings.get_double('see-through-opacity'), this.settings.get_boolean('see-through-keep-text'));
    this.place();
  }

  place(): void {
    const frame = this.window.get_frame_rect();
    const buffer = this.window.get_buffer_rect();
    const x = frame.x - buffer.x;
    const y = frame.y - buffer.y;
    this.effect.setFrame(x, y, frame.width, frame.height, buffer.width, buffer.height);
    this.backdrop.set_position(x, y);
    this.backdrop.set_size(frame.width, frame.height);
    this.blur.set_property('corner-radius', this.radius);
  }

  private get radius(): number {
    const rounded = this.settings.get_boolean('rounded-window-corners') && !this.window.is_maximized() && !this.window.is_fullscreen();
    return rounded ? WINDOW_RADIUS : 0;
  }

  destroy(): void {
    for (const signal of this.signals) this.window.disconnect(signal);
    for (const signal of this.surfacesSignals) this.actor.disconnect(signal);
    this.surfaces?.remove_effect_by_name(EFFECT);
    this.backdrop.destroy();
  }
}

export class SeeThroughWindows {
  private readonly settings = settings();
  private readonly treated = new Map<Meta.Window, SeeThroughWindow>();
  private readonly watched = new Map<Meta.Window, number[]>();
  private readonly settingsSignals: number[];
  private readonly createdSignal: number;

  constructor() {
    this.settingsSignals = [
      this.settings.connect(`changed::${APPS}`, () => this.watched.forEach((_signals, window) => this.sync(window))),
      ...LOOK_KEYS.map(key => this.settings.connect(`changed::${key}`, () => this.treated.forEach(treatment => treatment.sync()))),
    ];
    this.createdSignal = global.display.connect('window-created', (_display, window: Meta.Window) => this.watch(window));
    for (const actor of global.get_window_actors()) this.watch(actor.meta_window!);
  }

  private watch(window: Meta.Window): void {
    const signals = APP_SIGNALS.map(signal => window.connect(signal, () => this.sync(window)));
    signals.push(window.connect('unmanaged', () => this.forget(window)));
    this.watched.set(window, signals);
    this.sync(window);
  }

  private sync(window: Meta.Window): void {
    const actor = window.get_compositor_private<Meta.WindowActor>();
    const wanted = !!actor && canBeSeeThrough(window) && chosenIn(this.settings, window);
    const treatment = this.treated.get(window);
    if (wanted && !treatment) this.treated.set(window, new SeeThroughWindow(window, actor!, this.settings));
    if (!wanted && treatment) {
      treatment.destroy();
      this.treated.delete(window);
    }
  }

  private forget(window: Meta.Window): void {
    for (const signal of this.watched.get(window) ?? []) window.disconnect(signal);
    this.watched.delete(window);
    this.treated.get(window)?.destroy();
    this.treated.delete(window);
  }

  destroy(): void {
    for (const window of [...this.watched.keys()]) this.forget(window);
    for (const signal of this.settingsSignals) this.settings.disconnect(signal);
    global.display.disconnect(this.createdSignal);
  }
}
