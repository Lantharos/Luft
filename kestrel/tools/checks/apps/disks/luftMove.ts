import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {notificationTitled} from '../drives/drive.js';
import {checks} from '../../lib/check.js';
import {call} from '../../lib/dbus.js';
import {saveBothStyles, type Palette} from '../lib/palette.js';
import type {Driver} from './driver.js';

const {eventually} = checks('Luft app');

const MICRON = '/org/freedesktop/UDisks2/drives/Micron_7450';
const LUFT = 1024 ** 2;

function show(stage: string, progress: number) {
  return call('com.lantharos.KestrelChecks', '/com/lantharos/KestrelChecks/Resize', 'com.lantharos.KestrelChecks.Resize', 'Show',
    new GLib.Variant('(sdsat)', [stage, progress, MICRON, [LUFT]]), null, {connection: Gio.DBus.system});
}

export async function checkLuftMoving(driver: Driver, palette: Palette) {
  await show('moving', 0.42);
  await driver.click('micron');
  await saveBothStyles(driver.app, palette, 'disks-luft-moving');
  await show('', 0);
  await eventually(() => notificationTitled('Luft has moved'), 'Kestrel says when Luft has finished moving');
}
