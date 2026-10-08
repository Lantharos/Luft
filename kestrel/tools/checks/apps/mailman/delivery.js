import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {ScratchAppSecrets} from '../../../fixtures/services/appSecrets.js';
import {checks} from '../../lib/check.js';
import {press, type} from '../../lib/input.js';
import {fixture} from '../../lib/processes.js';
import {pause, settled, Timeout, waitUntil} from '../../lib/wait.js';
import {changes, withApp} from '../lib/apps.js';
import {MailServer, USERS} from './stalwart.js';

const {require, eventually} = checks('Luft app');
const ARRIVAL_TARGET = 2000;
const RECOVERY_TARGET = 10000;
const GIVE_UP = 45000;
const SYNC_TIMEOUT = 20000;
const SILENT = 3000;
const ROUNDS = 3;
const LIST_AREA = {x: 248, y: 60, width: 408, height: 240};
const BELOW_INBOX = {x: 8, y: 150, width: 232, height: 260};
const STORE = GLib.build_filenamev([GLib.get_user_data_dir(), 'mailman', 'mail.sqlite']);

const elapsed = since => (GLib.get_monotonic_time() - since) / 1000;
const median = values => values.toSorted((a, b) => a - b)[Math.floor(values.length / 2)];
const ms = value => `${Math.round(value)} ms`;

function query(sql) {
  const [, stdout] = GLib.spawn_sync(null, ['sqlite3', STORE, sql], null, GLib.SpawnFlags.SEARCH_PATH, null);
  return new TextDecoder().decode(stdout).trim();
}

const stored = subject => query(`SELECT count(*) FROM messages WHERE subject = '${subject}'`) !== '0';

function seed(ports) {
  const smtp = {host: '127.0.0.1', port: ports.smtp, security: 'none'};
  const accounts = [
    ['alice', {kind: 'imap', imap: {host: '127.0.0.1', port: ports.relay, security: 'none'}, smtp}],
    ['bob', {kind: 'jmap', session: `http://127.0.0.1:${ports.http}/.well-known/jmap`}],
  ];
  const statements = accounts.map(([user, protocol], index) => {
    const config = JSON.stringify({protocol, username: user, oauth: null});
    return `INSERT INTO accounts (id, email, name, config, added) VALUES (${index + 1}, '${user}@example.test', '${user}', '${config}', strftime('%s', 'now'));
      INSERT INTO identities (account, name, address, preferred) VALUES (${index + 1}, '${user}', '${user}@example.test', 1);`;
  });
  query(`${statements.join('\n')}
    INSERT OR REPLACE INTO settings (key, value) VALUES ('settings', '{"screener":false,"notifications":false}');`);
  return Object.fromEntries(accounts.map(([user], index) => [`account-${index + 1}`, JSON.stringify({kind: 'password', password: USERS[user]})]));
}

async function arrival(app, subject, since) {
  await settled();
  const listFrame = () => app.frame(app.area(LIST_AREA));
  const before = await listFrame();
  const timing = {stored: Infinity, shown: Infinity};
  try {
    await waitUntil(async () => {
      if (timing.stored === Infinity && stored(subject)) timing.stored = elapsed(since);
      if (timing.stored !== Infinity && !(await listFrame()).looksLike(before)) timing.shown = elapsed(since);
      return timing.shown !== Infinity;
    }, `${subject} is listed`, GIVE_UP);
  } catch (error) {
    if (!(error instanceof Timeout)) throw error;
  }
  return timing;
}

async function deliveries(app, server, from, to, label) {
  const timings = [];
  for (let round = 1; round <= ROUNDS; round++) {
    const subject = `${label}-${round}`;
    timings.push(await arrival(app, subject, server.deliver(from, to, subject)));
  }
  return {stored: median(timings.map(timing => timing.stored)), shown: median(timings.map(timing => timing.shown))};
}

