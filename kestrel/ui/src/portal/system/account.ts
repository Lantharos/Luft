import AccountsService from 'gi://AccountsService';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import { Avatar } from 'resource:///org/gnome/shell/ui/userWidget.js';

import { appNames } from '../core/apps.js';
import { openDialog } from '../core/dialog.js';
import { SUCCESS, option, respond, type Invocation, type Options } from '../core/request.js';
import { row } from '../core/rows.js';

const ACCOUNT_XML = `<node><interface name="org.freedesktop.impl.portal.Account">
  <method name="GetUserInformation">
    <arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="a{sv}" direction="in"/>
    <arg type="u" direction="out"/><arg type="a{sv}" direction="out"/>
  </method>
</interface></node>`;

function details(user: AccountsService.User): Options {
  const icon = user.get_icon_file();
  return {
    id: new GLib.Variant('s', user.user_name),
    name: new GLib.Variant('s', user.get_real_name() || user.user_name),
    image: new GLib.Variant('s', icon && GLib.file_test(icon, GLib.FileTest.EXISTS) ? Gio.File.new_for_path(icon).get_uri() : ''),
  };
}

export class AccountPortal {
  readonly dbus = Gio.DBusExportedObject.wrapJSObject(ACCOUNT_XML, this);

  async GetUserInformationAsync([handle, appId, , options]: [string, string, string, Options], invocation: Invocation): Promise<void> {
    const user = AccountsService.UserManager.get_default().get_user(GLib.get_user_name());
    const app = appNames(appId);
    respond(invocation, await openDialog(handle, {
      title: `Share your name and picture with ${app.object}?`,
      description: option<string>(options, 'reason') || `${app.subject} will see the name and picture of your account.`,
      icon: 'avatar-default-symbolic',
    }, dialog => {
      const avatar = new Avatar(user, { styleClass: 'kestrel-portal-avatar', iconSize: 40 });
      avatar.update();
      const card = row({ icon: avatar, title: user.get_real_name() || user.user_name, subtitle: user.user_name });
      card.reactive = card.can_focus = false;
      dialog.content.add_child(card);
      dialog.buttons([
        { label: 'Cancel', action: dialog.cancel },
        { label: 'Share', action: () => dialog.finish(SUCCESS, details(user)), default: true },
      ]);
    }));
  }
}
