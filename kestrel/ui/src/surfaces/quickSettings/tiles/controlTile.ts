import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

import { animateActor } from '../../../shared/motion.js';
import type { QuickControl } from '../quickControls.js';

interface TileParts {
  body: St.BoxLayout;
  top: St.BoxLayout;
  icon: St.Icon;
  title: St.Label;
  subtitle: St.Label;
}

function tileParts(): TileParts {
  const body = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-control-body', x_expand: true });
  const top = new St.BoxLayout({ style_class: 'kestrel-control-top', x_expand: true });
  const icon = new St.Icon({ icon_size: 22, x_expand: true, x_align: Clutter.ActorAlign.START });
  const title = new St.Label({ style_class: 'kestrel-control-title', x_align: Clutter.ActorAlign.START });
  const subtitle = new St.Label({ style_class: 'kestrel-control-subtitle', x_align: Clutter.ActorAlign.START });
  top.add_child(icon);
  body.add_child(top);
  body.add_child(title);
  body.add_child(subtitle);
  return { body, top, icon, title, subtitle };
}

function chevron(item: QuickControl): St.Button {
  const icon = new St.Icon({ icon_name: 'go-next-symbolic', icon_size: 14 });
  icon.set_pivot_point(0.5, 0.5);
  const more = new St.Button({
    style_class: 'kestrel-control-more', can_focus: true, track_hover: true,
    accessible_name: 'Show options', child: icon,
  });
  item.bind_property('menu-enabled', more, 'visible', GObject.BindingFlags.SYNC_CREATE);
  more.connect('clicked', () => {
    if (item.menu!.isOpen) item.menu!.close({ animate: true });
    else item.menu!.open();
  });
  item.menu!.connect('open-state-changed', (_menu, open) =>
    animateActor(icon, { rotation_angle_z: open ? -90 : 0, duration: 220, mode: Clutter.AnimationMode.EASE_OUT_CUBIC }));
  return more;
}

export function styleControl(item: QuickControl): void {
  const previous = item.get_child();
  const { body, top, icon, title, subtitle } = tileParts();
  item.bind_property('gicon', icon, 'gicon', GObject.BindingFlags.SYNC_CREATE);
  item.bind_property('icon-name', icon, 'icon-name', item.icon_name ? GObject.BindingFlags.SYNC_CREATE : GObject.BindingFlags.DEFAULT);
  if (item.menu) top.add_child(chevron(item));
  item.bind_property('title', title, 'text', GObject.BindingFlags.SYNC_CREATE);
  const updateSubtitle = () => {
    subtitle.text = item.subtitle || (item.checked ? 'On' : 'Off');
  };
  item.connect('notify::subtitle', updateSubtitle);
  item.connect('notify::checked', updateSubtitle);
  updateSubtitle();
  item.style_class = 'kestrel-control';
  item.track_hover = true;
  item.can_focus = true;
  item.label_actor = title;
  item.set_child(body);
  previous?.destroy();
}

export interface ActionTile {
  actor: St.Button;
  title: St.Label;
  subtitle: St.Label;
  icon: St.Icon;
}

export function actionTile(iconName: string, titleText: string, activate: () => void): ActionTile {
  const { body, icon, title, subtitle } = tileParts();
  icon.icon_name = iconName;
  title.text = titleText;
  const actor = new St.Button({
    style_class: 'kestrel-control', can_focus: true, track_hover: true,
    accessible_name: titleText, label_actor: title, child: body,
  });
  actor.connect('clicked', activate);
  return { actor, title, subtitle, icon };
}
