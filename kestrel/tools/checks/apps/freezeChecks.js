import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {Keys, LuftApp, sleep} from './luftApp.js';

const FREEZE_AFTER = 300000;
const FREEZE_MARGIN = 30000;
const THAW_TARGET = 250;
const SETTLE = 800;
const TYPED = 'Frozen pages keep what was typed';
const FIRST_LINE = {left: 310, top: 62, width: 250, height: 24};
const TEXT_TOLERANCE = 40;

function firstLine(app) {
  const {x, y} = app.window.get_frame_rect();
  return app.frame({x: x + FIRST_LINE.left, y: y + FIRST_LINE.top, width: FIRST_LINE.width, height: FIRST_LINE.height});
}

async function minimized(app) {
  const since = GLib.get_monotonic_time();
  app.window.minimize();
  await app.reaches('suspended', since, 5000);
  return since;
}

class FreezeCheck {
  constructor({require, output, styles}) {
    this.require = require;
    this.output = output;
    this.styles = styles;
    this.session = new Gio.Settings({schema_id: 'org.gnome.desktop.session'});
    this.draft = new LuftApp('draft');
    this.tern = null;
  }

  async start() {
    const keys = new Keys();
    this.session.set_uint('idle-delay', 0);
    this.styles.interface.set_string('color-scheme', 'prefer-dark');
    await this.draft.open();
    await this.draft.settle(() => true);
    keys.press(Clutter.KEY_n, [Clutter.KEY_Control_L]);
    await sleep(SETTLE);
    const blank = await firstLine(this.draft);
    await keys.type(TYPED);
    await sleep(SETTLE);
    this.typed = await firstLine(this.draft);
    this.require(!this.typed.looksLike(blank, 8), 'Draft shows the text typed before it is minimized');
    this.draftHidden = await minimized(this.draft);

    this.tern = new LuftApp('tern');
    await this.tern.open();
    await sleep(SETTLE * 2);
    await keys.type('sleep 900');
    keys.press(Clutter.KEY_Return);
    await sleep(SETTLE);
    this.ternHidden = await minimized(this.tern);
  }

  async finish() {
    const {draft, tern, require} = this;
    const frozenAfter = await draft.reaches('frozen', this.draftHidden, FREEZE_AFTER + FREEZE_MARGIN);
    require(frozenAfter >= FREEZE_AFTER, `Draft freezes ${Math.round(frozenAfter / 1000)} s after it was minimized`);
    require(!tern.lifecycle.some(change => change.state === 'frozen' && change.at >= this.ternHidden), 'Tern keeps running while a command runs out of sight');

    this.styles.interface.set_string('color-scheme', 'prefer-dark');
    const shown = GLib.get_monotonic_time();
    draft.window.unminimize();
    draft.window.activate(global.get_current_time());
    const thawed = await draft.reaches('active', shown, 5000);
    await sleep(SETTLE);
    (await draft.frame()).save(`${this.output}/draft-thawed-dark.png`);
    const restored = await firstLine(draft);
    const kept = restored.looksLike(this.typed, TEXT_TOLERANCE);
    if (!kept) {
      this.typed.saveZoomed(`${this.output}/draft-thawed-typed.png`, 4);
      restored.saveZoomed(`${this.output}/draft-thawed-restored.png`, 4);
    }
    require(thawed < THAW_TARGET && kept, `Draft comes back ${Math.round(thawed)} ms after it is shown, with its text still in place`);
  }

  async close() {
    await this.draft.close();
    await this.tern?.close();
    this.session.reset('idle-delay');
  }
}

export async function startFreezeCheck(context) {
  const check = new FreezeCheck(context);
  try {
    await check.start();
  } catch (error) {
    await check.close();
    throw error;
  }
  return check;
}
