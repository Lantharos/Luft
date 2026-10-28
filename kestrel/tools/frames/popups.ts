import {dismissImmediately, toggleSurface, Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {rest} from '../checks/lib/input/input.js';
import {gjs, stop, waitForWindow, type Process} from '../checks/lib/processes.js';
import {settled, waitUntil} from '../checks/lib/wait.js';
import {lock, showPrompt, unlock, wake} from '../checks/lockScreen/lib/shield.js';
import {measured, type Interaction} from './recorder.js';

const ENTRY_TITLE = 'Kestrel window check';

let entry: Process | null = null;

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

export const popupInteractions: Interaction[] = [
  {name: 'Emoji open', first: 'Emoji first open', prepare: focusEntry, act: measured(() => toggleSurface('emoji')), finish: closeEntry},
  {
    name: 'Lock prompt', first: 'Lock prompt first open', prepare: locked, finish: unlocked,
    act: measured(showPrompt),
  },
  {
    name: 'Lock screen', prepare: unlocked, finish: unlocked,
    act: measured(async () => {
      Main.screenShield.lock(true);
      await waitUntil(() => Main.screenShield.locked && Main.screenShield.active, 'the screen locks');
    }),
  },
  {
    name: 'Unlock screen', prepare: async () => {
      await locked();
      await showPrompt();
    },
    act: measured(async () => {
      Main.screenShield.deactivate(true);
      await waitUntil(() => !Main.screenShield.locked, 'the screen unlocks');
    }),
  },
];
