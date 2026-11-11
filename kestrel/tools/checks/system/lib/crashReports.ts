import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import {STAND_IN_ENVIRONMENT, STAND_IN_KEY} from '../../../fixtures/services/pultInbox.js';
import {answerable, descendants, shownStyled, styled, textOf} from '../../lib/actors.js';
import {call, property} from '../../lib/dbus.js';
import {outcome, repository, scratch, spawn} from '../../lib/processes.js';
import {pause} from '../../lib/wait.js';

const REPORTS = 'com.lantharos.CrashReports1';
const REPORTS_PATH = '/com/lantharos/CrashReports1';
const COREDUMP = 'fc2e22bc6ee647b6b90729ab34a250b1';
const COLLECTOR_NAME = 'com.lantharos.CrashCollector1';
const COLLECTOR = repository('target', 'release', 'luft-crash-collector');
export const FIXTURE = repository('target', 'release', 'luft-crash-fixture');
export const DIALOG = 'kestrel-crash-report-dialog';
export const CONTENTS = 'kestrel-crash-report-contents';

const session = () => GLib.path_get_dirname(GLib.get_user_data_dir());
const cursorFile = () => GLib.build_filenamev([session(), 'crash-collector', 'cursor']);

export function writeConfig(port: number) {
  GLib.file_set_contents(GLib.build_filenamev([session(), 'crash-reports.toml']),
    `environment = "${STAND_IN_ENVIRONMENT}"\nkey = "${STAND_IN_KEY}"\nserver = "http://127.0.0.1:${port}"\n`);
}

export function removeConfig() {
  GLib.unlink(GLib.build_filenamev([session(), 'crash-reports.toml']));
}

export const reportsProperty = <T>(key: string) => property<T>(REPORTS, REPORTS_PATH, REPORTS, key);

export async function choose(choice: 'ask' | 'always' | 'never') {
  await call(REPORTS, REPORTS_PATH, REPORTS, 'SetChoice', new GLib.Variant('(s)', [choice]));
}

export function setMetered(state: number) {
  return call('org.freedesktop.NetworkManager', '/com/lantharos/KestrelChecks/NetworkManager', 'com.lantharos.KestrelChecks.NetworkManager',
    'SetMetered', new GLib.Variant('(u)', [state]), null, {connection: Gio.DBus.system});
}

export const cursor = () => GLib.file_test(cursorFile(), GLib.FileTest.EXISTS)
  ? new TextDecoder().decode(GLib.file_get_contents(cursorFile())[1]) : '';

/** What systemd does after each core dump, and for a poke while the collector is gone: starts it, or wakes it. */
export async function poke() {
  await call('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus', 'StartServiceByName',
    new GLib.Variant('(su)', [COLLECTOR_NAME, 0]), '(u)', {connection: Gio.DBus.system});
  await outcome([COLLECTOR, '--poke']);
}

/** Runs the fixture, or a copy of it elsewhere, until it ends, and gives its process ID. */
export async function crash(mode: string, program = FIXTURE): Promise<number> {
  const process = spawn([program, mode]);
  const pid = Number(process.get_identifier());
  await process.exited;
  return pid;
}

/** Waits until systemd-coredump wrote the core dump of `pid` into the journal. */
export async function dumped(pid: number, tries = 60) {
  for (let tried = 0; tried < tries; tried++) {
    const found = await outcome(['journalctl', '-q', '-o', 'cat', '--output-fields=COREDUMP_PID', `MESSAGE_ID=${COREDUMP}`, `COREDUMP_PID=${pid}`]);
    if (found.stdout) return;
    await pause(500);
  }
  throw new Error(`systemd-coredump never recorded process ${pid}`);
}

/** Pokes the collector until it has read past what was in the journal, as after a core dump. */
export async function collected(before: string) {
  for (let tries = 0; tries < 40 && cursor() === before; tries++) {
    await poke();
    await pause(250);
  }
  if (cursor() === before) throw new Error('the collector never read the journal');
}

const ISOLATION = /[\u2068\u2069]/g;

export const askDialog = () => answerable(DIALOG);

/** Whether the question's title reads `title`, without the marks that isolate a name put into it. */
export const titled = (title: string) =>
  descendants(askDialog()!).some(actor => textOf(actor)?.replace(ISOLATION, '') === title);
export const contentsDialog = () => shownStyled(CONTENTS);
export const shownJson = () => (styled('kestrel-crash-report-json')[0] as St.Label | undefined)?.get_text() ?? '';

export function forbidden(text: string): string[] {
  const user = GLib.get_user_name();
  const host = GLib.get_host_name();
  const real = GLib.get_real_name();
  return [
    ['/var/home/', 'a home path'],
    ['/home/', 'a home path'],
    [user, 'the user name'],
    [host, 'the host name'],
    ...(real && real !== 'Unknown' ? real.split(' ').filter(word => word.length > 2).map(word => [word, 'the real name'] as [string, string]) : []),
    ['KESTREL_', 'an environment variable'],
    ['DBUS_SESSION_BUS_ADDRESS', 'an environment variable'],
    ['COREDUMP_', 'a core dump field'],
  ].filter(([needle]) => needle && text.toLowerCase().includes(needle.toLowerCase())).map(([, what]) => what);
}

export const scratchCopy = () => scratch('crash-reports', 'third-party', 'luft-crash-fixture');
