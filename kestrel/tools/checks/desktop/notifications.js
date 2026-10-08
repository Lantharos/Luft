import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {dismissImmediately, toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';
import * as MessageTray from 'resource:///com/lantharos/kestrel/ui/messageTray.js';

import {descendants, firstStyled, labelled, named, shown} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {call, subscribe} from '../lib/dbus.js';
import {capture} from '../lib/screenshots.js';
import {settled, waitUntil} from '../lib/wait.js';

const {require, eventually} = checks('notification');

async function notify(app, title, body, actions = []) {
  const reply = await call('org.gnome.Shell', '/org/freedesktop/Notifications', 'org.freedesktop.Notifications', 'Notify',
    new GLib.Variant('(susssasa{sv}i)', [app, 0, '', title, body, actions, {
      'x-shell-sender': new GLib.Variant('s', Gio.DBus.session.get_unique_name()),
      'x-shell-sender-pid': new GLib.Variant('u', app.length),
    }, -1]), '(u)');
  return reply.deepUnpack()[0];
}

const classed = (name, root) => descendants(root).filter(actor => actor.get_style_class_name?.() === name);

function clearAll() {
  for (const source of Main.messageTray.getSources())
    for (const notification of [...source.notifications]) notification.destroy();
}

function squareInset(card, headerClass) {
  const first = firstStyled(headerClass, card).get_children().find(child => child.visible);
  const [cardX, cardY] = card.get_transformed_position();
  const [x, y] = first.get_transformed_position();
  return Math.round(x - cardX) === Math.round(y - cardY);
}

async function checkCenter(replies) {
  await notify('Weather', 'Rain later', 'Showers expected from 4 pm.');
  await notify('Chatter', 'Noor', 'Did you see the draft?');
  await notify('Chatter', 'Sam', 'Pushed the fix.');
  const id = await notify('Chatter', 'Maya', 'Lunch at one?', ['inline-reply', 'Reply']);
  dismissImmediately();
  toggleSurface('notifications');
  const center = named('kestrel-notifications');
  await waitUntil(() => shown(center), 'the notification center opens');
  const groups = () => classed('kestrel-notification-group', center);
  const groupsOf = app => groups().filter(group => named(`Clear notifications from ${app}`, group));
  await eventually(() => groups().length === 2 && groupsOf('Chatter').length === 1 && groupsOf('Weather').length === 1, 'notifications are grouped by app');
  const [chatter] = groupsOf('Chatter');
  const cards = classed('kestrel-notification', chatter);
  require(cards.filter(card => card.visible).length === 2 && named('1 more', chatter), 'larger groups collapse to the newest notifications');
  await settled();
  require(squareInset(chatter, 'kestrel-notification-group-header'), 'the app name sits as far from the top of a group as from its side');
  await capture('notification-groups');

  named('Reply', chatter).emit('clicked', Clutter.BUTTON_PRIMARY);
  const entry = await waitUntil(() => firstStyled('kestrel-notification-reply-entry', chatter), 'a reply field opens');
  await eventually(() => global.stage.get_key_focus() === entry.clutter_text, 'Reply opens a focused text field');
  entry.set_text('Sounds good');
  await capture('notification-reply');
  entry.clutter_text.emit('activate');
  await eventually(() => replies.some(([replied, text]) => replied === id && text === 'Sounds good'), 'replies reach the app');

  named('Clear notifications from Chatter', center).emit('clicked', Clutter.BUTTON_PRIMARY);
  await eventually(() => groups().length === 1, 'clearing a group removes only that app');
  dismissImmediately();
}

async function checkBanner(replies) {
  clearAll();
  const id = await notify('Chatter', 'Maya', 'Are you coming?', ['inline-reply', 'Reply']);
  const banner = await waitUntil(() => descendants(global.stage).find(actor => actor.has_style_class_name?.('notification-banner') && actor.mapped),
    'the banner shows');
  await settled();
  require(squareInset(banner, 'message-header'), 'the app name sits as far from the top of a banner as from its side');
  banner.expand(false);
  const reply = await waitUntil(() => labelled('Reply', banner), 'the banner offers Reply');
  reply.emit('clicked', Clutter.BUTTON_PRIMARY);
  await eventually(() => firstStyled('notification-reply-entry', banner), 'banners offer an inline reply field');
  const entry = firstStyled('notification-reply-entry', banner);
  await capture('notification-banner-reply');
  entry.set_text('On my way');
  entry.clutter_text.emit('activate');
  await eventually(() => replies.some(([replied, text]) => replied === id && text === 'On my way'), 'banner replies reach the app');
  clearAll();
  dismissImmediately();
}

async function checkAppRules() {
  const general = new Gio.Settings({schema_id: 'org.gnome.desktop.notifications'});
  const rules = new Gio.Settings({
    schema_id: 'com.lantharos.kestrel.notifications.application',
    path: '/com/lantharos/kestrel/notifications/application/org-gnome-nautilus/',
  });
  const source = new MessageTray.Source({title: 'Files', policy: new MessageTray.NotificationApplicationPolicy('org.gnome.Nautilus')});
  Main.messageTray.add(source);
  const send = urgency => {
    const notification = new MessageTray.Notification({source, title: 'Copy finished', urgency});
    source.addNotification(notification);
    return notification;
  };
  const bannered = notification => Main.messageTray._notification === notification || Main.messageTray._notificationQueue.includes(notification);
  try {
    general.set_boolean('show-banners', false);
    require(!bannered(send(MessageTray.Urgency.NORMAL)) && bannered(send(MessageTray.Urgency.CRITICAL)),
      'Do Not Disturb lets only urgent notifications through by default');
    rules.set_string('during-do-not-disturb', 'never');
    require(!bannered(send(MessageTray.Urgency.CRITICAL)), 'apps can stay quiet during Do Not Disturb');
    rules.set_string('during-do-not-disturb', 'always');
    require(bannered(send(MessageTray.Urgency.NORMAL)), 'apps can show everything during Do Not Disturb');
    rules.set_string('during-do-not-disturb', 'never');
    rules.set_boolean('keep-in-list', false);
    const unlisted = send(MessageTray.Urgency.NORMAL);
    await eventually(() => !source.notifications.includes(unlisted), 'notifications that skip the list go away when no banner shows');
  } finally {
    general.reset('show-banners');
    rules.reset('during-do-not-disturb');
    rules.reset('keep-in-list');
    source.destroy();
  }
}

export async function run() {
  const replies = [];
  const unsubscribe = subscribe({iface: 'org.freedesktop.Notifications', member: 'NotificationReplied', path: '/org/freedesktop/Notifications'},
    (_signal, reply) => replies.push(reply));
  try {
    clearAll();
    await checkCenter(replies);
    await checkBanner(replies);
    await checkAppRules();
  } finally {
    unsubscribe();
    clearAll();
  }
}
