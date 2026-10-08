import {useScheme} from '../lib/palette.js';
import {show} from './navigation.js';

const PAGES = ['bluetooth', 'display', 'sound', 'power', 'appearance', 'appearance/fonts', 'appearance/taskbar', 'notifications', 'keyboard', 'mouse',
  'accessibility', 'apps', 'privacy', 'security', 'datetime', 'users', 'login', 'updates', 'about'];

async function visit(app, scheme) {
  useScheme(scheme);
  await app.settle(() => true);
  for (const page of PAGES) (await show(app, page)).save(`settings-${page.replace('/', '-')}-${scheme}`);
}

export async function checkPages(app) {
  await visit(app, 'light');
  await visit(app, 'dark');
}