function networkReturned() {
  const bus = Gio.DBusConnection.new_for_address_sync(GLib.getenv('KESTREL_SYSTEM_BUS'),
    Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT | Gio.DBusConnectionFlags.MESSAGE_BUS_CONNECTION, null, null);
  bus.emit_signal(null, '/org/freedesktop/NetworkManager', 'org.freedesktop.DBus.Properties', 'PropertiesChanged',
    new GLib.Variant('(sa{sv}as)', ['org.freedesktop.NetworkManager', {State: new GLib.Variant('u', 70)}, []]));
  bus.flush_sync(null);
  bus.close_sync(null);
}

async function afterCutOff(app, server, subject, recover) {
  await server.cutOff();
  server.deliver('bob', 'alice', subject);
  await pause(SILENT);
  const unnoticed = !stored(subject);
  recover();
  return {unnoticed, ...await arrival(app, subject, GLib.get_monotonic_time())};
}

async function checkArrivals(app, server) {
  const imap = await deliveries(app, server, 'bob', 'alice', 'idle');
  require(imap.shown < ARRIVAL_TARGET, `mail over IMAP IDLE is listed ${ms(imap.shown)} after delivery`);
  const jmap = await deliveries(app, server, 'alice', 'bob', 'push');
  require(jmap.shown < ARRIVAL_TARGET, `mail over JMAP push is listed ${ms(jmap.shown)} after delivery`);

  await server.restart();
  const restarted = await arrival(app, 'restart', server.deliver('bob', 'alice', 'restart'));
  require(restarted.stored < RECOVERY_TARGET, `mail arrives ${ms(restarted.stored)} after the server comes back from a restart`);

  const refreshed = await afterCutOff(app, server, 'refresh', () => press(Clutter.KEY_F5));
  require(refreshed.unnoticed && refreshed.stored < ARRIVAL_TARGET, `F5 brings in mail ${ms(refreshed.stored)} after a silently dropped connection`);
  const reconnected = await afterCutOff(app, server, 'network', networkReturned);
  require(reconnected.unnoticed && reconnected.stored < ARRIVAL_TARGET,
    `a network change brings in mail ${ms(reconnected.stored)} after a silently dropped connection`);
}

async function runCommand(app, title, label) {
  await changes(app, 'Ctrl+K opens the command palette', () => press(Clutter.KEY_Control_L, Clutter.KEY_k));
  type(title);
  await changes(app, label, () => press(Clutter.KEY_Return), BELOW_INBOX);
}

async function checkScreener(app) {
  const waiting = Number(query("SELECT count(DISTINCT thread) FROM messages WHERE verdict = 'pending'"));
  require(waiting > 0, `with the Screener off, ${waiting} conversations from new senders stay in the inbox`);
  const off = await app.frame(app.area(BELOW_INBOX));
  await runCommand(app, 'Turn on the Screener', 'the Screener shows in the sidebar once it is turned on');
  await runCommand(app, 'Turn off the Screener', 'turning the Screener off changes the sidebar again');
  const offAgain = await app.settle(frame => frame.looksLike(off), app.area(BELOW_INBOX));
  require(offAgain.looksLike(off), 'the Screener leaves the sidebar once it is turned off');
}

export async function checkDelivery(stalwart) {
  const server = new MailServer(stalwart);
  let keyring = null;
  try {
    await server.start();
    await server.startRelay(fixture('services', 'tcpRelay.py'));
    keyring = new ScratchAppSecrets(seed(server.ports));
    require(await keyring.own(), 'a scratch keyring hands Mailman the test passwords');
    server.deliver('bob', 'alice', 'welcome-alice');
    server.deliver('alice', 'bob', 'welcome-bob');
    await withApp('mailman', [], async app => {
      await eventually(() => query("SELECT count(*) FROM messages WHERE subject LIKE 'welcome-%'") === '2', 'mailman syncs the first messages', SYNC_TIMEOUT);
      await checkArrivals(app, server);
      (await app.settle(() => true)).save('mailman-inbox');
      await checkScreener(app);
    });
  } finally {
    keyring?.close();
    await server.remove();
  }
}
