import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';
import { animateActor } from './motion.js';

const VISIBLE_AFTER_CHANGE_MS = 900;

export function attachSliderValue(item: St.Button, slider: St.Widget & { value: number }): void {
  const label = new St.Label({ style_class: 'kestrel-slider-value', opacity: 0, y_align: Clutter.ActorAlign.CENTER });
  const row = item.get_child()!;
  row.insert_child_above(label, slider.get_parent());
  let hideTimer = 0;
  const hide = () => {
    hideTimer = 0;
    animateActor(label, { opacity: 0, duration: 200, mode: Clutter.AnimationMode.EASE_OUT_QUAD });
    return GLib.SOURCE_REMOVE;
  };
  slider.connect('notify::value', () => {
    label.text = `${Math.round(slider.value * 100)}%`;
    if (!item.mapped) return;
    animateActor(label, { opacity: 255, duration: 120, mode: Clutter.AnimationMode.EASE_OUT_QUAD });
    if (hideTimer) GLib.Source.remove(hideTimer);
    hideTimer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, VISIBLE_AFTER_CHANGE_MS, hide);
  });
  label.text = `${Math.round(slider.value * 100)}%`;
  label.connect('destroy', () => { if (hideTimer) GLib.Source.remove(hideTimer); });
}
