import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';
import type { QuickControl } from './quickControls.js';

export function styleControl(item: QuickControl): void {
  const previous = item.get_child();
  const body = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-control-body', x_expand: true });
  const top = new St.BoxLayout({ x_expand: true });
  const icon = new St.Icon({ icon_size: 22, x_expand: true, x_align: Clutter.ActorAlign.START });
  item.bind_property('gicon', icon, 'gicon', GObject.BindingFlags.SYNC_CREATE);
  item.bind_property('icon-name', icon, 'icon-name', GObject.BindingFlags.DEFAULT);
  top.add_child(icon);
  if (item.menu) {
    const more = new St.Button({
      style_class: 'kestrel-control-more', can_focus: true, track_hover: true,
      accessible_name: 'Show options',
      child: new St.Icon({ icon_name: 'go-next-symbolic', icon_size: 14 }),
    });
    item.bind_property('menu-enabled', more, 'visible', GObject.BindingFlags.SYNC_CREATE);
    more.connect('clicked', () => item.menu?.open());
    top.add_child(more);
  }
  body.add_child(top);
  const title = new St.Label({ style_class: 'kestrel-control-title', x_align: Clutter.ActorAlign.START });
  item.bind_property('title', title, 'text', GObject.BindingFlags.SYNC_CREATE);
  body.add_child(title);
  const subtitle = new St.Label({ style_class: 'kestrel-control-subtitle', x_align: Clutter.ActorAlign.START });
  const updateSubtitle = () => {
    subtitle.text = item.subtitle || (item.checked ? 'On' : item.toggle_mode ? 'Off' : 'Options');
  };
  item.connect('notify::subtitle', updateSubtitle);
  item.connect('notify::checked', updateSubtitle);
  updateSubtitle();
  body.add_child(subtitle);
  item.style_class = 'kestrel-control';
  item.track_hover = true;
  item.can_focus = true;
  item.label_actor = title;
  item.set_child(body);
  previous?.destroy();
}
