import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import {dismissImmediately, toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';
import * as MessageTray from 'resource:///com/lantharos/kestrel/ui/messageTray.js';

import {descendants, firstStyled, labelled, named, shown, styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {call, subscribe} from '../lib/dbus.js';
import {centerOf, click, fingerScroll, liftFingers, moveTo, pressButton, releaseButton, rest, scroll} from '../lib/input.js';
import {LuftApp} from '../lib/luftApp.js';
import {gjs, spawn, stop, waitForWindow} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {nextFrame, pause, settled, waitUntil} from '../lib/wait.js';
import {clip} from '../../motion/film.js';
import {touchDown, touchMove, touchUp} from '../tablet/lib/touch.js';

const {require, eventually} = checks('notification');
const monthTitle = new Intl.DateTimeFormat(undefined, {month: 'long', year: 'numeric'});
const VELOCITY_WINDOW = 150;
const WEEKS_DRAGGED = 3;
const DISMISSED = 2;
const DISMISS_SHARE = 0.4;
const clips = GLib.build_filenamev([GLib.getenv('KESTREL_CAPTURE_DIR'), 'clips']);

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

    await settled();
    const scrolled = list.vadjustment.value;
    const under = point => {
      let actor = global.stage.get_actor_at_pos(Clutter.PickMode.ALL, ...point);
      while (actor && !actor.has_style_class_name?.('kestrel-notification')) actor = actor.get_parent();
      return actor;
    };
    const card = classed('kestrel-notification', center).find(actor => actor.mapped && under(centerOf(actor)) === actor);
    const point = centerOf(card);
    moveTo(point);
    await fingerScroll(-20, {steps: 4});
    liftFingers();
    await eventually(() => list.vadjustment.value < scrolled, 'two fingers moving down over a notification scroll the list');
    require(card.translation_x === 0 && card.translation_y === 0, 'scrolling the list leaves its notifications in place');
  } finally {
    rest();
    clearAll();
    dismissImmediately();
  }
}

const near = (value, target) => Math.abs(value - target) < 1;
const resting = actor => !actor.get_transition('translation-x') && !actor.get_transition('translation-y');
const bannerOf = title => descendants(global.stage)
  .find(actor => actor.has_style_class_name?.('notification-banner') && actor.mapped && actor.notification?.title === title) ?? null;

async function showBanner(title, actions = []) {
  clearAll();
  const id = await notify('Chatter', title, 'Swipe this away', actions);
  const banner = await waitUntil(() => bannerOf(title), `the ${title} banner shows`);
  await waitUntil(() => Main.messageTray._notificationState === MessageTray.State.SHOWN, `the ${title} banner settles`);
  await settled();
  return {id, banner};
}

async function glide(from, to, steps, interval = 16) {
  for (let step = 1; step <= steps; step++) {
    moveTo([from[0] + (to[0] - from[0]) * step / steps, from[1] + (to[1] - from[1]) * step / steps]);
    await pause(interval);
  }
}

function heightsWhile(actor) {
  const heights = [];
  const signal = global.stage.connect_after('after-paint', () => heights.push(actor.height));
  return () => {
    global.stage.disconnect(signal);
    return heights;
  };
}

const shrinksSmoothly = heights => heights.some(height => height > heights.at(-1) + 1 && height < heights[0] - 1) &&
  heights.every((height, index) => !index || height <= heights[index - 1] + 0.5);

