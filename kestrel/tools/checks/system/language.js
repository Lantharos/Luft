import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {formatsLocale, t} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {descendants} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';

const {require, eventually} = checks('language');
const ACCOUNTS = 'org.freedesktop.Accounts';

async function chooseLanguage(language) {
  const connection = Gio.DBus.system;
  const [path] = (await call(ACCOUNTS, '/org/freedesktop/Accounts', ACCOUNTS, 'FindUserByName',
    new GLib.Variant('(s)', [GLib.get_user_name()]), '(o)', {connection})).deepUnpack();
  await call(ACCOUNTS, path, `${ACCOUNTS}.User`, 'SetLanguage', new GLib.Variant('(s)', [language]), null, {connection});
}

const weekday = () => new Intl.DateTimeFormat(formatsLocale(), {weekday: 'long'}).format(new Date(2026, 9, 18));

async function checkFormats() {
  const locale = new Gio.Settings({schema_id: 'org.gnome.system.locale'});
  require(locale.get_string('region') === '', 'formats follow the language');
  require(formatsLocale() === 'sr-RS' && weekday() === 'недеља', 'dates follow the new language');
  require(GLib.getenv('LC_TIME') === 'sr_RS.UTF-8', 'apps started from now on get dates in the new language');
  locale.set_string('region', 'sr_RS.UTF-8@latin');
  try {
    await eventually(() => weekday() === 'nedelja', 'dates switch to the chosen formats right away');
    require(GLib.getenv('LC_TIME') === 'sr_RS.UTF-8@latin', 'apps started from now on get the chosen formats');
  } finally {
    locale.reset('region');
  }
  await eventually(() => weekday() === 'недеља', 'dates follow the language again once the formats follow it');
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
  await checkFormats();

  await chooseLanguage('en_US.UTF-8');
  await eventually(() => quickSettings.accessible_name === english, 'switching back restores English');
  require(weekday() === 'Sunday' && GLib.getenv('LC_TIME') === 'en_US.UTF-8', 'dates follow English again');
}
