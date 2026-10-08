import Clutter from 'gi://Clutter';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';
import {SwitcherPopup} from 'resource:///com/lantharos/kestrel/ui/switcherPopup.js';

import {shownStyled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {chord, hold, press, release} from '../lib/input.js';
import {gjs, waitForWindows} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {nextFrame, waitUntil} from '../lib/wait.js';

const {eventually} = checks('window switching');

const switcher = () => Main.uiGroup.get_children().find(actor => actor instanceof SwitcherPopup);

async function checkAltTab(windows) {
  const before = await waitUntil(() => windows.find(window => window.has_focus()), 'one of the windows takes focus');
  hold(Clutter.KEY_Alt_L);
  press(Clutter.KEY_Tab);
  await eventually(() => Main.modalCount > 0 && switcher()?.opacity === 255, 'Alt-Tab opens the window switcher');
  await capture('window-switcher');
  release(Clutter.KEY_Alt_L);
  await eventually(() => Main.modalCount === 0 && global.display.focus_window !== before, 'releasing Alt switches to the chosen window');
}

async function checkWindowMenu() {
  await chord(Clutter.KEY_Alt_L, Clutter.KEY_space);
  await eventually(() => shownStyled('window-menu'), 'Alt+Space opens the window menu');
  await capture('window-menu');
  press(Clutter.KEY_Escape);
  await eventually(() => !shownStyled('window-menu') && Main.modalCount === 0, 'Escape closes the window menu');
}

async function checkShellFocus() {
  hold(Clutter.KEY_Control_L);
  await nextFrame();
  hold(Clutter.KEY_Alt_L);
  press(Clutter.KEY_Tab);
  await eventually(() => Main.modalCount > 0, 'Ctrl-Alt-Tab opens shell focus switching');
  press(Clutter.KEY_Escape);
  release(Clutter.KEY_Control_L, Clutter.KEY_Alt_L);
  await eventually(() => Main.modalCount === 0, 'Escape leaves shell focus switching');
}

export async function run() {
  gjs('clients/window.js', ['--multiple']);
  const windows = await waitForWindows(['Kestrel window check 1', 'Kestrel window check 2']);
  await checkAltTab(windows);
  await checkWindowMenu();
  await checkShellFocus();
}
