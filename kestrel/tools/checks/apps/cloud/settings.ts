import type {LuftApp} from '../../lib/apps/luftApp.js';
import {checks} from '../../lib/check.js';
import {changes} from '../lib/apps.js';
import {scrollToEnd, show} from '../settings/navigation.js';
import type {Drive} from './service.js';

const {require} = checks('Luft app');

export async function checkSettings(app: LuftApp, drive: Drive) {
  (await scrollToEnd(app, await show(app, 'accounts'))).save('settings-accounts-dark');
  await changes(app, 'the account opens its details', async () => app.click(await app.find({role: 'button', name: 'WebDAV'})));
  (await app.settle(() => true)).save('settings-accounts-details-dark');
  require(drive.name === 'WebDAV', 'a new account is named after its service');
}
