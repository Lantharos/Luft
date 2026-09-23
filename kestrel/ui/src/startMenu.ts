import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import St from 'gi://St';

export class StartMenu {
  readonly actor: St.BoxLayout;
  readonly search: St.Entry;

  private readonly appSystem = Shell.AppSystem.get_default();
  private readonly grid = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-app-grid' });

  constructor(private readonly close: () => void, private readonly power: () => void) {
    this.actor = new St.BoxLayout({
      orientation: Clutter.Orientation.VERTICAL,
      style_class: 'kestrel-popover',
      reactive: true,
      visible: false,
    });
    this.actor.add_effect_with_name('backdrop', new Shell.BlurEffect({
      mode: Shell.BlurMode.BACKGROUND,
      radius: 36,
      brightness: 0.75,
    }));

    this.search = new St.Entry({
      style_class: 'kestrel-search',
      hint_text: 'Search apps',
      can_focus: true,
      x_expand: true,
    });
    this.search.get_clutter_text().connect('text-changed', () => this.refreshApps());
    this.actor.add_child(this.search);

    const title = new St.Label({ text: 'Apps', style_class: 'kestrel-title' });
    this.actor.add_child(title);

    const scroller = new St.ScrollView({
      style_class: 'kestrel-app-scroll',
      hscrollbar_policy: St.PolicyType.NEVER,
      vscrollbar_policy: St.PolicyType.AUTOMATIC,
    });
    scroller.set_size(570, 370);
    scroller.child = this.grid;
    this.actor.add_child(scroller);

    const footer = new St.BoxLayout({ style_class: 'kestrel-footer' });
    const account = new St.Button({
      style_class: 'kestrel-action',
      child: new St.Label({ text: GLib.get_real_name() || GLib.get_user_name() }),
      x_expand: true,
      can_focus: true,
    });
    account.connect('clicked', this.close);
    footer.add_child(account);

    const powerButton = new St.Button({
      style_class: 'kestrel-action',
      child: new St.Icon({ icon_name: 'system-shutdown-symbolic', icon_size: 19 }),
      can_focus: true,
    });
    powerButton.connect('clicked', this.power);
    footer.add_child(powerButton);
    this.actor.add_child(footer);

    this.appSystem.connect('installed-changed', () => this.refreshApps());
    this.refreshApps();
  }

  focus(): void {
    this.search.grab_key_focus();
  }

  clearSearch(): void {
    this.search.set_text('');
  }

  private refreshApps(): void {
    this.grid.destroy_all_children();

    const query = this.search.get_text().trim().toLocaleLowerCase();
    const apps = this.appSystem.get_installed()
      .filter(app => app.should_show())
      .filter(app => !query || app.get_display_name().toLocaleLowerCase().includes(query))
      .sort((a, b) => a.get_display_name().localeCompare(b.get_display_name()));

    for (let index = 0; index < apps.length; index += 5) {
      const row = new St.BoxLayout({ style_class: 'kestrel-app-row' });
      for (const app of apps.slice(index, index + 5))
        row.add_child(this.appButton(app));
      this.grid.add_child(row);
    }
  }

  private appButton(app: Gio.AppInfo): St.Button {
    const content = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, x_align: Clutter.ActorAlign.CENTER });
    content.add_child(new St.Icon({ gicon: app.get_icon(), icon_size: 37 }));
    content.add_child(new St.Label({
      text: app.get_display_name(),
      style_class: 'kestrel-app-label',
      x_align: Clutter.ActorAlign.CENTER,
    }));

    const button = new St.Button({
      style_class: 'kestrel-app-button',
      child: content,
      can_focus: true,
      reactive: true,
      track_hover: true,
    });
    button.connect('clicked', () => {
      const shellApp = this.appSystem.lookup_app(app.get_id() ?? '');
      if (shellApp)
        shellApp.activate();
      else
        app.launch([], null);
      this.clearSearch();
      this.close();
    });
    return button;
  }
}
