import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {clockChanges} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {moveClock, realClock, setClock} from '../lib/fakeClock.js';
import {click, press, rest, type} from '../lib/input/input.js';
import {clearNotifications} from '../lib/notifications.js';
import {capture} from '../lib/screenshots.js';
import {threads} from '../lib/threads.js';
import {pause, settled} from '../lib/wait.js';
import {lock, unlock} from '../lockScreen/lib/shield.js';
import {prepareForSleep} from '../lockScreen/lib/sleep.js';
import {closeStart, descriptionOf, openStart, rows, search, titleOf} from '../start/search/results.js';
import {withApp} from '../apps/lib/apps.js';
import {show} from '../apps/settings/navigation.js';
import {builtFolder, installBuilt, listed, request, setSetting} from '../extensions/lib/extensions.js';
import {FOCUS, REMINDERS, STATE, type Stored, answer, answerChooser, bannerMentions, banners, buttonIn, cleanSlate, only, crashKestrel, element, file, keepFor, mentions, openPanel, popup, push, read, readJson, reminder, requeue, row, saved, seed, sentence} from './reminders/world.js';

const {require, eventually} = checks('Reminders');
const THURSDAY_NOON = new Date(2026, 10, 5, 12, 0).getTime();
const SECOND_MS = 1000;
const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const QUIET_MS = 2500;
const FIRES_MS = 6000;
const WAKEUPS_S = 30;
const RESTART_MS = 150_000;
const MANY = 400;

async function wakeJustBefore(at: number) {
  await prepareForSleep(true);
  setClock(at - 2 * SECOND_MS);
  await prepareForSleep(false);
}

async function quickAdd(text: string, ...expected: string[]) {
  await eventually(() => popup(), 'the pop-up is open');
  type(text);
  for (const words of expected) await eventually(() => mentions(popup(), words), `"${text}" is understood as ${words}`);
}

async function checkAdding() {
  await only();
  const idle = await eventually(element, 'Reminders sits in the taskbar');
  await settled();
  click(idle);
  await eventually(() => mentions(popup(), 'Nothing to remember'), 'with nothing to remember it says so');
  await quickAdd('dentist tuesday 3pm', 'Dentist', 'Tuesday, November 10 at 3:00 PM');
  await capture('reminders-preview');
  press(Clutter.KEY_Return);
  await eventually(() => mentions(popup(), 'Upcoming') && mentions(popup(), 'Dentist'), 'Enter adds it to Upcoming');
  await eventually(() => saved().some(({title}) => title === 'Dentist'), 'and it is written to its file');
  await quickAdd("mum's birthday 14 march every year", "Mum's birthday", 'Sunday, March 14, 2027', 'Every year on March 14', 'A heads-up 3 days before');
  press(Clutter.KEY_Return);
  await quickAdd('pay rent every month on the 1st', 'Pay rent', 'Every month on the 1st');
  press(Clutter.KEY_Return);
  await quickAdd('finish the thesis by 1 december', 'A goal');
  press(Clutter.KEY_Return);
  await quickAdd('buy more film', 'No date, kept as a to-do');
  press(Clutter.KEY_Return);
  await eventually(() => mentions(popup(), 'To do') && mentions(popup(), 'Buy more film'), 'a to-do with no date gets its own list');
  const birthday = saved().find(({title}) => title === "Mum's birthday")!;
  require(birthday.kind === 'birthday' && birthday.headsUp === 3 && birthday.repeat?.unit === 'year', 'a birthday repeats yearly with a heads-up by itself');
  await capture('reminders-list');
}

