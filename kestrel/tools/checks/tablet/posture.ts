import GLib from 'gi://GLib';

import {checks} from '../lib/check.js';
import {LuftApp} from '../lib/apps/luftApp.js';
import {call, subscribe} from '../lib/dbus.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';
import {fold} from './lib/touch.js';

const {require, eventually} = checks('tablet posture');
const PORTAL = 'org.freedesktop.portal.Desktop';
const PATH = '/org/freedesktop/portal/desktop';
const SETTINGS = 'org.freedesktop.portal.Settings';

async function tabletMode(): Promise<boolean> {
  const reply = await call(PORTAL, PATH, SETTINGS, 'ReadOne', new GLib.Variant('(ss)', ['com.lantharos.kestrel', 'tablet-mode']), '(v)');
  return reply.recursiveUnpack<[boolean]>()[0];
}

export async function run() {
  await settled();
  const heard: boolean[] = [];
  const stop = subscribe<[string, string, boolean]>({iface: SETTINGS, member: 'SettingChanged', path: PATH}, (_signal, [namespace, key, value]) => {
    if (namespace === 'com.lantharos.kestrel' && key === 'tablet-mode') heard.push(value);
  });
  const heft = new LuftApp('heft', [], {}, {id: 'com.lantharos.Heft'});
  try {
    require(!(await tabletMode()), 'apps read that the computer is a laptop');
    await heft.open();
    heft.window.maximize();
    await settled(1500);
    await capture('heft-laptop');
    await fold(true);
    await eventually(() => heard.at(-1) === true, 'apps hear the computer fold into a tablet');
    require(await tabletMode(), 'apps read that the computer is a tablet');
    await settled(1500);
    await capture('heft-tablet');
    await fold(false);
    await eventually(() => heard.at(-1) === false, 'apps hear the computer unfold into a laptop');
    require(heard.length === 2, 'each fold is announced once');
  } finally {
    stop();
    await fold(false);
    await heft.close();
  }
}
