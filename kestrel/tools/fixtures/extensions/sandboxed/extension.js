import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

globalThis.sandboxedLoads = (globalThis.sandboxedLoads ?? 0) + 1;

function children(path) {
  try {
    const enumerator = Gio.File.new_for_path(path).enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null);
    const names = [];
    for (let info = enumerator.next_file(null); info; info = enumerator.next_file(null)) names.push(info.get_name());
    return names;
  } catch {
    return [];
  }
}

function homeContents(sandboxed) {
  const home = GLib.get_home_dir();
  const own = [sandboxed.path, sandboxed.dataPath].filter(path => path.startsWith(`${home}/`)).map(path => path.slice(home.length + 1).split('/')[0]);
  return children(home).filter(name => !own.includes(name));
}

export default async function enable(sandboxed) {
  sandboxed.taskbar.addItem({
    icon: 'face-smile-symbolic',
    label: sandboxed.t('item'),
    onClick: () => sandboxed.notifications.send({ title: sandboxed.t('hello') }),
  });
  sandboxed.quickSettings.addToggle({ title: sandboxed.t('item'), icon: 'face-smile-symbolic', setting: 'on', menu: [{ setting: 'on' }, 'settings'] });
  sandboxed.search.addProvider({ title: sandboxed.t('item'), search: query => [{ title: `Sandboxed found ${query}`, activate() {} }] });
  sandboxed.settingsPage.describe(() => [{ title: 'Probed', items: [{ setting: 'on' }] }]);
  sandboxed.storage.set('kept', 'kept');
  await sandboxed.writeText('note.txt', 'written');
  const helper = sandboxed.helper.start();
  const echoed = () => new Promise(resolve => {
    const listening = helper.onLine(line => {
      listening.dispose();
      resolve(line);
    });
    void helper.write('hi');
  });
  sandboxed.peers.handle('report', async () => ({
    helper: await echoed(),
    pid: Number(new TextDecoder().decode(GLib.file_get_contents('/proc/self/stat')[1]).split(' ')[0]),
    on: sandboxed.settings.get('on'),
    kept: sandboxed.storage.get('kept'),
    active: sandboxed.session.active,
    dark: sandboxed.appearance.dark,
    text: sandboxed.readText(GLib.build_filenamev([sandboxed.dataPath, 'note.txt'])),
    home: homeContents(sandboxed),
  }));
}
