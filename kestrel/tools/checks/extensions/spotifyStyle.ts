import GLib from 'gi://GLib';

import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {installBuilt, listed, request} from './lib/extensions.js';

const {eventually} = checks('Spotify Style');
const STYLE = 'com.lantharos.SpotifyStyle';
const NAME = 'com.lantharos.Kestrel';
const PATH = '/com/lantharos/Kestrel/Extensions';
const IFACE = 'com.lantharos.Kestrel.Extensions';

async function page(): Promise<string> {
  const [json] = (await call(NAME, PATH, IFACE, 'Page', new GLib.Variant('(s)', [STYLE]), '(s)')).deepUnpack<[string]>();
  return json;
}

export async function run() {
  await installBuilt(STYLE);
  try {
    await eventually(async () => (await listed(STYLE))?.state === 'running', 'its helper starts');
    await eventually(async () => (await page()).includes('Try again'), 'its page says when Spotify can’t be styled yet, from what the helper reports');
    await request('Disable', STYLE);
    await eventually(async () => (await listed(STYLE))?.state === 'off', 'turning it off runs its helper once to undo its theme');
  } finally {
    await request('Remove', STYLE);
  }
}
