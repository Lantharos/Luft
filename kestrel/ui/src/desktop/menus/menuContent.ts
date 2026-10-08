import Clutter from 'gi://Clutter';
import type Gio from 'gi://Gio';
import St from 'gi://St';

type MenuIcon = Gio.Icon | St.ImageContent | null;
interface MenuAction { label: string; detail?: string; enabled?: boolean; checked?: boolean; icon?: MenuIcon; run(): void; }
export interface MenuGroup { label: string; enabled?: boolean; icon?: MenuIcon; children: MenuEntry[] | (() => Promise<MenuEntry[]>); }
export type MenuEntry = MenuAction | MenuGroup | 'separator';

interface MenuHandlers {
  activate(action: MenuAction): void;
  open(group: MenuGroup): void;
  back: (() => void) | null;
  hover(button: St.Button): void;
}

function slot(icon: MenuIcon | undefined, iconName: string | null): St.Icon {
  if (icon instanceof St.ImageContent)
    return new St.Icon({ style_class: 'kestrel-context-icon', content: icon, content_gravity: Clutter.ContentGravity.RESIZE_ASPECT, width: 16, height: 16 });
  return new St.Icon({ style_class: 'kestrel-context-icon', icon_size: 16, ...icon ? { gicon: icon } : { icon_name: iconName } });
}

function row(label: string, enabled: boolean, handlers: MenuHandlers, leading: St.Icon[], trailing: string | null, detail?: string): St.Button {
  const box = new St.BoxLayout({ style_class: 'kestrel-context-row', x_expand: true });
  for (const icon of leading) box.add_child(icon);
  box.add_child(new St.Label({ text: label, x_expand: true, x_align: Clutter.ActorAlign.START, y_align: Clutter.ActorAlign.CENTER }));
  if (detail) box.add_child(new St.Label({ style_class: 'kestrel-context-detail', text: detail, y_align: Clutter.ActorAlign.CENTER }));
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
    const button = row(entry.label, entry.enabled !== false, handlers, leading, group ? 'go-next-symbolic' : null, group ? undefined : entry.detail);
    button.connect('clicked', () => group ? handlers.open(entry) : handlers.activate(entry));
    content.add_child(button);
  }
  return content;
}
