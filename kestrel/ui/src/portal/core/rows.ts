import Clutter from 'gi://Clutter';
import type Gio from 'gi://Gio';
import St from 'gi://St';

export interface RowSpec {
  icon?: Gio.Icon | string | St.Widget;
  title: string;
  subtitle?: string;
  checked?: boolean;
}

function iconActor(icon: RowSpec['icon']): St.Widget | null {
  if (!icon) return null;
  if (icon instanceof St.Widget) return icon;
  return typeof icon === 'string'
    ? new St.Icon({ icon_name: icon, style_class: 'kestrel-portal-row-icon' })
    : new St.Icon({ gicon: icon, style_class: 'kestrel-portal-row-icon' });
}

export function row({ icon, title, subtitle, checked }: RowSpec): St.Button {
  const box = new St.BoxLayout({ style_class: 'kestrel-portal-row-box', x_expand: true });
  const leading = iconActor(icon);
  if (leading) box.add_child(leading);
  const text = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-portal-row-text', x_expand: true, y_align: Clutter.ActorAlign.CENTER });
  text.add_child(new St.Label({ text: title, style_class: 'kestrel-portal-row-title' }));
  if (subtitle) text.add_child(new St.Label({ text: subtitle, style_class: 'kestrel-portal-row-subtitle' }));
  box.add_child(text);
  const check = new St.Icon({ icon_name: 'object-select-symbolic', style_class: 'kestrel-portal-row-check', y_align: Clutter.ActorAlign.CENTER, opacity: checked ? 255 : 0 });
  box.add_child(check);
  const button = new St.Button({ style_class: 'kestrel-portal-row', child: box, can_focus: true, x_expand: true, toggle_mode: checked !== undefined, checked: checked ?? false, accessible_name: title });
  button.connect('notify::checked', () => { check.opacity = button.checked ? 255 : 0; });
  return button;
}

export function list(rows: St.Widget[], scrollable = false): St.Widget {
  const box = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-portal-list', x_expand: true });
  for (const child of rows) box.add_child(child);
  if (!scrollable) return box;
  return new St.ScrollView({ child: box, style_class: 'kestrel-portal-scroll', hscrollbar_policy: St.PolicyType.NEVER, vscrollbar_policy: St.PolicyType.AUTOMATIC, overlay_scrollbars: true });
}

export function choose(rows: St.Button[], selected: (index: number) => void): void {
  rows.forEach((button, index) => button.connect('clicked', () => {
    rows.forEach((other, otherIndex) => { other.checked = otherIndex === index; });
    selected(index);
  }));
}
