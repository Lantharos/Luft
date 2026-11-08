import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {Main, MessageTray} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {withScheme} from '../apps/lib/palette.js';
import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';

const {require, eventually} = checks('remote login');
const TITLE = 'Signed in over SSH from 192.168.1.20';

const signIn = (account: string, address: string) =>
  call('com.lantharos.RemoteLogin1', '/com/lantharos/KestrelChecks/RemoteLogin', 'com.lantharos.KestrelChecks.RemoteLogin', 'SignIn',
    new GLib.Variant('(ss)', [account, address]), null, {connection: Gio.DBus.system});

const told = () => Main.messageTray.getSources().flatMap(source => source.notifications).find(notification => notification.title === TITLE);

async function captureCorners() {
  const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  kestrel.set_boolean('rounded-window-corners', false);
  try {
    await settled();
    await capture('remote-login-signed-in-square');
  } finally {
    kestrel.reset('rounded-window-corners');
  }
}

export async function run() {
  await signIn('mara', '192.168.1.20');
  const notification = await eventually(told, 'signing in over SSH shows a notification with the address');
  require(notification.body?.includes('mara'), 'the notification names the account that signed in');
  require(notification.urgency === MessageTray.Urgency.CRITICAL, 'the notification is urgent, so Do Not Disturb lets it through');
  require(notification.actions.map(action => action.label).join() === 'Settings', 'the notification leads to Settings');
  await capture('remote-login-signed-in-dark');
  await withScheme('light', async () => {
    await settled();
    await capture('remote-login-signed-in-light');
  });
  await captureCorners();
}
