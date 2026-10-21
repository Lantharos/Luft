import {useScheme} from '../lib/palette.js';
import {show} from './navigation.js';

const PAGES = ['bluetooth', 'network', 'network/ethernet', 'network/vpn', 'network/proxy', 'display', 'sound', 'power', 'input', 'input/shortcuts',
  'input/dictation', 'appearance', 'appearance/fonts', 'desktop', 'notifications', 'accessibility', 'apps', 'privacy', 'security', 'security/protections',
  'security/encryption', 'security/keyring', 'accounts', 'accounts/login', 'language', 'system', 'system/about'];

async function visit(app, scheme) {
  useScheme(scheme);
  await app.settle(() => true);
  for (const page of PAGES) (await show(app, page)).save(`settings-${page.replace('/', '-')}-${scheme}`);
}

export async function checkPages(app) {
  await visit(app, 'light');
  await visit(app, 'dark');
}
