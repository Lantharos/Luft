import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';
import { blurSurface, raiseSurface } from '../../shared/layout/surface.js';
import { taskbarPreferences } from './preferences/taskbarPreferences.js';
import { animateActor } from '../../shared/motion/motion.js';
import { freezeSelection } from '../../appearance/kestrelGlass.js';
import { ensureActorVisibleInScrollView } from '../../core/runtime/animationUtils.js';
import type { Monitor } from './panel.js';
import { windowIcon } from '../../appearance/icons/appIcons.js';
import { t } from '../../shared/i18n/index.js';
import { isVertical, outward, toward, type Edge } from '../../shared/layout/edge.js';
import { clamp } from '../../shared/math.js';

const POPUP_GAP = 10;
const SCREEN_MARGIN = 12;
const OPEN_KEYS: Record<Edge, number> = { bottom: Clutter.KEY_Up, top: Clutter.KEY_Down, left: Clutter.KEY_Right, right: Clutter.KEY_Left };

export class WindowPreviews {
  readonly actor = new St.BoxLayout({ name: 'kestrel-window-previews', style_class: 'kestrel-window-previews', reactive: true, track_hover: true, visible: false });
  private timer = 0;
  private source: St.Button | null = null;
  private windowSignals: [Meta.Window | Clutter.Actor, number][] = [];
  private clearSelection: (() => void) | null = null;

  constructor(private readonly monitorFor: (actor: Clutter.Actor) => Monitor | null, private readonly enabled: () => boolean, private readonly beforeOpen: () => void, private readonly activateWindow: (window: Meta.Window) => void) {
    blurSurface(this.actor, 20);
    this.actor.connect('notify::hover', () => {
      if (this.actor.hover) this.cancelTimer();
      else this.schedule(() => this.closeUnlessFocused(), 180);
    });
    this.actor.connect('key-press-event', (_actor, event) => {
      if (event.get_key_symbol() !== Clutter.KEY_Escape) return Clutter.EVENT_PROPAGATE;
      const source = this.source;
      this.close();
      source?.grab_key_focus();
      return Clutter.EVENT_STOP;
    });
    this.actor.connect('destroy', () => { this.cleanup(); this.source = null; });
  }

  bind(button: St.Button, app: () => Shell.App, windows: () => Meta.Window[]): void {
    button.connect('notify::hover', () => {
      if (button.hover) this.schedule(() => this.open(button, app(), windows()), 280);
      else this.schedule(() => this.closeUnlessFocused(), 180);
    });
    button.connect('key-press-event', (_actor, event) => {
      if (event.get_key_symbol() !== OPEN_KEYS[taskbarPreferences.edge] || !windows().length) return Clutter.EVENT_PROPAGATE;
      this.open(button, app(), windows(), true);
      return Clutter.EVENT_STOP;
    });
    button.connect('destroy', () => {
      if (this.source === button) this.close();
      this.cancelTimer();
    });
  }

