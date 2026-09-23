import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import St from 'gi://St';

export interface Monitor {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PanelActions {
  start(): void;
  quickSettings(): void;
  notifications(): void;
}

export class KestrelPanel {
  readonly actor: St.Widget;

  private readonly appSystem = Shell.AppSystem.get_default();
  private readonly favorites = new Gio.Settings({ schema_id: 'org.gnome.shell' });
  private readonly appButtons = new St.BoxLayout({ style_class: 'kestrel-panel-center' });
  private readonly clock = new St.Label({ style_class: 'kestrel-panel-clock' });
  private readonly center: St.BoxLayout;
  private readonly right: St.BoxLayout;

  constructor(actions: PanelActions) {
    this.actor = new St.Widget({
      style_class: 'kestrel-panel',
      reactive: true,
      layout_manager: new Clutter.FixedLayout(),
    });

    this.actor.add_effect_with_name('backdrop', new Shell.BlurEffect({
      mode: Shell.BlurMode.BACKGROUND,
      radius: 26,
      brightness: 0.78,
    }));

    this.center = new St.BoxLayout({
      style_class: 'kestrel-panel-center',
    });
    this.center.add_child(this.iconButton('view-app-grid-symbolic', actions.start));
    this.center.add_child(this.appButtons);
    this.actor.add_child(this.center);

    this.right = new St.BoxLayout({
      style_class: 'kestrel-panel-right',
    });
    this.right.add_child(this.iconButton('dialog-information-symbolic', actions.notifications));
    this.right.add_child(this.iconButton('network-wireless-symbolic', actions.quickSettings));
    this.right.add_child(this.clock);
    this.actor.add_child(this.right);

    this.appSystem.connect('app-state-changed', () => this.refreshApps());
    this.appSystem.connect('installed-changed', () => this.refreshApps());
    this.favorites.connect('changed::favorite-apps', () => this.refreshApps());

    GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 30, () => {
      this.refreshClock();
      return GLib.SOURCE_CONTINUE;
    });

    this.refreshApps();
    this.refreshClock();
  }

  place(monitor: Monitor): void {
    this.actor.set_position(monitor.x, monitor.y + monitor.height - 64);
    this.actor.set_size(monitor.width, 64);
    this.positionGroups();
  }

  private refreshClock(): void {
    this.clock.text = GLib.DateTime.new_now_local().format('%a %d %b  %H:%M') ?? '';
    this.positionGroups();
  }

  private refreshApps(): void {
    this.appButtons.destroy_all_children();

    const ids = this.favorites.get_strv('favorite-apps');
    const apps = ids
      .map(id => this.appSystem.lookup_app(id))
      .filter((app): app is Shell.App => app !== null);

    for (const running of this.appSystem.get_running()) {
      if (!apps.some(app => app.id === running.id))
        apps.push(running);
    }

    for (const app of apps) {
      const button = new St.Button({
        style_class: 'kestrel-panel-button',
        child: app.create_icon_texture(25),
        can_focus: true,
        reactive: true,
        track_hover: true,
      });
      button.connect('clicked', () => app.activate());
      this.appButtons.add_child(button);
    }
    this.positionGroups();
  }

  private positionGroups(): void {
    if (!this.actor.get_stage())
      return;

    const [, centerWidth] = this.center.get_preferred_width(-1);
    const [, rightWidth] = this.right.get_preferred_width(-1);
    this.center.set_position(Math.round((this.actor.width - centerWidth) / 2), 10);
    this.right.set_position(this.actor.width - rightWidth - 18, 10);
  }

  private iconButton(iconName: string, action: () => void): St.Button {
    const button = new St.Button({
      style_class: 'kestrel-panel-button',
      child: new St.Icon({ icon_name: iconName, icon_size: 19 }),
      can_focus: true,
      reactive: true,
      track_hover: true,
    });
    button.connect('clicked', action);
    return button;
  }
}