async function checkEditing() {
  const dentist = () => saved().find(({title}) => title.startsWith('Dentist'))!;
  click(row('Dentist')!);
  await eventually(() => buttonIn(popup(), 'Edit'), 'opening a row offers its actions');
  click(buttonIn(popup(), 'Edit')!);
  await eventually(() => buttonIn(popup(), 'Save'), 'Edit shows the form');
  await capture('reminders-edit');
  click(buttonIn(popup(), 'Weekly', 'label')!);
  await eventually(() => mentions(popup(), 'Every week'), 'it can be set to repeat');
  click(buttonIn(popup(), 'Custom', 'label')!);
  await eventually(() => mentions(popup(), 'every 2 weeks') || buttonIn(popup(), 'Save'), 'a custom repeat can be typed');
  click(buttonIn(popup(), 'Save')!);
  await eventually(() => dentist().repeat?.unit === 'week', 'and saving keeps it');
  click(row('Dentist')!);
  await eventually(() => buttonIn(popup(), 'Delete'), 'its actions show again');
  click(buttonIn(popup(), 'Delete')!);
  await eventually(() => !saved().some(({title}) => title === 'Dentist'), 'Delete takes it away');
  click(buttonIn(popup(), 'Undo', 'label')!);
  await eventually(() => saved().some(({title}) => title === 'Dentist'), 'and Undo brings it back');
  press(Clutter.KEY_Escape);
  await eventually(() => !popup(), 'Escape closes it');
  rest();
}

async function checkFiringAndComingBack() {
  await setSetting(REMINDERS, 'come-back-every', new GLib.Variant('s', '5'));
  clearNotifications();
  setClock(THURSDAY_NOON + 57 * SECOND_MS);
  await push(reminder('call', {title: 'Call Sam', when: {day: '2026-11-05', time: '12:01'}}));
  await eventually(() => bannerMentions('Call Sam') && bannerMentions('Today at 12:01 PM'), 'it rings at its time, from the one timer', FIRES_MS);
  const rung = await eventually(() => stored('call').rung, 'and notes that it rang');
  require(buttonIn(banners()[0]!, 'Done', 'label') && buttonIn(banners()[0]!, 'Snooze 10 minutes', 'label'), 'its notification offers Done and Snooze');
  await capture('reminders-notification');
  await eventually(() => element() && mentions(element(), '1'), 'the taskbar counts it as due');
  clearNotifications();
  await wakeJustBefore(rung.last + 5 * MINUTE_MS);
  await eventually(() => bannerMentions('Still waiting: Call Sam') && bannerMentions('reminded once so far'), 'unanswered it comes back, marked as such', FIRES_MS);
  await capture('reminders-again');
  require(stored('call').rung!.count === 2, 'and counts the times it rang');
  await pause(QUIET_MS);
  require(banners().length === 1, 'it replaces its last notification');
  answer('Snooze 10 minutes');
  const snoozed = await eventually(() => stored('call').snoozedUntil, 'Snooze answers it for now');
  require(snoozed - Date.now() > 9 * MINUTE_MS, 'for as long as Settings says');
  await eventually(() => !banners().length, 'and the notification goes');
  await wakeJustBefore(stored('call').rung!.last + 5 * MINUTE_MS);
  await pause(QUIET_MS + 1000);
  require(!banners().length, 'a snoozed reminder doesn’t come back early');
  await wakeJustBefore(snoozed);
  await eventually(() => bannerMentions('Call Sam'), 'it rings again when the snooze ends', FIRES_MS);
  answer('Done');
  await eventually(() => stored('call').doneAt, 'Done finishes it');
  moveClock(HOUR_MS);
  await prepareForSleep(true);
  await prepareForSleep(false);
  await pause(QUIET_MS);
  require(!banners().length, 'and it stays quiet');
}

const stored = (id: string): Stored => saved().find(found => found.id === id)!;

