import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';
import * as MessageTray from 'resource:///com/lantharos/kestrel/ui/messageTray.js';

import {shownStyled, styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';
import {lock, showPrompt, unlock, wake} from './lib/shield.js';

const {require, eventually} = checks('lock screen');

const messages = () => new MessageTray.Source({title: 'Messages', iconName: 'mail-unread-symbolic'});
const previews = () => styled('unlock-dialog-notification-preview-title').filter(actor => actor.mapped).map(actor => actor.text);

async function checkBanner() {
  const source = messages();
  Main.messageTray.add(source);
  const notification = new MessageTray.Notification({source, title: 'Ayesha', body: 'Are we still on for tomorrow? I booked the table for seven.'});
  notification.addAction('Reply', () => {});
  source.addNotification(notification);
  await eventually(() => shownStyled('notification-banner'), 'a new notification shows a banner');
  await settled();
  await capture('notification-banner');
  source.destroy();
  await eventually(() => !shownStyled('notification-banner'), 'the banner goes with its app');
}

async function checkLockScreen() {
  await lock();
  const source = messages();
  try {
    Main.messageTray.add(source);
    source.addNotification(new MessageTray.Notification({source, title: 'Ayesha', body: 'Running ten minutes late.'}));
    await wake();
    await eventually(() => previews().includes('Ayesha'), 'the lock screen previews a notification that came in while locked');
    await capture('lock-screen');
    source.destroy();
    await eventually(() => previews().length === 0, 'the preview goes with its app');
    await showPrompt();
    require(Main.screenShield.locked, 'a key shows the unlock prompt');
    await capture('unlock-prompt');
  } finally {
    await unlock();
  }
}

export async function run() {
  await checkBanner();
  await checkLockScreen();
}
