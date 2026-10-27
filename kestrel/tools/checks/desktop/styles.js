import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {checks} from '../lib/check.js';
import {scratch} from '../lib/processes.js';

const {eventually} = checks('style');
const STYLESHEET = `
.structure-row { margin-left: 1px; }
.structure-row:first-child { margin-left: 2px; }
.structure-row:last-child { margin-right: 3px; }
.structure-row:last-child .structure-label { margin-top: 4px; }
`;

const theme = () => St.ThemeContext.get_for_stage(global.stage).get_theme();
const margin = (actor, side) => actor.get_theme_node().get_margin(side);

function row(name) {
  const actor = new St.BoxLayout({name, style_class: 'structure-row'});
  actor.label = new St.Label({style_class: 'structure-label', text: name});
  actor.add_child(actor.label);
  return actor;
}

function styledAs(container, first, last) {
  const rows = container.get_children().filter(actor => actor.visible && actor.has_style_class_name('structure-row'));
  return rows.every(actor =>
    margin(actor, St.Side.LEFT) === (actor === first ? 2 : 1) &&
    margin(actor, St.Side.RIGHT) === (actor === last ? 3 : 0) &&
    margin(actor.label, St.Side.TOP) === (actor === last ? 4 : 0));
}

async function checkStructure(container, rows) {
  const [a, b, c] = rows;
  const placed = (first, last, label) => eventually(() => styledAs(container, first, last), label);

  await placed(a, c, 'the first and last rows take their styles');
  a.hide();
  await placed(b, c, 'hiding the first row moves the first-row style to the next one');
  a.show();
  c.hide();
  await placed(a, b, 'hiding the last row restyles the row before it and its label');
  c.show();
  container.set_child_above_sibling(a, null);
  await placed(b, a, 'moving a row to the end gives it the last-row style');
  const added = row('d');
  container.add_child(added);
  await placed(b, added, 'a row added at the end takes the last-row style from the one before it');
  added.destroy();
  await placed(b, a, 'removing the last row gives its style back');
  const unstyled = new St.Widget();
  container.insert_child_below(unstyled, null);
  await placed(null, a, 'another child in front of the rows takes the first place from them');
  unstyled.hide();
  await placed(b, a, 'hiding that child gives the first place back');
}

export async function run() {
  const file = Gio.File.new_for_path(scratch('kestrel-checks', 'structure.css'));
  GLib.mkdir_with_parents(file.get_parent().get_path(), 0o755);
  file.replace_contents(new TextEncoder().encode(STYLESHEET), null, false, Gio.FileCreateFlags.NONE, null);
  theme().load_stylesheet(file);
  const container = new St.BoxLayout({opacity: 0});
  const rows = ['a', 'b', 'c'].map(row);
  for (const actor of rows) container.add_child(actor);
  Main.uiGroup.add_child(container);
  try {
    await checkStructure(container, rows);
  } finally {
    container.destroy();
    theme().unload_stylesheet(file);
  }
}
