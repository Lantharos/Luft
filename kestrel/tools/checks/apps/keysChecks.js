import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import * as IBusManager from 'resource:///org/gnome/shell/misc/ibusManager.js';
import * as KeyboardManager from 'resource:///org/gnome/shell/misc/keyboardManager.js';

import {prepareHome} from './home.js';
import {LuftApp, sleep, startSabineService, waitFor} from './luftApp.js';

const KEY_A = 30;
const KEY_E = 18;
const KEY_APOSTROPHE = 40;
const SAVED = 5000;
const IBUS_RESTART = 30000;
const METHOD = `name = "Pinyin lite"
label = "拼"
language = "zh"
candidates = 9
learn = true

rules = [
  { keys = "a'", text = "á" },
]

words = [
  { keys = "ni", text = "你" },
  { keys = "ni", text = "尼" },
  { keys = "hao", text = "好" },
  { keys = "nihao", text = "你好" },
]
`;

const read = path => new TextDecoder().decode(GLib.file_get_contents(path)[1]);
const exists = path => GLib.file_test(path, GLib.FileTest.EXISTS);

const config = (...parts) => GLib.build_filenamev([GLib.get_user_config_dir(), ...parts]);
const RULES = config('xkb/rules/evdev.xml');

function userLayouts() {
  return exists(RULES) ? [...read(RULES).matchAll(/<name>([^<]+)<\/name>/g)].map(match => match[1]) : [];
}

function forget(layout, method) {
  if (layout) {
    GLib.unlink(config('xkb/symbols', layout));
    const blocks = read(RULES).replace(/ *<layout>[\s\S]*?<\/layout>\n/g, block => block.includes(`<name>${layout}</name>`) ? '' : block);
    GLib.file_set_contents(RULES, blocks);
  }
  GLib.unlink(config('keys/input-methods', `${method}.toml`));
  GLib.unlink(GLib.build_filenamev([GLib.get_user_state_dir(), 'keys/learned', `${method}.json`]));
  GLib.unlink(config('autostart', 'com.lantharos.keys.input-methods.desktop'));
}

const windows = () => global.get_window_actors().map(actor => actor.meta_window);

async function openEntry(...variables) {
  const before = new Set(windows());
  const launcher = new Gio.SubprocessLauncher({flags: Gio.SubprocessFlags.NONE});
  for (const [name, value] of variables) launcher.setenv(name, value, true);
  const process = launcher.spawnv(['gjs', '-m', GLib.getenv('KESTREL_WINDOW_SCRIPT'), '--entry']);
  const opened = () => windows().find(window => !before.has(window) && window.title?.startsWith('Kestrel window check'));
  await waitFor(opened, 8000, () => 'the test entry did not open');
  await sleep(600);
  return {process, window: opened()};
}

