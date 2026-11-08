import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {checks} from '../lib/check.js';
import {fixture} from '../lib/processes.js';
import {pause} from '../lib/wait.js';

const {require} = checks('palm rejection');
const RECORDINGS = ['touch-only', 'taps-after', 'writing', 'palm-taskbar'];
const VIRTUAL_PX_PER_MM = 4;
const PEN_FORGOTTEN = 5000;
const HOLDS_SETTLE = 1000;
const TOOLS = {pen: Clutter.InputDeviceToolType.PEN, eraser: Clutter.InputDeviceToolType.ERASER} as const;

type Event =
  | [number, 'near' | 'away', keyof typeof TOOLS]
  | [number, 'move', number, number, number]
  | [number, 'tip' | 'lift']
  | [number, 'down' | 'drag', number, number, number]
  | [number, 'up', number];

interface Recording {
  size: [number, number];
  touches: ('finger' | 'palm')[];
  events: Event[];
}

interface Sent {
  label: 'finger' | 'palm';
  x: number;
  y: number;
  at: number;
  beforePen: boolean;
  arrived?: number;
}

const seat = global.stage.context.get_backend().get_default_seat();
const touchscreen = seat.create_virtual_device(Clutter.InputDeviceType.TOUCHSCREEN_DEVICE);
const pen = seat.create_virtual_device(Clutter.InputDeviceType.TABLET_DEVICE);
const penSettings = new Gio.Settings({schema_id: 'com.lantharos.kestrel.pen'});
let sent: Sent[] = [];

const load = (name: string): Recording =>
  JSON.parse(new TextDecoder().decode(GLib.file_get_contents(fixture('pen', `${name}.json`))[1]));

function watchTouches(): number {
  const isTouch = (type: Clutter.EventType) =>
    type === Clutter.EventType.TOUCH_BEGIN || type === Clutter.EventType.TOUCH_UPDATE ||
    type === Clutter.EventType.TOUCH_END || type === Clutter.EventType.TOUCH_CANCEL;
  return Clutter.Event.prepend_filter(null, event => {
    const type = event.type();
    const tablet = event.get_source_device()?.get_device_type() === Clutter.InputDeviceType.TABLET_DEVICE;
    if (!isTouch(type) && !tablet) return Clutter.EVENT_PROPAGATE;
    if (type === Clutter.EventType.TOUCH_BEGIN) {
      const [x, y] = event.get_coords();
      const touch = sent.find(candidate => candidate.arrived === undefined && Math.abs(candidate.x - x) < 0.01 && Math.abs(candidate.y - y) < 0.01);
      if (touch) touch.arrived = GLib.get_monotonic_time();
    }
    return Clutter.EVENT_STOP;
  });
}

async function replay(recording: Recording, mirrored: boolean) {
  const [width] = recording.size;
  const place = (x: number, y: number) => [(mirrored ? width - x : x) * VIRTUAL_PX_PER_MM, y * VIRTUAL_PX_PER_MM] as const;
  const firstPen = recording.events.find(([, kind]) => kind === 'near')?.[0] ?? Infinity;
  const labels = [...recording.touches];
  const start = GLib.get_monotonic_time() + 100_000;
  for (const event of recording.events) {
    const time = start + event[0] * 1000;
    const wait = (time - GLib.get_monotonic_time()) / 1000;
    if (wait >= 1) await pause(Math.floor(wait));
    switch (event[1]) {
    case 'near':
    case 'away':
      pen.notify_tablet_proximity(time, event[1] === 'near', TOOLS[event[2]]);
      break;
    case 'move': {
      const [x, y] = place(event[2], event[3]);
      pen.notify_tablet_motion(time, x, y, event[4]);
      break;
    }
    case 'tip':
    case 'lift':
      pen.notify_tablet_button(time, 0x14a, event[1] === 'tip' ? Clutter.ButtonState.PRESSED : Clutter.ButtonState.RELEASED);
      break;
    case 'down': {
      const [x, y] = place(event[3], event[4]);
      sent.push({label: labels.shift()!, x, y, at: GLib.get_monotonic_time(), beforePen: event[0] < firstPen});
      touchscreen.notify_touch_down(time, event[2], x, y);
      break;
    }
    case 'drag': {
      const [x, y] = place(event[3], event[4]);
      touchscreen.notify_touch_motion(time, event[2], x, y);
      break;
    }
    case 'up':
      touchscreen.notify_touch_up(time, event[2]);
      break;
    }
  }
  await pause(HOLDS_SETTLE);
}

function report(name: string) {
  const fingers = sent.filter(touch => touch.label === 'finger');
  const palms = sent.filter(touch => touch.label === 'palm' && !touch.beforePen);
  const early = sent.filter(touch => touch.label === 'palm' && touch.beforePen);
  const rejectedFingers = fingers.filter(touch => touch.arrived === undefined).length;
  const acceptedPalms = palms.filter(touch => touch.arrived !== undefined).length;
  const latency = Math.max(0, ...fingers.filter(touch => touch.arrived !== undefined).map(touch => (touch.arrived! - touch.at) / 1000));
  console.log(`Kestrel palm rejection: ${name}: ${fingers.length - rejectedFingers}/${fingers.length} fingers let through, ` +
    `${palms.length - acceptedPalms}/${palms.length} palms dropped, longest wait for a finger ${latency.toFixed(0)} ms` +
    (early.length ? `, ${early.filter(touch => touch.arrived !== undefined).length}/${early.length} palms before the pen first came near let through` : ''));
  require(rejectedFingers === 0, `${name}: every finger reaches the desktop`);
  require(acceptedPalms === 0, `${name}: every palm after the pen came near is dropped`);
}

export async function run() {
  const filter = watchTouches();
  try {
    for (const hand of ['right', 'left'] as const) {
      penSettings.set_string('hand', hand);
      for (const name of RECORDINGS) {
        sent = [];
        await replay(load(name), hand === 'left');
        report(hand === 'left' ? `${name}, mirrored for the left hand` : name);
        await pause(PEN_FORGOTTEN);
      }
    }
  } finally {
    Clutter.Event.remove_filter(filter);
    penSettings.reset('hand');
  }
}