async function checkRepeating() {
  clearNotifications();
  const start = new Date(2026, 10, 6, 7, 59, 57).getTime();
  setClock(start);
  await push(reminder('pills', {title: 'Vitamins', when: {day: '2026-11-06', time: '08:00'}, repeat: {unit: 'day', every: 1}}));
  await eventually(() => bannerMentions('Vitamins'), 'a daily reminder rings', FIRES_MS);
  answer('Done');
  await eventually(() => stored('pills').when!.day === '2026-11-07', 'and Done moves it to tomorrow');
  await wakeJustBefore(new Date(2026, 10, 7, 8, 0).getTime());
  await eventually(() => bannerMentions('Vitamins'), 'where it rings again, once', FIRES_MS);
  answer('Done');
  await eventually(() => stored('pills').when!.day === '2026-11-08', 'and moves on');
  await push(reminder('pills', {doneAt: Date.now()}));
  clearNotifications();
}

async function checkHolds() {
  clearNotifications();
  const banner = new Gio.Settings({schema_id: 'org.gnome.desktop.notifications'});
  const start = THURSDAY_NOON + 3 * DAY_MS + 57 * SECOND_MS;
  setClock(start);
  banner.set_boolean('show-banners', false);
  await push(reminder('held', {title: 'Water the plants', when: {day: '2026-11-08', time: '12:01'}}));
  await pause(5 * SECOND_MS);
  require(!banners().length && !stored('held').rung, 'during Do Not Disturb it waits, without counting as seen');
  banner.set_boolean('show-banners', true);
  await eventually(() => bannerMentions('Water the plants'), 'and arrives when Do Not Disturb ends', FIRES_MS);
  answer('Done');
  await eventually(() => stored('held').doneAt, 'it can be answered as usual');
  clearNotifications();
  await installBuilt(FOCUS);
  await eventually(async () => (await listed(FOCUS))?.state === 'running', 'Focus runs');
  await keepFor(FOCUS, {session: {minutes: 25, endsAt: Date.now() + 9 * SECOND_MS, left: null, soundscapes: false}});
  await pause(SECOND_MS);
  setClock(Date.now() + 0);
  const due = new Date(Date.now() + 2 * SECOND_MS);
  const when = {day: '2026-11-08', time: `${String(due.getHours()).padStart(2, '0')}:${String(due.getMinutes()).padStart(2, '0')}`};
  await push(reminder('focused', {title: 'Stretch', when}));
  await pause(5 * SECOND_MS);
  require(!banners().some(shownBanner => mentions(shownBanner, 'Stretch')), 'it waits out a Focus session too');
  await eventually(() => bannerMentions('Stretch'), 'and arrives when the session ends', 15 * SECOND_MS);
  clearNotifications();
  await request('Remove', FOCUS);
  await push(reminder('focused', {title: 'Stretch', doneAt: Date.now()}));
}

async function checkWaking() {
  clearNotifications();
  const before = new Date(2026, 10, 9, 22, 0).getTime();
  setClock(before);
  await push(reminder('morning', {title: 'Take the bins out', when: {day: '2026-11-10', time: '06:30'}}));
  await prepareForSleep(true);
  setClock(before + 10 * HOUR_MS);
  await pause(SECOND_MS);
  require(!banners().length, 'nothing rings while the computer sleeps');
  await prepareForSleep(false);
  await eventually(() => bannerMentions('Take the bins out') && bannerMentions('Missed:'), 'what came due in its sleep rings on waking, marked as missed', FIRES_MS);
  clearNotifications();
  await push(reminder('morning', {title: 'Take the bins out', doneAt: Date.now()}));
}

async function checkLocked() {
  clearNotifications();
  setClock(THURSDAY_NOON + 7 * DAY_MS);
  await only(reminder('away', {title: 'Feed the cat', when: {day: '2026-11-12', time: '11:00'}, rung: {count: 1, last: Date.now() - 5 * MINUTE_MS + 2 * SECOND_MS}}));
  await lock();
  await pause(4 * SECOND_MS);
  require(stored('away').rung!.count === 1, 'while the screen is locked it doesn’t keep coming back');
  await unlock();
  await eventually(() => stored('away').rung!.count === 2, 'it picks up again once someone is back');
  clearNotifications();
  await only();
}

