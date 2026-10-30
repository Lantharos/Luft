import type St from 'gi://St';

export function toggleStyleClass(actor: St.Widget, name: string, enabled: boolean): void {
  if (enabled) actor.add_style_class_name(name);
  else actor.remove_style_class_name(name);
}
