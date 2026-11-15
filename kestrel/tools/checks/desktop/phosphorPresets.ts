import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {checks} from '../lib/check.js';
import {gjs, stopAll, waitForWindow} from '../lib/processes.js';
import {capture, captureFrame, output, screenshot} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';
import {listed, request} from '../extensions/lib/extensions.js';
import {act, attachedEffects, choose, installProbes, nothingAttached, pageItems, PHOSPHOR, SHADERS, shaders, shadersRun} from './phosphor/effects.js';
import {installStripedApp, STRIPED_DESKTOP_ID} from './phosphor/windows.js';

const presets = checks('phosphor presets');
const {require, eventually} = presets;
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const OFF_NOTICE = 'was turned off';
const RED_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" rx="3" fill="#e0301e"/></svg>';
const PLAYED = 'filter_color.rgb = mix(filter_color.rgb, vec3(1.0, 0.0, 0.0), step(0.001, filter_play));';
const APP_COLOR = 'outline_color = vec4(max(outline_app_color, vec3(0.0)), 1.0) * outline_inside(outline_position);';
const PRESETS = ['terminal', 'amber', 'vaporwave', 'noir', 'vhs', 'neon', 'pocket'];
const BORDERS = ['double', 'dashed', 'neon', 'rainbow'];
const TRANSITIONS = ['pixelate', 'beam', 'shatter', 'static'];

type Choice = boolean | number | string;

const FILTERS: Record<string, [string, Choice][]> = {
  'grade-custom': [['grade', 'custom'], ['grade-strength', 1], ['grade-temperature', 0.6], ['grade-tint', 0.3], ['grade-saturation', 1.5], ['grade-contrast', 1.15]],
  duotone: [['grade', 'duotone'], ['grade-strength', 1]],
  'palette-pocket': [['palette', 'pocket'], ['pixelate', 3]],
  'palette-one-bit': [['palette', 'one-bit']],
  'palette-amber': [['palette', 'amber']],
  'palette-sixteen': [['palette', 'sixteen'], ['pixelate', 2]],
  pixelate: [['pixelate', 8]],
  posterize: [['stylize', 'posterize'], ['posterize-levels', 3]],
  halftone: [['stylize', 'halftone'], ['halftone-size', 9]],
  vhs: [['vhs', true], ['vhs-strength', 0.8]],
  'film-grain': [['screen-grain', 0.8]],
  vignette: [['screen-vignette', 0.8]],
  'crt-shadow-mask': [['desktop-crt', true], ['crt-mask', 0.8], ['crt-mask-type', 'shadow'], ['crt-line-count', 240], ['crt-line-thickness', 0.8]],
  'crt-slot-mask': [['desktop-crt', true], ['crt-mask', 0.8], ['crt-mask-type', 'slot']],
  bloom: [['bloom', 0.8], ['bloom-radius', 2], ['bloom-threshold', 0.4]],
};
const FILTER_OFF: [string, Choice][] = [
  ['grade', 'off'], ['palette', 'off'], ['pixelate', 1], ['stylize', 'off'], ['vhs', false], ['screen-grain', 0], ['screen-vignette', 0],
  ['desktop-crt', false], ['crt-mask', 0.2], ['crt-mask-type', 'aperture'], ['bloom', 0], ['glitch-bursts', false],
];

const anyTurnedOff = () => Main.messageTray.getSources().some(source => source.notifications.some(notification => notification.title?.endsWith(OFF_NOTICE)));

function giveStripedAnIcon() {
  const folder = GLib.build_filenamev([GLib.get_user_data_dir(), 'applications']);
  const icon = GLib.build_filenamev([folder, 'striped.svg']);
  GLib.file_set_contents(icon, RED_ICON);
  const desktop = GLib.build_filenamev([folder, STRIPED_DESKTOP_ID]);
  const [, contents] = GLib.file_get_contents(desktop);
  GLib.file_set_contents(desktop, `${new TextDecoder().decode(contents).trimEnd()}\nIcon=${icon}\n`);
}

