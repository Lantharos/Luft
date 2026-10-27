import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {call, property} from '../lib/dbus.js';
import {eventually, require} from './lib/driver.js';

const COLOR_SCHEMES: Record<string, number> = {'prefer-dark': 1, 'prefer-light': 2};

function readPortal<T>(key: string) {
  return call('org.freedesktop.portal.Desktop', '/org/freedesktop/portal/desktop', 'org.freedesktop.portal.Settings', 'ReadOne',
    new GLib.Variant('(ss)', ['org.freedesktop.appearance', key]), '(v)').then(reply => reply.recursiveUnpack<[T]>()[0]);
}

const hex = (channels: number[]) => `#${channels.map(channel => Math.round(channel * 255).toString(16).padStart(2, '0')).join('')}`;

export async function checkAppearance() {
  let accent = '';
  await eventually(async () => {
    accent = await property<string>('com.lantharos.Kestrel', '/com/lantharos/Kestrel/Appearance', 'com.lantharos.Kestrel.Appearance', 'AccentColor')
      .catch(() => '');
    return accent !== '';
  }, 'setup mode gives apps Luft’s palette from the wallpaper');
  const scheme = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'}).get_string('color-scheme');
  require(await readPortal<number>('color-scheme') === (COLOR_SCHEMES[scheme] ?? 0), 'apps in setup mode get Luft’s color scheme through the portal');
  require(hex(await readPortal<number[]>('accent-color')) === accent.toLowerCase(), 'apps in setup mode get Luft’s accent color through the portal');
}
