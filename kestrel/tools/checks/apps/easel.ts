import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

import type {LuftApp} from '../lib/apps/luftApp.js';
import {checks} from '../lib/check.js';
import {press, type} from '../lib/input/input.js';
import {withApp} from './lib/apps.js';
import {exists, removeTree} from './lib/files.js';
import {answerChooser, colorsOf, documentOf, folder, inFolder, near, pixelAt, remove, writePicture, type Rgb} from './easel/files.js';

export const timeout = 360000;

const {require, eventually} = checks('Luft app');
const BASE: Rgb = [40, 120, 200];
const FILL: Rgb = [47, 111, 222];
const MULTIPLIED = BASE.map((channel, index) => Math.round((channel * FILL[index]) / 255)) as Rgb;
const NOTE: Rgb = [243, 216, 138];
const SAVE_TIMEOUT = 15000;
const CENTER = [300, 200] as const;

const button = (name: string) => ({role: 'button', name});

async function exported(app: LuftApp, name: string) {
  const path = inFolder(name);
  remove(path);
  await answerChooser(path);
  press(Clutter.KEY_Control_L, Clutter.KEY_e);
  app.click(await app.find(button('Export')));
  await eventually(() => exists(path), `Easel exports ${name}`, SAVE_TIMEOUT);
  await app.waitUntil(async () => !(await app.all({role: 'dialog'})).length, 'the export dialog closes');
  return path;
}

async function centerOf(app: LuftApp, name: string) {
  return pixelAt(await exported(app, name), ...CENTER);
}

async function checkLayers(source: string, saved: string) {
  await withApp('easel', [source], async app => {
    (await app.settle(() => true)).save('easel-quick-edit');
    app.click(await app.find(button('Open in editor')));
    app.click(await app.find(button('Add a layer')));
    app.click(await app.find({role: 'menuitem', name: 'Layer'}));
    app.click(await app.find(button('Select')));
    press(Clutter.KEY_Control_L, Clutter.KEY_a);
    app.click(await app.find({...button('Fill'), within: {role: 'region', name: 'Tool options'}}));
    app.click(await app.find({role: 'combobox', name: 'Blending'}));
    app.click(await app.find({role: 'option', name: 'Multiply'}));
    await app.find({role: 'combobox', name: 'Blending'});
    (await app.settle(() => true)).save('easel-editor');
    const multiplied = await centerOf(app, 'multiplied.png');
    require(near(multiplied, MULTIPLIED), `a multiplied layer darkens the picture under it (${multiplied} against ${MULTIPLIED})`);

    press(Clutter.KEY_Control_L, Clutter.KEY_z);
    const normal = await centerOf(app, 'undone-blend.png');
    require(near(normal, FILL), `undoing the blend mode shows the filled layer as it was (${normal})`);
    press(Clutter.KEY_Control_L, Clutter.KEY_z);
    const original = await centerOf(app, 'undone-fill.png');
    require(near(original, BASE), `undoing the fill brings back the original picture (${original})`);
    press(Clutter.KEY_Control_L, Clutter.KEY_Shift_L, Clutter.KEY_z);
    press(Clutter.KEY_Control_L, Clutter.KEY_Shift_L, Clutter.KEY_z);
    require(near(await centerOf(app, 'redone.png'), MULTIPLIED), 'redoing both steps brings the multiplied layer back');

    await answerChooser(saved);
    press(Clutter.KEY_Control_L, Clutter.KEY_s);
    await eventually(() => exists(saved), 'Easel saves its own document', SAVE_TIMEOUT);
  });
  const record = await documentOf(saved);
  require(record.kind === 'image' && record.layers.length === 2 && record.layers[1].blend === 'multiply', 'the saved document keeps both layers and the blend mode');
  await withApp('easel', [saved], async app => {
    const reopened = await centerOf(app, 'reopened.png');
    require(near(reopened, MULTIPLIED), `the reopened document composites the same pixels (${reopened})`);
  });
}

async function layerAction(app: LuftApp, name: string) {
  app.click(await app.find(button('Layer actions')));
  app.click(await app.find({role: 'menuitem', name}));
}

async function checkMasksAndAdjustments(source: string, saved: string) {
  const gray = Math.round(BASE[0] * 0.4 + BASE[1] * 0.4 + BASE[2] * 0.2);
  await withApp('easel', [source], async app => {
    app.click(await app.find(button('Open in editor')));
    app.click(await app.find(button('Add a layer')));
    app.click(await app.find({role: 'menuitem', name: 'Layer'}));
    app.click(await app.find(button('Select')));
    press(Clutter.KEY_Control_L, Clutter.KEY_a);
    app.click(await app.find({...button('Fill'), within: {role: 'region', name: 'Tool options'}}));
    press(Clutter.KEY_Control_L, Clutter.KEY_d);
    await layerAction(app, 'Add a mask');
    require(near(await centerOf(app, 'masked.png'), FILL), 'a white mask keeps the layer visible');
    await layerAction(app, 'Invert mask');
    require(near(await centerOf(app, 'hidden.png'), BASE), 'an inverted mask hides the layer');
    app.click(await app.find(button('Add a layer')));
    app.click(await app.find({role: 'menuitem', name: 'Black and white'}));
    app.click(await app.find(button('Done')));
    const mono = await centerOf(app, 'mono.png');
    require(near(mono, [gray, gray, gray]), `a black and white adjustment layer turns what's under it gray (${mono})`);
    await answerChooser(saved);
    press(Clutter.KEY_Control_L, Clutter.KEY_s);
    await eventually(() => exists(saved), 'Easel saves masks and adjustment layers', SAVE_TIMEOUT);
  });
  await withApp('easel', [saved], async app => {
    const reopened = await centerOf(app, 'mono-reopened.png');
    require(near(reopened, [gray, gray, gray]), `the reopened document keeps the mask and the adjustment (${reopened})`);
  });
}

async function checkBoard(saved: string) {
  await withApp('easel', [], async app => {
    app.click(await app.find({text: 'New board'}));
    app.click(await app.find(button('Sticky note')));
    app.click(await app.find({role: 'application'}));
    type('Plan the launch');
    press(Clutter.KEY_Escape);
    (await app.settle(() => true)).save('easel-board');
    await answerChooser(saved);
    press(Clutter.KEY_Control_L, Clutter.KEY_s);
    await eventually(() => exists(saved), 'Easel saves a board', SAVE_TIMEOUT);
  });
  const record = await documentOf(saved);
  require(record.kind === 'board' && record.objects.some((object: {kind: string; text?: string}) => object.kind === 'note' && object.text === 'Plan the launch'), 'the saved board keeps the sticky note and its text');
  await withApp('easel', [saved], async app => {
    const colors = colorsOf(await exported(app, 'board.png'));
    require(colors.some(color => near(color, NOTE, 4)), 'the reopened board draws the sticky note');
  });
}

export async function run() {
  const source = inFolder('base.png');
  writePicture(source, BASE);
  try {
    await checkLayers(source, inFolder('layers.easel'));
    await checkMasksAndAdjustments(source, inFolder('masks.easel'));
    await checkBoard(inFolder('board.easel'));
  } finally {
    if (GLib.file_test(folder, GLib.FileTest.IS_DIR)) removeTree(folder);
  }
}
