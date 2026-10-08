import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import St from 'gi://St';
import {toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {descendants, named, shown} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {press} from '../lib/input.js';
import {gjs, stop} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';

const {eventually} = checks('overlay');
const COPIED = ['https://lantharos.dev/kestrel', 'Meet at the harbour at seven, the table is under Imeri.'];

async function checkMediaControls() {
  const player = gjs('clients/mediaPlayer.js');
  toggleSurface('notifications');
  const card = named('kestrel-notifications').get_first_child();
  await eventually(() => shown(card) && named('Pause', card), 'media controls appear for a playing app');
  await capture('media-controls');
  named('Pause', card).emit('clicked', Clutter.BUTTON_PRIMARY);
  await eventually(() => named('Play', card), 'media controls toggle playback');
  toggleSurface('notifications');
  await stop(player);
}

async function checkVolumeOsd() {
  const [osd] = Main.osdWindowManager._osdWindows;
  Main.osdWindowManager.showAll(new Gio.ThemedIcon({name: 'audio-volume-high-symbolic'}), null, 0.6, 1);
  await eventually(() => osd.visible && osd.opacity === 255, 'the volume level shows on screen');
  await capture('volume-osd');
  Main.osdWindowManager.hideAll();
  await eventually(() => !osd.visible, 'the volume level hides again');
}

async function checkScreenshotTool() {
  toggleSurface('quick');
  const quick = named('kestrel-quick-settings');
  await eventually(() => shown(quick), 'Quick Settings opens');
  named('Screenshot', quick).emit('clicked', Clutter.BUTTON_PRIMARY);
  await eventually(() => Main.screenshotUI.visible && !quick.visible, 'Quick Settings opens the screenshot tool without itself in view');
  await capture('screenshot-controls');
  Main.screenshotUI.close(true);
  await eventually(() => !Main.screenshotUI.visible && Main.modalCount === 0, 'the screenshot tool closes');
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
  await checkVolumeOsd();
  await checkScreenshotTool();
  await checkClipboardHistory();
}
