import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {onsets, overhear, pitchAt} from '../lib/audio/ear.js';
import {RATE, wav} from '../lib/audio/music.js';
import {intoSpeakers} from '../lib/audio/routing.js';
import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {click, hold, press, release, type Point} from '../lib/input/input.js';
import {capture} from '../lib/screenshots.js';
import {threads} from '../lib/threads.js';
import {builtFixture, repository, scratch, spawn, stop, waitForWindow, windows} from '../lib/processes.js';
import {pause} from '../lib/wait.js';
import {promptEntry, showPrompt, unlock, wake} from '../lockScreen/lib/shield.js';
import {installBuilt, listed, request, setSetting, developmentFolder} from '../extensions/lib/extensions.js';

const {require, eventually} = checks('Keystrokes');
const KEYSTROKES = 'com.lantharos.Keystrokes';
const NAME = 'com.lantharos.Kestrel';
const PATH = '/com/lantharos/Kestrel/Extensions';
const IFACE = 'com.lantharos.Kestrel.Extensions';
const KEY_GAP_MS = 110;
const BESIDE_FIELDS = 40;
const TONE_S = 0.05;
const TONES = {key: 1000, space: 1800, enter: 2600, backspace: 3400, click: 4200};
const PITCH_TOLERANCE = 300;
const REPEATS_AFTER_MS = 900;
const FAST_KEYS = 90;
const FAST_GAP_MS = 25;
const NEARLY_CLIPPED = 0.995;
const TAIL_AFTER_FAST_MS = 500;
const LATENCY_PRESSES = 40;
const LATENCY_GAP_MS = 120;
const LONGEST_LATENCY_MS = 15;
const STREAM_SLEEPS_MS = 7000;
const WAKEUPS_MS = 3000;
const CPU_MS = 6000;
const CPU_GAP_MS = 100;
const AUDIO_THREAD = /^(data-loop|kestrel-extensio)/;
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});

type PageItem = {type: string; title?: string; text?: string; action?: string; items?: {title: string; description?: string; actions?: {label: string; action: string}[]}[]};
type Tone = keyof typeof TONES;

const dataFolder = () => GLib.build_filenamev([GLib.get_user_data_dir(), 'luft', 'extension-data', KEYSTROKES]);
const storageFile = () => GLib.build_filenamev([GLib.get_user_state_dir(), 'luft', 'extension-storage', `${KEYSTROKES}.json`]);

async function pageItems(): Promise<PageItem[]> {
  const [json] = (await call(NAME, PATH, IFACE, 'Page', new GLib.Variant('(s)', [KEYSTROKES]), '(s)')).deepUnpack<[string]>();
  return (JSON.parse(json) as {items: PageItem[]}[]).flatMap(section => section.items);
}

const act = (action: string) => call(NAME, PATH, IFACE, 'Act', new GLib.Variant('(ssv)', [KEYSTROKES, action, new GLib.Variant('b', true)]));

const packRow = async (title: string) => (await pageItems()).flatMap(item => item.items ?? []).find(row => row.title === title);

async function usePack(title: string) {
  const use = (await packRow(title))?.actions?.find(action => action.label === 'Use');
  if (use) await act(use.action);
  await eventually(async () => (await packRow(title))?.description === 'In use', `${title} is in use`);
}

function tone(hertz: number): Float32Array {
  return Float32Array.from({length: RATE * TONE_S}, (_, index) => Math.sin(2 * Math.PI * hertz * index / RATE) * 0.5 * Math.min(1, (RATE * TONE_S - index) / 240));
}

function installTones() {
  const folder = GLib.build_filenamev([dataFolder(), 'tones']);
  GLib.mkdir_with_parents(folder, 0o700);
  const sounds: Record<string, string> = {};
  for (const [kind, hertz] of Object.entries(TONES)) {
    GLib.file_set_contents(`${folder}/${kind}.wav`, wav(tone(hertz)));
    sounds[kind] = `${kind}.wav`;
  }
  GLib.file_set_contents(`${folder}/pack.json`, JSON.stringify({name: 'Tones', sounds}));
  GLib.mkdir_with_parents(GLib.path_get_dirname(storageFile()), 0o700);
  GLib.file_set_contents(storageFile(), JSON.stringify({packs: [folder], pack: 'tones'}));
}

