import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { type Canvas, encodePng, sheetPixels } from './canvas.js';
import { dollopFrames } from './dollop.js';
import { guidePicture } from './guide.js';
import { pipFrames } from './pip.js';
import { tuftFrames } from './tuft.js';

const root = join(dirname(import.meta.path), '..');

const WALKS_AND_JUMPS = { walks: true, climbs: true, jumps: 5.5, flies: false };

const STATES = {
  idle: { row: 0, frames: 4 },
  walk: { row: 1, frames: 4 },
  sit: { row: 2, frames: 2 },
  sleep: { row: 3, frames: 2 },
  fall: { row: 4, frames: 3 },
  land: { row: 4, start: 3, frames: 1 },
  climb: { row: 5, frames: 4 },
  held: { row: 6, frames: 4 },
};

interface Character {
  abilities: object;
  likes: object;
  temper: object;
  states?: object;
}

const TUFT: Character = { abilities: WALKS_AND_JUMPS, likes: { window: 3, taskbar: 2, ground: 1, edges: 0.3 }, temper: { stride: 1.6, gravity: 1, sleepiness: 0.6 } };

const PIP: Character = {
  abilities: { walks: true, climbs: false, jumps: 0, flies: true },
  likes: { window: 4, taskbar: 3, ground: 0.5, edges: 0 },
  temper: { stride: 1.2, gravity: 0.35, sleepiness: 0.3 },
  states: { idle: STATES.idle, walk: STATES.walk, sit: STATES.sit, sleep: STATES.sleep, fall: STATES.fall, land: STATES.land, fly: STATES.climb, held: STATES.held },
};

const DOLLOP: Character = {
  abilities: { walks: true, climbs: true, jumps: 1.5, flies: false },
  likes: { window: 1, taskbar: 2, ground: 3, edges: 0.1 },
  temper: { stride: 0.8, gravity: 1.3, sleepiness: 0.75 },
};

const manifest = (name: string, description: string, { abilities, likes, temper, states = STATES }: Character) =>
  `${JSON.stringify({ name, description, frame: 24, sheet: 'sheet.png', states, abilities, likes, temper }, null, 2)}\n`;

async function writeSheet(folder: string, frames: readonly Canvas[]) {
  const { rgba, width, height } = sheetPixels(frames);
  await mkdir(folder, { recursive: true });
  await Bun.write(join(folder, 'sheet.png'), encodePng(rgba, width, height));
}

async function writePack(folder: string, frames: readonly Canvas[], json: string) {
  await writeSheet(folder, frames);
  await Bun.write(join(folder, 'pack.json'), json);
}

await writePack(join(root, 'packs/tuft'), tuftFrames(), manifest('Tuft', 'Curious, jumps and climbs onto anything', TUFT));
await writePack(join(root, 'packs/pip'), pipFrames(), manifest('Pip', 'Flies over to whatever looks like a good perch', PIP));
await writePack(join(root, 'packs/dollop'), dollopFrames(), manifest('Dollop', 'Slow, sleepy and very round', DOLLOP));

await writePack(join(root, 'template'), [], manifest('My stray', 'One line about who this is', TUFT));
await writePack(join(root, 'template/example'), tuftFrames(), manifest('Example', 'A finished sheet to copy from', TUFT));
const guide = guidePicture();
await Bun.write(join(root, 'template/guide.png'), encodePng(guide.rgba, guide.width, guide.height));

const preview = process.argv[2];
if (preview) {
  for (const [name, frames] of Object.entries({ tuft: tuftFrames(), pip: pipFrames(), dollop: dollopFrames() })) {
    const zoomed = sheetPixels(frames, 6);
    await Bun.write(join(preview, `${name}.png`), encodePng(zoomed.rgba, zoomed.width, zoomed.height));
  }
}
