import Clutter from 'gi://Clutter';
import AccountsService from 'gi://AccountsService';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import St from 'gi://St';

import { blurSurface } from './surface.js';
import type { ContextMenus } from './contextMenus.js';
import { blinkCaret } from './caret.js';
import { liftIcon } from './motion.js';
import { Avatar } from 'resource:///org/gnome/shell/ui/userWidget.js';

export class StartMenu {
  readonly actor: St.BoxLayout;
  readonly search: St.Entry;
  readonly powerButton: St.Button;
  private readonly favorites = new Gio.Settings({ schema_id: 'org.gnome.shell' });
  private readonly appSystem = Shell.AppSystem.get_default();
  private readonly grid = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-app-grid' });
  private readonly title = new St.Label({ text: 'Apps', style_class: 'kestrel-section-title' });
  private scroller: St.ScrollView;
  private apps: Gio.AppInfo[] = [];
  private matches: Gio.AppInfo[] = [];

  constructor(private readonly close: () => void, power: () => void, private readonly menus: ContextMenus) {
    this.actor = new St.BoxLayout({
      name: 'kestrel-start',
      orientation: Clutter.Orientation.VERTICAL,
      style_class: 'kestrel-popover kestrel-start',
      reactive: true, visible: false,
    });
    blurSurface(this.actor);
    this.search = new St.Entry({
      style_class: 'kestrel-search', hint_text: 'Search apps',
      can_focus: true, x_expand: true,
      primary_icon: new St.Icon({ icon_name: 'edit-find-symbolic', icon_size: 16 }),
    });
    blinkCaret(this.search);
    menus.bind(this.search, () => {
      const text = this.search.clutter_text;
      const clipboard = St.Clipboard.get_default();
      const copy = () => clipboard.set_text(St.ClipboardType.CLIPBOARD, text.get_selection());
      return [
        { label: 'Cut', enabled: text.get_selection().length > 0, run: () => { copy(); text.delete_selection(); } },
        { label: 'Copy', enabled: text.get_selection().length > 0, run: copy },
        { label: 'Paste', run: () => clipboard.get_text(St.ClipboardType.CLIPBOARD, (_clipboard, value) => {
          if (value) { text.delete_selection(); text.insert_text(value, text.cursor_position); }
        }) },
        { label: 'Select all', run: () => text.set_selection(0, -1) },
      ];
    });
    this.search.get_clutter_text().connect('text-changed', () => {
      this.refreshApps();
    });
    this.search.clutter_text.connect('key-press-event', (_text, event) => {
      if (event.get_key_symbol() !== Clutter.KEY_Down) return Clutter.EVENT_PROPAGATE;
      return this.grid.navigate_focus(null, St.DirectionType.TAB_FORWARD, false) ? Clutter.EVENT_STOP : Clutter.EVENT_PROPAGATE;
    });
    this.search.get_clutter_text().connect('activate', () => {
      if (this.matches[0]) this.launch(this.matches[0]);
    });
    this.actor.add_child(this.search);
    this.actor.add_child(this.title);
    const scroller = new St.ScrollView({
      style_class: 'kestrel-app-scroll',
      hscrollbar_policy: St.PolicyType.NEVER,
      vscrollbar_policy: St.PolicyType.AUTOMATIC,
      height: 0,
      x_expand: true, y_expand: true,
    });
    this.scroller = scroller;
    scroller.child = this.grid;
    this.actor.add_child(scroller);

    const footer = new St.BoxLayout({ style_class: 'kestrel-footer' });
    const account = new St.BoxLayout({ style_class: 'kestrel-account', reactive: true, x_expand: true });
    const user = AccountsService.UserManager.get_default().get_user(GLib.get_user_name());
    const avatar = new Avatar(user, { styleClass: 'kestrel-avatar', iconSize: 32 });
    avatar.y_align = Clutter.ActorAlign.CENTER;
    const signals = [
      user.connect('notify::is-loaded', () => avatar.update()),
      user.connect('changed', () => avatar.update()),
    ];
    avatar.connect('destroy', () => signals.forEach(signal => user.disconnect(signal)));
    avatar.update();
    account.add_child(avatar);
    account.add_child(new St.Label({
      text: GLib.get_real_name() || GLib.get_user_name(), y_align: Clutter.ActorAlign.CENTER,
    }));
    footer.add_child(account);
    this.powerButton = new St.Button({
      style_class: 'kestrel-icon-button',
      child: new St.Icon({ icon_name: 'system-shutdown-symbolic', icon_size: 18 }),
      accessible_name: 'Power and session', can_focus: true,
    });
    this.powerButton.connect('clicked', power);
    footer.add_child(this.powerButton);
    this.actor.add_child(footer);

    const installedChanged = this.appSystem.connect('installed-changed', () => this.loadApps());
    const favoritesChanged = this.favorites.connect('changed::favorite-apps', () => this.refreshApps());
    this.actor.connect('destroy', () => {
      this.appSystem.disconnect(installedChanged);
      this.favorites.disconnect(favoritesChanged);
    });
    this.loadApps();
    menus.bind(this.actor, () => [
      { label: 'Refresh apps', run: () => this.loadApps() },
      { label: 'Settings', run: () => menus.settings() },
    ]);
    menus.bind(account, () => [{ label: 'Account settings', run: () => menus.settings('system') }]);
    menus.bind(this.powerButton, () => [{ label: 'Power and session', run: power }]);
  }

