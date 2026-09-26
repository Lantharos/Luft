import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {toggleSurface, dismissImmediately} from 'resource:///org/gnome/shell/ui/kestrelUi.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export async function checkNotifications({pause, capture, actorNamed, output}) {
  const require = (condition, label) => {
    if (!condition) throw new Error(`Kestrel notification check failed: ${label}`);
    console.log(`Kestrel notification check: ${label}`);
  };
  const notify = (app, title, body, actions = []) => new Promise((resolve, reject) => {
    Gio.DBus.session.call('org.gnome.Shell', '/org/freedesktop/Notifications', 'org.freedesktop.Notifications', 'Notify',
      new GLib.Variant('(susssasa{sv}i)', [app, 0, '', title, body, actions, {
        'x-shell-sender': new GLib.Variant('s', Gio.DBus.session.get_unique_name()),
        'x-shell-sender-pid': new GLib.Variant('u', app.length),
      }, -1]), null, Gio.DBusCallFlags.NONE, -1, null,
      (connection, result) => { try { resolve(connection.call_finish(result).deep_unpack()[0]); } catch (error) { reject(error); } });
  });
  const clearAll = () => {
    for (const source of Main.messageTray.getSources())
      for (const notification of [...source.notifications]) notification.destroy();
  };
  const descendants = actor => [actor, ...actor.get_children().flatMap(descendants)];

  const replies = [];
  const subscription = Gio.DBus.session.signal_subscribe(null, 'org.freedesktop.Notifications', 'NotificationReplied',
    '/org/freedesktop/Notifications', null, Gio.DBusSignalFlags.NONE, (...args) => replies.push(args[5].deep_unpack()));
  try {
    await notify('Weather', 'Rain later', 'Showers expected from 4 pm.');
    await notify('Chatter', 'Noor', 'Did you see the draft?');
    await notify('Chatter', 'Sam', 'Pushed the fix.');
    const id = await notify('Chatter', 'Maya', 'Lunch at one?', ['inline-reply', 'Reply']);
    await pause(400);
    dismissImmediately();
    toggleSurface('notifications');
    await pause(450);
    const center = actorNamed(global.stage, 'kestrel-notifications');
    const groups = descendants(center).filter(actor => actor.get_style_class_name?.() === 'kestrel-notification-group');
    require(groups.length === 2, 'notifications are grouped by app');
    const chatter = groups[0];
    const cards = descendants(chatter).filter(actor => actor.get_style_class_name?.() === 'kestrel-notification');
    require(cards.filter(card => card.visible).length === 2 && !!actorNamed(chatter, '1 more'), 'larger groups collapse to the newest notifications');
    await capture(`${output}/notification-groups.png`);

    actorNamed(chatter, 'Reply').emit('clicked', Clutter.BUTTON_PRIMARY);
    await pause(200);
    const entry = descendants(chatter).find(actor => actor.get_style_class_name?.() === 'kestrel-notification-reply-entry');
    require(!!entry && global.stage.get_key_focus() === entry.clutter_text, 'Reply opens a focused text field');
    entry.set_text('Sounds good');
    await capture(`${output}/notification-reply.png`);
    entry.clutter_text.emit('activate');
    await pause(300);
    require(replies.some(([replied, text]) => replied === id && text === 'Sounds good'), 'replies reach the app');

    actorNamed(center, 'Clear notifications from Chatter').emit('clicked', Clutter.BUTTON_PRIMARY);
    await pause(300);
    require(descendants(center).filter(actor => actor.get_style_class_name?.() === 'kestrel-notification-group').length === 1,
      'clearing a group removes only that app');

    dismissImmediately();
    clearAll();
    await pause(300);
    const bannerId = await notify('Chatter', 'Maya', 'Are you coming?', ['inline-reply', 'Reply']);
    await pause(700);
    const banner = descendants(global.stage).find(actor => actor.has_style_class_name?.('notification-banner'));
    banner.expand(false);
    await pause(200);
    const replyButton = descendants(banner).find(actor => actor.label === 'Reply');
    replyButton.emit('clicked', Clutter.BUTTON_PRIMARY);
    await pause(200);
    const bannerEntry = descendants(banner).find(actor => actor.has_style_class_name?.('notification-reply-entry'));
    require(!!bannerEntry, 'banners offer an inline reply field');
    await capture(`${output}/notification-banner-reply.png`);
    bannerEntry.set_text('On my way');
    bannerEntry.clutter_text.emit('activate');
    await pause(300);
    require(replies.some(([replied, text]) => replied === bannerId && text === 'On my way'), 'banner replies reach the app');
  } finally {
    Gio.DBus.session.signal_unsubscribe(subscription);
    clearAll();
    dismissImmediately();
  }
}
