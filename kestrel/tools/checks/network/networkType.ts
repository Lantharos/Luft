import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {callLog} from '../system/lib/systemCalls.js';

const {require, eventually} = checks('network type');
const FIREWALL = 'com.lantharos.Firewall1';
const WIRED = '/org/freedesktop/NetworkManager/Settings/1';
const QUESTION = 'Is Wired connection 1 a home network?';

const asked = () => Main.messageTray.getSources().flatMap(source => source.notifications).find(notification => notification.title === QUESTION);

const firewall = (path: string, iface: string, method: string, network: string, value: string) =>
  call(FIREWALL, path, iface, method, new GLib.Variant('(os)', [network, value]), null, {connection: Gio.DBus.system});

export async function run() {
  const calls = callLog();
  try {
    await firewall('/com/lantharos/KestrelChecks/Firewall', 'com.lantharos.KestrelChecks.Firewall', 'Join', WIRED, 'Wired connection 1');
    const question = await eventually(asked, 'joining a network nobody chose a type for asks what kind it is');
    require(question.actions.map(action => action.label).join() === 'Home,Public', 'the question offers Home and Public');
    question.actions.find(action => action.label === 'Public')!.activate();
    await eventually(() => calls().includes(`SetNetworkType ${WIRED} public`), 'choosing Public makes it a public network');
    await eventually(() => !asked(), 'the question goes away once the network has a type');
  } finally {
    await firewall('/com/lantharos/Firewall1', FIREWALL, 'SetNetworkType', WIRED, 'home');
  }
}
