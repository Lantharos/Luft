import Gio from 'gi://Gio';
import {dismissImmediately, toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';

import {descendants, named, shown} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {click, moveTo, pressButton, releaseButton} from '../lib/input.js';
import {capture} from '../lib/screenshots.js';
import {nextFrame, settled, waitUntil} from '../lib/wait.js';

const {eventually} = checks('Start folder');
const ITEM = 'kestrel-start-item-';
const DRAG_STEPS = 12;

const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const layout = () => JSON.parse(settings.get_string('start-layout'));
const items = () => descendants(named('kestrel-start')).filter(actor => actor.name?.startsWith(ITEM) && actor.mapped);
const apps = () => items().filter(button => !button.name.includes('folder:'));
const idOf = button => button.name.replace(ITEM, '');
const panelApps = () => named('kestrel-panel-center').get_last_child().get_children().map(slot => slot.get_first_child());

async function dragOnto(sourceOf, targetOf, fraction = 0.5) {
  await settled();
  const [source, target] = [sourceOf(), targetOf()];
  const [x, y] = source.get_transformed_position();
  const [targetX, targetY] = target.get_transformed_position();
  const [fromX, fromY, toX, toY] = [x + source.width / 2, y + 24, targetX + target.width * fraction, targetY + Math.min(24, target.height / 2)];
  moveTo([fromX, fromY]);
  pressButton();
  for (let step = 1; step <= DRAG_STEPS; step++) {
    moveTo([fromX + (toX - fromX) * step / DRAG_STEPS, fromY + (toY - fromY) * step / DRAG_STEPS]);
    await nextFrame();
  }
  await nextFrame();
  releaseButton();
}

async function checkCreating() {
  const [first, second] = apps();
  await dragOnto(() => first, () => second);
  const folderOf = id => Object.keys(layout().folders).find(folder => layout().folders[folder].apps.includes(id));
  await eventually(() => folderOf(idOf(first)) && layout().folders[folderOf(idOf(first))].apps.includes(idOf(second)),
    'dragging onto an app creates a saved folder');
  const folder = folderOf(idOf(first));
  const folderButton = () => items().find(button => button.name === `${ITEM}${folder}`);

  await settled();
  const extra = idOf(apps()[0]);
  await dragOnto(() => apps()[0], folderButton);
  await eventually(() => layout().folders[folder].apps.length === 3, 'dragging into a folder adds an app');
  await dragOnto(folderButton, () => apps()[0], 0.95);
  await eventually(() => layout().items.indexOf(folder) > 0, 'folders can be reordered');
  await capture('start-folders');
  return {folder, folderButton, extra};
}

async function checkInside({folder, folderButton, extra}) {
  await settled();
  click(folderButton());
  const name = await waitUntil(() => shown(named('kestrel-folder-name')) && named('kestrel-folder-name'), 'the folder opens');
  click(name);
  name.set_text('Everyday');
  name.clutter_text.emit('activate');
  await eventually(() => layout().folders[folder].name === 'Everyday', 'folder names persist');

  await dragOnto(() => items()[2], () => items()[0], 0.05);
  await eventually(() => layout().folders[folder].apps[0] === extra, 'apps can be reordered inside folders');
  await capture('start-folder');
  await dragOnto(() => items()[0], () => named('kestrel-folder-back'));
  await eventually(() => !layout().folders[folder].apps.includes(extra) && layout().items.includes(extra), 'dragging to Apps moves an app out of its folder');
}

async function checkPinning() {
  const back = named('kestrel-folder-back');
  if (back?.mapped) {
    click(back);
    await waitUntil(() => !back.mapped, 'the folder closes');
  }
  await settled();
  const unpinned = idOf(apps()[0]);
  await dragOnto(() => apps()[0], () => panelApps()[0], 0.1);
  await eventually(() => settings.get_strv('favorite-apps')[0] === unpinned, 'dragging an app from Start pins it at the drop position');
  dismissImmediately();
  await dragOnto(() => panelApps()[0], () => panelApps()[2], 0.9);
  await eventually(() => settings.get_strv('favorite-apps').indexOf(unpinned) === 2, 'panel apps can be reordered by dragging');
}

export async function run() {
  const original = settings.get_string('start-layout');
  const favorites = settings.get_strv('favorite-apps');
  try {
    toggleSurface('start');
    await waitUntil(() => shown(named('kestrel-start')), 'Start opens');
    await checkInside(await checkCreating());
    await checkPinning();
  } finally {
    dismissImmediately();
    settings.set_string('start-layout', original);
    settings.set_strv('favorite-apps', favorites);
  }
}
