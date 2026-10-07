import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {ScratchAppSecrets} from '../../fixtures/services/appSecrets.js';
import {Keys, LuftApp, sleep, waitFor} from './luftApp.js';

const PORTS = {imap: 47831, smtp: 47832, http: 47833, relay: 47834};
const USERS = {alice: 'alice-password', bob: 'bob-password'};
const ARRIVAL_TARGET = 2000;
const RECOVERY_TARGET = 10000;
const GIVE_UP = 45000;
const STARTUP = 20000;
const SILENT = 3000;
const SPACING = 1500;
const LIST_AREA = {left: 248, top: 60, width: 408, height: 240};
const BELOW_INBOX = {left: 8, top: 150, width: 232, height: 260};
const TOOLS = GLib.path_get_dirname(GLib.path_get_dirname(GLib.path_get_dirname(GLib.filename_from_uri(import.meta.url)[0])));
const STORE = GLib.build_filenamev([GLib.get_user_data_dir(), 'mailman', 'mail.sqlite']);

const scratch = (...parts) => GLib.build_filenamev([GLib.get_user_cache_dir(), 'mailman-delivery', ...parts]);
const elapsed = since => (GLib.get_monotonic_time() - since) / 1000;
const median = values => values.toSorted((a, b) => a - b)[Math.floor(values.length / 2)];

function query(sql) {
  const [, stdout] = GLib.spawn_sync(null, ['sqlite3', STORE, sql], null, GLib.SpawnFlags.SEARCH_PATH, null);
  return new TextDecoder().decode(stdout).trim();
}

function serverConfig() {
  const principals = Object.entries(USERS).map(([name, secret]) => `[[directory."memory".principals]]
name = "${name}"
class = "individual"
secret = "${secret}"
email = ["${name}@example.test"]
`).join('\n');
  return `[server]
hostname = "127.0.0.1"
[server.listener.smtp]
bind = ["127.0.0.1:${PORTS.smtp}"]
protocol = "smtp"
[server.listener.imap]
bind = ["127.0.0.1:${PORTS.imap}"]
protocol = "imap"
[server.listener.http]
bind = ["127.0.0.1:${PORTS.http}"]
protocol = "http"
[http]
url = "'http://127.0.0.1:${PORTS.http}'"
[storage]
data = "rocksdb"
fts = "rocksdb"
blob = "rocksdb"
lookup = "rocksdb"
directory = "memory"
[store."rocksdb"]
type = "rocksdb"
path = "${scratch('data')}"
[directory."memory"]
type = "memory"
${principals}
[session.auth]
mechanisms = "[plain, login]"
allow-plain-text = true
[imap.auth]
allow-plain-text = true
[session.rcpt]
directory = "'memory'"
relay = false
`;
}

function listening(port) {
  try {
    new Gio.SocketClient().connect_to_host(`127.0.0.1:${port}`, 0, null).close(null);
    return true;
  } catch {
    return false;
  }
}

function spawn(argv) {
  return Gio.Subprocess.new(argv, Gio.SubprocessFlags.STDOUT_SILENCE | Gio.SubprocessFlags.STDERR_SILENCE);
}

async function startServer(stalwart) {
  const server = spawn([stalwart, '--config', scratch('config.toml')]);
  await waitFor(() => listening(PORTS.imap) && listening(PORTS.smtp) && listening(PORTS.http), STARTUP, () => 'Stalwart did not start');
  return server;
}

function deliver(from, to, subject) {
  const connection = new Gio.SocketClient().connect_to_host(`127.0.0.1:${PORTS.smtp}`, 0, null);
  const input = new Gio.DataInputStream({base_stream: connection.get_input_stream()});
  const reply = () => {
    let line;
    do [line] = input.read_line_utf8(null);
    while (line?.[3] === '-');
    if (!/^[23]/.test(line ?? '')) throw new Error(`Stalwart refused the message: ${line}`);
  };
  const say = text => {
    connection.get_output_stream().write_all(new TextEncoder().encode(`${text}\r\n`), null);
    reply();
  };
  reply();
  say('EHLO checks.example.test');
  say(`AUTH PLAIN ${GLib.base64_encode(new TextEncoder().encode(`\0${from}\0${USERS[from]}`))}`);
  say(`MAIL FROM:<${from}@example.test>`);
  say(`RCPT TO:<${to}@example.test>`);
  say('DATA');
  say(`From: ${from}@example.test\r\nTo: ${to}@example.test\r\nSubject: ${subject}\r\nMessage-ID: <${subject}@example.test>\r\n\r\nHello from the delivery check.\r\n.`);
  say('QUIT');
  connection.close(null);
  return GLib.get_monotonic_time();
}

