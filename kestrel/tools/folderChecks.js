import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {toggleSurface, dismissImmediately} from 'resource:///org/gnome/shell/ui/kestrelUi.js';

export async function checkFolders({pause, capture, actorNamed, pointer, output}) {
  const settings = new Gio.Settings({schema_id: 'org.gnome.shell'});
  const original = settings.get_string('kestrel-start-layout');
  const layout = () => JSON.parse(settings.get_string('kestrel-start-layout'));
  const favorites = settings;
  const savedFavorites = favorites.get_strv('favorite-apps');
  const require = (condition, label) => {
    if (!condition) throw new Error(`Start folder check failed: ${label}`);
    console.log(`Kestrel folder check: ${label}`);
  };
  const descendants = actor => [actor, ...actor.get_children().flatMap(descendants)];
  const items = () => descendants(actorNamed(global.stage, 'kestrel-start')).filter(actor => actor.name?.startsWith('kestrel-start-item-'));
  const click = async actor => {
    const [x, y] = actor.get_transformed_position();
    pointer.notify_absolute_motion(GLib.get_monotonic_time(), x + actor.width / 2, y + actor.height / 2);
    pointer.notify_button(GLib.get_monotonic_time(), 1, Clutter.ButtonState.PRESSED);
    pointer.notify_button(GLib.get_monotonic_time(), 1, Clutter.ButtonState.RELEASED);
    await pause(250);
  };
  const drag = async (source, target, fraction = 0.5) => {
    const [x, y] = source.get_transformed_position();
    const [tx, ty] = target.get_transformed_position();
    const startX = x + source.width / 2;
    const startY = y + 24;
    pointer.notify_absolute_motion(GLib.get_monotonic_time(), startX, startY);
    pointer.notify_button(GLib.get_monotonic_time(), 1, Clutter.ButtonState.PRESSED);
    await pause(80);
    for (let step = 1; step <= 12; step++) {
      pointer.notify_absolute_motion(GLib.get_monotonic_time(), startX + (tx + target.width * fraction - startX) * step / 12, startY + (ty + Math.min(24, target.height / 2) - startY) * step / 12);
      await pause(25);
    }
    await pause(120);
    pointer.notify_button(GLib.get_monotonic_time(), 1, Clutter.ButtonState.RELEASED);
    await pause(350);
  };
  try {
    dismissImmediately();
    toggleSurface('start');
    await pause(400);
    let buttons = items().filter(button => !button.name.includes('folder:'));
    const first = buttons[0].name.replace('kestrel-start-item-', '');
    const second = buttons[1].name.replace('kestrel-start-item-', '');
    await drag(buttons[0], buttons[1]);
    const folderId = Object.keys(layout().folders).find(id => layout().folders[id].apps.includes(first));
    require(!!folderId && layout().folders[folderId].apps.includes(second), 'dragging onto an app creates a saved folder');
    buttons = items();
    const folderButton = buttons.find(button => button.name === `kestrel-start-item-${folderId}`);
    const extra = buttons.find(button => !button.name.includes('folder:'));
    const extraId = extra.name.replace('kestrel-start-item-', '');
    await drag(extra, folderButton);
    require(layout().folders[folderId].apps.length === 3, 'dragging into a folder adds an app');
    buttons = items();
    await drag(buttons.find(button => button.name.endsWith(folderId)), buttons.find(button => !button.name.includes('folder:')), 0.95);
    require(layout().items.indexOf(folderId) > 0, 'folders can be reordered');
    await capture(`${output}/start-folders.png`);
    await click(items().find(button => button.name.endsWith(folderId)));
    const name = actorNamed(global.stage, 'kestrel-folder-name');
    await click(name);
    name.set_text('Everyday');
    name.clutter_text.emit('activate');
    require(layout().folders[folderId].name === 'Everyday', 'folder names persist');
    buttons = items();
    await drag(buttons[2], buttons[0], 0.05);
    require(layout().folders[folderId].apps[0] === extraId, 'apps can be reordered inside folders');
    await capture(`${output}/start-folder.png`);
    await drag(items()[0], actorNamed(global.stage, 'kestrel-folder-back'));
    require(!layout().folders[folderId].apps.includes(extraId) && layout().items.includes(extraId), 'dragging to Apps moves an app out of its folder');

    const panelApps = () => actorNamed(global.stage, 'kestrel-panel-center').get_last_child().get_children().map(slot => slot.get_first_child());
    const back = actorNamed(global.stage, 'kestrel-folder-back');
    if (back?.mapped) await click(back);
    const unpinned = items().find(button => !button.name.includes('folder:'));
    const unpinnedId = unpinned.name.replace('kestrel-start-item-', '');
    await drag(unpinned, panelApps()[0], 0.1);
    require(favorites.get_strv('favorite-apps')[0] === unpinnedId, 'dragging an app from Start pins it at the drop position');
    dismissImmediately();
    await pause(300);
    await drag(panelApps()[0], panelApps()[2], 0.9);
    require(favorites.get_strv('favorite-apps').indexOf(unpinnedId) === 2, 'panel apps can be reordered by dragging');
  } finally {
    dismissImmediately();
    settings.set_string('kestrel-start-layout', original);
    favorites.set_strv('favorite-apps', savedFavorites);
  }
}