async function open(title: string, x: number, y: number, client = 'stripedWindow') {
  gjs(`clients/windows/${client}.js`, [title, '520', '360']);
  const window = await waitForWindow(candidate => !!candidate.get_title()?.startsWith(title), `${title} opens`);
  window.move_frame(true, x, y);
  await pause(300);
  return window;
}

async function wear(choices: [string, Choice][]) {
  for (const [key, value] of choices) await choose(key, value);
  await settled();
}

async function frame() {
  const {x, y, width, height} = Main.layoutManager.primaryMonitor!;
  return captureFrame({x, y, width, height});
}

async function checkPlaying() {
  const filter = shaders().filter(PLAYED, {captured: true});
  await eventually(() => attachedEffects().views > 0, 'a filter that plays now and then goes on');
  require(!(await frame()).near(300, 300, '#ff0000', 30), 'and draws nothing of its burst until it plays');
  filter.play(1500);
  await eventually(async () => (await frame()).near(300, 300, '#ff0000', 30), 'playing it moves filter_play');
  await eventually(async () => !(await frame()).near(300, 300, '#ff0000', 30), 'and it ends by itself', 4000);
  filter.dispose();
  await eventually(nothingAttached, 'it comes off');
}

async function checkAppColor(striped: Meta.Window) {
  const overlay = shaders().overlay(APP_COLOR);
  await eventually(() => attachedEffects().overlays === 2, 'an overlay asking for the app\'s colour goes on');
  const {x, y} = striped.get_frame_rect();
  await eventually(async () => {
    const shown = await frame();
    return shown.near(x + 200, y + 200, '#e0301e', 90) && !shown.near(x + 200, y + 200, '#000000', 40);
  }, 'it gets the colour of the app\'s icon', 10000);
  overlay.dispose();
  await eventually(nothingAttached, 'it comes off');
}

async function checkWindowLooks(striped: Meta.Window) {
  for (const style of BORDERS) {
    await wear([['border', style], ['border-color', '#ff5fa2'], ['border-width', 3], ['border-motion', 'still']]);
    await eventually(() => attachedEffects().overlays === 2, `a ${style} border goes on`);
    await capture(`phosphor-border-${style}`);
    await wear([['border-motion', 'flow']]);
    await eventually(() => attachedEffects().overlays === 2, `a ${style} border flows`);
  }
  await wear([['border', 'glow'], ['border-motion', 'still'], ['border-app-color', true]]);
  await capture('phosphor-border-app-color');
  await wear([['border', 'off'], ['border-app-color', false]]);
  for (const shadow of ['hard', 'soft']) {
    await wear([['shadow', shadow], ['shadow-color', '#5fd4ff'], ['shadow-size', 14]]);
    await eventually(() => attachedEffects().overlays === 2, `a ${shadow} shadow goes on every window`);
    await capture(`phosphor-shadow-${shadow}`);
  }
  await wear([['shadow', 'off']]);
  striped.activate(global.get_current_time());
  await wear([['unfocused', 'dim'], ['unfocused-strength', 0.6]]);
  await eventually(() => attachedEffects().overlays === 1, 'dimming goes on the window in the background only');
  await capture('phosphor-unfocused-dim');
  await wear([['unfocused', 'desaturate'], ['unfocused-strength', 1]]);
  await eventually(() => attachedEffects().effects === 1, 'taking colour away goes on the window in the background only');
  await capture('phosphor-unfocused-desaturate');
  await wear([['unfocused', 'off']]);
  for (const overlay of [['tint', 'overlay-tint-color', '#5fd4ff'], ['scanlines', 'overlay-line-spacing', 6], ['grain', 'overlay-grain-size', 4], ['vignette', 'overlay-vignette-size', 0.9]] as const) {
    await wear([['overlay', overlay[0]], [overlay[1], overlay[2]]]);
    await eventually(() => attachedEffects().overlays === 2, `the ${overlay[0]} overlay takes its own setting`);
  }
  await wear([['overlay', 'off']]);
  await eventually(nothingAttached, 'window effects come off');
}

