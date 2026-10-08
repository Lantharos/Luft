import GLib from 'gi://GLib';
import * as IBusManager from 'resource:///com/lantharos/kestrel/misc/ibusManager.js';

import {checks} from '../../lib/check.js';
import {type} from '../../lib/input.js';
import {capture} from '../../lib/screenshots.js';
import {settled} from '../../lib/wait.js';
import {changes, withApp} from '../lib/apps.js';
import {write} from '../lib/files.js';
import {saveBothStyles} from '../lib/palette.js';
import {code, focus, openEntry, tryFieldHolds, typeInto, useSources} from './typing.js';

const {eventually} = checks('Keys');
const KEY_LEFT = 105;
const IBUS_RESTART = 30000;
const TRY_FIELD = [-200, 120];
export const ENGINE = 'keys:pinyin-lite';
const METHOD = `name = "Pinyin lite"
label = "拼"
language = "zh"
candidates = 9
learn = true

rules = [
  { keys = "a'", text = "á" },
]

words = [
  { keys = "ni", text = "你" },
  { keys = "ni", text = "尼" },
  { keys = "hao", text = "好" },
  { keys = "nihao", text = "你好" },
]
`;

async function checkTryField(app, palette) {
  await focus(app.window);
  const {width} = app.window.get_frame_rect();
  app.click([width + TRY_FIELD[0], TRY_FIELD[1]]);
  await changes(app, 'the Try it field shows the reading', () => type('ni'));
  await saveBothStyles(app, palette, 'keys-method-try');
  await changes(app, 'a number picks a word in the Try it field', () => type('2'));
  await changes(app, 'a replacement shows in the Try it field', () => type("a' "));
  await tryFieldHolds(app, () => {
    code(KEY_LEFT);
    type('x');
  }, '尼xá', 'the input method’s Try it field picks words, replaces and types at the caret while it is the input source too');
}

async function checkCandidates() {
  const entry = await openEntry();
  try {
    type('ni');
    const popup = IBusManager.getIBusManager()._candidatePopup;
    await eventually(() => popup.visible, 'typing a reading shows its words in Kestrel’s candidate popup');
    await settled();
    await capture('keys-candidates');
    await typeInto(entry, () => type('2'), '尼', 'a number picks that candidate');
    await typeInto(entry, () => type("a' "), '尼á', 'replacements turn a\' into á');
  } finally {
    await entry.close();
  }
}

export async function checkMethod(palette) {
  const file = `${GLib.get_home_dir()}/Documents/Pinyin lite.toml`;
  write(file, METHOD);
  await withApp('keys', [file], app => checkImported(app, palette));
}

async function checkImported(app, palette) {
  await eventually(() => IBusManager.getIBusManager().getEngineDesc(ENGINE), 'an imported input method is registered with IBus without logging out', IBUS_RESTART);
  await saveBothStyles(app, palette, 'keys-method');
  await useSources([['xkb', 'us']]);
  await useSources([['ibus', ENGINE], ['xkb', 'us']]);
  await checkTryField(app, palette);
  await checkCandidates();
}
