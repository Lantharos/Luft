import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {checks} from '../lib/check.js';
import {press, type} from '../lib/input.js';
import {changes, openApp, withApp} from './lib/apps.js';
import {checkPalette, showDark, useScheme, withPalette} from './lib/palette.js';

export const timeout = 420000;

const {require} = checks('Luft app');
const FREEZE_AFTER = 300000;
const FREEZE_MARGIN = 30000;
const THAW_TARGET = 250;
const SUSPEND_TIMEOUT = 5000;
const TYPED = 'Frozen pages keep what was typed';
const FIRST_LINE = {x: 310, y: 62, width: 250, height: 24};
const PROMPT_LINE = {x: 0, y: 50, width: 400, height: 22};
const TEXT_TOLERANCE = 40;
const TERMINAL_TOLERANCE = 40;

const firstLine = app => app.frame(app.area(FIRST_LINE));

async function minimized(app) {
  const since = GLib.get_monotonic_time();
  app.window.minimize();
  await app.reaches('suspended', since, SUSPEND_TIMEOUT);
  return since;
}

async function typeAndHide(draft) {
  await changes(draft, 'Ctrl+N opens a new file in Draft', () => press(Clutter.KEY_Control_L, Clutter.KEY_n));
  const blank = await firstLine(draft);
  await changes(draft, 'Draft shows what is typed', () => type(TYPED), FIRST_LINE);
  const typed = await firstLine(draft);
  require(!typed.looksLike(blank, 8), 'Draft shows the text typed before it is minimized');
  return {typed, hidden: await minimized(draft)};
}

async function runOutOfSight(tern, palette) {
  const prompted = frame => frame.share([palette.dark.surface], TERMINAL_TOLERANCE) < 1;
  require(prompted(await tern.settle(prompted, tern.area(PROMPT_LINE))), 'Tern shows the shell prompt');
  await changes(tern, 'Tern shows the typed command', () => type('sleep 900'), PROMPT_LINE);
  press(Clutter.KEY_Return);
  return minimized(tern);
}

async function thaw(draft, typed) {
  useScheme('dark');
  const shown = GLib.get_monotonic_time();
  draft.window.unminimize();
  draft.window.activate(global.get_current_time());
  const thawed = await draft.reaches('active', shown, SUSPEND_TIMEOUT);
  const restored = await draft.settle(frame => frame.looksLike(typed, TEXT_TOLERANCE), draft.area(FIRST_LINE));
  (await draft.frame()).save('draft-thawed-dark');
  const kept = restored.looksLike(typed, TEXT_TOLERANCE);
  if (!kept) {
    typed.saveZoomed('draft-thawed-typed', 4);
    restored.saveZoomed('draft-thawed-restored', 4);
  }
  require(thawed < THAW_TARGET && kept, `Draft comes back ${Math.round(thawed)} ms after it is shown, with its text still in place`);
}

async function checkFreezing(draft, palette) {
  const session = new Gio.Settings({schema_id: 'org.gnome.desktop.session'});
  session.set_uint('idle-delay', 0);
  let tern = null;
  try {
    await showDark(draft, palette);
    const {typed, hidden} = await typeAndHide(draft);
    tern = await openApp('tern');
    const ternHidden = await runOutOfSight(tern, palette);
    const frozenAfter = await draft.reaches('frozen', hidden, FREEZE_AFTER + FREEZE_MARGIN);
    require(frozenAfter >= FREEZE_AFTER, `Draft freezes ${Math.round(frozenAfter / 1000)} s after it was minimized`);
    require(!tern.lifecycle.some(change => change.state === 'frozen' && change.at >= ternHidden), 'Tern keeps running while a command runs out of sight');
    await thaw(draft, typed);
  } finally {
    await tern?.close();
    session.reset('idle-delay');
  }
}

export async function run() {
  await withPalette(palette => withApp('draft', [], async draft => {
    await checkPalette(draft, palette);
    await checkFreezing(draft, palette);
  }));
}
