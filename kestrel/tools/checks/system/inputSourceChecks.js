import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const LAYOUTS = new GLib.Variant('a(ss)', [['xkb', 'us'], ['xkb', 'de']]);

export async function checkInputSources({pause, capture, actorNamed, pointer, keyboard, output}) {
  const require = (condition, label) => {
    if (!condition) throw new Error(`Kestrel input source check failed: ${label}`);
    console.log(`Kestrel input source check: ${label}`);
  };
  const click = async actor => {
    const [x, y] = actor.get_transformed_position();
    pointer.notify_absolute_motion(GLib.get_monotonic_time(), x + actor.width / 2, y + actor.height / 2);
    pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.PRESSED);
    pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.RELEASED);
    await pause(300);
  };
  const key = (symbol, state) => keyboard.notify_keyval(GLib.get_monotonic_time(), symbol, state);
  const descendants = actor => [actor, ...actor.get_children().flatMap(descendants)];
  const checked = row => descendants(row).some(child => child.icon_name === 'object-select-symbolic');

  const settings = new Gio.Settings({schema_id: 'org.gnome.desktop.input-sources'});
  const saved = {sources: settings.get_value('sources'), mru: settings.get_value('mru-sources')};
  const indicator = actorNamed(global.stage, 'kestrel-input-source');
  const menu = actorNamed(global.stage, 'kestrel-context-menu');
  try {
    settings.set_value('mru-sources', LAYOUTS);
    settings.set_value('sources', LAYOUTS);
    await pause(400);
    require(indicator.visible && indicator.child.text === 'EN', 'two layouts show the current one in the panel');
    await capture(`${output}/input-source.png`);

    key(Clutter.KEY_Super_L, Clutter.KeyState.PRESSED);
    key(Clutter.KEY_space, Clutter.KeyState.PRESSED);
    key(Clutter.KEY_space, Clutter.KeyState.RELEASED);
    await pause(400);
    await capture(`${output}/input-source-switcher.png`);
    key(Clutter.KEY_Super_L, Clutter.KeyState.RELEASED);
    await pause(300);
    require(indicator.child.text === 'DE', 'Super+Space switches and the panel follows');

    await click(indicator);
    const english = actorNamed(menu, 'English (US)');
    const german = actorNamed(menu, 'German');
    require(menu.visible && english && german && actorNamed(menu, 'Keyboard settings'), 'the menu lists input sources and keyboard settings');
    require(checked(german) && !checked(english), 'the menu marks the current input source');
    await capture(`${output}/input-source-menu.png`);
    await click(english);
    require(!menu.visible && indicator.child.text === 'EN', 'choosing an input source switches to it');

    const workspace = global.workspace_manager.get_active_workspace_index();
    const [x, y] = indicator.get_transformed_position();
    pointer.notify_absolute_motion(GLib.get_monotonic_time(), x + indicator.width / 2, y + indicator.height / 2);
    pointer.notify_discrete_scroll(GLib.get_monotonic_time(), Clutter.ScrollDirection.DOWN, Clutter.ScrollSource.WHEEL);
    await pause(300);
    require(indicator.child.text === 'DE' && global.workspace_manager.get_active_workspace_index() === workspace,
      'scrolling over the indicator cycles input sources instead of workspaces');
  } finally {
    settings.set_value('sources', saved.sources);
    settings.set_value('mru-sources', saved.mru);
    pointer.notify_absolute_motion(GLib.get_monotonic_time(), 20, 20);
  }
  await pause(400);
}