const kindOf = (hertz: number) => (Object.entries(TONES).find(([, tone]) => Math.abs(tone - hertz) < PITCH_TOLERANCE)?.[0] ?? `${Math.round(hertz)} Hz`) as Tone;

async function kindsHeard(presses: () => void | Promise<void>): Promise<string[]> {
  const samples = await overhear(eventually, presses);
  return onsets(samples).map(at => kindOf(pitchAt(samples, at)));
}

const spaced = async (...keys: number[]) => {
  for (const key of keys) {
    press(key);
    await pause(KEY_GAP_MS);
  }
};

const besideFields = (window: Meta.Window): Point => {
  const {x, y, height} = window.get_frame_rect();
  return [x + BESIDE_FIELDS, y + height - BESIDE_FIELDS];
};

async function openEntries() {
  const before = new Set(windows());
  const process = spawn(['gjs', '-m', builtFixture('clients', 'entries', 'passwordEntry.js')]);
  const window = await waitForWindow(candidate => !before.has(candidate) && candidate.get_title()?.startsWith('Kestrel entry') === true, 'the entries open');
  await eventually(() => global.display.focus_window === window, 'they have the keyboard');
  await pause(300);
  return {window, close: () => stop(process)};
}

async function checkKinds(entries: Meta.Window) {
  const heard = await kindsHeard(() => spaced(Clutter.KEY_a, Clutter.KEY_7, Clutter.KEY_Shift_L, Clutter.KEY_Escape, Clutter.KEY_space, Clutter.KEY_Return, Clutter.KEY_BackSpace));
  require(heard.join() === 'key,key,key,key,space,enter,backspace', `letters and other keys, Space, Enter and Backspace sound apart (${heard.join()})`);

  const clicked = await kindsHeard(async () => {
    click(besideFields(entries));
    await pause(KEY_GAP_MS);
  });
  require(clicked.join() === 'click', `a mouse button sounds like a click (${clicked.join()})`);

  const typed = entries.get_title()!;
  const held = await kindsHeard(async () => {
    hold(Clutter.KEY_a);
    await pause(REPEATS_AFTER_MS);
    release(Clutter.KEY_a);
  });
  await eventually(() => entries.get_title()!.length > typed.length + 2, 'a held key repeats');
  require(held.join() === 'key', `and only sounds once (${held.join()})`);

  const volume = await kindsHeard(() => spaced(Clutter.KEY_AudioRaiseVolume, Clutter.KEY_AudioLowerVolume));
  require(!volume.length, `volume keys stay silent (${volume.join()})`);
}

async function checkSwitches(entries: Meta.Window) {
  const pressAndClick = async () => {
    press(Clutter.KEY_a);
    await pause(KEY_GAP_MS);
    click(besideFields(entries));
    await pause(KEY_GAP_MS);
  };
  await setSetting(KEYSTROKES, 'keys', new GLib.Variant('b', false));
  await pause(100);
  const clicksOnly = await kindsHeard(pressAndClick);
  require(clicksOnly.join() === 'click', `with typing sounds off only clicks play (${clicksOnly.join()})`);
  await setSetting(KEYSTROKES, 'keys', new GLib.Variant('b', true));
  await setSetting(KEYSTROKES, 'clicks', new GLib.Variant('b', false));
  await pause(100);
  const keysOnly = await kindsHeard(pressAndClick);
  require(keysOnly.join() === 'key', `with mouse clicks off only keys play (${keysOnly.join()})`);
  await setSetting(KEYSTROKES, 'clicks', new GLib.Variant('b', true));
}

