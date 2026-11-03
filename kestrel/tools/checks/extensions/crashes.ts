import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {checks} from '../lib/check.js';
import {scratch} from '../lib/processes.js';
import {install, listed, RAIN, request} from './lib/extensions.js';

const {require, eventually} = checks('extension crashes');
const STATE = scratch('extension-crashes.json');
const requeued = (crashes: number) => `000${crashes}~${GLib.getenv('KESTREL_CAPTURE_WORKER')}-extensions:crashes`;
const PROBE = 'com.example.Probe';
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});

const read = () => JSON.parse(new TextDecoder().decode(GLib.file_get_contents(STATE)[1])) as {crashes: number};
const notified = (title: string) => Main.messageTray.getSources().some(source => source.notifications.some(notification => notification.title === title));

function crashAgain(crashes: number): Promise<never> {
  GLib.file_set_contents(STATE, JSON.stringify({crashes}));
  GLib.file_set_contents(GLib.build_filenamev([GLib.getenv('KESTREL_CAPTURE_QUEUE')!, requeued(crashes)]), '');
  const pid = Gio.Credentials.new().get_unix_pid();
  Gio.Subprocess.new(['sh', '-c', `kill -SEGV ${pid}; sleep 1; kill -SEGV ${pid}`], Gio.SubprocessFlags.NONE);
  return new Promise(() => {});
}

async function running(id: string) {
  return (await listed(id))?.state === 'running';
}

export async function run() {
  if (!GLib.file_test(STATE, GLib.FileTest.EXISTS)) {
    install('probe', PROBE);
    await request('Reload', PROBE);
    await eventually(() => running(PROBE), 'the probe runs before Kestrel crashes');
    await crashAgain(1);
  }
  const {crashes} = read();
  if (crashes === 1) {
    await eventually(() => running(PROBE), 'one crash leaves the extensions that were running on');
    await crashAgain(2);
  }
  try {
    for (const id of [PROBE, RAIN]) {
      const after = await eventually(() => listed(id), `${id} is still listed after the second crash`);
      require(after.state === 'crashed' && !after.enabled, `${id}, running through two crashes in a row, is kept off`);
    }
    await eventually(() => notified('Probe was turned off') && notified('Rain was turned off'), 'the person is told which extensions were turned off');
    await request('Enable', PROBE);
    await eventually(() => running(PROBE), 'turning it on again in Settings brings it back');
  } finally {
    await request('Remove', PROBE);
    for (const key of ['disabled-extensions', 'extension-problems']) kestrel.reset(key);
    GLib.unlink(STATE);
  }
}

export const timeout = 120000;
