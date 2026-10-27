import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import St from 'gi://St';
import {toggleSurface, Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {descendants, named, shown, shownStyled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {moveTo, press, rest} from '../lib/input/input.js';
import {gjs, stop} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';

const {eventually} = checks('overlay');
const COPIED = ['https://lantharos.dev/kestrel', 'Meet at the harbour at seven, the table is under Lindqvist.'];

async function checkMediaControls() {
  const player = gjs('clients/apps/mediaPlayer.js');
  toggleSurface('notifications');
  const card = named('kestrel-notifications').get_first_child();
  await eventually(() => shown(card) && named('Pause', card), 'media controls appear for a playing app');
  await capture('media-controls');
  named('Pause', card).emit('clicked', Clutter.BUTTON_PRIMARY);
  await eventually(() => named('Play', card), 'media controls toggle playback');
  toggleSurface('notifications');
  await stop(player);
}

async function checkLevelOsd(name, icon, level) {
  const [osd] = Main.osdWindowManager._osdWindows;
  Main.osdWindowManager.showAll(new Gio.ThemedIcon({name: icon}), null, level, 1);
  await eventually(() => osd.visible && osd.opacity === 255, `the ${name} level shows on screen`);
  await capture(`${name}-osd`);
  Main.osdWindowManager.hideAll();
  await eventually(() => !osd.visible, `the ${name} level hides again`);
}

async function checkOsdReturnsWhileFading() {
  const [osd] = Main.osdWindowManager._osdWindows;
  const icon = new Gio.ThemedIcon({name: 'audio-volume-high-symbolic'});
  Main.osdWindowManager.showAll(icon, null, 0.5, 1);
  await eventually(() => osd.visible && osd.opacity === 255, 'the volume level shows on screen');
  Main.osdWindowManager.hideAll();
  await eventually(() => osd.visible && osd.opacity < 255, 'the volume level starts fading out');
  Main.osdWindowManager.showAll(icon, null, 0.6, 1);
  await eventually(() => osd.visible && osd.opacity === 255, 'a volume key pressed while the level fades out brings it back');
  Main.osdWindowManager.hideAll();
  await eventually(() => !osd.visible, 'the volume level hides again');
}

async function checkScreenKeyboard() {
  const settings = new Gio.Settings({schema_id: 'org.gnome.desktop.a11y.applications'});
  settings.set_boolean('screen-keyboard-enabled', true);
  try {
    Main.keyboard.open(global.display.get_primary_monitor());
    await eventually(() => Main.keyboard.visible && shown(Main.keyboard.keyboardActor), 'the on-screen keyboard opens');
    await capture('screen-keyboard');
    const key = descendants(Main.keyboard.keyboardActor).find(actor => actor.extendedKeys?.length && actor.mapped);
    key.showSubkeys();
    await eventually(() => shownStyled('keyboard-subkeys-boxpointer'), 'a key with extra characters shows them');
    await capture('screen-keyboard-subkeys');
    key.hideSubkeys();
    Main.keyboard.close();
    await eventually(() => !Main.keyboard.visible, 'the on-screen keyboard closes');
  } finally {
    settings.reset('screen-keyboard-enabled');
  }
}

async function checkScreenshotTool() {
  const shell = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  shell.set_strv('quick-tiles-removed', shell.get_strv('quick-tiles-removed').filter(id => id !== 'screenshot'));
  toggleSurface('quick');
  const quick = named('kestrel-quick-settings');
  await eventually(() => shown(quick) && named('Screenshot', quick), 'Quick Settings opens with the Screenshot tile added');
  named('Screenshot', quick).emit('clicked', Clutter.BUTTON_PRIMARY);
  await eventually(() => Main.screenshotUI.visible && !quick.visible, 'Quick Settings opens the screenshot tool without itself in view');
  await capture('screenshot-controls');
  const [button] = descendants(Main.screenshotUI).filter(actor => actor.has_style_class_name?.('screenshot-ui-type-button') && actor.mapped);
  const [x, y] = button.get_transformed_position();
  moveTo([x + button.width / 2, y + button.height / 2]);
  await eventually(() => shownStyled('screenshot-ui-tooltip')?.opacity === 255, 'pointing at a screenshot button shows its name');
  await capture('screenshot-tooltip');
  rest();
  Main.screenshotUI.close(true);
  await eventually(() => !Main.screenshotUI.visible && Main.modalCount === 0, 'the screenshot tool closes');
  shell.reset('quick-tiles-removed');
}

async function copy(clipboard, text) {
  clipboard.set_text(St.ClipboardType.CLIPBOARD, text);
  await new Promise(resolve => clipboard.get_text(St.ClipboardType.CLIPBOARD, resolve));
}

async function checkClipboardHistory() {
  const clipboard = St.Clipboard.get_default();
  for (const text of COPIED) await copy(clipboard, text);
  toggleSurface('clipboard');
  const panel = named('kestrel-clipboard');
  const rows = () => panel.get_first_child().child.get_children();
  const showing = (row, text) => descendants(row).some(actor => actor.text === text);
  await eventually(() => panel.visible && showing(rows()[0], COPIED[1]) && showing(rows()[1], COPIED[0]),
    'clipboard history lists copied text, newest first');
  press(Clutter.KEY_Escape);
  await eventually(() => !panel.visible, 'Escape closes clipboard history');
}

export async function run() {
  await checkMediaControls();
  await checkLevelOsd('volume', 'audio-volume-high-symbolic', 0.6);
  await checkLevelOsd('brightness', 'display-brightness-symbolic', 0.4);
  await checkOsdReturnsWhileFading();
  await checkScreenKeyboard();
  await checkScreenshotTool();
  await checkClipboardHistory();
}
