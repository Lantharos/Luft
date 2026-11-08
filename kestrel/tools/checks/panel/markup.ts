import GdkPixbuf from 'gi://GdkPixbuf';
import Gio from 'gi://Gio';
import St from 'gi://St';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {descendants} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {click, drag, moveTo, rest} from '../lib/input/input.js';
import {penReady, penStroke} from '../lib/input/penStroke.js';
import {BTN_STYLUS2, hover, leave, pressButton} from '../tablet/lib/pen.js';
import {capture} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';

const {require, eventually} = checks('markup');
const SCHEMES = [['dark', 'prefer-dark'], ['light', 'default']] as const;
const RED: [number, number, number] = [230, 46, 51];
const TOLERANCE = 24;
const ENOUGH_INK = 150;
const PEN_STEPS = 40;
const DRAG_SETTLE = 100;
const PEN_SETTLE = 200;
const SELECTION = {left: 160, top: 120, right: 1180, bottom: 640};

const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const penSettings = new Gio.Settings({schema_id: 'com.lantharos.kestrel.pen'});

const ui = () => Main.screenshotUI;
const editor = () => ui().markup;
const toolButton = (icon: string) => descendants(editor().toolbar).find(actor => actor instanceof St.Button && actor.icon_name === icon)!;

/** Drags with the mouse once the pointer has settled where the drag starts, so the press lands there. */
async function dragFrom(from: [number, number], to: [number, number], steps = 20) {
  moveTo(from);
  await pause(DRAG_SETTLE);
  await drag(from, to, {steps});
}

async function choose(tool: string) {
  click(toolButton(`screenshot-ui-${tool}-symbolic`));
  await eventually(() => editor().canvas.tool === tool, `the ${tool} can be picked from the toolbar`);
}
const strokesShown = () => descendants(editor().canvas).filter(actor => actor.constructor.name.includes('StrokeActor') && actor.visible).length;

function inkPixels(file: Gio.File, [r, g, b]: [number, number, number]) {
  const pixbuf = GdkPixbuf.Pixbuf.new_from_file(file.get_path()!);
  const pixels = pixbuf.get_pixels();
  const step = pixbuf.get_n_channels();
  let count = 0;
  for (let row = 0; row < pixbuf.height; row++) {
    for (let column = 0; column < pixbuf.width; column++) {
      const i = row * pixbuf.rowstride + column * step;
      if (Math.abs(pixels[i] - r) < TOLERANCE && Math.abs(pixels[i + 1] - g) < TOLERANCE && Math.abs(pixels[i + 2] - b) < TOLERANCE) count++;
    }
  }
  return {count, width: pixbuf.width, height: pixbuf.height};
}

async function openEditor() {
  ui().open();
  await eventually(() => ui().visible && ui().opacity === 255, 'the screenshot tool opens');
  ui().panel.selectionButton.checked = true;
  ui().resetArea();
  await dragFrom([SELECTION.left, SELECTION.top], [SELECTION.right, SELECTION.bottom]);
  ui().panel.drawButton.checked = true;
  click(ui().panel.captureButton);
  await eventually(() => editor().visible, 'capturing with drawing on opens the drawing tools instead of saving');
  require(!ui().panel.visible, 'the capture panel gives way to the drawing tools');
}

/** Writes a wave with the virtual pen, so the stroke comes through Kestrel's real pen events with their pressure. */
async function penWave(x: number, y: number) {
  await penStroke(Array.from({length: PEN_STEPS + 1}, (_, step) => {
    const t = step / PEN_STEPS;
    return [x + t * 360, y + Math.sin(t * Math.PI * 3) * 50] as [number, number];
  }));
}

function pressures() {
  const strokes = descendants(editor().canvas).filter(actor => actor.constructor.name.includes('StrokeActor')) as unknown as {stroke: {samples: {pressure: number}[]}}[];
  return strokes[0].stroke.samples.map(sample => sample.pressure);
}