function seed() {
  const smtp = {host: '127.0.0.1', port: PORTS.smtp, security: 'none'};
  const accounts = [
    ['alice', {kind: 'imap', imap: {host: '127.0.0.1', port: PORTS.relay, security: 'none'}, smtp}],
    ['bob', {kind: 'jmap', session: `http://127.0.0.1:${PORTS.http}/.well-known/jmap`}],
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

function area(app, {left, top, width, height}) {
  const {x, y} = app.window.get_frame_rect();
  return {x: x + left, y: y + top, width, height};
}

const listFrame = app => app.frame(area(app, LIST_AREA));

async function arrival(app, subject, since) {
  const before = await listFrame(app);
  let stored = null;
  let shown = null;
  while ((stored === null || shown === null) && elapsed(since) < GIVE_UP) {
    if (stored === null && query(`SELECT count(*) FROM messages WHERE subject = '${subject}'`) !== '0') stored = elapsed(since);
    if (shown === null && stored !== null && !(await listFrame(app)).looksLike(before)) shown = elapsed(since);
    await sleep(20);
  }
  return {stored: stored ?? Infinity, shown: shown ?? Infinity};
}

async function deliveries(app, from, to, label) {
  const timings = [];
  for (let round = 1; round <= 3; round++) {
    const subject = `${label}-${round}`;
    timings.push(await arrival(app, subject, deliver(from, to, subject)));
    await sleep(SPACING);
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

async function afterCutOff(app, relay, subject, recover) {
  relay.send_signal(10);
  await sleep(SPACING);
  deliver('bob', 'alice', subject);
  await sleep(SILENT);
  const unnoticed = query(`SELECT count(*) FROM messages WHERE subject = '${subject}'`) === '0';
  const since = recover();
  return {unnoticed, ...(await arrival(app, subject, since))};
}

async function runCommand(app, keys, title) {
  keys.press(Clutter.KEY_k, [Clutter.KEY_Control_L]);
  await sleep(SPACING);
  await keys.type(title);
  keys.press(Clutter.KEY_Return);
  await sleep(SPACING);
  return app.settle(() => true, area(app, BELOW_INBOX));
}

async function screenerSwitch(app) {
  const keys = new Keys();
  const waiting = query("SELECT count(DISTINCT thread) FROM messages WHERE verdict = 'pending'");
  const off = await app.settle(() => true, area(app, BELOW_INBOX));
  const on = await runCommand(app, keys, 'Turn on the Screener');
  const offAgain = await runCommand(app, keys, 'Turn off the Screener');
  return {waiting: Number(waiting), appears: !on.looksLike(off), leaves: offAgain.looksLike(off)};
}

async function measure(app, servers, stalwart) {
  const keys = new Keys();
  const imap = await deliveries(app, 'bob', 'alice', 'idle');
  const jmap = await deliveries(app, 'alice', 'bob', 'push');

  servers.stalwart.force_exit();
  await new Promise(resolve => servers.stalwart.wait_async(null, () => resolve()));
  await sleep(SILENT);
  servers.stalwart = await startServer(stalwart);
  const restarted = await arrival(app, 'restart', deliver('bob', 'alice', 'restart'));

  const refreshed = await afterCutOff(app, servers.relay, 'refresh', () => {
    keys.press(Clutter.KEY_F5);
    return GLib.get_monotonic_time();
  });
  const reconnected = await afterCutOff(app, servers.relay, 'network', () => {
    networkReturned();
    return GLib.get_monotonic_time();
  });
  return {imap, jmap, restarted, refreshed, reconnected};
}

export async function checkMailman({require, output}) {
  const stalwart = GLib.find_program_in_path('stalwart');
  if (!stalwart) {
    console.log('Kestrel Luft app check: mailman delivery skipped without stalwart');
    return;
  }
  GLib.mkdir_with_parents(scratch('data'), 0o755);
  GLib.file_set_contents(scratch('config.toml'), serverConfig());
  const servers = {stalwart: await startServer(stalwart), relay: spawn(['python3', `${TOOLS}/fixtures/services/tcpRelay.py`, `${PORTS.relay}`, `${PORTS.imap}`])};
  await waitFor(() => listening(PORTS.relay), STARTUP, () => 'the relay did not start');
  let keyring = null;
  let app = new LuftApp('mailman');
  try {
    await app.open();
    await app.close();
    keyring = new ScratchAppSecrets(seed());
    require(await keyring.own(), 'a scratch keyring hands Mailman the test passwords');
    deliver('bob', 'alice', 'welcome-alice');
    deliver('alice', 'bob', 'welcome-bob');
    app = new LuftApp('mailman');
    await app.open();
    await waitFor(() => query("SELECT count(*) FROM messages WHERE subject LIKE 'welcome-%'") === '2', STARTUP, () => 'mailman never synced the first messages');
    await sleep(SPACING);
    const {imap, jmap, restarted, refreshed, reconnected} = await measure(app, servers, stalwart);
    (await app.settle(() => true)).save(`${output}/mailman-inbox.png`);
    const screener = await screenerSwitch(app);
    const ms = value => `${Math.round(value)} ms`;
    console.log(`Kestrel Luft app check: mailman delivery: IMAP IDLE stored ${ms(imap.stored)}, shown ${ms(imap.shown)}; JMAP push stored ${ms(jmap.stored)}, shown ${ms(jmap.shown)}; after a server restart ${ms(restarted.stored)}; F5 after a silent drop ${ms(refreshed.stored)}; network change after a silent drop ${ms(reconnected.stored)}`);
    require(imap.shown < ARRIVAL_TARGET, `mail over IMAP IDLE is listed ${ms(imap.shown)} after delivery`);
    require(jmap.shown < ARRIVAL_TARGET, `mail over JMAP push is listed ${ms(jmap.shown)} after delivery`);
    require(restarted.stored < RECOVERY_TARGET, `mail arrives ${ms(restarted.stored)} after the server comes back from a restart`);
    require(refreshed.unnoticed && refreshed.stored < ARRIVAL_TARGET, `F5 brings in mail ${ms(refreshed.stored)} after a silently dropped connection`);
    require(reconnected.unnoticed && reconnected.stored < ARRIVAL_TARGET, `a network change brings in mail ${ms(reconnected.stored)} after a silently dropped connection`);
    require(screener.waiting > 0 && screener.appears && screener.leaves, `with the Screener off, ${screener.waiting} conversations from new senders stay in the inbox, and the Screener shows in the sidebar only while it is on`);
  } finally {
    await app.close();
    keyring?.close();
    servers.relay.force_exit();
    servers.stalwart.force_exit();
    GLib.spawn_command_line_sync(`rm -rf ${GLib.shell_quote(scratch())}`);
  }
}
