import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {checks} from '../../lib/check.js';
import {freePorts, listening} from '../../lib/ports.js';
import {fixture, repository, scratch, spawn, stop} from '../../lib/processes.js';
import {pause} from '../../lib/wait.js';
import {show} from './navigation.js';

const {require, eventually} = checks('dictation settings');
const SPEECH = 'com.lantharos.Speech1';
const SERVICE = repository('packages', 'speech', 'service', 'target', 'release', 'luft-speech');
const PARAKEET = 'parakeet-tdt-0.6b-v3';
const WHISPER = 'whisper-large-v3-turbo-q5_0';

async function overview() {
  const reply = await Gio.DBus.session.call(SPEECH, '/com/lantharos/Speech1', `${SPEECH}.Models`, 'Overview', null,
    new GLib.VariantType('(s)'), Gio.DBusCallFlags.NONE, -1, null);
  const {models, model} = JSON.parse(reply.deepUnpack()[0]);
  return {model, ...Object.fromEntries(models.map(entry => [entry.id, entry]))};
}

const downloading = (state, id) => state[id].download && !state[id].download.problem && state[id].download.received > 0;

async function saved(app, name, condition) {
  (await app.settle(condition)).save(`settings-dictation-${name}`);
}

export async function checkDictation(app) {
  const {port} = freePorts('port');
  const mirror = spawn(['python3', fixture('services', 'speechModels.py'), `${port}`, repository('packages', 'speech', 'data', 'models.json')]);
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
    require(!(await overview())[WHISPER].download, 'nothing downloads while dictation is off');
    await saved(app, 'off', () => true);

    preferences.set_boolean('enabled', true);
    await eventually(async () => downloading(await overview(), WHISPER), 'turning dictation on downloads Whisper for Japanese');
    await saved(app, 'whisper', () => true);

    preferences.set_string('language', 'en');
    await eventually(async () => {
      const state = await overview();
      return state.model === PARAKEET && downloading(state, PARAKEET) && !state[WHISPER].download;
    }, 'picking English downloads Parakeet instead and stops downloading Whisper');
    const kept = (await overview())[WHISPER].usage;
    require(kept > 0, 'what Whisper already downloaded stays');
    await saved(app, 'parakeet', () => true);

    preferences.set_string('language', 'ja');
    await eventually(async () => {
      const state = await overview();
      return downloading(state, WHISPER) && !state[PARAKEET].download;
    }, 'going back to Japanese picks Whisper up again and stops Parakeet');
    await pause(1000);
    require((await overview())[WHISPER].download.received > kept, 'Whisper carries on from where it stopped');
  } finally {
    for (const key of ['enabled', 'language']) preferences.reset(key);
    await stop(service);
    await stop(mirror);
  }
}
