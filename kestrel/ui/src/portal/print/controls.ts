import Clutter from 'gi://Clutter';
import St from 'gi://St';

export interface Segment<T extends string> {
  readonly value: T;
  readonly label: string;
}

export function field(label: string, control: St.Widget): St.BoxLayout {
  const box = new St.BoxLayout({ style_class: 'kestrel-print-field', x_expand: true });
  box.add_child(new St.Label({ text: label, style_class: 'kestrel-print-field-label', x_expand: true, y_align: Clutter.ActorAlign.CENTER }));
  box.add_child(control);
  return box;
}

export function segments<T extends string>(options: Segment<T>[], selected: T, changed: (value: T) => void): St.BoxLayout {
  const box = new St.BoxLayout({ style_class: 'kestrel-print-segments', y_align: Clutter.ActorAlign.CENTER });
  const buttons = options.map(({ value, label }) => {
    const button = new St.Button({ style_class: 'kestrel-print-segment', label, can_focus: true, toggle_mode: true, checked: value === selected, accessible_name: label });
    button.connect('clicked', () => {
      buttons.forEach((other, index) => { other.checked = options[index].value === value; });
      changed(value);
    });
    box.add_child(button);
    return button;
  });
  return box;
}

export function stepper(value: number, most: number, changed: (value: number) => void): St.BoxLayout {
  const box = new St.BoxLayout({ style_class: 'kestrel-print-stepper', y_align: Clutter.ActorAlign.CENTER });
  const count = new St.Entry({ style_class: 'kestrel-print-count', text: String(value), can_focus: true, accessible_name: 'Copies' });
  count.clutter_text.x_align = Clutter.ActorAlign.CENTER;
  const step = (icon: string, name: string, by: number) => {
    const button = new St.Button({ style_class: 'kestrel-print-step', child: new St.Icon({ icon_name: icon }), can_focus: true, accessible_name: name });
    button.connect('clicked', () => set(value + by));
    return button;
  };
  const less = step('list-remove-symbolic', 'Fewer copies', -1);
  const more = step('list-add-symbolic', 'More copies', 1);
  const set = (next: number) => {
    value = Math.min(Math.max(next, 1), most);
    if (count.text !== String(value)) count.text = String(value);
    less.reactive = value > 1;
    more.reactive = value < most;
    changed(value);
  };
  count.clutter_text.connect('text-changed', () => {
    const typed = Number.parseInt(count.text, 10);
    if (Number.isInteger(typed)) set(typed);
  });
  count.clutter_text.connect('key-focus-out', () => { count.text = String(value); });
  less.reactive = value > 1;
  more.reactive = value < most;
  box.add_child(less);
  box.add_child(count);
  box.add_child(more);
  return box;
}

export function pick(label: string, opened: () => void): St.Button {
  const box = new St.BoxLayout({ style_class: 'kestrel-print-pick-box' });
  box.add_child(new St.Label({ text: label, y_align: Clutter.ActorAlign.CENTER }));
  box.add_child(new St.Icon({ icon_name: 'pan-end-symbolic', style_class: 'kestrel-print-pick-arrow', y_align: Clutter.ActorAlign.CENTER }));
  const button = new St.Button({ style_class: 'kestrel-print-pick', child: box, can_focus: true, accessible_name: label, y_align: Clutter.ActorAlign.CENTER });
  button.connect('clicked', opened);
  return button;
}
