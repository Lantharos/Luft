import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

import {LEVEL_FLOOR_DB, loudness} from '../lib/audio/loudness.js';
import {intoSpeakers, removeNode} from '../lib/audio/routing.js';
import {checks} from '../lib/check.js';
import {scratch} from '../lib/processes.js';
import {pause} from '../lib/wait.js';
import {listed, request, SEASONS, setSetting} from '../extensions/lib/extensions.js';

const {require, eventually} = checks('Seasons sound');
const FADE_IN_MS = 2500;
const FADE_OUT_MS = 1500;
const AUDIBLE_DB = LEVEL_FLOOR_DB + 2;
const AUDIBLY_LOUDER_DB = 6;
const LONGER_THAN_A_LOOP_MS = 32000;
const RECOVERY_MS = 8000;
const RESTARTED = scratch('seasons-sound-restarted');
const REQUEUED = `0000~${GLib.getenv('KESTREL_CAPTURE_WORKER')}-desktop:seasonsSound`;
const mixer = Shell.Mixer.get_default();
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});

const turn = (key: string, on: boolean) => setSetting(SEASONS, key, new GLib.Variant('b', on));
const routed = () => intoSpeakers({'media.name': 'Seasons'}, 'Seasons:output', 2);

async function heard() {
  await eventually(routed, 'the rain reaches the speakers');
  await pause(FADE_IN_MS);
  return loudness(eventually);
}

async function expectRain(when: string) {
  const level = await heard();
  require(level > AUDIBLE_DB, `the rain can be heard ${when} (${level.toFixed(1)} dB)`);
}

async function expectQuiet(when: string) {
  await pause(FADE_OUT_MS);
  await eventually(() => !mixer.playing, `the rain stops ${when}`);
}

function restartKestrel() {
  GLib.file_set_contents(RESTARTED, '');
  GLib.file_set_contents(GLib.build_filenamev([GLib.getenv('KESTREL_CAPTURE_QUEUE')!, REQUEUED]), '');
  const pid = Gio.Credentials.new().get_unix_pid();
  Gio.Subprocess.new(['sh', '-c', `kill -SEGV ${pid}; sleep 1; kill -SEGV ${pid}`], Gio.SubprocessFlags.NONE);
  return new Promise(() => {});
}

async function checkVolume() {
  const usual = await heard();
  await setSetting(SEASONS, 'volume', new GLib.Variant('d', 1));
  const full = await heard();
  require(full > usual + AUDIBLY_LOUDER_DB, `turning its volume up makes it louder (${usual.toFixed(1)} → ${full.toFixed(1)} dB)`);
  await setSetting(SEASONS, 'volume', new GLib.Variant('d', 0.6));
}

async function checkLoops() {
  await pause(LONGER_THAN_A_LOOP_MS);
  await expectRain('once its loops have played through');
}

async function checkLostStream() {
  await eventually(() => removeNode({'media.name': 'Seasons'}), 'the sound server loses the rain');
  await eventually(() => !mixer.playing, 'and the rain stops');
  await eventually(routed, 'until it starts again by itself', RECOVERY_MS);
  await expectRain('after the sound server lost it');
}

async function checkOrders() {
  await turn('on', true);
  await turn('sound', true);
  await expectRain('after turning Seasons on and then its sound');

  await turn('sound', false);
  await expectQuiet('when its sound is turned off');
  await turn('on', false);
  await turn('sound', true);
  await pause(FADE_OUT_MS);
  require(!mixer.playing, 'its sound stays off while Seasons is off');
  await turn('on', true);
  await expectRain('after turning its sound on and then Seasons');

  await request('Disable', SEASONS);
  await expectQuiet('when Seasons is disabled');
  await request('Enable', SEASONS);
  await expectRain('after Seasons starts again with both on');
}

export async function run() {
  await eventually(async () => (await listed(SEASONS))?.state === 'running', 'Seasons runs in a new account');
  if (GLib.file_test(RESTARTED, GLib.FileTest.EXISTS)) {
    await expectRain('after Kestrel starts again with both on');
    kestrel.reset('extension-settings');
    return;
  }
  await checkOrders();
  await checkVolume();
  await checkLoops();
  await checkLostStream();
  await restartKestrel();
}

export const timeout = 180000;
