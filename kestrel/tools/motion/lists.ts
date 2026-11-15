import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';
import {dismissImmediately, NMWirelessNetworkItem, NMWirelessToggle, toggleSurface} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {descendants, existing, firstStyled, ofType, shown, styled} from '../checks/lib/actors.js';
import {press, rest} from '../checks/lib/input/input.js';
import {clearNotifications} from '../checks/lib/notifications.js';
import {gjs, stop, waitForWindow} from '../checks/lib/processes.js';
import {settled, waitUntil} from '../checks/lib/wait.js';
import {control} from '../checks/network/lib/networkManager.js';
import type {Area, Clip} from './film.js';
import {notify} from './shell.js';

const MARGIN = 24;

function around(actor: Clutter.Actor, below = 0): Area {
  const [x, y] = actor.get_transformed_position();
  const [width, height] = actor.get_transformed_size();
  return [x - MARGIN, y - MARGIN, width + MARGIN * 2, height + below + MARGIN * 2];
}

async function reset() {
  dismissImmediately();
  rest();
  await settled();
}

function painted(row: Clutter.Actor): [number, number] {
  const box = row.get_allocation_box();
  const top = box.y1 + row.translation_y;
  return [top, top + (box.y2 - box.y1) * row.scale_y];
}

function overlaps(name: string, list: () => Clutter.Actor) {
  let most = 0;
  const signal = global.stage.connect_after('after-paint', () => {
    const rows = list().get_children().filter(row => row.visible && row.opacity > 0).map(painted).sort(([a], [b]) => a - b);
    for (let i = 1; i < rows.length; i++) most = Math.max(most, rows[i - 1][1] - rows[i][0]);
  });
  return () => {
    global.stage.disconnect(signal);
    console.log(`Kestrel motion: ${name} rows overlap by at most ${most.toFixed(1)} px`);
  };
}

async function measured(clip: Clip, name: string, list: () => Clutter.Actor, action: () => unknown, notes: string, area: Area) {
  const done = overlaps(name, list);
  try {
    await clip(name, action, {notes, area});
  } finally {
    done();
  }
}

function bottomRight(width: number, height: number): Area {
  const {width: screenWidth, height: screenHeight} = global.display.get_monitor_geometry(global.display.get_primary_monitor());
  return [screenWidth - width, screenHeight - height, width, height];
}

async function notificationLists(clip: Clip) {
  await reset();
  clearNotifications();
  await notify('Weather', 'Rain later', 'Showers expected from 4 pm.');
  for (const [title, body] of [['Noor', 'Did you see the draft?'], ['Maya', 'Lunch at one?'], ['Ilir', 'Running late'], ['Lena', 'On my way']])
    await notify('Chatter', title, body);
  await notify('Calendar', 'Stand-up', 'In 10 minutes');
  toggleSurface('notifications');
  await settled();
  const center = existing('kestrel-notifications');
  const list = () => firstStyled('kestrel-notification-list', center)!;
  const group = () => firstStyled('kestrel-notification-group-list', center)!;
  const more = () => ofType(styled('kestrel-notification-more', center).find(button => button.visible)!, St.Button);
  const area = bottomRight(560, 900);
  await measured(clip, 'notification-group-show-more', group, () => more().emit('clicked', 1), 'Show more on a group of four', area);
  await measured(clip, 'notification-group-show-less', group, () => more().emit('clicked', 1), 'Show less on the same group', area);
  await measured(clip, 'notification-center-leap', list, () => notify('Weather', 'Wind', 'Gusts up to 60 km/h.'),
    'A new notification brings the bottom app to the top', area);
  await reset();
  clearNotifications();
}

async function clipboardList(clip: Clip) {
  await reset();
  const clipboard = St.Clipboard.get_default();
  for (const text of ['Harbour at six', 'Bring the charts', 'Table for four', 'The ferry leaves at noon']) {
    clipboard.set_text(St.ClipboardType.CLIPBOARD, text);
    await settled();
  }
  const client = gjs('clients/windows/window.js', ['--entry']);
  await waitForWindow('Kestrel window check');
  await settled();
  toggleSurface('clipboard');
  const panel = existing('kestrel-clipboard');
  await waitUntil(() => shown(panel), 'clipboard history opens', 4000);
  await settled();
  const list = () => firstStyled('kestrel-clipboard-list', panel)!;
  const area = () => around(panel, 120);
  await measured(clip, 'clipboard-remove', list, () => press(Clutter.KEY_Delete), 'Delete removes the focused entry', area());
  await measured(clip, 'clipboard-arrive', list, () => clipboard.set_text(St.ClipboardType.CLIPBOARD, 'Meet at the pier'),
    'Something new is copied while the history is open', area());
  await measured(clip, 'clipboard-leap', list, () => clipboard.set_text(St.ClipboardType.CLIPBOARD, 'Harbour at six'),
    'An older entry is copied again and moves to the top', area());
  await reset();
  await stop(client);
}

const quick = () => existing('kestrel-quick-settings');
const networks = () => descendants(quick()).filter((actor): actor is NMWirelessNetworkItem => actor instanceof NMWirelessNetworkItem);

async function wifiList(clip: Clip) {
  await reset();
  await control('AddWifi', new GLib.Variant('(a(sbs))', [[['Harbour', false, ''], ['Lighthouse', false, ''], ['Tidewater', false, '']]]));
  try {
    toggleSurface('quick');
    const toggle = await waitUntil(() => shown(quick()) && descendants(quick()).find((actor): actor is NMWirelessToggle => actor instanceof NMWirelessToggle),
      'quick settings have a Wi-Fi tile', 4000);
    await settled();
    ofType(styled('kestrel-control-more', toggle)[0], St.Button).emit('clicked', 1);
    await waitUntil(() => toggle.menu.isOpen && networks().filter(shown).length === 3, 'the Wi-Fi menu lists the networks', 4000);
    await settled();
    const list = () => networks()[0].get_parent()!;
    const area = () => around(list(), 120);
    await measured(clip, 'wifi-network-appears', list, () => control('ShowWifi', new GLib.Variant('(sy)', ['Marina', 85])),
      'A network comes into range', area());
    await measured(clip, 'wifi-network-leaves', list, () => control('HideWifi', new GLib.Variant('(s)', ['Lighthouse'])),
      'A network goes out of range', area());
    await measured(clip, 'wifi-network-joins', list, () => control('JoinWifi', new GLib.Variant('(s)', ['Tidewater'])),
      'The weakest network connects and moves to the top', area());
  } finally {
    await control('RemoveWifi');
    await reset();
  }
}

export const listGroups = {notificationLists, clipboardList, wifiList};
