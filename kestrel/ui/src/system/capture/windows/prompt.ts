import Gio from 'gi://Gio';

import { openDialog } from '../../../portal/core/dialog.js';
import { SUCCESS, type Dismissal } from '../../../portal/core/request.js';
import { t } from '../../../shared/i18n/index.js';
import type { Requester } from './requester.js';

const leaves = (sender: string): Dismissal => end => {
  const watch = Gio.bus_watch_name_on_connection(Gio.DBus.session, sender, Gio.BusNameWatcherFlags.NONE, null, end);
  return () => Gio.bus_unwatch_name(watch);
};

export async function askToRecordWindows({ app, name, sender }: Requester): Promise<boolean> {
  let allowed = false;
  await openDialog(leaves(sender), {
    title: t('window-capture-request', { app: name }),
    description: t('window-capture-description'),
    icon: 'media-record-symbolic',
    styleClass: 'kestrel-window-capture-dialog',
    askedBy: app,
  }, dialog => {
    dialog.content.hide();
    dialog.buttons([
      { label: t('portal-deny'), action: dialog.cancel },
      { label: t('portal-allow'), default: true, action: () => {
        allowed = true;
        dialog.finish(SUCCESS);
      } },
    ]);
  });
  return allowed;
}
