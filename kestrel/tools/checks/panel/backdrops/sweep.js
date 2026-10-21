import Gio from 'gi://Gio';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {rest} from '../../lib/input/input.js';
import {captureFrame} from '../../lib/screenshots.js';
import {waitUntil} from '../../lib/wait.js';
import {WALLPAPERS} from './wallpapers.js';

const SCHEMES = [['dark', 'prefer-dark'], ['light', 'default']];
const LOOKS = [['glass', 'glass', false], ['solid', 'solid', false], ['transparent', 'transparent', false], ['accent', 'accent', false], ['black', 'glass', true]];
const PROBE = 4;
const WALLPAPER_TIMEOUT = 10000;

const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const background = new Gio.Settings({schema_id: 'org.gnome.desktop.background'});
const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});

async function showWallpaper(file) {
  const {x, y, width, height} = Main.layoutManager.primaryMonitor;
  const probe = {x: x + width / 2, y: y + height / 2, width: PROBE, height: PROBE};
  const before = await captureFrame(probe);
  background.set_string('picture-uri', file.get_uri());
  background.set_string('picture-uri-dark', file.get_uri());
  await waitUntil(async () => !(await captureFrame(probe)).same(before), `${file.get_basename()} becomes the wallpaper`, WALLPAPER_TIMEOUT);
}

export async function sweepBackdrops(visit) {
  const saved = {uri: background.get_string('picture-uri'), dark: background.get_string('picture-uri-dark'), scheme: interfaceSettings.get_string('color-scheme')};
  rest();
  try {
    for (const [slug, file] of WALLPAPERS) {
      await showWallpaper(file());
      for (const [scheme, colorScheme] of SCHEMES) {
        interfaceSettings.set_string('color-scheme', colorScheme);
        for (const [name, look, pureBlack] of LOOKS) {
          if (pureBlack && scheme === 'light') continue;
          settings.set_string('taskbar-look', look);
          settings.set_boolean('pure-black', pureBlack);
          await visit(`${slug}-${scheme}-${name}`, scheme);
        }
      }
    }
  } finally {
    for (const key of ['taskbar-look', 'pure-black']) settings.reset(key);
    background.set_string('picture-uri', saved.uri);
    background.set_string('picture-uri-dark', saved.dark);
    interfaceSettings.set_string('color-scheme', saved.scheme);
  }
}
