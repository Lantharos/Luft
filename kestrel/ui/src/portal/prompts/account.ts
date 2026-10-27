import AccountsService from 'gi://AccountsService';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import { Avatar } from 'resource:///com/lantharos/kestrel/ui/userWidget.js';

import { t } from '../../shared/i18n/index.js';
import { appNames } from '../core/apps.js';
import { openDialog } from '../core/dialog.js';
import { SUCCESS, type Dismissal, type Options } from '../core/request.js';
import { row } from '../core/rows.js';

function details(user: AccountsService.User): Options {
  const icon = user.get_icon_file();
  return {
    id: new GLib.Variant('s', user.user_name),
    name: new GLib.Variant('s', user.get_real_name() || user.user_name),
    image: new GLib.Variant('s', icon && GLib.file_test(icon, GLib.FileTest.EXISTS) ? Gio.File.new_for_path(icon).get_uri() : ''),
  };
}

export async function shareAccount(dismissal: Dismissal, appId: string, reason: string): Promise<[number, Options]> {
  const user = AccountsService.UserManager.get_default().get_user(GLib.get_user_name());
  const app = appNames(appId);
  const [response] = await openDialog(dismissal, {
    title: t('portal-account-title', { appName: app.object }),
    description: reason || t('portal-account-description', { appName: app.subject }),
    icon: 'avatar-default-symbolic',
    askedBy: appId,
  }, dialog => {
    const avatar = new Avatar(user, { styleClass: 'kestrel-portal-avatar', iconSize: 40 });
    avatar.update();
    const card = row({ icon: avatar, title: user.get_real_name() || user.user_name, subtitle: user.user_name });
    card.reactive = card.can_focus = false;
    dialog.content.add_child(card);
    dialog.buttons([
      { label: t('portal-cancel'), action: dialog.cancel },
      { label: t('portal-share'), action: () => dialog.finish(SUCCESS), default: true },
    ]);
  });
  return [response, response === SUCCESS ? details(user) : {}];
}
