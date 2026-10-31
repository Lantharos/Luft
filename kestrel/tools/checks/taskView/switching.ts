import Clutter from 'gi://Clutter';
import type Meta from 'gi://Meta';
import {Main, SwitcherPopup} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {shownStyled, styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {centerOf, chord, click, hold, press, release} from '../lib/input/input.js';
import {gjs, waitForWindows} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {nextFrame, waitUntil} from '../lib/wait.js';

const {eventually} = checks('window switching');

const switcher = () => Main.uiGroup.get_children().find(actor => actor instanceof SwitcherPopup);

async function checkAltTab(windows: Meta.Window[]) {
  const before = await waitUntil(() => windows.find(window => window.has_focus()), 'one of the windows takes focus');
  hold(Clutter.KEY_Alt_L);
  press(Clutter.KEY_Tab);
  await eventually(() => Main.modalCount > 0 && switcher()?.opacity === 255, 'Alt-Tab opens the window switcher');
  await capture('window-switcher');
  release(Clutter.KEY_Alt_L);
  await eventually(() => Main.modalCount === 0 && global.display.focus_window !== before, 'releasing Alt switches to the chosen window');
}

async function checkClosingFromSwitcher(windows: Meta.Window[]) {
  hold(Clutter.KEY_Alt_L);
  press(Clutter.KEY_Tab);
  await eventually(() => switcher()?.opacity === 255, 'Alt-Tab opens the window switcher again');
  const shownCloses = () => styled('kestrel-switcher-close').filter(close => close.opacity === 255 && close.reactive);
  await eventually(() => shownCloses().length === 1, 'only the selected window shows a close button');
  await capture('window-switcher-close');
  click(centerOf(shownCloses()[0]));
  await eventually(() => windows.filter(window => window.get_compositor_private()).length === windows.length - 1 && switcher()?.opacity === 255,
    'the close button closes its window and the switcher stays open');
  release(Clutter.KEY_Alt_L);
  await eventually(() => Main.modalCount === 0, 'releasing Alt leaves the switcher');
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
  gjs('clients/windows/window.js', ['--multiple']);
  const windows = await waitForWindows(['Kestrel window check 1', 'Kestrel window check 2']);
  await checkAltTab(windows);
  await checkClosingFromSwitcher(windows);
  await checkWindowMenu();
  await checkShellFocus();
}
