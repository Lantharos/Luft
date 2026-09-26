import { freezeSelection } from 'resource:///org/gnome/shell/ui/kestrelGlass.js';
import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import Shell from 'gi://Shell';
import St from 'gi://St';
import type { Monitor } from './panel.js';
import { blurSurface } from './surface.js';
import { animateActor } from './motion.js';
import { menuContent, type MenuEntry } from './menuContent.js';

export type { MenuEntry } from './menuContent.js';

export class ContextMenus {
  readonly shield = new St.Widget({ reactive: true, visible: false });
  readonly actor = new St.BoxLayout({ name: 'kestrel-context-menu', style_class: 'kestrel-context-menu', orientation: Clutter.Orientation.VERTICAL, reactive: true, visible: false });
  private readonly favorites = new Gio.Settings({ schema_id: 'org.gnome.shell' });
  private source: Clutter.Actor | null = null;
  private sourceDestroy = 0;
  private clearSelection: (() => void) | null = null;
  private anchor: { x: number; y: number; monitor: Monitor } | null = null;

  constructor(private readonly monitor: (x: number, y: number) => Monitor | null, private readonly dismissShell: () => void, private readonly enabled: () => boolean, private readonly beforeOpen: () => void) {
    blurSurface(this.actor, 14);
    this.actor.connect('destroy', () => {
      if (this.source && this.sourceDestroy) this.source.disconnect(this.sourceDestroy);
      this.source = null;
      this.sourceDestroy = 0;
    });
    this.shield.connect('button-press-event', () => { this.close(); return Clutter.EVENT_STOP; });
    this.actor.connect('key-press-event', (_actor, event) => {
      const key = event.get_key_symbol();
      if (key === Clutter.KEY_Escape) { this.close(); return Clutter.EVENT_STOP; }
      if ([Clutter.KEY_Down, Clutter.KEY_Up, Clutter.KEY_Tab].includes(key)) {
        this.actor.navigate_focus((global as unknown as Shell.Global).stage.get_key_focus(), key === Clutter.KEY_Up ? St.DirectionType.TAB_BACKWARD : St.DirectionType.TAB_FORWARD, true);
        return Clutter.EVENT_STOP;
      }
      return Clutter.EVENT_PROPAGATE;
    });
  }

  bind(actor: Clutter.Actor, entries: () => MenuEntry[]): void {
    actor.connect('button-press-event', (_actor, event) => {
      if (event.get_button() !== Clutter.BUTTON_SECONDARY) return Clutter.EVENT_PROPAGATE;
      const [x, y] = event.get_coords();
      this.open(actor, entries(), x, y);
      return Clutter.EVENT_STOP;
    });
    actor.connect('key-press-event', (_actor, event) => {
      if (event.get_key_symbol() !== Clutter.KEY_Menu &&
          !(event.get_key_symbol() === Clutter.KEY_F10 && (event.get_state() & Clutter.ModifierType.SHIFT_MASK)))
        return Clutter.EVENT_PROPAGATE;
      const [x, y] = actor.get_transformed_position();
      this.open(actor, entries(), x, y);
      return Clutter.EVENT_STOP;
    });
  }

  appEntries(app: Shell.App): MenuEntry[] {
    const launch = (action: () => void) => () => { this.dismissShell(); action(); };
    const entries: MenuEntry[] = [{ label: 'Open', run: launch(() => app.activate()) }];
    const info = app.get_app_info();
    if (app.can_open_new_window() && !info?.list_actions().includes('new-window'))
      entries.push({ label: 'New window', run: launch(() => app.open_new_window(-1)) });
    for (const action of info?.list_actions() ?? [])
      entries.push({ label: info!.get_action_name(action), run: launch(() => app.launch_action(action, (global as unknown as Shell.Global).get_current_time(), -1)) });
    const windows = app.get_windows();
    for (const window of windows) entries.push({ label: window.get_title() || app.get_name(), run: launch(() => window.activate((global as unknown as Shell.Global).get_current_time())) });
    if (windows.length === 1) {
      const window = windows[0];
      if (window.can_minimize()) entries.push({ label: window.minimized ? 'Restore' : 'Minimize', run: () => {
        if (window.minimized) window.unminimize(); else window.minimize();
      } });
      if (window.can_maximize()) entries.push({ label: window.is_maximized() ? 'Unmaximize' : 'Maximize', run: () => {
        if (window.is_maximized()) window.unmaximize(); else window.maximize();
      } });
    }
    if (!app.is_window_backed()) {
      const pinned = this.favorites.get_strv('favorite-apps').includes(app.id);
      entries.push({ label: pinned ? 'Unpin from panel' : 'Pin to panel', run: () => {
        const ids = this.favorites.get_strv('favorite-apps');
        this.favorites.set_strv('favorite-apps', pinned ? ids.filter(id => id !== app.id) : [...ids, app.id]);
      } });
    }
    if (windows.length) entries.push({ label: windows.length === 1 ? 'Close window' : 'Close all windows', run: () => app.request_quit() });
    return entries;
  }

