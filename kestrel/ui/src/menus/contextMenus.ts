import { freezeSelection } from 'resource:///com/lantharos/kestrel/ui/kestrelGlass.js';
import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import type Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';
import type { Monitor } from '../panel/panel.js';
import { blurSurface } from '../shared/surface.js';
import { animateActor } from '../shared/motion.js';
import { menuContent, type MenuEntry, type MenuGroup } from './menuContent.js';
import { openSettings, type SettingsPageId } from '../settings/pages.js';
import { taskbarPreferences } from '../panel/preferences/taskbarPreferences.js';

export type { MenuEntry } from './menuContent.js';

const MIN_WIDTH = 176;
const MAX_WIDTH = 420;
const TRAILING_SPACE = 84;
const SLIDE_DISTANCE = 40;
const RESIZE = { duration: 160, mode: Clutter.AnimationMode.EASE_OUT_CUBIC };
const SLIDE_OUT = { duration: 120, mode: Clutter.AnimationMode.EASE_IN_QUAD };
const SLIDE_IN = { duration: 200, mode: Clutter.AnimationMode.EASE_OUT_CUBIC };

export class ContextMenus {
  readonly shield = new St.Widget({ reactive: true, visible: false });
  readonly actor = new St.BoxLayout({ name: 'kestrel-context-menu', style_class: 'kestrel-context-menu', orientation: Clutter.Orientation.VERTICAL, reactive: true, visible: false });
  private readonly viewport = new St.Widget({ layout_manager: new Clutter.BinLayout(), clip_to_allocation: true, x_expand: true, y_expand: true });
  private readonly favorites = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });
  private source: Clutter.Actor | null = null;
  private sourceDestroy = 0;
  private previousFocus: Clutter.Actor | null = null;
  private clearSelection: (() => void) | null = null;
  private anchor: { x: number; y: number; monitor: Monitor } | null = null;

  constructor(private readonly monitor: (x: number, y: number) => Monitor | null, private readonly dismissShell: () => void, private readonly enabled: () => boolean, private readonly beforeOpen: () => void, private readonly activateWindow: (window: Meta.Window) => void) {
    blurSurface(this.actor, 18);
    this.actor.add_child(this.viewport);
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

  appEntries(app: Shell.App, windows = app.get_windows()): MenuEntry[] {
    const launch = (action: () => void) => () => { this.dismissShell(); action(); };
    const entries: MenuEntry[] = [{ label: 'Open', run: launch(() => app.activate()) }];
    const info = app.get_app_info();
    if (app.can_open_new_window() && !info?.list_actions().includes('new-window'))
      entries.push({ label: 'New window', run: launch(() => app.open_new_window(-1)) });
    for (const action of info?.list_actions() ?? [])
      entries.push({ label: info!.get_action_name(action), run: launch(() => app.launch_action(action, (global as unknown as Shell.Global).get_current_time(), -1)) });
    for (const window of windows) entries.push({ label: window.get_title() || app.get_name(), run: launch(() => this.activateWindow(window)) });
    if (windows.length === 1) {
      const window = windows[0];
      if (window.can_minimize()) entries.push({ label: window.minimized ? 'Restore' : 'Minimize', run: () => {
        if (window.minimized) window.unminimize(); else window.minimize();
      } });
      if (window.can_maximize()) entries.push({ label: window.is_maximized() ? 'Unmaximize' : 'Maximize', run: () => {
        if (window.is_maximized()) window.unmaximize(); else window.maximize();
      } });
    }
    if (taskbarPreferences.showPinned && !app.is_window_backed()) {
      const pinned = this.favorites.get_strv('favorite-apps').includes(app.id);
      entries.push({ label: pinned ? 'Unpin from taskbar' : 'Pin to taskbar', run: () => {
        const ids = this.favorites.get_strv('favorite-apps');
        this.favorites.set_strv('favorite-apps', pinned ? ids.filter(id => id !== app.id) : [...ids, app.id]);
      } });
    }
    if (windows.length) entries.push({ label: windows.length === 1 ? 'Close window' : 'Close all windows', run: () => {
      if (windows.length === app.get_windows().length) app.request_quit();
      else for (const window of windows) window.delete((global as unknown as Shell.Global).get_current_time());
    } });
    return entries;
  }

  settings(page: SettingsPageId | null = null): void {
    this.dismissShell();
    openSettings(page);
  }

  open(source: Clutter.Actor, entries: MenuEntry[], x: number, y: number): void {
    if (!this.enabled() || !entries.length) return;
    this.beforeOpen();
    this.close();
    const monitor = this.monitor(x, y);
    if (!monitor) return;
    this.source = source;
    this.sourceDestroy = source.connect('destroy', () => { this.source = null; this.sourceDestroy = 0; this.close(); });
    this.clearSelection?.();
    this.clearSelection = null;
    this.anchor = { x, y, monitor };
    this.previousFocus = (global as unknown as Shell.Global).stage.get_key_focus();
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

  private async openGroup(group: MenuGroup, parents: MenuEntry[][]): Promise<void> {
    const source = this.source;
    const children = Array.isArray(group.children) ? group.children : await group.children();
    if (this.source === source && this.actor.visible) this.present(children, parents, 1);
  }

  private present(entries: MenuEntry[], parents: MenuEntry[][], direction = 0): void {
    const { x, y, monitor } = this.anchor!;
    const content = menuContent(entries, {
      activate: action => { this.close(); action.run(); },
      open: group => void this.openGroup(group, [...parents, entries]),
      back: parents.length ? () => this.present(parents.at(-1)!, parents.slice(0, -1), -1) : null,
      hover: button => {
        if (!this.source || this.clearSelection) return;
        if (button.hover) button.grab_key_focus();
        else if ((global as unknown as Shell.Global).stage.get_key_focus() === button) this.actor.grab_key_focus();
      },
    });
    const page = new St.ScrollView({
      hscrollbar_policy: St.PolicyType.NEVER, vscrollbar_policy: St.PolicyType.AUTOMATIC, child: content,
      x_align: Clutter.ActorAlign.START, y_align: Clutter.ActorAlign.START,
    });
    const previous = this.viewport.get_children();
    this.viewport.add_child(page);
    this.actor.show();
    const theme = this.actor.get_theme_node();
    const width = Math.min(monitor.width - 16, Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, content.get_preferred_width(-1)[1] + TRAILING_SPACE)));
    const innerWidth = width - theme.get_horizontal_padding();
    page.set_size(innerWidth, Math.min(content.get_preferred_height(innerWidth)[1], monitor.height - 40));
    const height = page.height + theme.get_vertical_padding();
    const position = {
      x: Math.round(Math.max(monitor.x + 8, Math.min(x, monitor.x + monitor.width - width - 8))),
      y: Math.round(Math.max(monitor.y + 8, Math.min(y - height, monitor.y + monitor.height - height - 8))),
    };
    if (direction) {
      const growing = height >= this.actor.height;
      const slideDelay = growing ? RESIZE.duration : 0;
      for (const old of previous.filter(page => page.reactive)) {
        old.reactive = false;
        animateActor(old, { translation_x: -direction * SLIDE_DISTANCE, opacity: 0, ...SLIDE_OUT, delay: slideDelay, onStopped: () => old.destroy() });
      }
      page.translation_x = direction * SLIDE_DISTANCE;
      page.opacity = 0;
      animateActor(page, { translation_x: 0, opacity: 255, ...SLIDE_IN, delay: slideDelay + SLIDE_OUT.duration / 2 });
      animateActor(this.actor, { ...position, width, height, ...RESIZE, delay: growing ? 0 : SLIDE_OUT.duration + SLIDE_IN.duration / 2 });
      this.actor.grab_key_focus();
      return;
    }
    for (const old of previous) old.destroy();
    for (const property of ['x', 'y', 'width', 'height']) this.actor.remove_transition(property);
    this.actor.set_size(width, height);
    this.actor.set_position(position.x, position.y);
  }

  close(immediate = false): void {
    if (this.actor.visible && !this.clearSelection) this.clearSelection = freezeSelection(this.actor);
    if (this.source && this.sourceDestroy) this.source.disconnect(this.sourceDestroy);
    this.source = null;
    this.sourceDestroy = 0;
    if (immediate) { this.actor.remove_all_transitions(); this.actor.hide(); }
    else if (this.actor.visible) animateActor(this.actor, {
      opacity: 0, translation_y: 6, duration: 100, mode: Clutter.AnimationMode.EASE_IN_QUAD,
      onComplete: () => { if (!this.source) this.actor.hide(); },
    });
    this.shield.hide();
    const previous = this.previousFocus;
    this.previousFocus = null;
    if (previous?.mapped) previous.grab_key_focus();
    else {
      const stage = (global as unknown as Shell.Global).stage;
      const focus = stage.get_key_focus();
      if (focus && this.actor.contains(focus)) stage.set_key_focus(null);
    }
  }
}
