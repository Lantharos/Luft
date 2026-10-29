import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {checks} from '../lib/check.js';
import {moveBy} from '../lib/input/input.js';
import {output, screenshot} from '../lib/screenshots.js';
import {pause} from '../lib/wait.js';

const {require, eventually} = checks('dimming');
const SCREEN_BLANK_DELAY = 20;
const BACKLIGHT_MAX = 1000;
const ENCODING_GAMMA = 2.2;
const SETTLED_SAMPLE = 2000;

type Sample = [at: number, value: number];

const now = () => GLib.get_monotonic_time() / 1000;
const wake = () => moveBy(3, 3);
const overlay = () => Main.uiGroup.get_children().find(actor => actor.name === 'dimOverlay')!;
const span = (samples: Sample[]) => samples.at(-1)![0] - samples[0][0];
const distinct = (samples: Sample[]) => new Set(samples.map(([, value]) => value)).size;
const monotonic = (samples: Sample[], direction: 1 | -1) => samples.every(([, value], index) => index === 0 || (value - samples[index - 1][1]) * direction >= 0);

class StandInBacklight extends GObject.Object {
  static [GObject.properties] = {
    'brightness': GObject.ParamSpec.int('brightness', null, null, GObject.ParamFlags.READWRITE, 0, BACKLIGHT_MAX, BACKLIGHT_MAX),
  };

  static {
    GObject.registerClass(this);
  }

  readonly writes: Sample[] = [];
  private level = BACKLIGHT_MAX;

  get brightness() {
    return this.level;
  }

  set brightness(level: number) {
    this.writes.push([now(), level]);
    this.changeByHardware(level);
  }

  get brightness_min() {
    return 0;
  }

  get brightness_max() {
    return BACKLIGHT_MAX;
  }

  changeByHardware(level: number) {
    this.level = level;
    this.notify('brightness');
  }
}

async function saveScreenshot(name: string) {
  GLib.file_set_contents(output(name), (await screenshot()).toArray());
}

function paintedOpacities() {
  const samples: Sample[] = [];
  const signal = global.stage.connect('after-paint', () => samples.push([now(), overlay().opacity]));
  return {samples, stop: () => global.stage.disconnect(signal)};
}

async function paintsOver(milliseconds: number) {
  let frames = 0;
  const signal = global.stage.connect('after-paint', () => frames++);
  await pause(milliseconds);
  global.stage.disconnect(signal);
  return frames;
}

async function checkOverlay(dimmedLuminance: number) {
  const depth = Math.round(255 * (1 - dimmedLuminance ** (1 / ENCODING_GAMMA)));
  const painted = paintedOpacities();
  wake();
  await eventually(() => Main.brightnessManager.dimming, 'the screen dims after half the screen blank delay', (SCREEN_BLANK_DELAY / 2 + 2) * 1000);
  await pause(500);
  await saveScreenshot('dimming-fading');
  await eventually(() => overlay().opacity === depth && !overlay().get_transition('opacity'), 'the overlay settles at the dimmed level', 3000);
  painted.stop();

  const fading = painted.samples.filter(([, opacity]) => opacity > 0);
  const fadeIn = fading.slice(0, fading.findIndex(([, opacity]) => opacity === depth) + 1);
  require(fadeIn[0][1] < depth / 4, 'the overlay starts faint instead of popping in');
  require(monotonic(fadeIn, 1) && distinct(fadeIn) >= 10, 'the overlay darkens a little with every frame');
  require(span(fadeIn) > 1100 && span(fadeIn) < 2200, 'the overlay takes about a second and a half to fade in');
  require(overlay().get_n_children() === Main.layoutManager.monitors.length, 'the overlay covers every display');
  await saveScreenshot('dimming-dimmed');
  require(await paintsOver(SETTLED_SAMPLE) <= 1, 'a dimmed screen stops repainting once the fade is over');

  const fadeOut = paintedOpacities();
  wake();
  await eventually(() => !overlay().visible, 'using the computer lifts the overlay', 1000);
  fadeOut.stop();
  require(span(fadeOut.samples) < 400 && distinct(fadeOut.samples) > 2, 'the overlay fades out quickly');
}

