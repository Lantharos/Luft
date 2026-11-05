import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {installBuilt, listed, request, setSetting, setting} from './lib/extensions.js';
import {exists, LIBRARY, ORIGINAL_SETTINGS, placeApps, read, STEAM, STEAM_STYLES, TAILOR, VESKTOP_SETTINGS, VESKTOP_THEME, write} from './lib/tailor.js';

const {eventually, require} = checks('Tailor');
const NAME = 'com.lantharos.Kestrel';
const PATH = '/com/lantharos/Kestrel/Extensions';
const IFACE = 'com.lantharos.Kestrel.Extensions';
const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});

async function page(): Promise<string> {
  const [json] = (await call(NAME, PATH, IFACE, 'Page', new GLib.Variant('(s)', [TAILOR]), '(s)')).deepUnpack<[string]>();
  return json;
}

async function followsTheDesktop() {
  const dark = /--kestrel-surface: (#[0-9a-f]{6});/.exec(read(VESKTOP_THEME))?.[1];
  interfaceSettings.set_string('color-scheme', interfaceSettings.get_string('color-scheme') === 'prefer-dark' ? 'prefer-light' : 'prefer-dark');
  await eventually(async () => !read(VESKTOP_THEME).includes(`--kestrel-surface: ${dark};`), 'the theme file follows the desktop’s style without restarting anything');
  await eventually(async () => !read(`${STEAM}/tailor/look.css`).includes(`--kestrel-surface: ${dark};`), 'Steam’s colors follow too, for the next time it opens');
}

async function coversSteamUpdates() {
  write(LIBRARY, 'button{color:#fff}\n'.repeat(90));
  await eventually(async () => read(LIBRARY).startsWith('/* Tailor */'), 'a Steam update is covered again by watching its folder');
  require(read(`${STEAM}/css/library.original.css`).startsWith('button{color:#fff}'), 'what the update brought is what’s kept');
  write(LIBRARY, STEAM_STYLES);
  await eventually(async () => read(`${STEAM}/css/library.original.css`) === STEAM_STYLES, 'and again, for the next test');
}

async function turnsOneOffExactly() {
  await setSetting(TAILOR, 'vesktop', new GLib.Variant('b', false));
  await eventually(async () => read(VESKTOP_SETTINGS) === ORIGINAL_SETTINGS && !exists(VESKTOP_THEME), 'turning Vesktop off gives back its settings byte for byte');
  require(read(LIBRARY).startsWith('/* Tailor */'), 'the other apps keep their look');
  await setSetting(TAILOR, 'vesktop', new GLib.Variant('b', true));
  await eventually(async () => exists(VESKTOP_THEME) && read(VESKTOP_SETTINGS).includes('luft.theme.css'), 'turning it back on dresses it again');
}

export async function run() {
  placeApps();
  const scheme = interfaceSettings.get_string('color-scheme');
  await installBuilt(TAILOR);
  try {
    await eventually(async () => (await listed(TAILOR))?.state === 'running', 'its helper starts');
    await eventually(async () => String(await setting(TAILOR, 'found')) === 'steam,vesktop', 'it finds the apps on this computer');
    const shown = await page();
    require(shown.includes('vesktop') && shown.includes('steam') && !shown.includes('spotify'), 'its page speaks of what’s installed and of nothing else');
    await eventually(async () => read(LIBRARY).startsWith('/* Tailor */'), 'Steam gets the theme');
    require(read(`${STEAM}/css/library.original.css`) === STEAM_STYLES, 'Steam’s own stylesheet is kept as it was');
    require(read(LIBRARY).length === STEAM_STYLES.length, 'and the file Steam checks keeps its size');
    await eventually(async () => exists(VESKTOP_THEME) && read(VESKTOP_SETTINGS).includes('luft.theme.css'), 'Vesktop gets the theme');
    await followsTheDesktop();
    await coversSteamUpdates();
    await turnsOneOffExactly();
    await request('Disable', TAILOR);
    await eventually(async () => (await listed(TAILOR))?.state === 'off', 'it can be turned off');
    await eventually(async () => read(LIBRARY) === STEAM_STYLES && !exists(`${STEAM}/tailor`) && !exists(`${STEAM}/css/library.original.css`), 'turning it off runs the helper once to put Steam back exactly');
    require(read(VESKTOP_SETTINGS) === ORIGINAL_SETTINGS && !exists(VESKTOP_THEME), 'and Vesktop');
  } finally {
    interfaceSettings.set_string('color-scheme', scheme);
    await request('Remove', TAILOR);
  }
}
