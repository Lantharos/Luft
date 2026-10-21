import AccountsService from 'gi://AccountsService';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type GObject from 'gi://GObject';

import { chooseLocale } from '../../shared/i18n/index.js';

const FORMATS = ['LC_TIME', 'LC_NUMERIC', 'LC_MONETARY', 'LC_MEASUREMENT', 'LC_PAPER'];

const messagesLocale = (language: string) => language.replace(/\.[^@]*/, '');

function environmentFor(language: string, region: string): Record<string, string> {
  const formats = region || language;
  return {
    LANGUAGE: messagesLocale(language),
    LANG: language,
    ...Object.fromEntries(FORMATS.map(name => [name, formats])),
  };
}

function shareWithApps(environment: Record<string, string>, ownsTheScreen: boolean): void {
  for (const [name, value] of Object.entries(environment)) GLib.setenv(name, value, true);
  if (!ownsTheScreen) return;
  const assignments = Object.entries(environment).map(([name, value]) => `${name}=${value}`);
  Gio.DBus.session.call('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus', 'UpdateActivationEnvironment',
    new GLib.Variant('(a{ss})', [environment]), null, Gio.DBusCallFlags.NONE, -1, null, null);
  Gio.DBus.session.call('org.freedesktop.systemd1', '/org/freedesktop/systemd1', 'org.freedesktop.systemd1.Manager', 'SetEnvironment',
    new GLib.Variant('(as)', [assignments]), null, Gio.DBusCallFlags.NONE, -1, null, null);
}

export function followUserLanguage(ownsTheScreen: boolean): () => void {
  const user = AccountsService.UserManager.get_default().get_user(GLib.get_user_name());
  const locale = new Gio.Settings({ schema_id: 'org.gnome.system.locale' });
  let applied = '';
  const apply = () => {
    const language = (user.is_loaded && user.get_language()) || '';
    const region = locale.get_string('region');
    if (`${language}|${region}` === applied) return;
    applied = `${language}|${region}`;
    chooseLocale(language, region);
    if (language) shareWithApps(environmentFor(language, region), ownsTheScreen);
  };
  const signals: [GObject.Object, number][] = [
    [user, user.connect('notify::is-loaded', apply)],
    [user, user.connect('changed', apply)],
    [locale, locale.connect('changed::region', apply)],
  ];
  apply();
  return () => signals.forEach(([object, id]) => object.disconnect(id));
}