async function checkTransitions() {
  for (const look of TRANSITIONS) {
    await wear([['open-effect', look], ['close-effect', look], ['open-length', 2], ['close-length', 2]]);
    gjs('clients/windows/stripedWindow.js', [`Shown ${look}`, '520', '360']);
    await waitForWindow(candidate => candidate.get_title() === `Shown ${look}`, `a window opens with ${look}`);
    await pause(380);
    GLib.file_set_contents(output(`phosphor-open-${look}`), (await screenshot()).toArray());
    await settled();
    require(nothingAttached(), `${look} leaves nothing on the window once it's open`);
    global.get_window_actors().find(actor => actor.meta_window?.get_title() === `Shown ${look}`)!.meta_window!.delete(global.get_current_time());
    await eventually(() => !global.get_window_actors().some(actor => actor.meta_window?.get_title() === `Shown ${look}`), `the window closes with ${look}`);
  }
  await wear([['open-effect', 'off'], ['close-effect', 'off'], ['open-length', 1], ['close-length', 1]]);
}

async function checkFilters() {
  for (const [name, choices] of Object.entries(FILTERS)) {
    await wear([...FILTER_OFF, ...choices]);
    await eventually(() => attachedEffects().views > 0, `the ${name} filter goes on`);
    await capture(`phosphor-filter-${name}`);
  }
  await wear([...FILTER_OFF, ['glitch-bursts', true], ['glitch-gap', 60]]);
  await eventually(() => attachedEffects().views > 0, 'glitches now and then put a filter on');
  const view = global.stage.peek_stage_views().find(candidate => candidate.get_filter())!;
  view.get_filter()!.set_uniform('filter_play', 1, [0.5]);
  view.queue_filter_frame();
  await pause(200);
  GLib.file_set_contents(output('phosphor-filter-glitch'), (await screenshot()).toArray());
  await wear(FILTER_OFF);
  await eventually(nothingAttached, 'turning the filters off leaves nothing');
}

async function checkPresets() {
  for (const preset of PRESETS) {
    await choose('look', preset);
    await settled();
    await pause(600);
    await capture(`phosphor-look-${preset}`);
  }
  await choose('look', 'vaporwave');
  await settled();
  await choose('border-width', 6);
  await eventually(() => lookIs('custom'), 'changing a preset makes the look Custom');
  await choose('look', 'noir');
  await settled();
  await choose('look', 'custom');
  await eventually(() => settingIs('border-width', 6), 'picking Custom again brings back what was changed');
  await choose('look', 'plain');
  await eventually(nothingAttached, 'the plain look leaves nothing on the screen');
  await capture('phosphor-look-plain');
  await checkQuickChanges();
}

const settles = (what: string, holds: () => boolean) => eventually(async () => {
  await settled();
  return holds();
}, what);

async function checkQuickChanges() {
  await choose('look', 'vaporwave');
  await settles('Vaporwave goes on', () => lookIs('vaporwave'));
  await choose('border-width', 5);
  await settles('changing it makes the look Custom', () => lookIs('custom'));
  await Promise.all([choose('look', 'plain'), choose('screen-grain', 0.3)]);
  await settles('a change right after picking a look goes on top of it, as Custom', () =>
    lookIs('custom') && settingIs('screen-grain', 0.3) && settingIs('border', 'off') && settingIs('grade', 'off'));
  await choose('look', 'terminal');
  await settles('picking another look puts all of it on', () => lookIs('terminal') && settingIs('desktop-crt', true) && settingIs('screen-grain', 0));
  await choose('look', 'custom');
  await settles('Custom brings back exactly what was last had', () => settingIs('screen-grain', 0.3) && settingIs('border', 'off') && settingIs('desktop-crt', false));
  await Promise.all([choose('look', 'amber'), choose('look', 'neon')]);
  await settles('two looks picked at once leave the last one, whole', () => lookIs('neon') && settingIs('border', 'neon') && settingIs('desktop-crt', false));
  await choose('look', 'plain');
  await eventually(nothingAttached, 'and plain leaves nothing');
}

