import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import {labelled, ofType} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {call, subscribe} from '../lib/dbus.js';
import {click} from '../lib/input/input.js';
import {backendOf, PORTAL_PATH, portalDialog} from '../lib/access/portal.js';
import {settled} from '../lib/wait.js';

const {require, eventually} = checks('frontend');
const FRONTEND = 'org.freedesktop.portal.Desktop';
const MONITOR = 1;
const EMBEDDED_CURSOR = 2;
const MIRRORED = ['ScreenCast', 'RemoteDesktop', 'InputCapture', 'GlobalShortcuts', 'Settings', 'Notification', 'Screenshot',
  'Clipboard', 'Usb', 'DynamicLauncher'];

type Properties = Record<string, unknown> & {version: number};
type PortalResponse = [number, Record<string, unknown>];

const u = (value: number) => new GLib.Variant('u', value);
const s = (value: string) => new GLib.Variant('s', value);

async function properties(name: string, iface: string) {
  const reply = await call(name, PORTAL_PATH, 'org.freedesktop.DBus.Properties', 'GetAll', new GLib.Variant('(s)', [iface]), '(a{sv})');
  return reply.recursiveUnpack<[Properties]>()[0];
}

async function checkProperties() {
  for (const portal of MIRRORED) {
    const backend = await properties(backendOf(portal), `org.freedesktop.impl.portal.${portal}`);
    const frontend = await properties(FRONTEND, `org.freedesktop.portal.${portal}`);
    require(backend.version > 0 && Object.keys(backend).every(key => JSON.stringify(frontend[key]) === JSON.stringify(backend[key])),
      `apps see everything ${portal} offers from the moment the session starts`);
  }
}

function requestPath(token: string) {
  const sender = Gio.DBus.session.get_unique_name()!.slice(1).replaceAll('.', '_');
  return `/org/freedesktop/portal/desktop/request/${sender}/${token}`;
}

let requests = 0;

function request(method: string, parameters: [string, unknown][], options: Record<string, GLib.Variant>) {
  const token = `frontend${++requests}`;
  return new Promise<{response: number; results: Record<string, unknown>}>((resolve, reject) => {
    const unsubscribe = subscribe<PortalResponse>({iface: 'org.freedesktop.portal.Request', member: 'Response', path: requestPath(token)},
      (_signal, [response, results]) => {
        unsubscribe();
        resolve({response, results});
      });
    const signature = `(${parameters.map(([type]) => type).join('')}a{sv})`;
    const values = [...parameters.map(([, value]) => value), {...options, handle_token: s(token)}];
    call(FRONTEND, PORTAL_PATH, 'org.freedesktop.portal.ScreenCast', method, new GLib.Variant(signature, values), '(o)').catch((error: unknown) => {
      unsubscribe();
      reject(error);
    });
  });
}

async function checkScreenCast() {
  const created = await request('CreateSession', [], {session_handle_token: s('frontend')});
  require(created.response === 0, 'apps can start sharing the screen through the portal');
  const session = created.results.session_handle;
  const selected = await request('SelectSources', [['o', session]], {types: u(MONITOR), cursor_mode: u(EMBEDDED_CURSOR)});
  require(selected.response === 0, 'apps that draw the pointer into the stream can pick a screen, like Discord does');
  const started = request('Start', [['o', session], ['s', '']], {});
  await eventually(() => portalDialog(), 'the portal asks which screen to share');
  await settled();
  click(ofType(labelled('Cancel', ofType(portalDialog(), St.Widget)), Clutter.Actor));
  require((await started).response !== 0, 'cancelling the picker tells the app nothing was shared');
}

export async function run() {
  await checkProperties();
  await checkScreenCast();
}
