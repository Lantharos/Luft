import {checks} from '../../lib/check.js';
import {changes} from '../lib/apps.js';
import {useScheme} from '../lib/palette.js';
import {show} from '../settings/navigation.js';

const {require} = checks('Luft app');

export async function checkSettings(app, drive) {
  useScheme('light');
  (await show(app, 'accounts')).save('settings-accounts-light');
  useScheme('dark');
  (await app.settle(() => true)).save('settings-accounts-dark');
  await changes(app, 'the account opens its details', () => app.click([400, 150]));
  (await app.settle(() => true)).save('settings-accounts-details-dark');
  (await show(app, 'accounts/add', 'a kestrel-settings link opens adding an account')).save('settings-accounts-add-dark');
  require(drive.name === 'WebDAV', 'a new account is named after its service');
}
