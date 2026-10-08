import {descendants, named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {click} from '../lib/input.js';
import {spawn, stop} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {startSessionClient} from './lib/sessionClient.js';

const {require, eventually} = checks('panel status');
const SCREEN_CAST = `
  const {Gio, GLib} = imports.gi;
  const call = (path, iface, method, args, type) => Gio.DBus.session.call_sync('org.gnome.Mutter.ScreenCast', path, iface, method, args,
    type ? new GLib.VariantType(type) : null, Gio.DBusCallFlags.NONE, -1, null);
  const [session] = call('/org/gnome/Mutter/ScreenCast', 'org.gnome.Mutter.ScreenCast', 'CreateSession',
    new GLib.Variant('(a{sv})', [{}]), '(o)').deep_unpack();
  call(session, 'org.gnome.Mutter.ScreenCast.Session', 'Start', null, null);
  new GLib.MainLoop(null, false).run();`;

const showsIcon = (actor, name) => descendants(actor).some(child => child.visible && child.icon_name === name);

export async function run() {
  const privacy = named('kestrel-privacy');
  const menu = named('kestrel-context-menu');
  const panel = named('kestrel-panel');
  require(!privacy.visible, 'the privacy button stays hidden while nothing is in use');

  spawn(['gjs', '-c', SCREEN_CAST]);
  const inhibitor = await startSessionClient('--inhibit');
  await eventually(() => privacy.visible && showsIcon(privacy, 'screen-shared-symbolic'), 'sharing the screen shows the privacy button', 10000);
  await eventually(() => showsIcon(named('Quick settings', panel), 'view-reveal-symbolic'), 'apps keeping the screen awake show an eye');
  await capture('privacy');

  click(privacy);
  await eventually(() => menu.visible && named('Stop sharing the screen', menu), 'the privacy button lists what is in use');
  await capture('privacy-menu');
  click(named('Stop sharing the screen', menu));
  await eventually(() => !privacy.visible, 'stopping the share hides the privacy button');

  await stop(inhibitor);
  await eventually(() => !showsIcon(panel, 'view-reveal-symbolic'), 'the eye goes away when the app lets the screen sleep');
}