  open(button: St.Button, app: Shell.App, appWindows: Meta.Window[], focus = false): void {
    this.cancelTimer();
    if (!this.enabled()) return;
    const monitor = this.monitorFor(button);
    const windows = appWindows.filter(window => !window.skip_taskbar);
    if (!monitor || !windows.length) return;
    this.beforeOpen();
    this.close(true);
    this.source = button;
    this.actor.destroy_all_children();
    const width = Math.min(204, Math.floor((monitor.width - 40) / Math.min(windows.length, 4)) - 12);
    const columns = Math.max(1, Math.floor((monitor.width - 24) / (width + 12)));
    const grid = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL });
    const scroll = new St.ScrollView({ hscrollbar_policy: St.PolicyType.NEVER, vscrollbar_policy: St.PolicyType.NEVER });
    let firstWindow: St.Button | null = null;
    let row: St.BoxLayout;
    windows.forEach((window, index) => {
      if (index % columns === 0) { row = new St.BoxLayout({ style_class: 'kestrel-preview-row' }); grid.add_child(row); }
      const card = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, width, style_class: 'kestrel-preview-card' });
      const header = new St.BoxLayout({ style_class: 'kestrel-preview-header' });
      const name = () => window.title || app.get_name();
      const title = new St.Label({ text: name(), x_expand: true, y_align: Clutter.ActorAlign.CENTER });
      const icon = windowIcon(app, window, 16);
      icon.y_align = Clutter.ActorAlign.CENTER;
      icon.set_margin_right(6);
      header.add_child(icon);
      header.add_child(title);
      const close = new St.Button({ style_class: 'kestrel-preview-close', can_focus: true, accessible_name: t('previews-close-window', { title: name() }), child: new St.Icon({ icon_name: 'window-close-symbolic', icon_size: 16 }) });
      close.connect('clicked', () => window.delete(global.get_current_time()));
      header.add_child(close);
      card.add_child(header);
      const source = window.get_compositor_private() as Clutter.Actor | null;
      const preview = new St.Widget({ width: width - 4, height: 116, layout_manager: new Clutter.BinLayout() });
      if (source) {
        const clone = new Clutter.Clone({ source, x_align: Clutter.ActorAlign.CENTER, y_align: Clutter.ActorAlign.CENTER });
        const resize = () => {
          clone.visible = source.width > 0 && source.height > 0;
          if (!clone.visible) return;
          const scale = Math.min((width - 4) / source.width, 116 / source.height);
          clone.set_size(Math.round(source.width * scale), Math.round(source.height * scale));
        };
        preview.add_child(clone);
        resize();
        this.windowSignals.push([source, source.connect('notify::width', resize)], [source, source.connect('notify::height', resize)]);
      }
      const activate = new St.Button({ child: preview, can_focus: true, style_class: 'kestrel-preview-window', accessible_name: name() });
      activate.connect('clicked', () => { this.close(); this.activateWindow(window); });
      firstWindow ??= activate;
      for (const control of [activate, close]) control.connect('key-focus-in', () => ensureActorVisibleInScrollView(scroll, control));
      card.add_child(activate);
      row!.add_child(card);
      this.windowSignals.push([window, window.connect('notify::title', () => {
        title.text = name();
        activate.accessible_name = title.text;
        close.accessible_name = t('previews-close-window', { title: title.text });
      })]);
      this.windowSignals.push([window, window.connect('unmanaged', () => this.close())]);
    });
    scroll.child = grid;
    this.actor.add_child(scroll);
    this.actor.show();
    const edge = taskbarPreferences.edge;
    const clearance = taskbarPreferences.clearance;
    const availableHeight = monitor.height - (isVertical(edge) ? 24 : clearance + 36);
    const naturalHeight = grid.get_preferred_height(-1)[1];
    scroll.vscrollbar_policy = naturalHeight > availableHeight ? St.PolicyType.AUTOMATIC : St.PolicyType.NEVER;
    scroll.height = Math.min(naturalHeight, availableHeight);
    const popupWidth = this.actor.get_preferred_width(-1)[1];
    const popupHeight = this.actor.get_preferred_height(popupWidth)[1];
    this.actor.set_position(...this.beside(button, monitor, edge, popupWidth, popupHeight));
    raiseSurface(this.actor);
    this.actor.opacity = 0;
    this.actor.set(toward(edge, 8));
    animateActor(this.actor, { opacity: 255, ...toward(edge, 0), duration: 160, mode: Clutter.AnimationMode.EASE_OUT_QUAD });
    if (focus && firstWindow) (firstWindow as St.Button).grab_key_focus();
  }

  private beside(button: St.Button, monitor: Monitor, edge: Edge, width: number, height: number): [number, number] {
    const [x, y] = button.get_transformed_position();
    const [buttonWidth, buttonHeight] = button.get_transformed_size();
    const reach = taskbarPreferences.clearance + POPUP_GAP;
    const across = (start: number, length: number, size: number) => outward(edge) > 0 ? start + length - reach - size : start + reach;
    const along = (start: number, length: number, center: number, size: number) =>
      Math.round(clamp(center - size / 2, start + SCREEN_MARGIN, start + length - size - SCREEN_MARGIN));
    if (isVertical(edge)) return [across(monitor.x, monitor.width, width), along(monitor.y, monitor.height, y + buttonHeight / 2, height)];
    return [along(monitor.x, monitor.width, x + buttonWidth / 2, width), across(monitor.y, monitor.height, height)];
  }

  contains(actor: Clutter.Actor | null): boolean {
    return actor !== null && (this.actor.contains(actor) || !!this.source?.contains(actor));
  }

  close(immediate = false): void {
    this.cleanup();
    this.source = null;
    if (!this.actor.visible && !immediate) return;
    const finish = () => {
      this.actor.hide();
      this.clearSelection?.();
      this.clearSelection = null;
      this.actor.destroy_all_children();
    };
    if (immediate) { this.actor.remove_all_transitions(); finish(); }
    else if (!this.clearSelection) {
      this.clearSelection = freezeSelection(this.actor);
      animateActor(this.actor, { opacity: 0, ...toward(taskbarPreferences.edge, 6), duration: 100, mode: Clutter.AnimationMode.EASE_IN_QUAD, onComplete: finish });
    }
  }

  private closeUnlessFocused(): void {
    const focus = global.stage.get_key_focus();
    if (!focus || !this.actor.contains(focus)) this.close();
  }

  private cleanup(): void {
    this.cancelTimer();
    for (const [window, signal] of this.windowSignals) window.disconnect(signal);
    this.windowSignals = [];
  }

  private schedule(callback: () => void, delay: number): void {
    this.cancelTimer();
    this.timer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, delay, () => { this.timer = 0; callback(); return GLib.SOURCE_REMOVE; });
  }

  private cancelTimer(): void {
    if (this.timer) GLib.Source.remove(this.timer);
    this.timer = 0;
  }
}
