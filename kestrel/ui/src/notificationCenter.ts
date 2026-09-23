import Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';
import St from 'gi://St';

interface Notification {
  title: string;
  body: string;
  destroy(): void;
}

interface Source {
  title: string;
  notifications: Notification[];
  connect(signal: string, callback: () => void): number;
}

export interface MessageTray {
  getSources(): Source[];
  connect(signal: string, callback: () => void): number;
}

export class NotificationCenter {
  readonly actor: St.BoxLayout;

  private readonly list = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-notification-list' });

  constructor(private readonly tray: MessageTray) {
    this.actor = new St.BoxLayout({
      orientation: Clutter.Orientation.VERTICAL,
      style_class: 'kestrel-popover',
      visible: false,
      reactive: true,
    });
    this.actor.add_effect_with_name('backdrop', new Shell.BlurEffect({
      mode: Shell.BlurMode.BACKGROUND,
      radius: 34,
      brightness: 0.76,
    }));

    const header = new St.BoxLayout();
    header.add_child(new St.Label({
      text: 'Notifications',
      style_class: 'kestrel-title',
      x_expand: true,
    }));
    const clearButton = new St.Button({
      style_class: 'kestrel-action',
      label: 'Clear all',
      can_focus: true,
    });
    clearButton.connect('clicked', () => this.clear());
    header.add_child(clearButton);
    this.actor.add_child(header);

    const scroll = new St.ScrollView({
      hscrollbar_policy: St.PolicyType.NEVER,
      vscrollbar_policy: St.PolicyType.AUTOMATIC,
    });
    scroll.set_size(350, 470);
    scroll.child = this.list;
    this.actor.add_child(scroll);

    this.tray.connect('source-added', () => {
      this.watchSources();
      this.refresh();
    });
    this.tray.connect('source-removed', () => this.refresh());
    this.watchSources();
    this.refresh();
  }

  refresh(): void {
    this.list.destroy_all_children();

    const notifications = this.tray.getSources()
      .flatMap(source => source.notifications.map(notification => ({ source, notification })))
      .reverse();

    if (notifications.length === 0) {
      this.list.add_child(new St.Label({
        text: 'You’re all caught up',
        style_class: 'kestrel-muted',
      }));
      return;
    }

    for (const { source, notification } of notifications) {
      const item = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-notification' });
      item.add_child(new St.Label({ text: source.title, style_class: 'kestrel-muted' }));
      item.add_child(new St.Label({ text: notification.title, style_class: 'kestrel-section-title' }));
      if (notification.body)
        item.add_child(new St.Label({ text: notification.body, style_class: 'kestrel-muted' }));
      this.list.add_child(item);
    }
  }

  private watchSources(): void {
    for (const source of this.tray.getSources()) {
      if (watchedSources.has(source))
        continue;
      watchedSources.add(source);
      source.connect('notification-added', () => this.refresh());
      source.connect('notification-removed', () => this.refresh());
    }
  }

  private clear(): void {
    for (const source of this.tray.getSources()) {
      for (const notification of [...source.notifications])
        notification.destroy();
    }
    this.refresh();
  }
}

const watchedSources = new WeakSet<Source>();