function stored(key: string) {
  return (kestrel.get_value('extension-settings').recursiveUnpack() as Record<string, Record<string, unknown>>)[PHOSPHOR]?.[key];
}
const lookIs = (look: string) => stored('look') === look;
const settingIs = (key: string, value: Choice) => stored(key) === value;

async function checkSavedLooks() {
  await choose('look', 'neon');
  await settled();
  const group = (await pageItems()).find(item => item.type === 'group') as {items: {type?: string; title?: string; action?: string; actions?: {label: string; action: string}[]}[]};
  const save = group.items.find(item => item.type === 'entry')!;
  await act(save.action!, new GLib.Variant('s', 'Mine'));
  await choose('look', 'plain');
  await eventually(nothingAttached, 'another look takes it off');
  const saved = ((await pageItems()).find(item => item.type === 'group') as typeof group).items.find(item => item.type === 'list') as unknown as {items: {title: string; actions: {label: string; action: string}[]}[]};
  const mine = saved.items.find(item => item.title === 'Mine');
  require(!!mine, 'a saved look is listed under its name');
  await act(mine!.actions[0].action, new GLib.Variant('b', true));
  await eventually(() => lookIs('custom') && settingIs('border', 'neon'), 'using it puts it back on as a custom look');
  await choose('look', 'plain');
}

async function subpageValue(key: string) {
  return ((await pageItems()).find(item => item.type === 'page' && (item as {key?: string}).key === key) as {value?: string} | undefined)?.value;
}

async function checkSubpages() {
  const keys = (await pageItems()).filter(item => item.type === 'page').map(item => (item as {key?: string}).key);
  require(['windows', 'motion', 'apps', 'filters', 'color', 'surfaces'].every(key => keys.includes(key)), 'each area of the page opens on a page of its own');
  await choose('look', 'plain');
  await eventually(async () => await subpageValue('windows') === 'Off', 'with nothing on, Windows says so');
  await choose('border', 'neon');
  await eventually(async () => await subpageValue('windows') === 'Neon tube', 'one window effect on is named');
  await choose('shadow', 'hard');
  await eventually(async () => await subpageValue('windows') === '2 on', 'and several are counted');
  await wear([['open-effect', 'glitch'], ['close-effect', 'glitch']]);
  await eventually(async () => await subpageValue('motion') === 'Glitch', 'opening and closing the same way counts once');
  await choose('look', 'plain');
}

async function checkSafety() {
  await choose('look', 'vhs');
  await eventually(() => attachedEffects().views > 0, 'the VHS look is on');
  kestrel.set_boolean('screen-effects-off', true);
  await eventually(nothingAttached, 'turning every effect off takes the moving filter off too');
  kestrel.set_boolean('screen-effects-off', false);
  await eventually(() => attachedEffects().views > 0, 'and it comes back');
  await choose('look', 'plain');
  await eventually(nothingAttached, 'and goes again');
}

export async function run() {
  installStripedApp();
  giveStripedAnIcon();
  try {
    await installProbes();
    await eventually(shadersRun, 'the probe runs');
    await eventually(async () => (await listed(PHOSPHOR))?.state === 'running', 'Phosphor runs');
    await choose('filters-captured', true);
    const striped = await open('Striped', 100, 90);
    await open('Other', 760, 300, 'boardWindow');
    await checkPlaying();
    await checkAppColor(striped);
    await checkWindowLooks(striped);
    await checkTransitions();
    await checkFilters();
    await checkPresets();
    await checkSavedLooks();
    await checkSubpages();
    await checkSafety();
    require(!anyTurnedOff(), 'every new effect compiles and stays fast enough');
  } finally {
    await request('Remove', SHADERS);
    await request('Remove', PHOSPHOR);
    await stopAll();
    for (const key of ['extension-settings', 'disabled-extensions', 'screen-effects-off']) kestrel.reset(key);
  }
}