async function checkTimeZones() {
  clearNotifications();
  setClock(THURSDAY_NOON + 6 * DAY_MS);
  await push(reminder('zone', {title: 'Call home', when: {day: '2026-11-11', time: '20:59'}}));
  const home = GLib.getenv('TZ')!;
  GLib.setenv('TZ', 'Asia/Tokyo', true);
  clockChanges.zoneChanged();
  await eventually(() => bannerMentions('Call home'), 'a local time follows the computer to another time zone', FIRES_MS);
  GLib.setenv('TZ', home, true);
  clockChanges.zoneChanged();
  clearNotifications();
  await push(reminder('zone', {title: 'Call home', doneAt: Date.now()}));
}

async function checkGoals() {
  clearNotifications();
  await setSetting(REMINDERS, 'goal-nudge-every', new GLib.Variant('s', '1'));
  setClock(new Date(2026, 11, 8, 8, 59, 57).getTime());
  await only(reminder('thesis', {title: 'Finish the thesis', kind: 'goal', when: {day: '2026-12-01', time: null}, rung: {count: 1, last: new Date(2026, 11, 7, 9, 0).getTime()}}));
  await eventually(() => bannerMentions('Finish the thesis') && bannerMentions('7 days overdue'), 'an overdue goal gets a nudge saying how long it has been', FIRES_MS);
  await capture('reminders-goal');
  require(buttonIn(banners()[0]!, 'Not today', 'label'), 'with a way to put it off');
  await openPanel();
  await eventually(() => mentions(popup(), 'Overdue') && mentions(popup(), '7 days overdue'), 'the list shows how overdue it is');
  await capture('reminders-overdue');
  press(Clutter.KEY_Escape);
  await eventually(() => !popup(), 'and closes');
  clearNotifications();
}

async function checkMissed() {
  clearNotifications();
  await request('Disable', REMINDERS);
  setClock(new Date(2026, 11, 20, 10, 0).getTime());
  seed([
    reminder('lunch', {title: 'Lunch with Noor', when: {day: '2026-12-18', time: '12:30'}}),
    reminder('daily', {title: 'Water the fern', when: {day: '2026-12-10', time: '08:00'}, repeat: {unit: 'day', every: 1}}),
  ]);
  await request('Enable', REMINDERS);
  await eventually(() => bannerMentions('Lunch with Noor') && bannerMentions('Missed:'), 'what was missed while off shows on the next start', FIRES_MS);
  await eventually(() => bannerMentions('Water the fern'), 'and a repeat missed for days shows as one', FIRES_MS);
  await pause(SECOND_MS);
  require(banners().filter(shownBanner => mentions(shownBanner, 'Water the fern')).length <= 1 && stored('daily').when!.day === '2026-12-20', 'for its latest day');
  await eventually(() => stored('lunch').rung, 'which is written down');
  await settled();
  clearNotifications();
  await request('Disable', REMINDERS);
  await setSetting(REMINDERS, 'come-back', new GLib.Variant('b', false));
  await request('Enable', REMINDERS);
  await pause(QUIET_MS);
  require(!banners().length, 'and only once');
  await request('Disable', REMINDERS);
  seed(['a', 'b', 'c', 'd', 'e'].map(id => reminder(id, {title: `Missed ${id}`, when: {day: '2026-12-19', time: '09:00'}})));
  await request('Enable', REMINDERS);
  await eventually(() => bannerMentions('5 reminders are waiting'), 'several at once are summed up in one');
  clearNotifications();
  await setSetting(REMINDERS, 'come-back', new GLib.Variant('b', true));
}

