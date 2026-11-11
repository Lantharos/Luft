import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

export function clearNotifications() {
  for (const source of Main.messageTray.getSources())
    for (const notification of [...source.notifications]) notification.destroy();
}