async function checkBannerSwipes(closed, invoked) {
  let {id, banner} = await showBanner('Follow');
  const [x, y] = centerOf(banner);
  moveTo([x, y]);
  pressButton();
  await glide([x, y], [x + 90, y], 9);
  require(near(banner.translation_x, 90) && banner.translation_y === 0, 'a banner follows the pointer sideways as it is dragged');
  require(banner.opacity < 255, 'a dragged banner fades as it leaves');
  await capture('notification-banner-drag');
  await clip(clips, 'notification-banner-spring-back', async () => {
    await glide([x + 90, y], [x + 50, y], 4);
    await pause(VELOCITY_WINDOW + 50);
    releaseButton();
  }, {notes: 'Dragged a banner 50 px to the right and let go slowly'});
  await eventually(() => resting(banner) && banner.translation_x === 0 && banner.opacity === 255, 'a banner let go before the threshold springs back');
  require(!closed.has(id) && bannerOf('Follow') === banner, 'a banner that springs back stays');

  ({id, banner} = await showBanner('Tap', ['default', 'Open']));
  const [tapX, tapY] = centerOf(banner);
  moveTo([tapX, tapY]);
  pressButton();
  await glide([tapX, tapY], [tapX + 4, tapY + 2], 2);
  require(banner.translation_x === 0, 'a press that barely moves leaves the banner in place');
  releaseButton();
  await eventually(() => invoked.some(([invokedId, action]) => invokedId === id && action === 'default'), 'a click that barely moves still opens the notification');

  ({id, banner} = await showBanner('Fling'));
  const fling = centerOf(banner);
  require(70 < banner.width * DISMISS_SHARE, 'the flick stays short of the distance that dismisses');
  await clip(clips, 'notification-banner-fling', async () => {
    moveTo(fling);
    pressButton();
    await glide(fling, [fling[0] + 70, fling[1]], 5, 8);
    releaseButton();
  }, {notes: 'Flicked a banner 70 px to the right'});
  await eventually(() => closed.get(id) === DISMISSED && !bannerOf('Fling'), 'a quick flick throws a banner away');

  ({id, banner} = await showBanner('Down'));
  const down = centerOf(banner);
  moveTo(down);
  pressButton();
  await glide(down, [down[0] + 4, down[1] + 30], 5);
  require(near(banner.translation_y, 30) && banner.translation_x === 0, 'a banner dragged down follows the pointer downward only');
  await capture('notification-banner-drag-down');
  await glide([down[0] + 4, down[1] + 30], [down[0] + 6, down[1] + 70], 4);
  await pause(VELOCITY_WINDOW + 50);
  releaseButton();
  await eventually(() => closed.get(id) === DISMISSED, 'dragging a banner down past its threshold dismisses it');

  ({id, banner} = await showBanner('Touch'));
  const finger = centerOf(banner);
  touchDown(finger);
  await touchMove(finger, [finger[0] + 80, finger[1]], 8);
  require(near(banner.translation_x, 80), 'a banner follows a finger on the touchscreen');
  await touchMove([finger[0] + 80, finger[1]], [finger[0] + 200, finger[1]], 6);
  await pause(VELOCITY_WINDOW + 50);
  touchUp();
  await eventually(() => closed.get(id) === DISMISSED, 'a finger can swipe a banner away');

  ({id, banner} = await showBanner('Touchpad'));
  moveTo(centerOf(banner));
  await fingerScroll(-60, {horizontal: true, steps: 6});
  require(near(banner.translation_x, 60), 'a two-finger swipe moves the banner with the fingers');
  await capture('notification-banner-touchpad');
  await fingerScroll(-140, {horizontal: true, steps: 10});
  await pause(VELOCITY_WINDOW);
  liftFingers();
  await eventually(() => closed.get(id) === DISMISSED, 'a two-finger swipe dismisses a banner');
  rest();
  clearAll();
}

async function checkCenterSwipes(closed) {
  clearAll();
  const weather = await notify('Weather', 'Wind', 'Gusts up to 60 km/h.');
  const noor = await notify('Chatter', 'Noor', 'The draft is ready.');
  const sam = await notify('Chatter', 'Sam', 'Shipped it.');
  dismissImmediately();
  toggleSurface('notifications');
  const center = named('kestrel-notifications');
  await waitUntil(() => shown(center), 'the notification center opens');
  await settled();
  const groups = () => classed('kestrel-notification-group', center);
  const cardOf = title => named(title, center)?.get_parent().get_parent() ?? null;
  const [chatter] = groups().filter(group => named('Clear notifications from Chatter', group));
  try {
    const card = cardOf('Sam');
    const [x, y] = centerOf(card);
    moveTo([x, y]);
    pressButton();
    await glide([x, y], [x + 100, y + 3], 10);
    require(near(card.translation_x, 100) && card.translation_y === 0 && chatter.translation_x === 0,
      'a notification in a group follows the pointer sideways on its own');
    await capture('notification-center-drag');
    await glide([x + 100, y + 3], [x + 200, y + 3], 6);
    await pause(VELOCITY_WINDOW + 50);
    const before = chatter.height;
    const heights = heightsWhile(chatter);
    await clip(clips, 'notification-center-gap', async () => releaseButton(), {notes: 'Let go of a notification dragged past halfway'});
    const painted = heights();
    await eventually(() => closed.get(sam) === DISMISSED, 'a notification let go past its threshold is dismissed');
    await eventually(() => classed('kestrel-notification', chatter).length === 1, 'its group keeps the other notification');
    require(chatter.height < before - 1 && shrinksSmoothly(painted), 'the group closes the gap smoothly');

    const listParent = styled('kestrel-notification-list', center)[0];
    const weatherGroup = groups().find(group => named('Clear notifications from Weather', group));
    const finger = centerOf(cardOf('Wind'));
    const listHeights = heightsWhile(listParent);
    await clip(clips, 'notification-center-group-fling', async () => {
      touchDown(finger);
      await touchMove(finger, [finger[0] + 70, finger[1]], 4);
      require(weatherGroup.translation_x > 0, 'the only notification of an app takes its whole group along');
      touchUp();
    }, {notes: 'Flicked the only notification of an app with a finger'});
    await eventually(() => closed.get(weather) === DISMISSED && groups().length === 1, 'a flick throws away an app\'s only notification with its group');
    require(shrinksSmoothly(listHeights()), 'the remaining notifications move up smoothly');

    click(named('Dismiss notification', cardOf('Noor')));
    await eventually(() => closed.get(noor) === DISMISSED && groups().length === 0, 'the close button still dismisses a notification');
  } finally {
    rest();
    clearAll();
    dismissImmediately();
  }
}