async function checkPasswordField(entries: Meta.Window) {
  await spaced(Clutter.KEY_Tab);
  await pause(250);
  const before = entries.get_title()!;
  const typing = await kindsHeard(async () => {
    await spaced(Clutter.KEY_s, Clutter.KEY_e, Clutter.KEY_c, Clutter.KEY_space, Clutter.KEY_BackSpace, Clutter.KEY_Return);
    click(besideFields(entries));
    await pause(KEY_GAP_MS);
  });
  await eventually(() => entries.get_title() !== before, 'the password field gets what’s typed');
  require(!typing.length, `an app’s password field stays silent, keys and clicks (${typing.join()})`);
  press(Clutter.KEY_ISO_Left_Tab);
  await pause(250);
  const after = await kindsHeard(() => spaced(Clutter.KEY_b));
  require(after.join() === 'key', `and leaving it brings the sounds back (${after.join()})`);
}

async function checkOwnPasswordField() {
  const entry = new St.PasswordEntry({reactive: true, can_focus: true});
  Main.uiGroup.add_child(entry);
  entry.grab_key_focus();
  await pause(100);
  try {
    const hidden = await kindsHeard(() => spaced(Clutter.KEY_a, Clutter.KEY_space));
    require(entry.text === 'a ' && !hidden.length, `Kestrel's own password fields stay silent (${hidden.join()})`);
    const numeric = await kindsHeard(() => {
      entry.input_purpose = Clutter.InputContentPurpose.DIGITS;
      return spaced(Clutter.KEY_1, Clutter.KEY_2);
    });
    require(!numeric.length, `whatever their purpose, while their text is hidden (${numeric.join()})`);
  } finally {
    entry.destroy();
  }
  global.stage.set_key_focus(null);
}

async function checkLockScreen() {
  const atOnce = await kindsHeard(async () => {
    Main.screenShield.lock(true);
    press(Clutter.KEY_a);
    await pause(KEY_GAP_MS);
  });
  require(!atOnce.length, `a key pressed as the screen locks stays silent (${atOnce.join()})`);
  await eventually(() => Main.screenShield.active, 'the screen locks');
  await wake();
  const locked = await kindsHeard(() => spaced(Clutter.KEY_b, Clutter.KEY_space));
  require(!locked.length, `keys on the lock screen stay silent (${locked.join()})`);
  await showPrompt();
  const prompted = await kindsHeard(async () => {
    await spaced(Clutter.KEY_p, Clutter.KEY_w, Clutter.KEY_BackSpace);
    click(promptEntry()!);
    await pause(KEY_GAP_MS);
  });
  require(!prompted.length, `the unlock prompt stays silent (${prompted.join()})`);
  await capture('keystrokes-locked');
  await unlock();
  await eventually(() => !Main.screenShield.active, 'the screen unlocks');
  await pause(300);
}

async function checkFastTyping() {
  await usePack('Typewriter');
  await setSetting(KEYSTROKES, 'key-volume', new GLib.Variant('d', 1));
  await pause(800);
  let lastPress = 0;
  const samples = await overhear(eventually, async () => {
    for (let key = 0; key < FAST_KEYS; key++) {
      press(Clutter.KEY_a);
      await pause(FAST_GAP_MS);
    }
    lastPress = Date.now();
  }, TAIL_AFTER_FAST_MS);
  const peak = samples.reduce((most, sample) => Math.max(most, Math.abs(sample)), 0);
  const clipped = samples.reduce((count, sample) => count + (Math.abs(sample) >= NEARLY_CLIPPED ? 1 : 0), 0);
  const lastLoud = samples.findLastIndex(sample => Math.abs(sample) > 0.01);
  console.log(`Kestrel keystrokes fast typing: ${JSON.stringify({keys: FAST_KEYS, gapMs: FAST_GAP_MS, peak: Math.round(peak * 1000) / 1000, clipped, quietForMs: Math.round((samples.length - lastLoud) / RATE * 1000)})}`);
  require(lastPress && peak > 0.05, `very fast typing plays (peak ${peak.toFixed(3)})`);
  require(peak < 1 && clipped === 0, `without clipping (peak ${peak.toFixed(3)}, ${clipped} clipped samples)`);
  require((samples.length - lastLoud) / RATE * 1000 > TAIL_AFTER_FAST_MS - 330, 'and it dies away right after the last key, nothing piled up');
  await setSetting(KEYSTROKES, 'key-volume', new GLib.Variant('d', 0.7));
  await usePack('Tones');
}

