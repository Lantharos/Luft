import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { appNames } from '../core/apps.js';
import { openDialog } from '../core/dialog.js';
import { SUCCESS } from '../core/request.js';
import { label } from './accelerators.js';

export interface RequestedShortcut {
  readonly description: string;
  readonly shortcuts: string[];
}

function shortcutRow({ description, shortcuts }: RequestedShortcut): St.Widget {
  const row = new St.BoxLayout({ style_class: 'kestrel-shortcut-row', x_expand: true });
  row.add_child(new St.Label({ text: description, x_expand: true, y_align: Clutter.ActorAlign.CENTER }));
  row.add_child(new St.Label({ text: shortcuts.map(label).join(', '), style_class: 'kestrel-shortcut-key', y_align: Clutter.ActorAlign.CENTER }));
  return row;
}

export async function allowShortcuts(handle: string, appId: string, requested: RequestedShortcut[]): Promise<boolean> {
  const app = appNames(appId);
  const [response] = await openDialog(handle, {
    title: `Let ${app.object} use keyboard shortcuts?`,
    description: `These shortcuts reach ${app.object} even while you use other apps.`,
    icon: 'preferences-desktop-keyboard-shortcuts-symbolic',
    askedBy: appId,
  }, dialog => {
    const list = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-shortcut-list', x_expand: true });
    for (const shortcut of requested) list.add_child(shortcutRow(shortcut));
    dialog.content.add_child(list);
    dialog.buttons([
      { label: 'Cancel', action: dialog.cancel },
      { label: 'Allow', default: true, action: () => dialog.finish(SUCCESS) },
    ]);
  });
  return response === SUCCESS;
}
