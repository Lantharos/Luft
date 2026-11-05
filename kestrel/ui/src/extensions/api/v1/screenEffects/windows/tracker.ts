import type Clutter from 'gi://Clutter';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import type { EffectWindow } from '../../types.js';
import type { EffectsStage } from '../stage.js';

const EFFECT_TYPES = [Meta.WindowType.NORMAL, Meta.WindowType.DIALOG, Meta.WindowType.MODAL_DIALOG, Meta.WindowType.UTILITY];
const WINDOW_SIGNALS = ['shown', 'notify::wm-class', 'notify::gtk-application-id', 'notify::fullscreen', 'notify::maximized-horizontally', 'notify::maximized-vertically'] as const;
const GEOMETRY_SIGNALS = ['size-changed'] as const;

export interface Attachment {
  /** The window's frame or buffer changed. */
  place(): void;
  detach(): void;
}

/** One kind of effect, as it goes on each window. */
export interface WindowEffect {
  wants(window: EffectWindow): boolean;
  /** Whether it may stay on a fullscreen window. */
  readonly onFullscreen: boolean;
  attach(window: Meta.Window, actor: Meta.WindowActor): Attachment;
  readonly followsFocus: boolean;
}

export function windowDetails(window: Meta.Window): EffectWindow {
  const app = Shell.WindowTracker.get_default().get_window_app(window);
  const type = window.get_window_type();
  return {
    appId: app && !app.is_window_backed() ? app.get_id() : null,
    kind: type === Meta.WindowType.UTILITY ? 'utility' : type === Meta.WindowType.NORMAL ? 'normal' : 'dialog',
    focused: window.has_focus(),
    maximized: window.is_maximized(),
    fullscreen: window.is_fullscreen(),
  };
}

const holdsSurfaces = (actor: Clutter.Actor) => (actor.constructor as typeof Clutter.Actor).$gtype.name.startsWith('MetaSurface');

/** The actor holding a window's surfaces, which is what has its pixels, under its shadow. */
export const surfacesOf = (actor: Meta.WindowActor): Clutter.Actor | null => actor.get_children().find(holdsSurfaces) ?? null;

class TrackedWindow {
  private readonly attachments = new Map<WindowEffect, Attachment>();
  private readonly signals: number[];
  private unredirectHeld = false;
  private closing = false;

  constructor(readonly window: Meta.Window, private readonly tracker: WindowTracker) {
    this.signals = [
      ...WINDOW_SIGNALS.map(signal => window.connect(signal, () => this.sync())),
      ...GEOMETRY_SIGNALS.map(signal => window.connect(signal, () => this.place())),
    ];
  }

  private place(): void {
    for (const attachment of this.attachments.values()) attachment.place();
  }

  /** What's on a closing window stays for as long as it shows, so it doesn't lose its border as it goes. */
  close(): void {
    this.closing = true;
  }

  sync(): void {
    if (this.closing) return;
    const actor = this.window.get_compositor_private<Meta.WindowActor>();
    const details = actor && EFFECT_TYPES.includes(this.window.get_window_type()) ? windowDetails(this.window) : null;
    for (const effect of this.tracker.effects) {
      const wanted = !!details && !this.tracker.held && (!details.fullscreen || effect.onFullscreen) && effect.wants(details);
      const attachment = this.attachments.get(effect);
      if (wanted && !attachment) this.attachments.set(effect, effect.attach(this.window, actor!));
      if (!wanted && attachment) this.detach(effect, attachment);
    }
    this.holdUnredirect(!!details?.fullscreen && this.attachments.size > 0);
  }

  private detach(effect: WindowEffect, attachment: Attachment): void {
    attachment.detach();
    this.attachments.delete(effect);
  }

  /** Direct scanout shows a fullscreen window's buffer as it is, so it has to stop while an effect is on one. */
  private holdUnredirect(held: boolean): void {
    if (held === this.unredirectHeld) return;
    this.unredirectHeld = held;
    if (held) global.compositor.disable_unredirect();
    else global.compositor.enable_unredirect();
  }

  drop(effect: WindowEffect): void {
    const attachment = this.attachments.get(effect);
    if (attachment) this.detach(effect, attachment);
    this.holdUnredirect(this.unredirectHeld && this.attachments.size > 0);
  }

  destroy(): void {
    for (const signal of this.signals) this.window.disconnect(signal);
    for (const [effect, attachment] of [...this.attachments]) this.detach(effect, attachment);
    this.holdUnredirect(false);
  }
}

/** Follows windows while a window effect exists, and puts on each what asks for it. */
export class WindowTracker {
  readonly effects = new Set<WindowEffect>();
  private readonly tracked = new Map<Meta.Window, TrackedWindow>();
  private disconnectors: (() => void)[] = [];

  constructor(private readonly stage: EffectsStage) {}

  get held(): boolean {
    return this.stage.held;
  }

  add(effect: WindowEffect): void {
    if (!this.effects.size) this.start();
    this.effects.add(effect);
    this.sync();
  }

  remove(effect: WindowEffect): void {
    for (const window of this.tracked.values()) window.drop(effect);
    this.effects.delete(effect);
    if (!this.effects.size) this.stop();
  }

  private start(): void {
    const created = global.display.connect('window-created', (_display, window: Meta.Window) => this.track(window));
    const focused = global.display.connect('notify::focus-window', () => {
      if ([...this.effects].some(effect => effect.followsFocus)) this.sync();
    });
    this.disconnectors = [() => global.display.disconnect(created), () => global.display.disconnect(focused)];
    for (const actor of global.get_window_actors()) this.track(actor.meta_window!);
  }

  private stop(): void {
    for (const disconnect of this.disconnectors.splice(0)) disconnect();
    for (const window of this.tracked.values()) window.destroy();
    this.tracked.clear();
  }

  private track(window: Meta.Window): void {
    if (this.tracked.has(window)) return;
    const tracked = new TrackedWindow(window, this);
    this.tracked.set(window, tracked);
    const gone = () => {
      window.disconnect(unmanaged);
      tracked.destroy();
      this.tracked.delete(window);
    };
    const unmanaged = window.connect('unmanaged', () => {
      const actor = window.get_compositor_private<Meta.WindowActor>();
      tracked.close();
      if (actor) actor.connect('destroy', gone);
      else gone();
    });
    tracked.sync();
  }

  sync(): void {
    for (const window of this.tracked.values()) window.sync();
  }
}