export async function checkKeys({pause, capture, keyboard, output}) {
  const require = (condition, label) => {
    if (!condition) throw new Error(`Kestrel Keys check failed: ${label}`);
    console.log(`Kestrel Keys check: ${label}`);
  };
  const key = code => {
    keyboard.notify_key(GLib.get_monotonic_time(), code, Clutter.KeyState.PRESSED);
    keyboard.notify_key(GLib.get_monotonic_time(), code, Clutter.KeyState.RELEASED);
  };
  const type = text => [...text].forEach(character => {
    keyboard.notify_keyval(GLib.get_monotonic_time(), character.codePointAt(0), Clutter.KeyState.PRESSED);
    keyboard.notify_keyval(GLib.get_monotonic_time(), character.codePointAt(0), Clutter.KeyState.RELEASED);
  });
  const keyval = symbol => {
    keyboard.notify_keyval(GLib.get_monotonic_time(), symbol, Clutter.KeyState.PRESSED);
    keyboard.notify_keyval(GLib.get_monotonic_time(), symbol, Clutter.KeyState.RELEASED);
  };
  const pick = async search => {
    keyval(Clutter.KEY_Return);
    await pause(500);
    type(search);
    await pause(400);
    keyval(Clutter.KEY_Return);
  };
  const styles = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  const inputSources = new Gio.Settings({schema_id: 'org.gnome.desktop.input-sources'});
  const saved = {sources: inputSources.get_value('sources'), mru: inputSources.get_value('mru-sources'), scheme: styles.get_string('color-scheme')};
  const useSources = sources => {
    const value = new GLib.Variant('a(ss)', sources);
    inputSources.set_value('mru-sources', value);
    inputSources.set_value('sources', value);
  };
  const shoot = async (app, name) => {
    styles.set_string('color-scheme', 'prefer-dark');
    await sleep(900);
    (await app.frame()).save(`${output}/${name}-dark.png`);
    styles.set_string('color-scheme', 'prefer-light');
    await sleep(900);
    (await app.frame()).save(`${output}/${name}-light.png`);
    styles.set_string('color-scheme', 'prefer-dark');
  };
  const reached = async (condition, label, timeout = 3000) => {
    await waitFor(condition, timeout, () => `Kestrel Keys check failed: ${label}`);
    console.log(`Kestrel Keys check: ${label}`);
  };
  const typeInto = async (window, act, expected, label) => {
    window.activate(global.get_current_time());
    await pause(300);
    act();
    await reached(() => window.title === `Kestrel entry: ${expected}`, label);
  };

  const service = await startSabineService();
  const engine = 'keys:pinyin-lite';
  let id = null;
  try {
    styles.set_string('color-scheme', 'prefer-dark');
    const existing = userLayouts();
    const created = () => userLayouts().find(layout => !existing.includes(layout));
    const keys = new LuftApp('keys', ['kestrel-keys:layout/new?from=us%2Bintl']);
    try {
      await keys.open();
      await sleep(2500);
      keyval(Clutter.KEY_Return);
      await waitFor(created, SAVED, () => 'Keys did not create the layout');
      id = created();
      const symbols = GLib.build_filenamev([GLib.get_user_config_dir(), 'xkb/symbols', id]);
      require(exists(symbols) && read(symbols).includes('include "us(intl)"'), `a new layout starts from an existing one and is written to ~/.config/xkb as ${id}`);
      await sleep(1500);
      key(KEY_A);
      await pause(300);
      await pick('small a with ring above');
      await reached(() => read(symbols).includes('replace key <AC01> { type[Group1] = "FOUR_LEVEL", [ aring,'), 'pressing a key picks it and a character found by name is assigned to it', SAVED);
      await shoot(keys, 'keys-layout');

      useSources([['xkb', id]]);
      await reached(() => KeyboardManager.getKeyboardManager().currentLayout?.id === id, 'the custom layout is an input source Kestrel can switch to');

      const wayland = await openEntry();
      try {
        const {window} = wayland;
        await typeInto(window, () => key(KEY_A), 'å', 'a GTK app types the character assigned in Keys');
        await typeInto(window, () => {
          key(KEY_APOSTROPHE);
          key(KEY_E);
        }, 'åé', 'dead keys from the base layout keep working');

        keys.window.activate(global.get_current_time());
        await pause(300);
        await pick('dotless i');
        await reached(() => read(symbols).includes('[ idotless,'), 'a second change is saved too', SAVED);
        await pause(800);
        await typeInto(window, () => key(KEY_A), 'åéı', 'changing the layout in Keys switches the running keymap live');
      } finally {
        wayland.process.force_exit();
      }
      await pause(400);

      const x11 = await openEntry(['GDK_BACKEND', 'x11']);
      try {
        require(x11.window.get_client_type() === Meta.WindowClientType.X11, 'the second entry runs under Xwayland');
        await typeInto(x11.window, () => key(KEY_A), 'ı', 'X11 apps under Xwayland get the custom layout too');
      } finally {
        x11.process.force_exit();
      }
    } finally {
      await keys.close();
    }

    const file = GLib.build_filenamev([prepareHome(), 'Documents', 'Pinyin lite.toml']);
    GLib.file_set_contents(file, METHOD);
    const methods = new LuftApp('keys', [file]);
    try {
      await methods.open();
      await reached(() => IBusManager.getIBusManager().getEngineDesc(engine), 'an imported input method is registered with IBus without logging out', IBUS_RESTART);
      await shoot(methods, 'keys-method');

      useSources([['xkb', 'us']]);
      await pause(600);
      useSources([['ibus', engine], ['xkb', 'us']]);
      await pause(1500);
      const entry = await openEntry();
      try {
        const {window} = entry;
        window.activate(global.get_current_time());
        await pause(600);
        type('ni');
        const popup = IBusManager.getIBusManager()._candidatePopup;
        await reached(() => popup.visible, 'typing a reading shows its words in Kestrel’s candidate popup');
        await pause(300);
        await capture(`${output}/keys-candidates.png`);
        await typeInto(window, () => type('2'), '尼', 'a number picks that candidate');
        await typeInto(window, () => type("a' "), '尼á', 'replacements turn a\' into á');
      } finally {
        entry.process.force_exit();
      }
    } finally {
      await methods.close();
    }

    useSources([['xkb', id], ['ibus', engine]]);
    const desktop = GLib.build_filenamev([GLib.get_user_data_dir(), 'applications', 'com.lantharos.keys.desktop']);
    GLib.mkdir_with_parents(GLib.path_get_dirname(desktop), 0o755);
    GLib.file_set_contents(desktop, '[Desktop Entry]\nType=Application\nName=Keys\nExec=true\n');
    const settings = new LuftApp('settings', ['kestrel-settings:keyboard']);
    try {
      await settings.open();
      await sleep(1500);
      await shoot(settings, 'settings-keyboard-keys');
    } finally {
      await settings.close();
      GLib.unlink(desktop);
    }
  } finally {
    forget(id, engine.slice('keys:'.length));
    inputSources.set_value('sources', saved.sources);
    inputSources.set_value('mru-sources', saved.mru);
    styles.set_string('color-scheme', saved.scheme);
    await service.stop();
  }
  await pause(400);
}
