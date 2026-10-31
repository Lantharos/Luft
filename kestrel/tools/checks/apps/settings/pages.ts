import Gio from 'gi://Gio';

import type {LuftApp} from '../../lib/apps/luftApp.js';
import {captureEdge} from '../../taskbar/taskbarOptions/taskbar.js';
import {settled} from '../../lib/wait.js';
import {useScheme, type Scheme} from '../lib/palette.js';
import {show} from './navigation.js';

const PAGES = ['bluetooth', 'network', 'network/ethernet', 'network/vpn', 'network/proxy', 'display', 'sound', 'power', 'input', 'input/shortcuts',
  'input/dictation', 'appearance', 'appearance/icons', 'appearance/text', 'appearance/fonts', 'appearance/cursor', 'appearance/wallpaper', 'taskbar', 'taskbar/start', 'taskbar/more', 'windows', 'notifications', 'accessibility', 'apps', 'privacy', 'security',
  'security/encryption', 'security/keyring', 'accounts', 'accounts/login', 'language', 'system', 'system/about'];

const SQUARE_PAGES = ['appearance', 'appearance/icons', 'taskbar', 'windows', 'network'];

async function visit(app: LuftApp, scheme: Scheme) {
  useScheme(scheme);
  await app.settle(() => true);
  for (const page of PAGES) (await show(app, page)).save(`settings-${page.replace('/', '-')}-${scheme}`);
}

async function visitSquare(app: LuftApp) {
  const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  kestrel.set_boolean('rounded-window-corners', false);
  try {
    await settled();
    for (const page of SQUARE_PAGES) (await show(app, page)).save(`settings-${page.replace('/', '-')}-square`);
    await captureEdge('taskbar-square');
  } finally {
    kestrel.reset('rounded-window-corners');
  }
}

export async function checkPages(app: LuftApp) {
  await visit(app, 'light');
  await visit(app, 'dark');
  await visitSquare(app);
}
