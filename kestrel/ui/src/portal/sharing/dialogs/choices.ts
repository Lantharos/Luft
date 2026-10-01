import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { list, row } from '../../core/rows.js';

export function rememberRow(app: string): St.Button {
  return row({ icon: 'document-open-recent-symbolic', title: 'Remember my choice', subtitle: `${app} won't have to ask again`, checked: true });
}

export function clipboardRow(): St.Button {
  return row({ icon: 'edit-paste-symbolic', title: 'Share the clipboard', subtitle: 'Copy and paste in both directions', checked: true });
}

export function group(title: string, rows: St.Widget[]): St.Widget {
  const box = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-portal-field', x_expand: true });
  box.add_child(new St.Label({ text: title, style_class: 'kestrel-portal-label' }));
  box.add_child(list(rows));
  return box;
}