const percentile = (sorted: number[], at: number) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * at))];

async function checkLatency() {
  const mix = Shell.SoundMix.new('Keystroke timing', 'application-x-addon-symbolic');
  const sounds = Shell.KeySounds.new(mix);
  const folder = repository('extensions', 'keystrokes', 'packs', 'mechanical');
  const files = [1, 2, 3, 4, 5].map(take => Gio.File.new_for_path(`${folder}/key-${take}.flac`));
  const loaded = new Promise<void>(resolve => sounds.connect('loaded', () => resolve()));
  sounds.load(files.map(() => Shell.KeySound.KEY), files);
  sounds.set_levels(0.5, 0);
  await loaded;
  await eventually(() => intoSpeakers({'media.name': 'Keystroke timing'}, 'Keystroke timing:output', 2), 'timing sounds reach the speakers');
  const taken: number[] = [];
  try {
    await request('Disable', KEYSTROKES);
    await pause(STREAM_SLEEPS_MS);
    press(Clutter.KEY_a);
    await pause(400);
    const first = Number(sounds.get_latest_latency()) / 1000;
    for (let index = 0; index < LATENCY_PRESSES; index++) {
      press(Clutter.KEY_a);
      await pause(LATENCY_GAP_MS);
      taken.push(Number(sounds.get_latest_latency()) / 1000);
    }
    const sorted = taken.toSorted((a, b) => a - b);
    const numbers = {firstAfterRestMs: first, medianMs: percentile(sorted, 0.5), p95Ms: percentile(sorted, 0.95), longestMs: sorted.at(-1)};
    console.log(`Kestrel keystrokes latency: ${JSON.stringify(numbers)}`);
    require(numbers.p95Ms < LONGEST_LATENCY_MS, `a press is heard within ${LONGEST_LATENCY_MS} ms (${numbers.medianMs.toFixed(1)} ms typically, ${numbers.p95Ms.toFixed(1)} ms at worst in twenty)`);
  } finally {
    sounds.close();
    mix.close();
    await request('Enable', KEYSTROKES);
  }
}

async function usage(during: () => Promise<void>) {
  const before = threads();
  const started = GLib.get_monotonic_time();
  await during();
  const seconds = (GLib.get_monotonic_time() - started) / 1e6;
  let onCpu = 0;
  let switches = 0;
  let audioSwitches = 0;
  for (const [id, thread] of threads()) {
    const woke = thread.switches - (before.get(id)?.switches ?? 0);
    onCpu += thread.onCpu - (before.get(id)?.onCpu ?? 0);
    switches += woke;
    if (AUDIO_THREAD.test(thread.name)) audioSwitches += woke;
  }
  return {cpuPercent: Math.round(onCpu / 1e9 / seconds * 1000) / 10, wakeupsPerSecond: Math.round(switches / seconds), audioWakeupsPerSecond: Math.round(audioSwitches / seconds)};
}

async function typingFor(milliseconds: number) {
  const deadline = GLib.get_monotonic_time() + milliseconds * 1000;
  while (GLib.get_monotonic_time() < deadline) {
    press(Clutter.KEY_a);
    await pause(CPU_GAP_MS);
  }
}

async function checkCost() {
  await pause(STREAM_SLEEPS_MS);
  const idle = await usage(() => pause(WAKEUPS_MS));
  const typing = await usage(() => typingFor(CPU_MS));
  await request('Disable', KEYSTROKES);
  await pause(STREAM_SLEEPS_MS);
  const off = await usage(() => pause(WAKEUPS_MS));
  const typingOff = await usage(() => typingFor(CPU_MS));
  await request('Enable', KEYSTROKES);
  console.log(`Kestrel keystrokes cost: ${JSON.stringify({idle, typing, off, typingOff})}`);
  require(idle.audioWakeupsPerSecond === 0, `at rest its sound threads never wake (${idle.audioWakeupsPerSecond} a second, ${idle.wakeupsPerSecond} across all of Kestrel, ${off.wakeupsPerSecond} with it off)`);
  require(typing.cpuPercent - typingOff.cpuPercent < 3, `and typing adds next to no CPU (${typingOff.cpuPercent} → ${typing.cpuPercent}%)`);
}

