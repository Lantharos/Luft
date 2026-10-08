import GLib from 'gi://GLib';

import {call} from '../../lib/dbus.js';
import {gjs} from '../../lib/processes.js';
import {waitUntil} from '../../lib/wait.js';

const READY = 'com.lantharos.KestrelChecks.SessionClient';

function readyClient() {
  return call('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus', 'GetConnectionUnixProcessID',
    new GLib.Variant('(s)', [READY]), '(u)').then(reply => reply.deepUnpack()[0], () => 0);
}

export async function startSessionClient(...flags) {
  const client = gjs('clients/sessionClient.js', flags);
  const pid = Number(client.get_identifier());
  await waitUntil(async () => await readyClient() === pid, 'the session client is ready', 10000);
  return client;
}
