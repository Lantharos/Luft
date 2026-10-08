import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import {getInputSourceManager} from 'resource:///com/lantharos/kestrel/ui/status/keyboard.js';

import {named} from '../../lib/actors.js';
import {checks} from '../../lib/check.js';
import {click} from '../../lib/input.js';
import {changes, withApp} from '../lib/apps.js';
import {exists, read, write} from '../lib/files.js';
import {saveBothStyles} from '../lib/palette.js';
import {ENGINE} from './method.js';
import {focus, holdCode, releaseCode, useSources} from './typing.js';

const {require, eventually} = checks('Keys');
const KEY_RIGHTALT = 100;

function installKeysEntry() {
  const cache = GLib.get_user_cache_dir();
  const link = GLib.build_filenamev([cache, 'keys-link']);
  const recorder = GLib.build_filenamev([cache, 'keys-record']);
  const desktop = GLib.build_filenamev([GLib.get_user_data_dir(), 'applications', 'com.lantharos.keys.desktop']);
  write(recorder, `#!/bin/sh\nprintf %s "$1" > '${link}'\n`);
  GLib.chmod(recorder, 0o755);
  write(desktop, `[Desktop Entry]\nType=Application\nName=Keys\nExec=${recorder} %u\n`);
  return {
    link: () => exists(link) && read(link),
    remove: () => [link, recorder, desktop].forEach(path => GLib.unlink(path)),
  };
}

async function checkMenu(id) {
  const entry = installKeysEntry();
  try {
    const sources = getInputSourceManager();
    Object.values(sources.inputSources).find(source => source.id === ENGINE).activate(true);
    await eventually(() => sources.currentSource?.id === ENGINE, 'the input method is the current input source');
    await eventually(() => Shell.AppSystem.get_default().lookup_app('com.lantharos.keys.desktop')?.get_app_info().get_filename()?.startsWith(GLib.get_user_data_dir()),
      'Kestrel notices Keys');
    click(named('kestrel-input-source'));
    const menu = named('kestrel-context-menu');
    await eventually(() => menu.visible && named('Show keyboard layout', menu), 'the input source menu offers Show keyboard layout while Keys is installed');
    click(named('Show keyboard layout', menu));
    await eventually(entry.link, 'Show keyboard layout opens Keys');
    const link = entry.link();
    require(link === `kestrel-keys:view/${encodeURIComponent(id)}`, `an input method shows the layout underneath it (${link})`);
    return link;
  } finally {
    entry.remove();
  }
}

export async function checkShowLayout(palette, id) {
  await useSources([['xkb', id], ['ibus', ENGINE]]);
  await withApp('settings', ['kestrel-settings:keyboard'], async settings => {
    await settings.settle(() => true);
    await saveBothStyles(settings, palette, 'settings-keyboard-keys');
  });
  const link = await checkMenu(id);
  await withApp('keys', [link], keys => checkView(keys, palette));
}

async function checkView(keys, palette) {
  await keys.settle(() => true);
  await focus(keys.window);
  await changes(keys, 'holding AltGr shows the third level', () => holdCode(KEY_RIGHTALT));
  try {
    await saveBothStyles(keys, palette, 'keys-view');
  } finally {
    releaseCode(KEY_RIGHTALT);
  }
}