async function answerFolder(path: string) {
  await call('org.freedesktop.impl.portal.desktop.rover', '/org/freedesktop/portal/desktop', 'com.lantharos.KestrelChecks.FileChooser', 'Answer', new GLib.Variant('(s)', [Gio.File.new_for_path(path).get_uri()]));
}

function packFolder(name: string, change: (manifest: {name?: string; sounds: Record<string, unknown>}) => void) {
  const folder = scratch(`keystrokes-${name}-${GLib.uuid_string_random()}`);
  GLib.mkdir_with_parents(folder, 0o755);
  const template = GLib.build_filenamev([developmentFolder(KEYSTROKES), 'template']);
  const children = Gio.File.new_for_path(template).enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null);
  for (let info: Gio.FileInfo | null; (info = children.next_file(null));)
    Gio.File.new_for_path(`${template}/${info.get_name()}`).copy(Gio.File.new_for_path(`${folder}/${info.get_name()}`), Gio.FileCopyFlags.NONE, null, null);
  const manifest = JSON.parse(new TextDecoder().decode(GLib.file_get_contents(`${folder}/pack.json`)[1]));
  change(manifest);
  GLib.file_set_contents(`${folder}/pack.json`, JSON.stringify(manifest));
  return folder;
}

async function addPack(folder: string) {
  await answerFolder(folder);
  const add = (await pageItems()).find(item => item.title === 'Add sounds')!;
  await act(add.action!);
}

const says = async (pattern: RegExp) => (await pageItems()).some(item => item.type === 'text' && pattern.test(item.text!));

async function checkPacks() {
  await addPack(packFolder('keyless', manifest => delete manifest.sounds.key));
  await eventually(() => says(/at least one key sound/), 'a pack without a key sound says so plainly');
  await addPack(packFolder('missing', manifest => {
    manifest.sounds.space = 'nowhere.flac';
  }));
  await eventually(() => says(/nowhere\.flac isn't in that folder, can't be played/), 'a pack with a missing sound names it');
  await addPack(packFolder('fine', manifest => {
    manifest.name = 'Biscuit';
  }));
  await eventually(async () => (await packRow('Biscuit'))?.description === 'In use', 'a good pack joins the list and plays');
  const remove = (await packRow('Biscuit'))!.actions!.find(action => action.label === 'Remove')!;
  await act(remove.action);
  await eventually(async () => !await packRow('Biscuit'), 'it can be removed again');
  await usePack('Tones');
}

export async function run() {
  installTones();
  await installBuilt(KEYSTROKES);
  const entries = await openEntries();
  try {
    await eventually(async () => (await listed(KEYSTROKES))?.state === 'running', 'Keystrokes runs once installed');
    await eventually(async () => (await packRow('Tones'))?.description === 'In use', 'and remembers its pack');
    for (const pack of ['Mechanical', 'Soft membrane', 'Typewriter', 'Thock'])
      require(await packRow(pack), `it comes with ${pack}`);
    await eventually(() => intoSpeakers({'media.name': 'Keystrokes'}, 'Keystrokes:output', 2), 'its sounds reach the speakers');
    await checkKinds(entries.window);
    await checkSwitches(entries.window);
    await checkPasswordField(entries.window);
    await checkOwnPasswordField();
    await checkLockScreen();
    await checkPacks();
    await checkFastTyping();
    await checkCost();
    await checkLatency();
  } finally {
    await entries.close();
    await request('Remove', KEYSTROKES);
    kestrel.reset('extension-settings');
  }
}
