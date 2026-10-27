import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import {descendants, existing, named, ofType, shown, shownStyled, textOf} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {inputMethodSettled} from '../lib/input/inputMethod.js';
import {click, hold, press, release, scroll} from '../lib/input/input.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';

const {require, eventually} = checks('input source');
const LAYOUTS = new GLib.Variant('a(ss)', [['xkb', 'us'], ['xkb', 'de']]);

const checked = (row: Clutter.Actor) => descendants(row).some(child => child instanceof St.Icon && child.icon_name === 'object-select-symbolic');
const current = (indicator: St.Button) => indicator.child && textOf(indicator.child);

async function checkSwitcher(indicator: St.Button) {
  hold(Clutter.KEY_Super_L);
  press(Clutter.KEY_space);
  await eventually(() => shown(shownStyled('switcher-popup')), 'holding Super+Space shows the input source switcher');
  await capture('input-source-switcher');
  release(Clutter.KEY_Super_L);
  await eventually(() => current(indicator) === 'DE', 'Super+Space switches and the panel follows');
}

async function checkMenu(indicator: St.Button) {
  const menu = existing('kestrel-context-menu');
  await settled();
  click(indicator);
  await eventually(() => shown(menu) && named('Keyboard settings', menu), 'the menu lists input sources and keyboard settings');
  const listedEnglish = named('English (US)', menu);
  const listedGerman = named('German', menu);
  const [english, german] = require(listedEnglish && listedGerman && [listedEnglish, listedGerman], 'the menu lists every input source');
  require(checked(german) && !checked(english), 'the menu marks the current input source');
  await capture('input-source-menu');
  click(english);
  await eventually(() => !menu.visible && current(indicator) === 'EN', 'choosing an input source switches to it');
}

export async function run() {
  const settings = new Gio.Settings({schema_id: 'org.gnome.desktop.input-sources'});
  const saved = {sources: settings.get_value('sources'), mru: settings.get_value('mru-sources')};
  const indicator = ofType(existing('kestrel-input-source'), St.Button);
  await eventually(inputMethodSettled, 'IBus has settled with Xwayland and can switch input sources', 15000);
  try {
    settings.set_value('mru-sources', LAYOUTS);
    settings.set_value('sources', LAYOUTS);
    await eventually(() => indicator.visible && current(indicator) === 'EN', 'two layouts show the current one in the panel');
    await capture('input-source');

    await checkSwitcher(indicator);
    await checkMenu(indicator);

    const workspace = global.workspace_manager.get_active_workspace_index();
    scroll(Clutter.ScrollDirection.DOWN, indicator);
    await eventually(() => current(indicator) === 'DE', 'scrolling over the indicator cycles input sources');
    require(global.workspace_manager.get_active_workspace_index() === workspace, 'scrolling over the indicator leaves the workspace alone');
  } finally {
    settings.set_value('sources', saved.sources);
    settings.set_value('mru-sources', saved.mru);
  }
}