async function checkSearch() {
  await request('Disable', REMINDERS);
  setClock(THURSDAY_NOON);
  seed([reminder('b', {title: "Noor's birthday", kind: 'birthday', when: {day: '2027-03-14', time: null}, repeat: {unit: 'year', every: 1, date: 14}})]);
  await request('Enable', REMINDERS);
  await openStart();
  search('noor');
  await eventually(() => rows().some(found => titleOf(found) === "Noor's birthday"), 'Start finds a reminder');
  search('dentist friday 4pm');
  const add = await eventually(() => rows().find(found => titleOf(found) === 'Add reminder: Dentist'), 'and offers to add one from natural text');
  require(descriptionOf(add).includes('4:00 PM'), 'saying what it understood');
  await capture('reminders-search');
  click(add);
  await eventually(() => saved().some(({title}) => title === 'Dentist') && popup(), 'adding it shows it in the list');
  closeStart();
  press(Clutter.KEY_Escape);
  await eventually(() => !popup(), 'and the list closes');
}

async function checkCalendars() {
  const importing = file('reminders-import.ics');
  GLib.file_set_contents(importing, sentence([
    'BEGIN:VCALENDAR', 'VERSION:2.0',
    'BEGIN:VEVENT', 'UID:one', 'SUMMARY:Ana\\, birthday', 'DTSTART;VALUE=DATE:19900614', 'RRULE:FREQ=YEARLY', 'BEGIN:VALARM', 'TRIGGER:-P2D', 'END:VALARM', 'END:VEVENT',
    'BEGIN:VEVENT', 'UID:two', 'SUMMARY:Flight to Lis', ' bon', 'DTSTART;TZID=Asia/Tokyo:20270110T090000', 'END:VEVENT',
    'BEGIN:VEVENT', 'UID:three', 'SUMMARY:Long gone', 'DTSTART:20200101T100000Z', 'END:VEVENT',
    'BEGIN:VTODO', 'UID:four', 'SUMMARY:Sort the photos', 'END:VTODO',
    'BEGIN:VTODO', 'UID:five', 'SUMMARY:Finished', 'STATUS:COMPLETED', 'END:VTODO',
    'END:VCALENDAR',
  ]));
  const page = await withApp('settings', [], async app => {
    await show(app, `extensions/${REMINDERS.toLowerCase()}`).then(frame => frame.save('reminders-settings'));
    return app;
  });
  require(page, 'its page opens in Settings');
  await answerChooser(importing);
  const imported = await invokePage('Import');
  await eventually(() => saved().some(({id}) => id === 'one'), 'importing a calendar file adds what it holds');
  require(imported, 'from a button on its page');
  const ana = saved().find(({id}) => id === 'one')!;
  require(ana.title === 'Ana, birthday' && ana.kind === 'birthday' && ana.headsUp === 2 && ana.when!.day === '2027-06-14', 'a yearly event becomes a birthday on its next date, with its alarm as the heads-up');
  require(saved().find(({id}) => id === 'two')!.when!.time === '00:00', 'a time in another zone is turned into local time');
  require(!saved().some(({id}) => id === 'three' || id === 'five'), 'past events and finished tasks stay out');
  await invokePage('Import');
  await pause(500);
  require(saved().filter(({id}) => id === 'one').length === 1, 'importing the same file again adds nothing');
  const exporting = file('reminders-export.ics');
  await answerChooser(exporting);
  await invokePage('Export');
  await eventually(() => GLib.file_test(exporting, GLib.FileTest.EXISTS), 'exporting saves a calendar file');
  const written = read(exporting);
  require(written.includes('BEGIN:VCALENDAR') && written.includes('SUMMARY:Ana\\, birthday') && written.includes('RRULE:FREQ=YEARLY') && written.includes('TRIGGER:-P2D'), 'with what the extension holds');
}

async function invokePage(label: string) {
  const NAME = 'com.lantharos.Kestrel';
  const PATH = '/com/lantharos/Kestrel/Extensions';
  const IFACE = 'com.lantharos.Kestrel.Extensions';
  const [json] = (await call(NAME, PATH, IFACE, 'Page', new GLib.Variant('(s)', [REMINDERS]), '(s)')).deepUnpack<[string]>();
  const sections = JSON.parse(json) as {items: {type: string; title?: string; action?: string}[]}[];
  const button = sections.flatMap(section => section.items).find(item => item.type === 'button' && item.title === label)!;
  await call(NAME, PATH, IFACE, 'Act', new GLib.Variant('(ssv)', [REMINDERS, button.action!, new GLib.Variant('b', true)]));
  return true;
}

