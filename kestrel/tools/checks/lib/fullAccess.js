import GLib from 'gi://GLib';

import {waitUntil} from './wait.js';

const TRUSTED_APPS = GLib.getenv('KESTREL_TRUSTED_APPS');

const trusted = appId => global.context.is_app_trusted(appId);

export async function withFullAccess(appId, body) {
  GLib.file_set_contents(TRUSTED_APPS, `${appId}\n`);
  await waitUntil(() => trusted(appId), `${appId} gets full access`);
  try {
    await body();
  } finally {
    GLib.file_set_contents(TRUSTED_APPS, '');
    await waitUntil(() => !trusted(appId), `${appId} loses full access`);
  }
}
