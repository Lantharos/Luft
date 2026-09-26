import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';
import { blurSurface, PANEL_HEIGHT } from './surface.js';
import { animateActor } from './motion.js';
import { freezeSelection } from 'resource:///org/gnome/shell/ui/kestrelGlass.js';
import { ensureActorVisibleInScrollView } from 'resource:///org/gnome/shell/misc/animationUtils.js';
import type { Monitor } from './panel.js';

interface WindowIconApp extends Shell.App {
  create_window_icon_texture(window: Meta.Window, size: number): Clutter.Actor;
}

export class WindowPreviews {
  readonly actor = new St.BoxLayout({ name: 'kestrel-window-previews', style_class: 'kestrel-window-previews', reactive: true, track_hover: true, visible: false });
  private timer = 0;
  private source: St.Button | null = null;
  private windowSignals: [Meta.Window | Clutter.Actor, number][] = [];
  private clearSelection: (() => void) | null = null;

  constructor(private readonly monitorFor: (actor: Clutter.Actor) => Monitor | null, private readonly enabled: () => boolean, private readonly beforeOpen: () => void, private readonly activateWindow: (window: Meta.Window) => void) {
    blurSurface(this.actor, 16);
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

  bind(button: St.Button, app: () => Shell.App): void {
    button.connect('notify::hover', () => {
      if (button.hover) this.schedule(() => this.open(button, app()), 280);
      else this.schedule(() => this.closeUnlessFocused(), 180);
    });
    button.connect('key-press-event', (_actor, event) => {
      if (event.get_key_symbol() !== Clutter.KEY_Up || !app().get_windows().length) return Clutter.EVENT_PROPAGATE;
      this.open(button, app(), true);
      return Clutter.EVENT_STOP;
    });
    button.connect('destroy', () => {
      if (this.source === button) this.close();
      this.cancelTimer();
    });
  }

  open(button: St.Button, app: Shell.App, focus = false): void {
    this.cancelTimer();
    if (!this.enabled()) return;
    const monitor = this.monitorFor(button);
    const windows = app.get_windows().filter(window => !window.skip_taskbar);
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
      const title = new St.Label({ text: window.title || app.get_name(), x_expand: true, y_align: Clutter.ActorAlign.CENTER });
      const icon = (app as WindowIconApp).create_window_icon_texture(window, 16);
      icon.y_align = Clutter.ActorAlign.CENTER;
      icon.set_margin_right(6);
      header.add_child(icon);
      header.add_child(title);
      const close = new St.Button({ style_class: 'kestrel-preview-close', can_focus: true, accessible_name: `Close ${window.title}`, child: new St.Icon({ icon_name: 'window-close-symbolic', icon_size: 16 }) });
      close.connect('clicked', () => window.delete((global as unknown as Shell.Global).get_current_time()));
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
      const activate = new St.Button({ child: preview, can_focus: true, style_class: 'kestrel-preview-window', accessible_name: window.title || app.get_name() });
      activate.connect('clicked', () => { this.close(); this.activateWindow(window); });
      firstWindow ??= activate;
      for (const control of [activate, close]) control.connect('key-focus-in', () => ensureActorVisibleInScrollView(scroll, control));
      card.add_child(activate);
      row!.add_child(card);
      this.windowSignals.push([window, window.connect('notify::title', () => { title.text = window.title || app.get_name(); activate.accessible_name = title.text; close.accessible_name = `Close ${title.text}`; })]);
      this.windowSignals.push([window, window.connect('unmanaged', () => this.close())]);
    });
    scroll.child = grid;
    this.actor.add_child(scroll);
    this.actor.show();
    const availableHeight = monitor.height - PANEL_HEIGHT - 36;
    const naturalHeight = grid.get_preferred_height(-1)[1];
    scroll.vscrollbar_policy = naturalHeight > availableHeight ? St.PolicyType.AUTOMATIC : St.PolicyType.NEVER;
    scroll.height = Math.min(naturalHeight, availableHeight);
    const popupWidth = this.actor.get_preferred_width(-1)[1];
    const popupHeight = this.actor.get_preferred_height(popupWidth)[1];
    const [x] = button.get_transformed_position();
    this.actor.set_position(Math.round(Math.max(monitor.x + 12, Math.min(x + button.width / 2 - popupWidth / 2, monitor.x + monitor.width - popupWidth - 12))), monitor.y + monitor.height - PANEL_HEIGHT - popupHeight - 10);
    this.actor.get_parent()!.set_child_above_sibling(this.actor, null);
    this.actor.opacity = 0;
    this.actor.translation_y = 8;
    animateActor(this.actor, { opacity: 255, translation_y: 0, duration: 160, mode: Clutter.AnimationMode.EASE_OUT_QUAD });
    if (focus && firstWindow) (firstWindow as St.Button).grab_key_focus();
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
      animateActor(this.actor, { opacity: 0, translation_y: 6, duration: 100, mode: Clutter.AnimationMode.EASE_IN_QUAD, onComplete: finish });
    }
  }

  private closeUnlessFocused(): void {
    const focus = (global as unknown as Shell.Global).stage.get_key_focus();
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
