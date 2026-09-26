import Clutter from 'gi://Clutter';
import type Gio from 'gi://Gio';
import St from 'gi://St';

export interface MenuAction { label: string; enabled?: boolean; checked?: boolean; icon?: Gio.Icon | null; run(): void; }
export interface MenuGroup { label: string; enabled?: boolean; icon?: Gio.Icon | null; children: MenuEntry[]; }
export type MenuEntry = MenuAction | MenuGroup | 'separator';

export interface MenuHandlers {
  activate(action: MenuAction): void;
  open(group: MenuGroup): void;
  back: (() => void) | null;
  hover(button: St.Button): void;
}

function slot(icon: Gio.Icon | null | undefined, iconName: string | null): St.Icon {
  return new St.Icon({ style_class: 'kestrel-context-icon', gicon: icon ?? null, icon_name: icon ? null : iconName, icon_size: 16 });
}

function row(label: string, enabled: boolean, handlers: MenuHandlers, leading: St.Icon[], trailing: string | null): St.Button {
  const box = new St.BoxLayout({ style_class: 'kestrel-context-row', x_expand: true });
  for (const icon of leading) box.add_child(icon);
  box.add_child(new St.Label({ text: label, x_expand: true, x_align: Clutter.ActorAlign.START, y_align: Clutter.ActorAlign.CENTER }));
  if (trailing) box.add_child(new St.Icon({ style_class: 'kestrel-context-icon', icon_name: trailing, icon_size: 16 }));
  const button = new St.Button({ style_class: 'kestrel-context-action', accessible_name: label, can_focus: enabled, reactive: enabled,
    opacity: enabled ? 255 : 110, track_hover: true, x_expand: true, child: box });
  button.connect('notify::hover', () => handlers.hover(button));
  return button;
}

export function menuContent(entries: MenuEntry[], handlers: MenuHandlers): St.BoxLayout {
  const content = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL });
  const items = entries.filter(entry => entry !== 'separator');
  const checks = items.some(entry => 'run' in entry && entry.checked !== undefined);
  const icons = items.some(entry => entry.icon);
  if (handlers.back) {
    const back = row('Back', true, handlers, [slot(null, 'go-previous-symbolic')], null);
    back.connect('clicked', handlers.back);
    content.add_child(back);
    content.add_child(new St.Widget({ style_class: 'kestrel-context-separator' }));
  }
  for (const entry of entries) {
    if (entry === 'separator') {
      content.add_child(new St.Widget({ style_class: 'kestrel-context-separator' }));
      continue;
    }
    const leading = [
      ...checks ? [slot(null, 'run' in entry && entry.checked ? 'object-select-symbolic' : null)] : [],
      ...icons ? [slot(entry.icon, null)] : [],
    ];
    const group = 'children' in entry;
    const button = row(entry.label, entry.enabled !== false, handlers, leading, group ? 'go-next-symbolic' : null);
    button.connect('clicked', () => group ? handlers.open(entry) : handlers.activate(entry));
    content.add_child(button);
  }
  return content;
}