async function checkConditionalSettings() {
  const description = await listed(REMINDERS);
  const dependsOn = (key: string) => description!.settings!.find(setting => setting.key === key)!;
  require(dependsOn('come-back-every').depends === 'come-back', 'how often it comes back follows its switch');
  require(dependsOn('taskbar-next-within').depends === 'taskbar-shows' && dependsOn('taskbar-next-within').when?.[0] === 'next', 'how far ahead only shows for what’s next');
}

function use() {
  const before = threads();
  const started = GLib.get_monotonic_time();
  return () => {
    const seconds = (GLib.get_monotonic_time() - started) / 1e6;
    let onCpu = 0;
    let switches = 0;
    let main = 0;
    for (const [id, thread] of threads()) {
      const woke = thread.switches - (before.get(id)?.switches ?? 0);
      onCpu += thread.onCpu - (before.get(id)?.onCpu ?? 0);
      switches += woke;
      if (thread.name.startsWith('kestrel')) main += woke;
    }
    return {seconds: Math.round(seconds), wakeupsPerSecond: Math.round(switches / seconds * 10) / 10, mainThreadPerSecond: Math.round(main / seconds * 10) / 10, cpuPercent: Math.round(onCpu / 1e9 / seconds * 1000) / 10};
  };
}

async function idleFor(seconds: number) {
  await settled();
  await pause(2 * SECOND_MS);
  const stop = use();
  await pause(seconds * SECOND_MS);
  return stop();
}

async function checkCost() {
  await request('Disable', REMINDERS);
  const off = await idleFor(WAKEUPS_S);
  const day = dayIn(30);
  seed(Array.from({length: MANY}, (_, index) => reminder(`many-${index}`, {title: `Reminder ${index}`, when: {day, time: '09:00'}, repeat: index % 2 ? {unit: 'week', every: 1} : null})));
  await request('Enable', REMINDERS);
  const on = await idleFor(WAKEUPS_S);
  const offAgain = (await request('Disable', REMINDERS), await idleFor(WAKEUPS_S));
  await request('Enable', REMINDERS);
  console.log(`Kestrel reminders idle cost: ${JSON.stringify({reminders: MANY, off, on, offAgain})}`);
  const baseline = Math.max(off.mainThreadPerSecond, offAgain.mainThreadPerSecond);
  require(on.mainThreadPerSecond <= baseline + 1, `${MANY} reminders add no wakeups while idle (${baseline} → ${on.mainThreadPerSecond} a second on Kestrel's main thread)`);
}

const dayIn = (days: number) => {
  const date = new Date(Date.now() + days * DAY_MS);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const firstOfNextMonth = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth() + 1, 1, 12).toISOString().slice(0, 10);
};

async function capturePictures() {
  realClock();
  clearNotifications();
  const later = new Date(Date.now() + 2 * HOUR_MS).toTimeString().slice(0, 3);
  await only(
    reminder('thesis', {title: 'Finish the thesis', kind: 'goal', when: {day: dayIn(-5), time: null}, warned: true, rung: {count: 1, last: Date.now() - HOUR_MS}}),
    reminder('call', {title: 'Call the plumber', when: {day: dayIn(0), time: `${later}30`}}),
    reminder('dentist', {title: 'Dentist', when: {day: dayIn(1), time: '15:00'}}),
    reminder('rent', {title: 'Pay rent', when: {day: firstOfNextMonth(), time: null}, repeat: {unit: 'month', every: 1, date: 1}}),
    reminder('mum', {title: "Mum's birthday", kind: 'birthday', when: {day: dayIn(12), time: null}, repeat: {unit: 'year', every: 1}, headsUp: 3}),
    reminder('stamps', {title: 'Buy stamps'}),
    reminder('film', {title: 'Take the film to be developed'}),
  );
  await openPanel();
  await capture('reminders-store-list');
  await quickAdd("noor's birthday 14 march every year", 'Every year on March 14');
  await capture('reminders-store-add');
  press(Clutter.KEY_Escape);
  await eventually(() => !popup(), 'the pop-up closes');
  rest();
  const soon = new Date(Date.now() + 2 * SECOND_MS);
  await only(reminder('tea', {title: 'Take the bread out', when: {day: dayIn(0), time: soon.toTimeString().slice(0, 5)}, rung: {count: 2, last: Date.now() - 16 * MINUTE_MS}}));
  await eventually(() => bannerMentions('Still waiting: Take the bread out'), 'it shows coming back', FIRES_MS);
  await capture('reminders-store-notification');
  clearNotifications();
}

