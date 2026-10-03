import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';
import {toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';

const PASTED = 'See you at the harbour';

export async function checkClipboardPlacement({pause, capture, actorNamed, keyboard, output}) {
  const require = (condition, label) => {
    if (!condition) throw new Error(`Kestrel clipboard check failed: ${label}`);
    console.log(`Kestrel clipboard check: ${label}`);
  };
  const key = symbol => {
    keyboard.notify_keyval(GLib.get_monotonic_time(), symbol, Clutter.KeyState.PRESSED);
    keyboard.notify_keyval(GLib.get_monotonic_time(), symbol, Clutter.KeyState.RELEASED);
  };
  const panel = actorNamed(global.stage, 'kestrel-clipboard');
  St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, PASTED);
  const app = Gio.Subprocess.new(['gjs', '-m', GLib.getenv('KESTREL_WINDOW_SCRIPT'), '--entry'], Gio.SubprocessFlags.NONE);
  try {
    await pause(1200);
    const window = global.display.focus_window;
    const caret = Main.inputMethod.caret;
    const frame = window?.get_frame_rect();
    require(!!caret && !!frame && caret.x >= frame.x && caret.y >= frame.y &&
      caret.x < frame.x + frame.width && caret.y < frame.y + frame.height, 'the text cursor of the focused field is known');

    toggleSurface('clipboard');
    await pause(400);
    require(panel.visible && Math.abs(panel.y - (caret.y + caret.height)) <= 12 && Math.abs(panel.x - caret.x) <= 12,
      'clipboard history opens just below the text cursor');
    await capture(`${output}/clipboard-history.png`);

    key(Clutter.KEY_Return);
    await pause(700);
    require(!panel.visible && window.title === `Kestrel entry: ${PASTED}`, 'Enter pastes the latest entry into the field');

    window.move_frame(true, frame.x, Main.layoutManager.primaryMonitor.height - frame.height + 120);
    await pause(500);
    const lowCaret = Main.inputMethod.caret;
    toggleSurface('clipboard');
    await pause(400);
    require(panel.visible && panel.y + panel.height <= lowCaret.y && lowCaret.y - (panel.y + panel.height) <= 12,
      'clipboard history opens above a text cursor near the bottom of the screen');
    key(Clutter.KEY_Escape);
    await pause(300);
  } finally {
    app.force_exit();
  }
  await pause(300);
}
