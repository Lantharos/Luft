import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {checks} from '../../lib/check.js';
import {press, type Point} from '../../lib/input/input.js';
import {scratch} from '../../lib/processes.js';
import {changes, withApp} from '../../apps/lib/apps.js';
import {saveEveryLook} from '../../apps/lib/corners.js';
import {write} from '../../apps/lib/files.js';
import {menuItem} from '../../apps/rover/places.js';
import {show} from '../../apps/settings/navigation.js';
import type {Nearby} from './nearby.js';
import {NEARBY, nearbyId} from './transfers.js';

const {eventually} = checks('Post');
const FILE: Point = [330, 104];
const SEND_TO_DEVICE = menuItem(FILE, 10, 2);
const FIREWALL = 'com.lantharos.Firewall1';
const WIRED = '/org/freedesktop/NetworkManager/Settings/1';

export async function checkRover(nearby: Nearby) {
  await nearbyId();
  const file = GLib.build_filenamev([scratch('post', 'Rover'), 'Boarding pass.txt']);
  write(file, 'Gate 14, seat 22A\n');
  await withApp('rover', [GLib.path_get_dirname(file)], async app => {
    await changes(app, 'right-clicking a file in Rover opens its menu', () => app.click(FILE, Clutter.BUTTON_SECONDARY));
    await saveEveryLook(app, 'post-rover-menu');
    await changes(app, `Send to device opens the devices nearby, ${NEARBY} among them`, () => app.click(SEND_TO_DEVICE));
    await saveEveryLook(app, 'post-rover-devices');
    press(Clutter.KEY_Escape);
  });
  await eventually(async () => (await nearby.devices()).length > 0, 'the computer nearby is still there');
}

function classify(type: 'home' | 'public') {
  Gio.DBus.system.call_sync(FIREWALL, '/com/lantharos/Firewall1', FIREWALL, 'SetNetworkType', new GLib.Variant('(os)', [WIRED, type]),
    null, Gio.DBusCallFlags.NONE, -1, null);
}

export async function checkSettings() {
  await withApp('settings', [], async app => {
    await show(app, 'post');
    await saveEveryLook(app, 'post-settings');
    classify('public');
    try {
      await show(app, 'network');
      await show(app, 'post', 'Post’s page opens again once the network is public');
      await saveEveryLook(app, 'post-settings-public');
    } finally {
      classify('home');
    }
    await show(app, 'network/firewall');
    await saveEveryLook(app, 'post-firewall');
  });
}
