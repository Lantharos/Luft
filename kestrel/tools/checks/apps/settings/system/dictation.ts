import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type {LuftApp} from '../../../lib/apps/luftApp.js';
import {checks} from '../../../lib/check.js';
import {freePorts, listening} from '../../../lib/apps/ports.js';
import {fixture, repository, scratch, spawn, stop} from '../../../lib/processes.js';
import type {Frame} from '../../../lib/screenshots.js';
import {pause} from '../../../lib/wait.js';
import {show} from '../navigation.js';

const {require, eventually} = checks('dictation settings');
const SPEECH = 'com.lantharos.Speech1';
const SERVICE = repository('target', 'release', 'luft-speech');
const PARAKEET = 'parakeet-tdt-0.6b-v3';
const WHISPER = 'whisper-large-v3-turbo-q5_0';

interface Model {
  id: string;
  usage: number;
  download: {problem: string | null; received: number} | null;
}

interface Models {
  model: string;
  models: Model[];
}

async function overview() {
  const reply = await Gio.DBus.session.call(SPEECH, '/com/lantharos/Speech1', `${SPEECH}.Models`, 'Overview', null,
    new GLib.VariantType('(s)'), Gio.DBusCallFlags.NONE, -1, null);
  const {models, model}: Models = JSON.parse(reply.deepUnpack<[string]>()[0]);
  return {model, models: Object.fromEntries(models.map(entry => [entry.id, entry]))};
}

type Overview = Awaited<ReturnType<typeof overview>>;

const downloading = (state: Overview, id: string) => state.models[id].download && !state.models[id].download.problem && state.models[id].download.received > 0;

async function saved(app: LuftApp, name: string, condition: (frame: Frame) => boolean) {
  (await app.settle(condition)).save(`settings-dictation-${name}`);
}

export async function checkDictation(app: LuftApp) {
  const {port} = freePorts('port');
  const mirror = spawn(['python3', fixture('services', 'speechModels.py'), `${port}`, repository('services', 'speech', 'data', 'models.json')]);
  const preferences = new Gio.Settings({schema_id: 'com.lantharos.kestrel.dictation'});
  const service = spawn([SERVICE], {env: {
    XDG_DATA_HOME: scratch('kestrel-settings-dictation', `${GLib.get_real_time()}`),
    LUFT_SPEECH_MIRROR: `http://127.0.0.1:${port}`,
  }});
  try {
    await eventually(() => listening(port), 'the stand-in model mirror is up');
    preferences.set_string('language', 'ja');
    await show(app, 'input/dictation');
    await eventually(async () => (await overview()).model === WHISPER, 'Japanese needs Whisper', 15000);
    require(!(await overview()).models[WHISPER].download, 'nothing downloads while dictation is off');
    await saved(app, 'off', () => true);

    preferences.set_boolean('enabled', true);
    await eventually(async () => downloading(await overview(), WHISPER), 'turning dictation on downloads Whisper for Japanese');
    await saved(app, 'whisper', () => true);

    preferences.set_string('language', 'en');
    await eventually(async () => {
      const state = await overview();
      return state.model === PARAKEET && downloading(state, PARAKEET) && !state.models[WHISPER].download;
    }, 'picking English downloads Parakeet instead and stops downloading Whisper');
    const kept = (await overview()).models[WHISPER].usage;
    require(kept > 0, 'what Whisper already downloaded stays');
    await saved(app, 'parakeet', () => true);

    preferences.set_string('language', 'ja');
    await eventually(async () => {
      const state = await overview();
      return downloading(state, WHISPER) && !state.models[PARAKEET].download;
    }, 'going back to Japanese picks Whisper up again and stops Parakeet');
    await pause(1000);
    require(((await overview()).models[WHISPER].download?.received ?? 0) > kept, 'Whisper carries on from where it stopped');
  } finally {
    for (const key of ['enabled', 'language']) preferences.reset(key);
    await stop(service);
    await stop(mirror);
  }
}
