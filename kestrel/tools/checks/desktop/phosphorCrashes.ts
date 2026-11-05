import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {checks} from '../lib/check.js';
import {scratch} from '../lib/processes.js';
import {installBuilt, listed, request} from '../extensions/lib/extensions.js';
import {attachedEffects, choose, nothingAttached, PHOSPHOR} from './phosphor/effects.js';

const {require, eventually} = checks('phosphor crashes');
const STATE = scratch('phosphor-crashes.json');
const STARTING = GLib.build_filenamev([GLib.get_user_state_dir(), 'kestrel', 'effects-starting']);
const requeued = (crashes: number) => `000${crashes}~${GLib.getenv('KESTREL_CAPTURE_WORKER')}-desktop:phosphorCrashes`;
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});

const read = () => JSON.parse(new TextDecoder().decode(GLib.file_get_contents(STATE)[1])) as {crashes: number};
const notified = (title: string) => Main.messageTray.getSources().some(source => source.notifications.some(notification => notification.title === title));
const running = async () => (await listed(PHOSPHOR))?.state === 'running';

function crashAgain(crashes: number, justBefore = ''): Promise<never> {
  GLib.file_set_contents(STATE, JSON.stringify({crashes}));
  GLib.file_set_contents(GLib.build_filenamev([GLib.getenv('KESTREL_CAPTURE_QUEUE')!, requeued(crashes)]), '');
  const pid = Gio.Credentials.new().get_unix_pid();
  Gio.Subprocess.new(['sh', '-c', `kill -SEGV ${pid}; sleep 1; ${justBefore} kill -SEGV ${pid}`], Gio.SubprocessFlags.NONE);
  return new Promise(() => {});
}

export async function run() {
  if (!GLib.file_test(STATE, GLib.FileTest.EXISTS)) {
    await installBuilt(PHOSPHOR);
    await eventually(running, 'Phosphor runs');
    await choose('invert', 'colors');
    await eventually(() => attachedEffects().views > 0, 'a filter is on before Kestrel crashes');
    await crashAgain(1, `: > '${STARTING}';`);
  }
  const {crashes} = read();
  if (crashes === 1) {
    await eventually(() => notified('Screen effects are off'), 'going down as effects went on turns them off, and says so');
    require(kestrel.get_boolean('screen-effects-off'), 'and they stay off');
    require(nothingAttached(), 'so nothing is attached');
    kestrel.reset('screen-effects-off');
    await eventually(() => attachedEffects().views > 0, 'turning them back on brings the filter back');
    await crashAgain(2);
  }
  await eventually(async () => (await listed(PHOSPHOR))?.state === 'crashed', 'a second crash in a row keeps Phosphor off');
  require(nothingAttached(), 'with nothing attached');
  require(!await running(), 'and it stays off');
  await request('Remove', PHOSPHOR);
  for (const key of ['extension-settings', 'disabled-extensions', 'extension-problems']) kestrel.reset(key);
  GLib.unlink(STATE);
}

export const timeout = 120000;
