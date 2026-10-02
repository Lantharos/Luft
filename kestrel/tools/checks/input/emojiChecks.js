import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const KEPT = 'Keep this on the clipboard';
const US_LAYOUT = new GLib.Variant('a(ss)', [['xkb', 'us']]);

export async function checkEmoji({pause, capture, actorNamed, keyboard, output}) {
  const require = (condition, label) => {
    if (!condition) throw new Error(`Kestrel emoji check failed: ${label}`);
    console.log(`Kestrel emoji check: ${label}`);
  };
  const press = (...symbols) => {
    for (const symbol of symbols) keyboard.notify_keyval(GLib.get_monotonic_time(), symbol, Clutter.KeyState.PRESSED);
    for (const symbol of symbols.reverse()) keyboard.notify_keyval(GLib.get_monotonic_time(), symbol, Clutter.KeyState.RELEASED);
  };
  const type = text => [...text].forEach(character => press(character.codePointAt(0)));
  const descendants = actor => [actor, ...actor.get_children().flatMap(descendants)];
  const panel = actorNamed(global.stage, 'kestrel-emoji');
  const cells = () => descendants(panel)
    .filter(actor => actor.has_style_class_name?.('kestrel-emoji-cell') && actor.visible)
    .sort((a, b) => a.y - b.y || a.x - b.x);
  const firstResult = () => cells()[0]?.accessible_name;
  const erase = text => [...text].forEach(() => press(Clutter.KEY_BackSpace));
  const footer = () => descendants(panel).find(actor => actor.has_style_class_name?.('kestrel-emoji-name'))?.text;
  const currentTab = () => descendants(panel).find(actor => actor.has_style_class_name?.('kestrel-emoji-category') && actor.has_style_pseudo_class('checked'));
  const readClipboard = () => new Promise(resolve => St.Clipboard.get_default().get_text(St.ClipboardType.CLIPBOARD, (_clipboard, text) => resolve(text)));
  const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  const openFromKeyboard = async symbol => {
    const pressed = GLib.get_monotonic_time();
    let painted = 0;
    const paint = global.stage.connect('after-paint', () => {
      painted ||= GLib.get_monotonic_time();
    });
    press(Clutter.KEY_Super_L, symbol);
    await pause(400);
    global.stage.disconnect(paint);
    return (painted - pressed) / 1000;
  };
  const waitFor = async condition => {
    for (let waited = 0; !condition() && waited < 5000; waited += 100) await pause(100);
  };
  const launch = (...variables) => {
    const launcher = new Gio.SubprocessLauncher({flags: Gio.SubprocessFlags.NONE});
    for (const [name, value] of variables) launcher.setenv(name, value, true);
    return launcher.spawnv(['gjs', '-m', GLib.getenv('KESTREL_WINDOW_SCRIPT'), '--entry']);
  };

  const inputSources = new Gio.Settings({schema_id: 'org.gnome.desktop.input-sources'});
  const savedSources = {sources: inputSources.get_value('sources'), mru: inputSources.get_value('mru-sources')};
  inputSources.set_value('mru-sources', US_LAYOUT);
  inputSources.set_value('sources', US_LAYOUT);
  try {
    settings.reset('emoji-recent');
    settings.reset('emoji-skin-tone');
    await pause(400);
    const app = launch();
    try {
      await pause(1200);
      const window = global.display.focus_window;
      const caret = Main.inputMethod.caret;
      const openMs = await openFromKeyboard(Clutter.KEY_period);
      require(panel.visible && !Main.inputMethod.hasPreedit(), 'Super+. opens the emoji panel instead of starting IBus emoji typing');
      require(Math.abs(panel.y - (caret.y + caret.height)) <= 12 && Math.abs(panel.x - caret.x) <= 12, 'the emoji panel opens just below the text cursor');
      require(!global.stage.get_key_focus() && window.has_focus(), 'the focused app keeps its keyboard focus while the panel is open');
      console.log(`Kestrel emoji open: ${openMs.toFixed(1)} ms to the first frame`);
      await capture(`${output}/emoji-picker.png`);

      type('party');
      await pause(250);
      require(firstResult() === 'party popper', 'searching for party finds 🎉 first');
      await capture(`${output}/emoji-picker-search.png`);
      press(Clutter.KEY_Return);
      await pause(300);
      require(window.title === 'Kestrel entry: 🎉' && panel.visible, 'Enter inserts the emoji into the field and the panel stays open');

      type('tada');
      await pause(200);
      require(firstResult() === 'party popper', 'searching for tada finds 🎉 by its keyword');
      press(Clutter.KEY_Return);
      await pause(300);
      require(window.title === 'Kestrel entry: 🎉🎉', 'picking again inserts another emoji');
      require(settings.get_strv('emoji-recent')[0] === '🎉' && firstResult() === 'party popper', 'recently used emoji lead the panel');

      press(Clutter.KEY_Tab);
      press(Clutter.KEY_Return);
      await pause(350);
      await capture(`${output}/emoji-picker-skin-tone.png`);
      press(Clutter.KEY_Right);
      press(Clutter.KEY_Right);
      press(Clutter.KEY_Return);
      await pause(250);
      require(settings.get_string('emoji-skin-tone') === 'medium-light', 'the chosen skin tone is remembered');
      press(Clutter.KEY_Shift_L, Clutter.KEY_ISO_Left_Tab);
      type('waving hand');
      await pause(200);
      press(Clutter.KEY_Return);
      await pause(300);
      require(window.title === 'Kestrel entry: 🎉🎉👋🏼', 'people emoji are inserted with the chosen skin tone');
      press(Clutter.KEY_Right);
      press(Clutter.KEY_Return);
      await pause(300);
      require(window.title === 'Kestrel entry: 🎉🎉👋🏼🎉', 'arrow keys move between emoji while typing still searches');

      for (const [query, name] of [['em dash', 'em dash'], ['euro', 'euro sign'], ['alpha', 'greek small letter alpha'], ['e acute', 'latin small letter e with acute']]) {
        type(query);
        await pause(200);
        require(firstResult() === name, `searching for ${query} finds ${name} first`);
        erase(query);
      }
      type('copyright');
      await pause(200);
      require(cells().slice(0, 2).map(cell => cell.accessible_name).sort().join() === 'copyright,copyright sign', 'search results mix emoji and symbols');
      erase('copyright');
      type('degree');
      await pause(250);
      require(firstResult() === 'degree sign' && footer() === 'Degree sign · U+00B0', 'searching for degree finds ° first and shows its name and code point');
      await capture(`${output}/emoji-picker-symbol-search.png`);
      press(Clutter.KEY_Return);
      await pause(300);
      require(window.title === 'Kestrel entry: 🎉🎉👋🏼🎉°', 'Enter inserts a symbol into the field');

      press(Clutter.KEY_Tab);
      press(Clutter.KEY_Tab);
      for (let step = 0; step < 9; step++) press(Clutter.KEY_Right);
      press(Clutter.KEY_Return);
      await pause(500);
      require(currentTab()?.accessible_name === 'Common symbols', 'the symbol tabs are reachable from the keyboard');
      await capture(`${output}/emoji-picker-symbols.png`);
      press(Clutter.KEY_Down);
      await pause(100);
      require(footer() === 'Copyright sign · U+00A9', 'moving into the grid selects the first symbol of the tab');
      press(Clutter.KEY_Return);
      await pause(300);
      require(window.title === 'Kestrel entry: 🎉🎉👋🏼🎉°©', 'a symbol picked from its tab goes into the field');
      type('x');
      erase('x');
      await pause(200);
      require(settings.get_strv('emoji-recent').slice(0, 2).join() === '©,°' && firstResult() === 'copyright sign', 'picked symbols lead the recently used list');

      press(Clutter.KEY_Super_L, Clutter.KEY_period);
      await pause(300);
      require(!panel.visible, 'the shortcut closes the panel again while it is open');
      await openFromKeyboard(Clutter.KEY_period);
      press(Clutter.KEY_Escape);
      await pause(300);
      type('ok');
      await pause(300);
      require(!panel.visible && window.title === 'Kestrel entry: 🎉🎉👋🏼🎉°©ok', 'Escape closes the panel and typing reaches the app again');
    } finally {
      app.force_exit();
    }
    await pause(400);

    St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, KEPT);
    const x11App = launch(['GDK_BACKEND', 'x11'], ['GTK_IM_MODULE', 'ibus']);
    try {
      await waitFor(() => global.display.focus_window?.get_client_type() === Meta.WindowClientType.X11);
      await pause(300);
      const window = global.display.focus_window;
      const caret = Main.inputMethod.caret;
      await openFromKeyboard(Clutter.KEY_semicolon);
      require(panel.visible && panel.contains(global.stage.get_key_focus()), 'Super+; opens the panel for an X11 app, which has no text input support');
      require(!!caret && Math.abs(panel.y - (caret.y + caret.height)) <= 12 && Math.abs(panel.x - caret.x) <= 12, 'the panel opens just below the text cursor of an X11 app');
      type('rocket');
      await pause(200);
      press(Clutter.KEY_Return);
      await pause(900);
      require(!panel.visible && window.title === 'Kestrel entry: 🚀' && await readClipboard() === KEPT,
        'an X11 app gets the emoji pasted and the clipboard keeps its content');

      const picture = new Uint8Array(256 * 1024).map((_, index) => index * 31);
      St.Clipboard.get_default().set_content(St.ClipboardType.CLIPBOARD, 'image/png', new GLib.Bytes(picture));
      await openFromKeyboard(Clutter.KEY_semicolon);
      type('rocket');
      await pause(200);
      press(Clutter.KEY_Return);
      await pause(900);
      const kept = await new Promise(resolve => St.Clipboard.get_default().get_content(St.ClipboardType.CLIPBOARD, 'image/png', (_clipboard, bytes) => resolve(bytes?.toArray())));
      require(window.title === 'Kestrel entry: 🚀🚀' && kept?.length === picture.length && kept.every((value, index) => value === picture[index]),
        'a picture on the clipboard survives pasting an emoji into an X11 app');

      St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, KEPT);
      await openFromKeyboard(Clutter.KEY_semicolon);
      type('em dash');
      await pause(200);
      press(Clutter.KEY_Return);
      await pause(900);
      require(window.title === 'Kestrel entry: 🚀🚀—' && await readClipboard() === KEPT, 'an X11 app gets a symbol pasted and the clipboard keeps its content');
    } finally {
      x11App.force_exit();
    }
  } finally {
    settings.reset('emoji-skin-tone');
    inputSources.set_value('sources', savedSources.sources);
    inputSources.set_value('mru-sources', savedSources.mru);
  }
  await pause(400);
}
