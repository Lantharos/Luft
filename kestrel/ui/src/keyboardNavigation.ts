import Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';
import St from 'gi://St';

const directions = new Map([
  [Clutter.KEY_Left, St.DirectionType.LEFT], [Clutter.KEY_Right, St.DirectionType.RIGHT],
  [Clutter.KEY_Up, St.DirectionType.UP], [Clutter.KEY_Down, St.DirectionType.DOWN],
]);

export function navigateWithKeyboard(root: St.Widget): void {
  root.connect('key-press-event', (_actor, event) => {
    if (event.get_state() & (Clutter.ModifierType.CONTROL_MASK | Clutter.ModifierType.MOD1_MASK | Clutter.ModifierType.SUPER_MASK))
      return Clutter.EVENT_PROPAGATE;
    const key = event.get_key_symbol();
    const tab = key === Clutter.KEY_Tab || key === Clutter.KEY_ISO_Left_Tab;
    const focus = (global as unknown as Shell.Global).stage.get_key_focus();
    if (!tab && focus instanceof Clutter.Text && focus.editable) return Clutter.EVENT_PROPAGATE;
    const direction = tab
      ? (key === Clutter.KEY_ISO_Left_Tab || event.get_state() & Clutter.ModifierType.SHIFT_MASK) ? St.DirectionType.TAB_BACKWARD : St.DirectionType.TAB_FORWARD
      : directions.get(key);
    if (direction === undefined) return Clutter.EVENT_PROPAGATE;
    return root.navigate_focus(focus, direction, tab) ? Clutter.EVENT_STOP : Clutter.EVENT_PROPAGATE;
  });
}
