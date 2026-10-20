import GLib from 'gi://GLib';
import {standInBus, t} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';

import {descendants} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';

const {require, eventually} = checks('language');
const ACCOUNTS = 'org.freedesktop.Accounts';

async function chooseLanguage(language) {
  const connection = standInBus();
  const [path] = (await call(ACCOUNTS, '/org/freedesktop/Accounts', ACCOUNTS, 'FindUserByName',
    new GLib.Variant('(s)', [GLib.get_user_name()]), '(o)', {connection})).deepUnpack();
  await call(ACCOUNTS, path, `${ACCOUNTS}.User`, 'SetLanguage', new GLib.Variant('(s)', [language]), null, {connection});
}

export async function run() {
  const english = t('taskbar-quick-settings');
  const quickSettings = descendants(global.stage).find(actor => actor.accessible_name === english);
  require(quickSettings, 'the taskbar starts in English');

  await chooseLanguage('sr_RS.UTF-8');
  await eventually(() => t('taskbar-quick-settings') !== english, 'Kestrel switches to the account’s new language');
  require(quickSettings.accessible_name === t('taskbar-quick-settings'), 'the taskbar follows the new language without restarting');
  require(GLib.getenv('LANGUAGE') === 'sr_RS', 'apps started from now on get the new language');
  await settled();
  await capture('language-serbian');

  await chooseLanguage('en_US.UTF-8');
  await eventually(() => quickSettings.accessible_name === english, 'switching back restores English');
}
