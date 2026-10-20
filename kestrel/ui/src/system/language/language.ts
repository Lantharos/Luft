import AccountsService from 'gi://AccountsService';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { chooseLanguage } from '../../shared/i18n/index.js';

const messagesLocale = (language: string) => language.replace(/\.[^@]*/, '');

function shareWithApps(language: string, ownsTheScreen: boolean): void {
  const value = messagesLocale(language);
  GLib.setenv('LANGUAGE', value, true);
  if (!ownsTheScreen) return;
  const assignment = `LANGUAGE=${value}`;
  Gio.DBus.session.call('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus', 'UpdateActivationEnvironment',
    new GLib.Variant('(a{ss})', [{ LANGUAGE: value }]), null, Gio.DBusCallFlags.NONE, -1, null, null);
  Gio.DBus.session.call('org.freedesktop.systemd1', '/org/freedesktop/systemd1', 'org.freedesktop.systemd1.Manager', 'SetEnvironment',
    new GLib.Variant('(as)', [[assignment]]), null, Gio.DBusCallFlags.NONE, -1, null, null);
}

export function followUserLanguage(ownsTheScreen: boolean): () => void {
  const user = AccountsService.UserManager.get_default().get_user(GLib.get_user_name());
  let applied = '';
  const apply = () => {
    const language = (user.is_loaded && user.get_language()) || '';
    if (!language || language === applied) return;
    applied = language;
    if (chooseLanguage(language)) shareWithApps(language, ownsTheScreen);
  };
  const signals = [user.connect('notify::is-loaded', apply), user.connect('changed', apply)];
  apply();
  return () => signals.forEach(id => user.disconnect(id));
}
