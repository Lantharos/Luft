import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

const SETTLE = 700;
const EDGE_MARGIN = 12;
const SURFACE_GAP = 10;

const actorNamed = (actor, name) => actor.name === name || actor.accessible_name === name
  ? actor : actor.get_children().reduce((found, child) => found ?? actorNamed(child, name), null);

export async function checkBoardCorner({board, named, windows, pointer, keyboard, pause, capture, output, require}) {
  const time = () => GLib.get_monotonic_time();
  const start = actorNamed(Main.layoutManager.uiGroup, 'kestrel-start');
  const corner = actorNamed(Main.layoutManager.uiGroup, 'kestrel-board-corner');
  const monitor = Main.layoutManager.primaryMonitor;
  const press = async button => {
    const [x, y] = button.get_transformed_position();
    pointer.notify_absolute_motion(time(), Math.round(x + button.width / 2), Math.round(y + button.height / 2));
    await pause(120);
    pointer.notify_button(time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.PRESSED);
    pointer.notify_button(time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.RELEASED);
    await pause(SETTLE);
  };
  const escape = async () => {
    keyboard.notify_keyval(time(), Clutter.KEY_Escape, Clutter.KeyState.PRESSED);
    keyboard.notify_keyval(time(), Clutter.KEY_Escape, Clutter.KeyState.RELEASED);
    await pause(SETTLE);
  };
  const startInCorner = () => {
    const [, cornerY] = corner.get_transformed_position();
    return start.visible && start.translation_y === 0 &&
      Math.round(start.x + start.width) === monitor.x + monitor.width - EDGE_MARGIN &&
      Math.round(start.y + start.height) === Math.round(cornerY) - SURFACE_GAP;
  };

  board.fitAll();
  await pause(SETTLE);
  require(corner.visible, 'the corner shows Start, this desktop\'s apps and the status pill on a board');
  const tracker = Shell.WindowTracker.get_default();
  const apps = new Set(windows().map(window => tracker.get_window_app(window)));
  const dock = actorNamed(corner, 'kestrel-board-dock');
  const buttons = dock.get_child_at_index(1).get_children();
  require(buttons.length === apps.size, `the corner lists the ${apps.size} apps open on this desktop`);

  await press(actorNamed(dock, 'Open Start'));
  require(startInCorner(), 'the Start button in the corner opens Start right above it');
  await capture(`${output}/board-start.png`);
  await escape();
  require(!start.visible, 'Escape closes Start on the board');

  await pause(400);
  global.display.emit('overlay-key');
  await pause(SETTLE);
  require(startInCorner(), 'pressing Super once on a board opens Start in the corner');
  await escape();
  await pause(400);

  const files = named('Files');
  const ordered = [...new Set(windows().sort((a, b) => a.get_stable_sequence() - b.get_stable_sequence()).map(window => tracker.get_window_app(window)))];
  const filesButton = buttons[ordered.indexOf(tracker.get_window_app(files))];
  await press(filesButton);
  require(board.enteredWindow() === files && global.display.focus_window === files, 'an app in the corner enters its window');
  await capture(`${output}/board-corner.png`);
  await press(filesButton);
  require(!board.enteredWindow(), 'choosing the app of the entered window again steps back out');

  const view = {...board.camera.view};
  global.display.emit('overlay-key');
  await pause(120);
  global.display.emit('overlay-key');
  await pause(SETTLE);
  require(!board.shown && !start.visible, 'pressing Super twice still leaves the board');
  global.display.emit('overlay-key');
  await pause(120);
  global.display.emit('overlay-key');
  await pause(SETTLE + 300);
  require(board.shown && JSON.stringify({...board.camera.view}) === JSON.stringify(view), 'and pressing it twice again comes back to the same view');
}
