import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { t } from '../../shared/i18n/index.js';
import { appNames } from '../core/apps.js';
import { openDialog } from '../core/dialog.js';
import { requested, SUCCESS } from '../core/request.js';
import { labels } from './accelerators.js';

export interface RequestedShortcut {
  readonly description: string;
  readonly shortcuts: string[];
}

function shortcutRow({ description, shortcuts }: RequestedShortcut): St.Widget {
  const row = new St.BoxLayout({ style_class: 'kestrel-shortcut-row', x_expand: true });
  row.add_child(new St.Label({ text: description, x_expand: true, y_align: Clutter.ActorAlign.CENTER }));
  row.add_child(new St.Label({ text: labels(shortcuts), style_class: 'kestrel-shortcut-key', y_align: Clutter.ActorAlign.CENTER }));
  return row;
}

export async function allowShortcuts(handle: string, appId: string, wanted: RequestedShortcut[]): Promise<boolean> {
  const app = appNames(appId);
  const [response] = await openDialog(requested(handle), {
    title: t('shortcuts-consent-title', { appName: app.object }),
    description: t('shortcuts-consent-description', { appName: app.object }),
    icon: 'preferences-desktop-keyboard-shortcuts-symbolic',
    askedBy: appId,
  }, dialog => {
    const list = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-shortcut-list', x_expand: true });
    for (const shortcut of wanted) list.add_child(shortcutRow(shortcut));
    dialog.content.add_child(list);
    dialog.buttons([
      { label: t('portal-cancel'), action: dialog.cancel },
      { label: t('portal-allow'), default: true, action: () => dialog.finish(SUCCESS) },
    ]);
  });
  return response === SUCCESS;
}
