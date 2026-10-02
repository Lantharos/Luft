import {LuftApp, sleep} from './luftApp.js';

const PAGES = ['bluetooth', 'display', 'sound', 'power', 'appearance', 'appearance/fonts', 'notifications', 'keyboard', 'mouse', 'apps',
  'privacy', 'security', 'datetime', 'users', 'login', 'updates', 'about'];
const LOADING = 600;

async function shown(app, condition) {
  await app.settle(condition);
  await sleep(LOADING);
  return app.settle(condition);
}

async function checkPage(page, home, {styles, require, output}) {
  styles.interface.set_string('color-scheme', 'prefer-dark');
  const app = new LuftApp('settings', [`kestrel-settings:${page}`]);
  const name = page.replace('/', '-');
  try {
    await app.open();
    const dark = await shown(app, frame => !frame.same(home));
    dark.save(`${output}/settings-${name}-dark.png`);
    require(!dark.same(home), `settings opens straight to ${page} from a kestrel-settings link`);

    styles.interface.set_string('color-scheme', 'prefer-light');
    const light = await shown(app, frame => !frame.same(dark));
    light.save(`${output}/settings-${name}-light.png`);
    require(!light.same(dark), `settings shows ${page} in the light style`);
  } finally {
    await app.close();
  }
}

export async function checkSettingsPages(home, context) {
  for (const page of PAGES) await checkPage(page, home, context);
}
