import AccountsService from 'gi://AccountsService';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

import * as KestrelUi from '../../kestrelUi.js';
import { Avatar } from '../../shared/widgets/userWidget.js';

const AVATAR_SIZE = 22;
const ROOT = 0;
const MANY = 3;

export namespace Administrators {
  export interface Signals extends St.BoxLayout.SignalSignatures {
    'chosen': (uid: number) => void;
  }
}

function displayName(uid: number, user: AccountsService.User): string {
  if (uid === ROOT) return KestrelUi.t('polkit-administrator');
  if (!user.is_loaded) return '';
  return user.get_real_name() || user.get_user_name();
}

function person(uid: number, toggle: boolean): St.Button {
  const user = AccountsService.UserManager.get_default().get_user_by_id(uid);
  const avatar = new Avatar(user, { styleClass: 'polkit-dialog-avatar', iconSize: AVATAR_SIZE });
  const name = new St.Label({ style_class: 'polkit-dialog-name', y_align: Clutter.ActorAlign.CENTER });
  const box = new St.BoxLayout({ style_class: 'polkit-dialog-person-box' });
  box.add_child(avatar);
  box.add_child(name);
  const button = new St.Button({
    style_class: toggle ? 'polkit-dialog-person kestrel-control' : 'polkit-dialog-person polkit-dialog-only',
    child: box, toggle_mode: toggle, can_focus: toggle, reactive: toggle, x_align: Clutter.ActorAlign.START,
  });
  const update = () => {
    avatar.update();
    name.text = displayName(uid, user);
    button.accessible_name = name.text;
  };
  user.connectObject('notify::is-loaded', update, 'changed', update, button);
  update();
  return button;
}

export class Administrators extends St.BoxLayout {
  static [GObject.signals] = {
    'chosen': { param_types: [GObject.TYPE_UINT] },
  };

  static {
    GObject.registerClass(this);
  }

  declare connect: GObject.SignalMethods<this, Administrators.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, Administrators.Signals>['emit'];

  constructor(uids: number[], chosen: number) {
    const many = uids.length > MANY;
    super({ style_class: 'polkit-dialog-people', orientation: many ? Clutter.Orientation.VERTICAL : Clutter.Orientation.HORIZONTAL });
    const choice = uids.length > 1;
    const buttons = uids.map(uid => {
      const button = person(uid, choice);
      button.x_expand = many;
      button.checked = uid === chosen;
      button.connect('clicked', () => {
        for (const other of buttons) other.checked = other === button;
        if (uid === chosen) return;
        chosen = uid;
        this.emit('chosen', uid);
      });
      this.add_child(button);
      return button;
    });
  }
}
