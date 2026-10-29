import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';

import {descendants, labelOf, named, textOf} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {click, press} from '../lib/input/input.js';
import {outcome, spawn, stop} from '../lib/processes.js';
import {pause, settled} from '../lib/wait.js';
import {followLink, openApp} from '../apps/lib/apps.js';
import {capture} from '../lib/screenshots.js';
import {startSessionClient} from '../system/lib/sessionClient.js';

const {require, eventually} = checks('panel status');
const SCREEN_CAST = 'org.gnome.Mutter.ScreenCast';
const LEVEL_METER_NAMES = ['com.lantharos.settings', 'org.PulseAudio.pavucontrol'];
const SETTLE_MS = 1000;

interface DumpObject {
  type: string;
  info?: {props?: Record<string, string | number>};
}

const pipewireObjects = async () => JSON.parse((await outcome(['pw-dump'])).stdout) as DumpObject[];
const isNode = (object: DumpObject, key: string, value: string) => object.type === 'PipeWire:Interface:Node' && object.info?.props?.[key] === value;

async function settingsMeters() {
  return (await pipewireObjects()).filter(object => isNode(object, 'application.id', 'com.lantharos.settings')
    && object.info?.props?.['media.class'] === 'Stream/Input/Audio').length;
}

async function shareScreen() {
  const reply = await call(SCREEN_CAST, '/org/gnome/Mutter/ScreenCast', SCREEN_CAST, 'CreateSession', new GLib.Variant('(a{sv})', [{}]), '(o)');
  const [session] = reply.deepUnpack();
  await call(SCREEN_CAST, session, `${SCREEN_CAST}.Session`, 'Start');
}

const showsIcon = (actor: Clutter.Actor, name: string) => descendants(actor).some(child => child.visible && child instanceof St.Icon && child.icon_name === name);

export async function run() {
  const privacy = named('kestrel-privacy')!;
  const menu = named('kestrel-context-menu')!;
  const panel = named('kestrel-panel')!;
  require(!privacy.visible, 'the privacy button stays hidden while nothing is in use');

  await shareScreen();
  const inhibitor = await startSessionClient('--inhibit');
  await eventually(() => privacy.visible && showsIcon(privacy, 'screen-shared-symbolic'), 'sharing the screen shows the privacy button', 10000);
  await eventually(() => showsIcon(named('Quick settings', panel)!, 'view-reveal-symbolic'), 'apps keeping the screen awake show an eye');
  await capture('privacy');

  click(privacy);
  await eventually(() => menu.visible && named('Stop sharing the screen', menu), 'the privacy button lists what is in use');
  await capture('privacy-menu');
  click(named('Stop sharing the screen', menu)!);
  await eventually(() => !privacy.visible, 'stopping the share hides the privacy button');

  await stop(inhibitor);
  await eventually(() => !showsIcon(panel, 'view-reveal-symbolic'), 'the eye goes away when the app lets the screen sleep');

  for (const meter of LEVEL_METER_NAMES) {
    const recorder = spawn(['parecord', '--device=microphone', `--property=application.id=${meter}`, '/dev/null']);
    await eventually(() => privacy.visible && showsIcon(privacy, 'audio-input-microphone-symbolic'),
      `an app recording under the name ${meter} still shows the microphone`);
    await settled();
    click(privacy);
    await eventually(() => named('kestrel-context-menu')?.visible && descendants(named('kestrel-context-menu')!).some(entry => [textOf(entry), labelOf(entry), entry.accessible_name].some(text => text?.includes('(name not verified)'))),
      'the menu marks the name an app recording through PulseAudio gave itself as not verified');
    press(Clutter.KEY_Escape);
    await eventually(() => !named('kestrel-context-menu')?.visible, 'the menu closes');
    await stop(recorder);
    await eventually(() => !privacy.visible, 'the microphone goes once it stops');
  }

  const settings = await openApp('settings', ['kestrel-settings:sound']);
  try {
    await eventually(async () => await settingsMeters() === 1, 'the Sound page measures the input level');
    await pause(SETTLE_MS);
    require(!privacy.visible, 'Settings measuring the input level leaves the privacy indicator hidden');
    await followLink('settings', 'kestrel-settings:display');
    await eventually(async () => await settingsMeters() === 0, 'leaving the Sound page stops measuring the input level');
  } finally {
    await settings.close();
  }
}
