import Gio from 'gi://Gio';
import Meta from 'gi://Meta';

import {checks} from '../lib/check.js';
import {fixture, gjs, spawn, waitForWindows} from '../lib/processes.js';

const {require, eventually} = checks('variable refresh');
const STEAM = {SteamGameId: '480'};

function declaring(...args) {
  return spawn(['python3', fixture('clients', 'wayland', 'contentTypeClient.py'), ...args], {env: args.includes('steam') ? STEAM : {}});
}

export async function run() {
  declaring('game');
  declaring('video', 'steam');
  declaring('none', 'steam');
  declaring('none');
  gjs('clients/window.js');
  const [game, steamVideo, steamGame, plain, app] = await waitForWindows(['Kestrel content type: game', 'Kestrel content type: video steam',
    'Kestrel content type: none steam', 'Kestrel content type: none', 'Kestrel window check']);

  await eventually(() => game.get_content_type() === Meta.WindowContentType.GAME &&
    steamVideo.get_content_type() === Meta.WindowContentType.VIDEO &&
    plain.get_content_type() === Meta.WindowContentType.NONE, 'windows report the content type their client declares');
  await eventually(() => game.variable_refresh, 'a window that declares a game gets variable refresh');
  await eventually(() => steamGame.variable_refresh, 'a Steam game without a content type gets variable refresh');
  require(!steamVideo.variable_refresh, 'declared video keeps a fixed refresh rate even when launched as a game');
  require(!plain.variable_refresh && !app.variable_refresh, 'other apps keep a fixed refresh rate');

  const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  settings.set_string('variable-refresh', 'fullscreen');
  try {
    await eventually(() => plain.variable_refresh && app.variable_refresh, 'every fullscreen app gets variable refresh when chosen');
    require(!steamVideo.variable_refresh, 'declared video keeps a fixed refresh rate for every fullscreen app');
  } finally {
    settings.reset('variable-refresh');
  }
}
