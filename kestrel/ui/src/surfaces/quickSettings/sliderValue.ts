import GLib from 'gi://GLib';
import St from 'gi://St';
import { FluentNumber, t } from '../../shared/i18n/index.js';
import { animateActor, Curve, Duration } from '../../shared/motion/motion.js';

const VISIBLE_AFTER_CHANGE_MS = 900;
const BUBBLE_GAP = 6;

export function attachSliderValue(slider: St.Widget & { value: number }): void {
  const bubble = new St.Label({ style_class: 'kestrel-slider-value', opacity: 0, visible: false });
  global.stage.add_child(bubble);
  let hideTimer = 0;
  const hide = () => {
    hideTimer = 0;
    animateActor(bubble, { opacity: 0, duration: Duration.tap, onStopped: () => { if (!hideTimer) bubble.hide(); } });
    return GLib.SOURCE_REMOVE;
  };
  const place = () => {
    const [x, y] = slider.get_transformed_position();
    const handle = slider.get_theme_node().get_length('-slider-handle-radius');
    const [, width] = bubble.get_preferred_width(-1);
    const [, height] = bubble.get_preferred_height(width);
    const thumb = x + handle + slider.value * (slider.width - 2 * handle);
    bubble.set_position(Math.round(thumb - width / 2), Math.round(y - height - BUBBLE_GAP));
  };
  slider.connect('notify::value', () => {
    bubble.text = t('quick-settings-slider-value', { percent: new FluentNumber(slider.value, { style: 'percent' }) });
    if (!slider.mapped) return;
    bubble.get_parent()!.set_child_above_sibling(bubble, null);
    bubble.show();
    place();
    animateActor(bubble, { opacity: 255, duration: Duration.quick, curve: Curve.decelerate });
    if (hideTimer) GLib.Source.remove(hideTimer);
    hideTimer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, VISIBLE_AFTER_CHANGE_MS, hide);
  });
  slider.connect('notify::mapped', () => {
    if (slider.mapped) return;
    if (hideTimer) GLib.Source.remove(hideTimer);
    hideTimer = 0;
    bubble.remove_all_transitions();
    bubble.hide();
  });
  slider.connect('destroy', () => {
    if (hideTimer) GLib.Source.remove(hideTimer);
    bubble.destroy();
  });
}