  focus(): void {
    this.search.grab_key_focus();
  }
  clearSearch(): void { this.search.set_text(''); }

  private loadApps(): void {
    this.apps = this.appSystem.get_installed().filter(app => app.should_show())
      .sort((a, b) => a.get_display_name().localeCompare(b.get_display_name()));
    this.refreshApps();
  }

  private refreshApps(): void {
    this.grid.destroy_all_children();
    const query = this.search.get_text().trim().toLocaleLowerCase();
    const pinned = new Set(this.favorites.get_strv('favorite-apps'));
    this.matches = this.apps.filter(app => query
      ? app.get_display_name().toLocaleLowerCase().includes(query)
      : !pinned.has(app.get_id() ?? ''));
    this.title.text = query ? 'Search results' : 'Apps';
    if (!this.matches.length) {
      this.grid.add_child(new St.Label({ text: 'No apps found', style_class: 'kestrel-empty' }));
      return;
    }
    for (let index = 0; index < this.matches.length; index += 6) {
      const row = new St.BoxLayout({ style_class: 'kestrel-app-row' });
      for (let column = 0; column < 6; column++) {
        const app = this.matches[index + column];
        row.add_child(app ? this.appButton(app) : new St.Widget({ width: 92, x_expand: true }));
      }
      this.grid.add_child(row);
    }
  }

  private appButton(app: Gio.AppInfo): St.Button {
    const content = new St.BoxLayout({
      orientation: Clutter.Orientation.VERTICAL,
      style_class: 'kestrel-app-content', x_align: Clutter.ActorAlign.CENTER,
    });
    content.add_child(new St.Icon({ gicon: app.get_icon(), icon_size: 36, x_align: Clutter.ActorAlign.CENTER }));
    content.add_child(new St.Label({
      text: app.get_display_name(), style_class: 'kestrel-app-label',
      x_align: Clutter.ActorAlign.CENTER,
    }));
    const button = new St.Button({
      style_class: 'kestrel-app-button', child: content,
      width: 92, x_expand: true,
      can_focus: true, track_hover: true, accessible_name: app.get_display_name(),
    });
    button.connect('key-focus-in', () => {
      const adjustment = this.scroller.vadjustment;
      const [, y] = button.get_transformed_position();
      const [, top] = this.scroller.get_transformed_position();
      if (y < top) adjustment.value += y - top;
      else if (y + button.height > top + this.scroller.height)
        adjustment.value += y + button.height - top - this.scroller.height;
    });
    liftIcon(button, content.get_first_child()!);
    this.menus.bind(button, () => {
      const shellApp = this.appSystem.lookup_app(app.get_id() ?? '');
      return shellApp ? this.menus.appEntries(shellApp) : [{ label: 'Open', run: () => this.launch(app) }];
    });
    button.connect('clicked', () => this.launch(app));
    return button;
  }

  private launch(app: Gio.AppInfo): void {
    const shellApp = this.appSystem.lookup_app(app.get_id() ?? '');
    if (shellApp) shellApp.activate();
    else app.launch([], null);
    this.close();
  }
}
