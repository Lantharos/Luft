import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import Soup from 'gi://Soup?version=3.0';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {ScratchKeyring} from '../../fixtures/services/secretService.js';
import {shown, showsText, styled} from '../lib/actors.js';
import {freePorts} from '../lib/apps/ports.js';
import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {intoSpeakers, speakersIntoLevels} from '../lib/audio/routing.js';
import {spawn, stop} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {pause} from '../lib/wait.js';
import {lock, unlock} from '../lockScreen/lib/shield.js';
import {install, request, rewrite, userFolder} from './lib/extensions.js';

const {require, eventually} = checks('quiet extension API');
const QUIET = 'com.example.Quiet';
const CALL_SETTLES_MS = 3000;
const LISTENING_MS = 500;
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});

interface Held {app: string; count: number}
interface Quiet {
  calls: number;
  held: number;
  inCall(): boolean;
  hold(): void;
  heldNow(): Held[];
  release(): Held[];
  end(): void;
  holding(): boolean;
  notify(title: string): void;
  loop(): {stop(fade?: number): void};
  keep(): {dispose(): void};
  fetch(url: string, options?: object): Promise<{status: number; ok: boolean; text: string; headers: Record<string, string>; json(): unknown}>;
  secrets: {get(key: string): Promise<string | null>; set(key: string, secret: string): Promise<void>; delete(key: string): Promise<void>};
}

const quiet = () => (globalThis as {quiet?: Quiet}).quiet!;
const banners = () => styled('notification-banner', Main.uiGroup).filter(shown);
const bannerSays = (title: string) => banners().some(banner => showsText(title, banner));

async function notify(app: string, title: string) {
  await call('org.gnome.Shell', '/org/freedesktop/Notifications', 'org.freedesktop.Notifications', 'Notify',
    new GLib.Variant('(susssasa{sv}i)', [app, 0, '', title, 'Just checking in.', [], {}, -1]), '(u)');
}

function clearNotifications() {
  for (const source of Main.messageTray.getSources())
    for (const notification of [...source.notifications]) notification.destroy();
}

async function checkCalls() {
  require(!quiet().inCall(), 'nothing is in a call at first');
  const recorder = spawn(['parecord', '--device=microphone', '/dev/null']);
  try {
    await eventually(() => quiet().inCall() && quiet().calls === 1, 'an app recording from the microphone starts a call');
  } finally {
    await stop(recorder);
  }
  await pause(CALL_SETTLES_MS / 2);
  require(quiet().inCall(), 'the call lasts a moment after the microphone is let go');
  await eventually(() => !quiet().inCall() && quiet().calls === 2, 'and then ends', CALL_SETTLES_MS * 2);
}

async function checkHolding() {
  clearNotifications();
  quiet().hold();
  require(quiet().holding(), 'a hold holds notifications back');
  await notify('Chatter', 'Noor wrote');
  await notify('Chatter', 'Sam wrote');
  await notify('Weather', 'Rain later');
  await eventually(() => quiet().held === 3, 'other apps’ notifications are held');
  await pause(500);
  require(!banners().length, 'without banners');
  const held = quiet().heldNow();
  require(held[0].app === 'Chatter' && held[0].count === 2 && held[1].app === 'Weather', `it learns which apps sent how many (${JSON.stringify(held)})`);
  require(Main.messageTray.getSources().some(source => source.notifications.some(notification => notification.title === 'Rain later')), 'and they wait in the notification center');
  quiet().notify('Hold over soon');
  await eventually(() => bannerSays('Hold over soon'), 'its own notification still shows');
  await capture('extension-hold');
  const released = quiet().release();
  require(released.reduce((sum, app) => sum + app.count, 0) === 3 && !quiet().holding(), 'releasing it hands back what came in');
  await pause(500);
  require(!Main.messageTray.getSources().some(source => source.notifications.some(notification => notification.title?.startsWith('While Quiet'))),
    'and leaves summing up to the extension');

  clearNotifications();
  quiet().hold();
  await notify('Chatter', 'Maya wrote');
  await eventually(() => quiet().held === 4, 'a second hold holds a notification');
  quiet().end();
  await eventually(() => bannerSays('While Quiet held notifications back'), 'ending it without summing up shows a summary of its own');
  await capture('extension-hold-summary');
  clearNotifications();
}