function useStandInBacklight(backlight: StandInBacklight) {
  const builtIn = Main.layoutManager.primaryMonitor!.index;
  const connector = global.backend.get_monitor_manager().get_logical_monitors()!
    .find(logicalMonitor => logicalMonitor.get_number() === builtIn)!.get_monitors()[0].get_connector();
  const original = Meta.Monitor.prototype.get_backlight;
  Meta.Monitor.prototype.get_backlight = function (this: Meta.Monitor) {
    return this.get_connector() === connector ? backlight as unknown as Meta.Backlight : original.call(this);
  };
  Main.brightnessManager['rebuildScales']();
  return () => {
    Meta.Monitor.prototype.get_backlight = original;
    Main.brightnessManager['rebuildScales']();
  };
}

async function changeDimming(backlight: StandInBacklight, dimming: boolean, level: number, label: string, timeout: number) {
  backlight.writes.length = 0;
  const started = now();
  Main.brightnessManager.dimming = dimming;
  await eventually(() => backlight.writes.at(-1)?.[1] === level, label, timeout);
  return {elapsed: now() - started, writes: [...backlight.writes]};
}

const dim = (backlight: StandInBacklight, level: number) => changeDimming(backlight, true, level, 'the backlight reaches the dimmed level', 3000);
const undim = (backlight: StandInBacklight, level: number) => changeDimming(backlight, false, level, 'the backlight comes back to the brightness that was chosen', 1000);

async function checkBacklight(dimmedLuminance: number) {
  const backlight = new StandInBacklight();
  const restore = useStandInBacklight(backlight);
  const brightness = Main.brightnessManager.globalScale!;
  const dimmed = Math.round(dimmedLuminance * BACKLIGHT_MAX);
  const covered = Main.layoutManager.monitors.length - 1;
  try {
    brightness.value = 0.8;
    require(backlight.brightness === 800, 'the stand-in built-in panel follows the brightness');

    const ramp = await dim(backlight, dimmed);
    require(monotonic(ramp.writes, -1) && distinct(ramp.writes) >= 30, 'the backlight steps down smoothly');
    require(ramp.elapsed > 1200 && ramp.elapsed < 2000, 'the backlight takes about a second and a half to dim');
    require(overlay().get_n_children() === covered && overlay().visible === covered > 0,
      'only displays without backlight control get the overlay');
    await pause(300);
    require(backlight.writes.length === ramp.writes.length, 'the backlight stops changing once it is dim');

    Main.brightnessManager['rebuildScales']();
    require(backlight.writes.length === ramp.writes.length && backlight.brightness === dimmed, 'docking while dimmed keeps the panel dim');

    brightness.value = 0.6;
    Main.brightnessManager.autoBrightnessTarget = 0.7;
    require(backlight.brightness === dimmed, 'changing the brightness while dimmed waits for the screen to wake');
    const restored = await undim(backlight, 800);
    require(restored.elapsed < 350 && monotonic(restored.writes, 1), 'the backlight comes back quickly, following the light sensor');
    Main.brightnessManager.autoBrightnessTarget = -1;
    await eventually(() => backlight.brightness === 600, 'the chosen brightness returns without the light sensor', 1000);

    Main.brightnessManager.dimming = true;
    await pause(400);
    brightness.value = 0.5;
    const retargeted = await dim(backlight, dimmed);
    require(monotonic(retargeted.writes, -1), 'a brightness change while dimming keeps the ramp going');
    await undim(backlight, 500);

    Main.brightnessManager.dimming = true;
    await pause(400);
    backlight.writes.length = 0;
    backlight.changeByHardware(700);
    await pause(300);
    require(backlight.writes.length === 0 && !Main.brightnessManager.dimming && Math.abs(brightness.value - 0.7) < 0.01,
      'a brightness change from the hardware ends the dim and moves the brightness slider');
  } finally {
    restore();
  }
}

export async function run() {
  const power = new Gio.Settings({schema_id: 'com.lantharos.kestrel.power'});
  const session = new Gio.Settings({schema_id: 'org.gnome.desktop.session'});
  const dimmedLuminance = power.get_int('idle-brightness') / 100;
  try {
    session.set_uint('idle-delay', SCREEN_BLANK_DELAY);
    await checkOverlay(dimmedLuminance);
    session.reset('idle-delay');
    await checkBacklight(dimmedLuminance);
  } finally {
    session.reset('idle-delay');
    wake();
  }
}
