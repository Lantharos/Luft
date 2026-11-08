import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';
import St from 'gi://St';
import {handwriting, Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {descendants, firstStyled, ofType} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {centerOf, rest} from '../lib/input/input.js';
import {penReady, penStroke, penTap} from '../lib/input/penStroke.js';
import {gjs, repository, scratch, spawn, stop, waitForWindow} from '../lib/processes.js';
import {captureFrame} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';

const {require, eventually} = checks('handwriting');
const NAME = 'com.lantharos.Handwriting1';
const SERVICE = repository('target', 'release', 'luft-handwriting');
const MODEL = 'latin-pp-ocrv5-mobile';
const REAL = GLib.getenv('KESTREL_HANDWRITING');
const SCHEMES = [['dark', 'prefer-dark'], ['light', 'default']] as const;
const READ_TIMEOUT = 5000;
const LINE_HEIGHT = 64;

type Point = [number, number];

const preferences = new Gio.Settings({schema_id: 'com.lantharos.kestrel.handwriting'});
const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});

const strip = () => handwriting()!.strip;
const entryText = (window: Meta.Window) => window.title.match(/^Kestrel entry: (.*?)(?: \[.*\])?$/)?.[1] ?? '';
const context = () => ofType(firstStyled('kestrel-handwriting-context'), St.Label);
const area = () => firstStyled('kestrel-handwriting-area')!;

/** A word-like scribble in the writing area, starting `from` along it. */
function scribble(from: number, width = 120): Point[] {
  const [left, top] = area().get_transformed_position();
  const y = top + area().height * 0.55;
  return Array.from({length: 24}, (_, i) => [left + from + width * i / 23, y + Math.sin(i * 1.3) * 14] as Point);
}

function letterPosition(index: number): Point {
  const text = context().clutter_text;
  const [, x, y, height] = text.position_to_coords(index);
  const [left, top] = text.get_transformed_position();
  return [left + x, top + y + height / 2];
}

function inkInArea() {
  const {origin, size} = area().get_transformed_extents();
  const strokes = descendants(strip().actor).filter(actor => actor.constructor.name.includes('StrokeActor'));
  return strokes.length > 0 && strokes.every(actor => {
    const [x, y] = centerOf(actor);
    return x >= origin.x && x <= origin.x + size.width && y >= origin.y && y <= origin.y + size.height;
  });
}

async function owned(name: string) {
  const reply = await Gio.DBus.session.call('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus', 'NameHasOwner',
    new GLib.Variant('(s)', [name]), new GLib.VariantType('(b)'), Gio.DBusCallFlags.NONE, -1, null);
  return reply.deep_unpack<[boolean]>()[0];
}

async function touchField(window: Meta.Window) {
  const [x] = centerOf(window.get_compositor_private() as Meta.WindowActor);
  const field: Point = [x, window.get_frame_rect().y + 180];
  await penTap(field);
  await eventually(() => Main.inputMethod.caret, 'the text field reports where its cursor is');
  await eventually(() => strip().shown && strip().actor.opacity === 255, 'touching a text field with the pen opens the writing strip');
  const caret = Main.inputMethod.caret!;
  const [, top] = strip().actor.get_transformed_position();
  require(top >= caret.y + caret.height, 'the strip opens under the cursor, leaving the field in sight');
  await settled();
}

async function editing(window: Meta.Window) {
  await penStroke(scribble(20));
  await eventually(() => entryText(window) === 'Vidimo se', 'a pause after writing types what was written', READ_TIMEOUT);
  await penStroke(scribble(20));
  await eventually(() => entryText(window) === 'Vidimo se sutra', 'the next words are typed after a space', READ_TIMEOUT);
  await eventually(() => context().text.endsWith('Vidimo se sutra'), 'the strip shows the field’s text');

  const [startX, y] = letterPosition(context().text.indexOf('se'));
  const [endX] = letterPosition(context().text.indexOf('se') + 2);
  await penStroke(Array.from({length: 12}, (_, i) => [startX - 2 + (endX - startX + 4) * i / 11, y] as Point));
  await eventually(() => entryText(window) === 'Vidimo sutra', 'striking a word out in the strip deletes it from the field');

  const before = letterPosition(context().text.indexOf('sutra'));
  await penTap(before);
  await penStroke(scribble(20));
  await eventually(() => entryText(window) === 'Vidimo u šest sutra', 'tapping between words writes the next words there', READ_TIMEOUT);

  await penStroke(scribble(200));
  const [left, top] = area().get_transformed_position();
  const middle = top + area().height * 0.55;
  await penStroke(Array.from({length: 13}, (_, i) => [left + 200 + (i % 2 ? 120 : 0), middle - 12 + i * 2] as Point));
  await pause(1500);
  require(entryText(window) === 'Vidimo u šest sutra', 'scribbling over writing takes it back before it is typed');
}