async function loudness(monitor: Shell.AudioMonitor) {
  monitor.set_listening(false);
  monitor.set_listening(true);
  await eventually(() => speakersIntoLevels(), 'Kestrel hears the speakers');
  await pause(LISTENING_MS);
  return monitor.read(1)[1];
}

async function checkLockedSounds() {
  const monitor = Shell.AudioMonitor.get_default();
  const loop = quiet().loop();
  try {
    await eventually(() => intoSpeakers({'media.name': 'Quiet'}, 'Quiet:output', 2), 'its sounds reach the speakers');
    await eventually(async () => await loudness(monitor) > 0.1, 'its loop plays');
    await lock();
    await eventually(async () => await loudness(monitor) === 0, 'locking the screen silences it');
    const kept = quiet().keep();
    await eventually(async () => await loudness(monitor) > 0.1, 'keeping it brings it back while the screen stays locked');
    kept.dispose();
    await eventually(async () => await loudness(monitor) === 0, 'and letting go silences it again');
    await unlock();
    await eventually(async () => await loudness(monitor) > 0.1, 'unlocking brings it back');
  } finally {
    if (Main.screenShield.locked) await unlock();
    loop.stop();
    monitor.set_listening(false);
  }
}

async function checkNetwork(port: number) {
  const server = new Soup.Server({});
  server.add_handler('/hello', (_server, message) => {
    const asked = message.get_request_headers().get_one('authorization');
    message.set_status(asked === 'Bearer token' ? 200 : 401, null);
    message.get_response_headers().replace('X-Reply', 'yes');
    message.set_response('application/json', Soup.MemoryUse.COPY, new TextEncoder().encode(JSON.stringify({hello: 'there'})));
  });
  server.listen_local(port, Soup.ServerListenOptions.IPV4_ONLY);
  try {
    const reply = await quiet().fetch(`http://127.0.0.1:${port}/hello`, {headers: {authorization: 'Bearer token'}});
    require(reply.ok && (reply.json() as {hello: string}).hello === 'there' && reply.headers['x-reply'] === 'yes', 'it fetches from the host its manifest names');
    require((await quiet().fetch(`http://127.0.0.1:${port}/hello`)).status === 401, 'and sees the status of a refused request');
    let refused = false;
    await quiet().fetch('https://example.com/').catch(() => (refused = true));
    require(refused, 'a host its manifest doesn’t name is refused');
  } finally {
    server.disconnect();
  }
}

async function checkSecrets(keyring: ScratchKeyring) {
  await quiet().secrets.set('token', 'kept-secret');
  require(keyring.items.some(item => item.secret === 'kept-secret' && item.attributes.extension === QUIET), 'a secret goes into the keyring');
  require(await quiet().secrets.get('token') === 'kept-secret', 'and comes back out');
  await quiet().secrets.delete('token');
  require(await quiet().secrets.get('token') === null, 'deleting it forgets it');
  await quiet().secrets.set('token', 'kept-secret');
}

export async function run() {
  const keyring = new ScratchKeyring();
  require(await keyring.own(), 'a scratch keyring stands in for the Secret Service');
  const {web} = freePorts('web');
  install('quiet', QUIET);
  rewrite(GLib.build_filenamev([userFolder(QUIET), 'extension.toml']), text => text.replace('127.0.0.1:1', `127.0.0.1:${web}`));
  await request('Reload', QUIET);
  try {
    await eventually(() => (globalThis as {quiet?: Quiet}).quiet?.inCall !== undefined, 'an extension with the new permissions runs');
    await checkCalls();
    await checkHolding();
    await checkNetwork(web);
    await checkSecrets(keyring);
    await checkLockedSounds();
    await request('Remove', QUIET);
    await eventually(() => !keyring.items.some(item => item.attributes.extension === QUIET), 'removing it deletes its secrets');
  } finally {
    await request('Remove', QUIET);
    clearNotifications();
    for (const key of ['disabled-extensions', 'extension-settings', 'extension-problems']) kestrel.reset(key);
    keyring.close();
  }
}
