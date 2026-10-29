import type Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';

import {descendants, named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {click} from '../lib/input/input.js';
import {spawn, stop} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {startSessionClient} from '../system/lib/sessionClient.js';

const {require, eventually} = checks('panel status');
const SCREEN_CAST = 'org.gnome.Mutter.ScreenCast';
const LEVEL_METER_NAMES = ['com.lantharos.settings', 'org.PulseAudio.pavucontrol'];

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
    await stop(recorder);
    await eventually(() => !privacy.visible, 'the microphone goes once it stops');
  }
}
