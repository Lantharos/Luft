import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {dismissImmediately, toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';
import * as MessageTray from 'resource:///com/lantharos/kestrel/ui/messageTray.js';

import {descendants, firstStyled, labelled, named, shown, styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {call, subscribe} from '../lib/dbus.js';
import {fingerScroll, liftFingers, moveTo, rest, scroll} from '../lib/input.js';
import {capture} from '../lib/screenshots.js';
import {pause, settled, waitUntil} from '../lib/wait.js';

const {require, eventually} = checks('notification');
const monthTitle = new Intl.DateTimeFormat(undefined, {month: 'long', year: 'numeric'});
const VELOCITY_WINDOW = 150;
const WEEKS_DRAGGED = 3;

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

async function checkUpdateWhileHiding() {
  const tray = Main.messageTray;
  const source = new MessageTray.Source({title: 'Downloads', iconName: 'folder-download-symbolic'});
  tray.add(source);
  const notification = new MessageTray.Notification({source, title: 'Downloading photos', body: '10 of 40'});
  try {
    source.addNotification(notification);
    await eventually(() => tray._notification === notification && tray._notificationState === MessageTray.State.SHOWN, 'the download banner shows');
    tray._notificationExpired = true;
    tray._updateState();
    require(tray._notificationState === MessageTray.State.HIDING, 'the banner starts hiding once it expires');
    notification.set({body: '20 of 40'});
    notification.acknowledged = false;
    await eventually(() => tray._notificationState === MessageTray.State.SHOWN, 'the banner comes back when its notification updates while hiding');
    require(tray._notification === notification && shown(tray._banner), 'the updated notification keeps its banner');
  } finally {
    source.destroy();
  }
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

async function checkCalendar() {
  const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  const locale = new Gio.Settings({schema_id: 'org.gnome.system.locale'});
  const shortDay = day => new Intl.DateTimeFormat(undefined, {weekday: 'short'}).format(new Date(2023, 0, 1 + day)).slice(0, 2);
  toggleSurface('notifications');
  const center = named('kestrel-notifications');
  await waitUntil(() => shown(center), 'the notification center opens');
  const firstHeading = () => classed('kestrel-calendar-heading', center)[0].text;
  try {
    require(/, week \d+$/.test(firstStyled('kestrel-calendar-month', center).label), 'the month header shows the week number');
    locale.set_string('region', 'de_DE.UTF-8');
    await eventually(() => firstHeading() === shortDay(1), 'German region formats start the week on Monday');
    settings.set_string('week-start', 'sunday');
    await eventually(() => firstHeading() === shortDay(0), 'the week can start on Sunday whatever the region');
    settings.set_string('week-start', 'monday');
    await eventually(() => firstHeading() === shortDay(1), 'the week can start on Monday');
    await capture('notification-calendar');
  } finally {
    settings.reset('week-start');
    locale.reset('region');
    dismissImmediately();
  }
}

async function checkCalendarScrolling() {
  for (const app of ['Weather', 'Chatter', 'Calendar', 'Mail', 'Files', 'Music', 'Photos', 'Maps'])
    await notify(app, `${app} update`, 'Something changed.');
  toggleSurface('notifications');
  const center = named('kestrel-notifications');
  await waitUntil(() => shown(center), 'the notification center opens');
  await settled();
  const calendar = firstStyled('kestrel-calendar', center);
  const weeks = firstStyled('kestrel-calendar-viewport', center);
  const list = styled('kestrel-notification-list', center)[0].get_parent();
  const today = new Date();
  const shows = offset => firstStyled('kestrel-calendar-month', center).label
    .startsWith(`${monthTitle.format(new Date(today.getFullYear(), today.getMonth() + offset, 1))}, `);
  const atRest = () => !weeks.get_transition('week') && Number.isInteger(weeks.week);
  try {
    require(list.vadjustment.upper > list.vadjustment.page_size, 'many notifications make the list scroll');
    scroll(Clutter.ScrollDirection.DOWN, calendar);
    await eventually(() => shows(1) && atRest(), 'a wheel notch down over the calendar shows the next month');
    require(list.vadjustment.value === 0, 'scrolling the calendar leaves the notifications where they are');
    scroll(Clutter.ScrollDirection.UP, calendar);
    scroll(Clutter.ScrollDirection.UP, calendar);
    await eventually(() => shows(-1) && atRest(), 'each wheel notch up goes back one month');
    await capture('notification-calendar-previous');

    const start = weeks.week;
    moveTo(calendar);
    await fingerScroll(WEEKS_DRAGGED * weeks.pitch, {steps: 24});
    require(Math.abs(weeks.week - start - WEEKS_DRAGGED) < 0.05, 'the calendar follows the fingers on the touchpad');
    await capture('notification-calendar-dragging');
    await pause(VELOCITY_WINDOW);
    liftFingers();
    await eventually(() => shows(0) && atRest(), 'letting go settles on the nearest month');
    await fingerScroll(-2 * weeks.pitch, {steps: 6});
    liftFingers();
    await eventually(() => atRest() && weeks.week < start, 'a quick swipe up flings back to an earlier month');
    require(list.vadjustment.value === 0, 'swiping over the calendar leaves the notifications where they are');

    const settledWeek = weeks.week;
    scroll(Clutter.ScrollDirection.DOWN, list);
    await eventually(() => list.vadjustment.value > 0, 'the wheel scrolls the notification list');
    require(weeks.week === settledWeek, 'scrolling the notifications leaves the calendar on its month');
  } finally {
    rest();
    clearAll();
    dismissImmediately();
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
    await checkUpdateWhileHiding();
    await checkAppRules();
    await checkCalendar();
    await checkCalendarScrolling();
  } finally {
    unsubscribe();
    clearAll();
  }
}