async function checkWindowlessApp() {
  clearAll();
  const sender = spawn(['notify-send', '--wait', '--app-name=Mail', '--hint=string:desktop-entry:com.lantharos.mailman',
    '--category=email.arrived', 'Theo Brandt', 'Harbour photos']);
  try {
    await eventually(() => bannerOf('Theo Brandt'), 'mail from an app running without a window slides in as a banner');
  } finally {
    clearAll();
    await stop(sender);
  }
}

const pendingLaunches = () => Shell.WindowTracker.get_default().get_startup_sequences()
  .filter(sequence => sequence.get_application_id() && !sequence.get_completed());

async function checkActivation() {
  const tokens = [];
  const unsubscribe = subscribe({iface: 'org.gtk.Notifications', member: 'ActionInvoked', path: '/org/gtk/Notifications'},
    (_signal, [, , , , platformData]) => tokens.push(platformData['activation-token']));
  const settings = new LuftApp('settings');
  const other = gjs('clients/window.js');
  try {
    await settings.open();
    const app = Shell.AppSystem.get_default().lookup_app('com.lantharos.settings.desktop');
    await call('org.gtk.Notifications', '/org/gtk/Notifications', 'org.gtk.Notifications', 'AddNotification',
      new GLib.Variant('(ssa{sv})', [app.id.replace(/\.desktop$/, ''), 'updates', {
        title: new GLib.Variant('s', 'Updates ready'),
        'default-action': new GLib.Variant('s', 'show-updates'),
      }]));
    const banner = await waitUntil(() => bannerOf('Updates ready'), 'the app\'s banner shows');
    await settled();
    click(centerOf(banner));
    await eventually(() => tokens.some(Boolean), 'clicking the banner hands the app an activation token');
    await nextFrame();
    require(pendingLaunches().length === 0, 'opening an app that already runs from a notification shows no busy cursor');

    const window = await waitForWindow('Kestrel window check');
    window.activate(global.get_current_time());
    await eventually(() => window.has_focus(), 'another window takes focus');
    global.create_app_launch_context(0, -1).get_startup_notify_id(app.get_app_info(), []);
    await eventually(() => pendingLaunches().length === 1, 'launching the app shows the busy cursor');
    settings.window.activate(global.get_current_time());
    await eventually(() => pendingLaunches().length === 0, 'the busy cursor ends once the app\'s window comes to the front');
  } finally {
    unsubscribe();
    await stop(other);
    await settings.close();
    clearAll();
  }
}

export async function run() {
  const replies = [];
  const closed = new Map();
  const invoked = [];
  const unsubscribe = subscribe({iface: 'org.freedesktop.Notifications', path: '/org/freedesktop/Notifications'}, (signal, parameters) => {
    if (signal === 'NotificationReplied') replies.push(parameters);
    if (signal === 'NotificationClosed') closed.set(...parameters);
    if (signal === 'ActionInvoked') invoked.push(parameters);
  });
  try {
    clearAll();
    await checkCenter(replies);
    await checkBanner(replies);
    await checkWindowlessApp();
    await checkUpdateWhileHiding();
    await checkAppRules();
    await checkCalendar();
    await checkCalendarScrolling();
    await checkBannerSwipes(closed, invoked);
    await checkCenterSwipes(closed);
    await checkActivation();
  } finally {
    unsubscribe();
    clearAll();
  }
}
