import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {checks} from '../lib/check.js';
import {installBuilt, listed, request, setSetting, setting} from './lib/extensions.js';
import {exists, ORIGINAL_SETTINGS, page, placeApps, read, TAILOR, VESKTOP_SETTINGS, VESKTOP_THEME} from './lib/tailor.js';

const {eventually, require} = checks('Tailor');
const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});

async function followsTheDesktop() {
  const dark = /--kestrel-surface: (#[0-9a-f]{6});/.exec(read(VESKTOP_THEME))?.[1];
  interfaceSettings.set_string('color-scheme', interfaceSettings.get_string('color-scheme') === 'prefer-dark' ? 'prefer-light' : 'prefer-dark');
  await eventually(async () => !read(VESKTOP_THEME).includes(`--kestrel-surface: ${dark};`), 'the theme file follows the desktop’s style without restarting anything');
}

async function turnsOneOffExactly() {
  await setSetting(TAILOR, 'vesktop', new GLib.Variant('b', false));
  await eventually(async () => read(VESKTOP_SETTINGS) === ORIGINAL_SETTINGS && !exists(VESKTOP_THEME), 'turning Vesktop off gives back its settings byte for byte');
  await setSetting(TAILOR, 'vesktop', new GLib.Variant('b', true));
  await eventually(async () => exists(VESKTOP_THEME) && read(VESKTOP_SETTINGS).includes('luft.theme.css'), 'turning it back on dresses it again');
}

export async function run() {
  placeApps();
  const scheme = interfaceSettings.get_string('color-scheme');
  await installBuilt(TAILOR);
  try {
    await eventually(async () => (await listed(TAILOR))?.state === 'running', 'its helper starts');
    await eventually(async () => String(await setting(TAILOR, 'found')) === 'vesktop', 'it finds the apps on this computer');
    const shown = await page();
    require(shown.includes('vesktop') && !shown.includes('spotify'), 'its page speaks of what’s installed and of nothing else');
    await eventually(async () => exists(VESKTOP_THEME) && read(VESKTOP_SETTINGS).includes('luft.theme.css'), 'Vesktop gets the theme');
    await followsTheDesktop();
    await turnsOneOffExactly();
    await request('Disable', TAILOR);
    await eventually(async () => (await listed(TAILOR))?.state === 'off', 'it can be turned off');
    await eventually(() => read(VESKTOP_SETTINGS) === ORIGINAL_SETTINGS && !exists(VESKTOP_THEME), 'turning it off runs the helper once to put Vesktop back exactly');
  } finally {
    interfaceSettings.set_string('color-scheme', scheme);
    await request('Remove', TAILOR);
  }
}