async function screenshots(window: Meta.Window) {
  const scheme = interfaceSettings.get_string('color-scheme');
  try {
    for (const rounded of [true, false]) {
      kestrel.set_boolean('rounded-window-corners', rounded);
      for (const [name, colorScheme] of SCHEMES) {
        interfaceSettings.set_string('color-scheme', colorScheme);
        await touchField(window);
        await penStroke(scribble(20, 90));
        await penStroke(scribble(130, 70));
        require(inkInArea(), 'the ink shows where it was written');
        (await captureFrame()).save(`handwriting-strip-${name}${rounded ? '' : '-square'}`);
        await pause(1200);
      }
    }
  } finally {
    interfaceSettings.set_string('color-scheme', scheme);
    kestrel.reset('rounded-window-corners');
  }
}

/** With KESTREL_HANDWRITING naming a folder that holds the model's files and a `lines` folder of samples, writes each into a field with the real recognizer. */
async function realLines(window: Meta.Window) {
  const data = scratch('kestrel-handwriting', 'downloaded');
  const models = GLib.build_filenamev([data, 'luft-handwriting', 'models']);
  GLib.mkdir_with_parents(models, 0o700);
  const model = Gio.File.new_for_path(GLib.build_filenamev([models, MODEL]));
  if (!model.query_exists(null)) model.make_symbolic_link(REAL!, null);
  const service = spawn([SERVICE], {env: {XDG_DATA_HOME: data}});
  await eventually(() => owned(NAME), 'the handwriting service is on the session bus', 15000);
  const lines = Gio.File.new_for_path(GLib.build_filenamev([REAL!, 'lines']));
  const names = [...lines.enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null)]
    .map(info => info.get_name()).filter(name => name.endsWith('.json')).sort();
  for (const name of names) {
    const strokes = JSON.parse(new TextDecoder().decode(lines.get_child(name).load_contents(null)[1])) as Point[][];
    const expected = new TextDecoder().decode(lines.get_child(name.replace(/\.json$/, '.txt')).load_contents(null)[1]).trim();
    const points = strokes.flat();
    const [x1, y1] = [Math.min(...points.map(p => p[0])), Math.min(...points.map(p => p[1]))];
    const wide = Math.max(1, Math.max(...points.map(p => p[0])) - x1);
    const scale = Math.min(LINE_HEIGHT / Math.max(1, Math.max(...points.map(p => p[1])) - y1), (area().width - 32) / wide);
    const [left, top] = area().get_transformed_position();
    const before = entryText(window);
    for (const stroke of strokes) {
      const placed = stroke.map(([x, y]) => [left + 16 + (x - x1) * scale, top + 24 + (y - y1) * scale] as Point);
      await penStroke(placed.filter((_, i) => i % 3 === 0 || i === placed.length - 1));
    }
    await eventually(() => entryText(window) !== before, `${name} is typed`, READ_TIMEOUT);
    console.log(`Kestrel handwriting: ${name}\texpected ${expected}\ttyped ${entryText(window).slice(before.length).trim()}`);
  }
  await stop(service);
}

export async function run() {
  preferences.set_boolean('enabled', true);
  rest();
  await penReady();
  const standIn = gjs('services/handwriting.js');
  const entry = gjs('clients/windows/window.js', ['--entry']);
  try {
    await eventually(() => owned(NAME), 'the stand-in handwriting service is on the session bus');
    const window = await waitForWindow('Kestrel window check');
    await eventually(() => window.has_focus() && Main.inputMethod.currentFocus, 'the text field takes the keyboard');
    await touchField(window);
    await editing(window);
    await penTap(centerOf(firstStyled('kestrel-handwriting-close')!));
    await eventually(() => !strip().shown, 'the close button closes the strip');
    await screenshots(window);
    if (REAL) {
      await stop(standIn);
      await touchField(window);
      await realLines(window);
    }
  } finally {
    await stop(entry);
    await stop(standIn);
    preferences.reset('enabled');
  }
  await eventually(() => !strip().shown, 'the strip closes with the text field it was writing into');
}
