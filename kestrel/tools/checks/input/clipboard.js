import Clutter from 'gi://Clutter';
import St from 'gi://St';
import {toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {named, shown} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {inputMethodSettled} from '../lib/inputMethod.js';
import {press} from '../lib/input.js';
import {gjs, waitForWindow} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';

const {require, eventually} = checks('clipboard');
const PASTED = 'See you at the harbour';
const NEAR = 12;

const inside = (caret, frame) => caret.x >= frame.x && caret.y >= frame.y && caret.x < frame.x + frame.width && caret.y < frame.y + frame.height;

async function openHistory(panel) {
  toggleSurface('clipboard');
  await eventually(() => shown(panel), 'clipboard history opens');
  await settled();
}

export async function run() {
  const panel = named('kestrel-clipboard');
  await eventually(inputMethodSettled, 'IBus has settled with Xwayland', 15000);
  St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, PASTED);
  gjs('clients/window.js', ['--entry']);
  const window = await waitForWindow('Kestrel window check');
  const frame = window.get_frame_rect();
  await eventually(() => window.has_focus() && Main.inputMethod.caret && inside(Main.inputMethod.caret, frame), 'the text cursor of the focused field is known');
  const caret = Main.inputMethod.caret;

  await openHistory(panel);
  require(Math.abs(panel.y - (caret.y + caret.height)) <= NEAR && Math.abs(panel.x - caret.x) <= NEAR, 'clipboard history opens just below the text cursor');
  await capture('clipboard-history');

  press(Clutter.KEY_Return);
  await eventually(() => !panel.visible && window.title === `Kestrel entry: ${PASTED}`, 'Enter pastes the latest entry into the field');

  const lowered = Main.layoutManager.primaryMonitor.height - frame.height + 120;
  window.move_frame(true, frame.x, lowered);
  await eventually(() => Main.inputMethod.caret.y > caret.y + (lowered - frame.y) / 2, 'the text cursor follows the window down');
  const lowCaret = Main.inputMethod.caret;
  await openHistory(panel);
  require(panel.y + panel.height <= lowCaret.y && lowCaret.y - (panel.y + panel.height) <= NEAR,
    'clipboard history opens above a text cursor near the bottom of the screen');
  press(Clutter.KEY_Escape);
  await eventually(() => !panel.visible, 'Escape closes clipboard history');
}