/** The upper pen button set to take a screenshot opens the tool with drawing on. */
async function penOpensDrawing() {
  ui().panel.drawButton.checked = false;
  penSettings.set_string('secondary-button-action', 'screenshot');
  try {
    hover([700, 450]);
    await pause(PEN_SETTLE);
    await pressButton(BTN_STYLUS2);
    leave();
    await eventually(() => ui().visible && ui().opacity === 255, 'the pen button opens the screenshot tool');
    require(ui().panel.drawButton.checked, 'opening it with the pen turns drawing on');
    ui().close(true);
  } finally {
    penSettings.reset('secondary-button-action');
  }
}

async function draw(scheme: string, corners: string) {
  await openEditor();
  const [left, top] = [SELECTION.left, SELECTION.top];
  await penWave(left + 80, top + 120);
  await eventually(() => strokesShown() === 1, 'a pen stroke stays on the screenshot');
  const pressed = pressures();
  require(Math.max(...pressed) - Math.min(...pressed) > 0.3, `the stroke follows how hard the pen presses (${Math.min(...pressed).toFixed(2)} to ${Math.max(...pressed).toFixed(2)})`);

  await choose('highlighter');
  await dragFrom([left + 60, top + 260], [left + 520, top + 260]);
  await eventually(() => strokesShown() === 2, 'the highlighter draws with the mouse');

  await choose('pen');
  await dragFrom([left + 600, top + 80], [left + 800, top + 300], 24);
  await capture(`screenshot-markup-${scheme}${corners}`);

  await choose('eraser');
  await dragFrom([left + 640, top + 60], [left + 760, top + 320], 24);
  await eventually(() => strokesShown() === 2, 'the eraser takes away the stroke it crosses');
  click(toolButton('edit-undo-symbolic'));
  await eventually(() => strokesShown() === 3, 'undo brings the erased stroke back');

  await choose('crop');
  await settled();
  await dragFrom([left, top], [left + 40, top + 30], 8);
  const [, , width, height] = editor().cropFrame.crop;
  require(width < SELECTION.right - SELECTION.left && height < SELECTION.bottom - SELECTION.top, 'dragging a corner crops the screenshot');
  await capture(`screenshot-markup-crop-${scheme}${corners}`);
  return {width, height};
}

async function saved(crop: {width: number; height: number}) {
  const file = new Promise<Gio.File>(resolve => {
    const id = ui().connect('screenshot-taken', (_ui, taken: Gio.File) => {
      ui().disconnect(id);
      resolve(taken);
    });
  });
  click(toolButton('object-select-symbolic'));
  const taken = await file;
  await eventually(() => !ui().visible, 'saving closes the screenshot tool');
  const ink = inkPixels(taken, RED);
  const scale = global.display.get_monitor_scale(global.display.get_primary_monitor());
  const [width, height] = [Math.round(crop.width * scale), Math.round(crop.height * scale)];
  require(Math.abs(ink.width - width) <= 1 && Math.abs(ink.height - height) <= 1, `the saved screenshot is the cropped size in the display's pixels (${ink.width}x${ink.height})`);
  require(ink.count > ENOUGH_INK, `the saved screenshot has the red ink drawn on it (${ink.count} pixels)`);
  taken.delete(null);
}

export async function run() {
  const scheme = interfaceSettings.get_string('color-scheme');
  rest();
  await penReady();
  await penOpensDrawing();
  try {
    for (const rounded of [true, false]) {
      kestrel.set_boolean('rounded-window-corners', rounded);
      for (const [name, colorScheme] of SCHEMES) {
        interfaceSettings.set_string('color-scheme', colorScheme);
        await settled();
        const crop = await draw(name, rounded ? '' : '-square');
        await saved(crop);
      }
    }
  } finally {
    interfaceSettings.set_string('color-scheme', scheme);
    kestrel.reset('rounded-window-corners');
    if (ui().visible) ui().close(true);
  }
}