  settings(panel = ''): void {
    this.dismissShell();
    const id = panel ? `gnome-${panel}-panel.desktop` : 'org.gnome.Settings.desktop';
    Shell.AppSystem.get_default().lookup_app(id)?.activate();
  }

  open(source: Clutter.Actor, entries: MenuEntry[], x: number, y: number): void {
    if (!this.enabled()) return;
    this.beforeOpen();
    this.close();
    if (!entries.length) return;
    const monitor = this.monitor(x, y);
    if (!monitor) return;
    this.source = source;
    this.sourceDestroy = source.connect('destroy', () => { this.source = null; this.sourceDestroy = 0; this.close(); });
    this.clearSelection?.();
    this.clearSelection = null;
    this.anchor = { x, y, monitor };
    const stage = (global as unknown as Shell.Global).stage;
    this.shield.set_position(0, 0);
    this.shield.set_size(stage.width, stage.height);
    this.shield.get_parent()!.set_child_above_sibling(this.shield, null);
    this.actor.get_parent()!.set_child_above_sibling(this.actor, null);
    this.present(entries, []);
    this.shield.show();
    this.actor.opacity = 0;
    this.actor.translation_y = 6;
    animateActor(this.actor, { opacity: 255, translation_y: 0, duration: 130, mode: Clutter.AnimationMode.EASE_OUT_QUAD });
    this.actor.grab_key_focus();
  }

  private present(entries: MenuEntry[], parents: MenuEntry[][]): void {
    const { x, y, monitor } = this.anchor!;
    this.actor.destroy_all_children();
    const content = menuContent(entries, {
      activate: action => { this.close(); action.run(); },
      open: group => this.present(group.children, [...parents, entries]),
      back: parents.length ? () => this.present(parents.at(-1)!, parents.slice(0, -1)) : null,
      hover: button => {
        if (!this.source || this.clearSelection) return;
        if (button.hover) button.grab_key_focus();
        else if ((global as unknown as Shell.Global).stage.get_key_focus() === button) this.actor.grab_key_focus();
      },
    });
    const scroll = new St.ScrollView({ hscrollbar_policy: St.PolicyType.NEVER, vscrollbar_policy: St.PolicyType.AUTOMATIC });
    scroll.child = content;
    this.actor.add_child(scroll);
    this.actor.show();
    this.actor.width = Math.min(monitor.width - 16, Math.max(144, Math.min(420, content.get_preferred_width(-1)[1] + 56)));
    scroll.height = Math.min(content.get_preferred_height(this.actor.width - 12)[1], monitor.height - 40);
    const height = this.actor.get_preferred_height(this.actor.width)[1];
    this.actor.set_position(Math.round(Math.max(monitor.x + 8, Math.min(x, monitor.x + monitor.width - this.actor.width - 8))),
      Math.round(Math.max(monitor.y + 8, Math.min(y - height, monitor.y + monitor.height - height - 8))));
    if (parents.length) this.actor.navigate_focus(null, St.DirectionType.TAB_FORWARD, false);
  }

  close(immediate = false): void {
    if (this.actor.visible && !this.clearSelection) this.clearSelection = freezeSelection(this.actor);
    if (this.source && this.sourceDestroy) this.source.disconnect(this.sourceDestroy);
    const source = this.source;
    this.source = null;
    this.sourceDestroy = 0;
    if (immediate) { this.actor.remove_all_transitions(); this.actor.hide(); }
    else if (this.actor.visible) animateActor(this.actor, {
      opacity: 0, translation_y: 6, duration: 100, mode: Clutter.AnimationMode.EASE_IN_QUAD,
      onComplete: () => { if (!this.source) this.actor.hide(); },
    });
    this.shield.hide();
    if (source?.mapped) source.grab_key_focus();
  }
}
