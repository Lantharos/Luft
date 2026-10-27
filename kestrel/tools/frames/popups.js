import Clutter from 'gi://Clutter';
import {dismissImmediately, toggleSurface, Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {named, shown, shownStyled} from '../checks/lib/actors.js';
import {press, rest} from '../checks/lib/input/input.js';
import {gjs, stop, waitForWindow} from '../checks/lib/processes.js';
import {settled, waitUntil} from '../checks/lib/wait.js';
import {lock, unlock, wake} from '../checks/lockScreen/lib/shield.js';
import {measured} from './recorder.js';

const ENTRY_TITLE = 'Kestrel window check';

let entry = null;

async function focusEntry() {
  dismissImmediately();
  entry ??= gjs('clients/windows/window.js', ['--entry']);
  const window = await waitForWindow(ENTRY_TITLE);
  window.activate(global.get_current_time());
  await waitUntil(() => window.has_focus() && Main.inputMethod.caret, 'the text field takes the keyboard');
  rest();
  await settled();
}

async function closeEntry() {
  if (entry) await stop(entry);
  entry = null;
  await settled();
}

async function locked() {
  if (Main.screenShield.locked) await unlock();
  await lock();
  await wake();
}

async function unlocked() {
  await unlock();
  await settled();
}

const promptShown = () => shown(named('kestrel-lock-controls')) && shownStyled('login-dialog-prompt-entry')?.clutter_text.has_key_focus();

export const popupInteractions = [
  {name: 'Emoji open', first: 'Emoji first open', prepare: focusEntry, act: measured(() => toggleSurface('emoji')), finish: closeEntry},
  {
    name: 'Lock prompt', first: 'Lock prompt first open', prepare: locked, finish: unlocked,
    act: measured(async () => {
      press(Clutter.KEY_space);
      await waitUntil(promptShown, 'a key shows the unlock prompt');
    }),
  },
];
