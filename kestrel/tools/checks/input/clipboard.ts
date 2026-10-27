import Clutter from 'gi://Clutter';
import type Mtk from 'gi://Mtk';
import St from 'gi://St';
import {toggleSurface, Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {existing, shown} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {inputMethodSettled} from '../lib/input/inputMethod.js';
import {press} from '../lib/input/input.js';
import {gjs, waitForWindow} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';

type Caret = NonNullable<typeof Main.inputMethod.caret>;

const {require, eventually} = checks('clipboard');
const PASTED = 'See you at the harbour';
const NEAR = 12;

const inside = (caret: Caret, frame: Mtk.Rectangle) => caret.x >= frame.x && caret.y >= frame.y && caret.x < frame.x + frame.width && caret.y < frame.y + frame.height;

async function openHistory(panel: Clutter.Actor) {
  toggleSurface('clipboard');
  await eventually(() => shown(panel), 'clipboard history opens');
  await settled();
}

export async function run() {
  const panel = existing('kestrel-clipboard');
  await eventually(inputMethodSettled, 'IBus has settled with Xwayland', 15000);
  St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, PASTED);
  gjs('clients/windows/window.js', ['--entry']);
  const window = await waitForWindow('Kestrel window check');
  const frame = window.get_frame_rect();
  const caret = await eventually(() => window.has_focus() && Main.inputMethod.caret && inside(Main.inputMethod.caret, frame) && Main.inputMethod.caret,
    'the text cursor of the focused field is known');

  await openHistory(panel);
  require(Math.abs(panel.y - (caret.y + caret.height)) <= NEAR && Math.abs(panel.x - caret.x) <= NEAR, 'clipboard history opens just below the text cursor');
  await capture('clipboard-history');

  press(Clutter.KEY_Return);
  await eventually(() => !panel.visible && window.title === `Kestrel entry: ${PASTED}`, 'Enter pastes the latest entry into the field');

  const lowered = Main.layoutManager.primaryMonitor!.height - frame.height + 120;
  window.move_frame(true, frame.x, lowered);
  const lowCaret = await eventually(() => Main.inputMethod.caret && Main.inputMethod.caret.y > caret.y + (lowered - frame.y) / 2 && Main.inputMethod.caret,
    'the text cursor follows the window down');
  await openHistory(panel);
  require(panel.y + panel.height <= lowCaret.y && lowCaret.y - (panel.y + panel.height) <= NEAR,
    'clipboard history opens above a text cursor near the bottom of the screen');
  press(Clutter.KEY_Escape);
  await eventually(() => !panel.visible, 'Escape closes clipboard history');
}
