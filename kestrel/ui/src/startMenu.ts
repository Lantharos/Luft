import Clutter from 'gi://Clutter';
import AccountsService from 'gi://AccountsService';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import St from 'gi://St';

import { blurSurface } from './surface.js';
import { liftIcon } from './motion.js';
import { Avatar } from 'resource:///org/gnome/shell/ui/userWidget.js';

export class StartMenu {
  readonly actor: St.BoxLayout;
  readonly search: St.Entry;
  readonly powerButton: St.Button;
  private readonly appSystem = Shell.AppSystem.get_default();
  private readonly grid = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-app-grid' });
  private readonly title = new St.Label({ text: 'All apps', style_class: 'kestrel-section-title' });
  private apps: Gio.AppInfo[] = [];
  private matches: Gio.AppInfo[] = [];

  constructor(private readonly close: () => void, power: () => void) {
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
    this.search.get_clutter_text().connect('text-changed', () => {
      this.refreshApps();
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
    scroller.child = this.grid;
    this.actor.add_child(scroller);

    const footer = new St.BoxLayout({ style_class: 'kestrel-footer' });
    const account = new St.BoxLayout({ style_class: 'kestrel-account', x_expand: true });
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

    this.appSystem.connect('installed-changed', () => this.loadApps());
    this.loadApps();
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
    this.matches = this.apps.filter(app => !query || app.get_display_name().toLocaleLowerCase().includes(query));
    this.title.text = query ? 'Search results' : 'All apps';
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
    liftIcon(button, content.get_first_child()!);
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