async function prepareRestart() {
  await request('Disable', REMINDERS);
  await pause(200);
  const now = new Date();
  const due = new Date(Math.ceil(now.getTime() / MINUTE_MS + 1) * MINUTE_MS);
  const when = {day: dayIn((due.getTime() - now.getTime()) / DAY_MS), time: due.toTimeString().slice(0, 5)};
  seed([reminder('kept', {title: 'Lock the back door', when}), reminder('todo', {title: 'Buy stamps', when: null})]);
  await request('Enable', REMINDERS);
  await eventually(() => element(), 'Reminders is back before Kestrel crashes');
  GLib.file_set_contents(STATE, JSON.stringify({kestrel: Gio.Credentials.new().get_unix_pid()}));
  requeue();
  crashKestrel();
  await new Promise(() => {});
}

async function verifyRestart() {
  const {kestrel} = readJson<{kestrel: number}>(STATE);
  require(Gio.Credentials.new().get_unix_pid() !== kestrel, 'Kestrel started again after crashing');
  await eventually(async () => (await listed(REMINDERS))?.state === 'running', 'Reminders runs again');
  require(saved().some(({title}) => title === 'Buy stamps'), 'its reminders survived the crash');
  const folder = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_data_dir(), 'luft', 'extension-data', REMINDERS]));
  const files = folder.enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null);
  const names: string[] = [];
  for (let info: Gio.FileInfo | null; (info = files.next_file(null));) names.push(info.get_name());
  require(names.includes('reminders.json') && !names.some(name => name.startsWith('.')), `and nothing half written is left (${names.join(', ')})`);
  await eventually(() => bannerMentions('Lock the back door'), 'and what it was waiting for still rings', RESTART_MS);
  GLib.unlink(STATE);
  clearNotifications();
  await request('Remove', REMINDERS);
  require(!GLib.file_test(builtFolder(REMINDERS), GLib.FileTest.EXISTS) && !GLib.file_test(folder.get_path()!, GLib.FileTest.EXISTS), 'removing it deletes its data too');
}

export async function run() {
  if (GLib.file_test(STATE, GLib.FileTest.EXISTS)) {
    await verifyRestart();
    return;
  }
  cleanSlate();
  await installBuilt(REMINDERS);
  await eventually(async () => (await listed(REMINDERS))?.state === 'running', 'Reminders runs once installed');
  await checkConditionalSettings();
  new Gio.Settings({schema_id: 'org.gnome.desktop.screensaver'}).set_boolean('lock-enabled', false);
  setClock(THURSDAY_NOON);
  try {
    await checkAdding();
    await checkEditing();
    await checkFiringAndComingBack();
    await checkRepeating();
    await checkHolds();
    await checkWaking();
    await checkLocked();
    await checkTimeZones();
    await checkGoals();
    await checkMissed();
    await checkSearch();
    await checkCalendars();
    await capturePictures();
    await checkCost();
    await prepareRestart();
  } finally {
    realClock();
  }
}

export const timeout = 420000;
