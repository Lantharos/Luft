import type {LuftApp} from '../../lib/apps/luftApp.js';
import {useScheme, type Scheme} from '../lib/palette.js';
import {show} from './navigation.js';

const PAGES = ['bluetooth', 'network', 'network/ethernet', 'network/vpn', 'network/proxy', 'display', 'sound', 'power', 'input', 'input/shortcuts',
  'input/dictation', 'appearance', 'appearance/icons', 'appearance/text', 'appearance/fonts', 'appearance/cursor', 'appearance/wallpaper', 'taskbar', 'taskbar/start', 'taskbar/more', 'windows', 'notifications', 'accessibility', 'apps', 'privacy', 'security',
  'security/encryption', 'security/keyring', 'accounts', 'accounts/login', 'language', 'system', 'system/about'];

async function visit(app: LuftApp, scheme: Scheme) {
  useScheme(scheme);
  await app.settle(() => true);
  for (const page of PAGES) (await show(app, page)).save(`settings-${page.replace('/', '-')}-${scheme}`);
}

export async function checkPages(app: LuftApp) {
  await visit(app, 'light');
  await visit(app, 'dark');
}
