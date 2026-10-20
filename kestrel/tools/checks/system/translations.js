import {dismissImmediately, toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';

import {withApp} from '../apps/lib/apps.js';
import {show} from '../apps/settings/navigation.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';

const SURFACES = ['start', 'quick', 'notifications', 'emoji'];
const SETTINGS_PAGES = ['bluetooth', 'display', 'sound', 'power', 'appearance', 'appearance/taskbar', 'notifications', 'keyboard', 'mouse',
  'accessibility', 'apps', 'privacy', 'security', 'region', 'datetime', 'users', 'login', 'updates', 'about', 'network'];

export const timeout = 240000;

export async function run() {
  await capture('translations-desktop');
  for (const surface of SURFACES) {
    toggleSurface(surface);
    await settled();
    await capture(`translations-${surface}`);
    dismissImmediately();
    await settled();
  }
  await withApp('settings', [], async app => {
    for (const page of SETTINGS_PAGES) (await show(app, page)).save(`translations-settings-${page.replace('/', '-')}`);
  });
}
