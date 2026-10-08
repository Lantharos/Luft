import {changes, followLink} from '../lib/apps.js';

export async function show(app, page, label = `settings shows ${page} from a kestrel-settings link`, area = null) {
  await changes(app, label, () => followLink('settings', `kestrel-settings:${page}`), area);
  return app.settle(() => true);
}
