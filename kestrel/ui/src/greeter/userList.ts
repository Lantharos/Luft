import type AccountsService from 'gi://AccountsService';
import Clutter from 'gi://Clutter';
import St from 'gi://St';
import { Avatar } from 'resource:///org/gnome/shell/ui/userWidget.js';

import { displayName } from './accounts.js';

const AVATAR_SIZE = 32;

interface Row {
  user: AccountsService.User | null;
  button: St.Button;
}

export class UserList {
  readonly actor = new St.BoxLayout({ name: 'kestrel-greeter-users', style_class: 'kestrel-greeter-users', orientation: Clutter.Orientation.VERTICAL });
  private rows: Row[] = [];

  constructor(private readonly choose: (user: AccountsService.User | null) => void) {}

  show(users: AccountsService.User[], offerOthers: boolean, selected: AccountsService.User | null): void {
    this.actor.destroy_all_children();
    this.rows = [];
    if (users.length + (offerOthers ? 1 : 0) < 2) return;
    for (const user of users) this.add(user, this.avatar(user), displayName(user));
    if (offerOthers) this.add(null, new St.Icon({ style_class: 'kestrel-greeter-avatar', icon_name: 'avatar-default-symbolic', icon_size: 18 }), 'Another account');
    this.select(selected);
  }

  select(user: AccountsService.User | null): void {
    for (const row of this.rows) row.button.checked = row.user === user;
  }

  set sensitive(sensitive: boolean) {
    for (const row of this.rows) row.button.reactive = sensitive;
  }

  private avatar(user: AccountsService.User): St.Widget {
    const avatar = new Avatar(user, { styleClass: 'kestrel-greeter-avatar', iconSize: AVATAR_SIZE });
    const signals = [
      user.connect('notify::is-loaded', () => avatar.update()),
      user.connect('changed', () => avatar.update()),
    ];
    avatar.connect('destroy', () => signals.forEach(signal => user.disconnect(signal)));
    avatar.update();
    return avatar;
  }

  private add(user: AccountsService.User | null, avatar: St.Widget, name: string): void {
    const content = new St.BoxLayout({ style_class: 'kestrel-greeter-user-content' });
    avatar.y_align = Clutter.ActorAlign.CENTER;
    content.add_child(avatar);
    content.add_child(new St.Label({ style_class: 'kestrel-greeter-user-name', text: name, y_align: Clutter.ActorAlign.CENTER }));
    const button = new St.Button({
      style_class: 'kestrel-greeter-user', child: content, accessible_name: name,
      can_focus: true, track_hover: true, x_align: Clutter.ActorAlign.START,
    });
    button.connect('clicked', () => this.choose(user));
    this.actor.add_child(button);
    this.rows.push({ user, button });
  }
}
