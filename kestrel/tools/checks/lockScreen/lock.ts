import Gio from 'gi://Gio';
import {Main, MessageTray} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {showsText, shownStyled, styled, textOf} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';
import {lock, showPrompt, unlock, wake} from './lib/shield.js';

const {require, eventually} = checks('lock screen');

const messages = () => new MessageTray.Source({title: 'Messages', iconName: 'mail-unread-symbolic'});
const previews = () => styled('unlock-dialog-notification-preview-title').filter(actor => actor.mapped).map(textOf);
const namesApp = () => styled('unlock-dialog-notification-source').some(source => source.mapped && showsText('Messages', source));

async function checkBanner() {
  const source = messages();
  Main.messageTray.add(source);
  const notification = new MessageTray.Notification({source, title: 'Theo', body: 'Are we still on for tomorrow? I booked the table for seven.'});
  notification.addAction('Reply', () => {});
  source.addNotification(notification);
  await eventually(() => shownStyled('notification-banner'), 'a new notification shows a banner');
  await settled();
  await capture('notification-banner');
  source.destroy();
  await eventually(() => !shownStyled('notification-banner'), 'the banner goes with its app');
}

async function checkLockScreen() {
  const shell = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  await lock();
  const source = messages();
  try {
    Main.messageTray.add(source);
    source.addNotification(new MessageTray.Notification({source, title: 'Theo', body: 'Running ten minutes late.'}));
    await wake();
    await eventually(namesApp, 'the lock screen names the app whose notification came in while locked');
    require(previews().length === 0, 'the lock screen keeps what the notification says to itself');
    await capture('lock-screen');
    shell.set_boolean('lock-screen-content', true);
    await eventually(() => previews().includes('Theo'), 'the lock screen previews the notification once message content is allowed there');
    await capture('lock-screen-content');
    source.destroy();
    await eventually(() => previews().length === 0, 'the preview goes with its app');
    await showPrompt();
    require(Main.screenShield.locked, 'a key shows the unlock prompt');
    await capture('unlock-prompt');
  } finally {
    shell.reset('lock-screen-content');
    await unlock();
  }
}

export async function run() {
  await checkBanner();
  await checkLockScreen();
}
