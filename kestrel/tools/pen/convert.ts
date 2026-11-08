import { basename } from 'node:path';

const usage = 'Usage: bun kestrel/tools/pen/convert.ts RECORDING NAME TOUCHES\n' +
  'RECORDING is the output of `libinput debug-events` while writing, NAME the fixture to write, and TOUCHES says\n' +
  'for every touch in the recording, in order, whether it was a finger or a palm, such as finger,palm,palm.';

const [recording, name, touches] = process.argv.slice(2);
if (!recording || !name || touches === undefined) {
  console.error(usage);
  process.exit(2);
}

type Event = (number | string)[];

const TIME = /\+(\d+\.\d+)s/;
const PEN = /s\s+([\d.]+)\*?\s*\/([\d.]+)\*?\s+pressure: ([\d.]+)/;
const TOUCH = /(\d+) \(\d+\) [\d.]+\/[\d.]+ \(([\d.]+)\/([\d.]+)mm\)/;
const SIZE = /Finger.*size (\d+)x(\d+)mm/;
const round = (value: string) => Math.round(Number(value) * 100) / 100;

const lines = (await Bun.file(recording).text()).split('\n');
const size = lines.map(line => SIZE.exec(line)).find(Boolean);
if (!size) throw new Error(`${basename(recording)} lists no touchscreen with a size`);

const events: Event[] = [];
for (const line of lines) {
  const time = TIME.exec(line);
  if (!time) continue;
  const at = Math.round(Number(time[1]) * 1000);
  const pen = PEN.exec(line);
  const touch = TOUCH.exec(line);
  if (line.includes('TABLET_TOOL_PROXIMITY') && pen) {
    const near = line.includes('proximity-in');
    const tool = line.includes(' eraser ') ? 'eraser' : 'pen';
    if (near) events.push([at, 'near', tool], [at, 'move', round(pen[1]), round(pen[2]), round(pen[3])]);
    else events.push([at, 'away', tool]);
  } else if (line.includes('TABLET_TOOL_TIP') && pen) {
    events.push([at, 'move', round(pen[1]), round(pen[2]), round(pen[3])], [at, line.includes(' down') ? 'tip' : 'lift']);
  } else if (line.includes('TABLET_TOOL_AXIS') && pen) {
    events.push([at, 'move', round(pen[1]), round(pen[2]), round(pen[3])]);
  } else if (line.includes('TOUCH_DOWN') && touch) {
    events.push([at, 'down', Number(touch[1]), round(touch[2]), round(touch[3])]);
  } else if (line.includes('TOUCH_MOTION') && touch) {
    events.push([at, 'drag', Number(touch[1]), round(touch[2]), round(touch[3])]);
  } else if (line.includes('TOUCH_UP') || line.includes('TOUCH_CANCEL')) {
    events.push([at, 'up', Number(/\t(\d+) \(/.exec(line)![1])]);
  }
}

const labels = touches.split(',').filter(Boolean);
const downs = events.filter(([, kind]) => kind === 'down').length;
if (labels.length !== downs || labels.some(label => label !== 'finger' && label !== 'palm'))
  throw new Error(`${basename(recording)} has ${downs} touches; name each one finger or palm`);

const fixture = { size: [Number(size[1]), Number(size[2])], touches: labels, events };
await Bun.write(new URL(`../fixtures/pen/${name}.json`, import.meta.url), `${JSON.stringify(fixture)}\n`);
console.log(`Wrote ${name}: ${downs} touches, ${events.length} events over ${(events.at(-1)![0] as number) / 1000} s`);
