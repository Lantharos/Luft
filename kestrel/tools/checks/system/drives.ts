import Gio from 'gi://Gio';

import {notificationTitled} from '../apps/drives/drive.js';
import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';

const {require, eventually} = checks('drive notifications');
const PLUGGED_IN = 'PHOTOS';

type Announced = Gio.Volume & {allowAutorun?: boolean};

const volumes = () => Gio.VolumeMonitor.get().get_volumes() as Announced[];

export async function run() {
  const present = volumes();
  require(present.some(volume => volume.get_drive()?.is_removable()), 'a USB drive is plugged in when the session starts');
  for (const volume of present)
    require(!volume.allowAutorun, `${volume.get_name()}, there when the session started, opens without a notification`);
  require(!notificationTitled('connected'), 'drives there at sign-in post no notification');

  await call('com.lantharos.KestrelChecks', '/com/lantharos/KestrelChecks/Drives', 'com.lantharos.KestrelChecks.Drives', 'PlugIn', null, null, {connection: Gio.DBus.system});
  const plugged = await eventually(() => volumes().find(volume => volume.get_name() === PLUGGED_IN), 'a USB drive plugged in during the session shows up');
  await eventually(() => plugged.allowAutorun, 'a USB drive plugged in during the session is announced once it opens');
  require(present.every(volume => !volume.allowAutorun), 'and the drives that were already there stay quiet');
}
