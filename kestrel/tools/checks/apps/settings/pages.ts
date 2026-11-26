import type {LuftApp} from '../../lib/apps/luftApp.js';
import {useScheme, type Scheme} from '../lib/palette.js';
import {show} from './navigation.js';

const PAGES = ['bluetooth', 'post', 'network', 'network/ethernet', 'network/vpn', 'network/firewall', 'network/proxy', 'display', 'sound', 'power', 'input', 'input/shortcuts',
  'input/dictation', 'appearance', 'appearance/icons', 'appearance/text', 'appearance/fonts', 'appearance/cursor', 'appearance/glass', 'appearance/wallpaper', 'taskbar', 'taskbar/gust', 'taskbar/more', 'windows', 'accessibility', 'apps', 'privacy', 'security',
  'security/encryption', 'security/keyring', 'security/remote-login', 'accounts', 'accounts/login', 'language', 'system', 'system/about'];

const DOCUMENTED_PAGES = ['appearance', 'security', 'sound', 'taskbar', 'windows'];

async function visit(app: LuftApp, scheme: Scheme, pages: string[]) {
  useScheme(scheme);
  await app.settle(() => true);
  for (const page of pages) (await show(app, page)).save(`settings-${page.replace('/', '-')}-${scheme}`);
}

export async function checkPages(app: LuftApp) {
  await visit(app, 'light', DOCUMENTED_PAGES);
  await visit(app, 'dark', PAGES);
}
