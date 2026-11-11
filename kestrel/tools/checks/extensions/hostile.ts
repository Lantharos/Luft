import GLib from 'gi://GLib';

import {checks} from '../lib/check.js';
import {install, listed, request} from './lib/extensions.js';

const {require, eventually} = checks('extensions');
const HOSTILE = 'com.example.Hostile';

interface Hostile {
  dataPath: string;
  path: string;
  readText(path: string): string | null;
  writeText(path: string, text: string): Promise<void>;
  deleteFile(path: string): void;
  open(uri: string): void;
  clipboard: {setImage(path: string): Promise<void>; setFiles(paths: string[]): void};
  sounds: {play(path: string): unknown};
  taskbar: {addItem(item: {icon: string; label: string}): unknown};
  popups: {open(options: {anchor: string; title: string; content: unknown}): {close(): void}};
  wallpaper: {addSprites(): {loadSheet(options: {path: string; cell: number}): unknown}};
}

const hostile = () => (globalThis as {hostile?: Hostile}).hostile ?? null;

function plant(folder: string) {
  const outside = GLib.build_filenamev([GLib.get_user_data_dir(), 'outside']);
  GLib.mkdir_with_parents(outside, 0o700);
  for (const name of ['secret.txt', 'secret.png', 'secret.wav', 'secret.svg']) GLib.file_set_contents(GLib.build_filenamev([outside, name]), 'not yours');
  const links: Record<string, string> = {
    'link.txt': 'secret.txt', 'link.png': 'secret.png', 'link.wav': 'secret.wav', 'link.svg': 'secret.svg', 'folder': '',
  };
  for (const [name, target] of Object.entries(links))
    GLib.spawn_command_line_sync(`ln -sfn ${GLib.shell_quote(GLib.build_filenamev([outside, target]))} ${GLib.shell_quote(GLib.build_filenamev([folder, name]))}`);
  GLib.file_set_contents(GLib.build_filenamev([folder, 'launcher.desktop']), '[Desktop Entry]\nType=Application\nName=Launcher\nExec=true\n');
  return outside;
}

const REFUSALS = /outside the extension's folders|is a program or launcher|isn't a web link/;

async function refused(what: string, call: () => unknown) {
  let reason = '';
  try {
    await call();
  } catch (error) {
    reason = (error as Error).message;
  }
  require(REFUSALS.test(reason), `${what} is refused (${reason || 'it went through'})`);
}

export async function run() {
  install('hostile', HOSTILE);
  try {
    await request('Reload', HOSTILE);
    const api = await eventually(() => hostile(), 'the extension that hands out bad paths runs');
    const data = api.dataPath;
    const outside = plant(data);
    const inData = (name: string) => GLib.build_filenamev([data, name]);
    require(api.readText(inData('own.txt')) === null, 'reading a missing file of its own still answers null');
    await api.writeText('own.txt', 'mine');
    require(api.readText(inData('own.txt')) === 'mine', 'and it reads and writes its own files');
    await refused('reading a file through a link out of its folders', () => api.readText(inData('link.txt')));
    await refused('writing through a linked folder', () => api.writeText('folder/written.txt', 'escaped'));
    require(!GLib.file_test(GLib.build_filenamev([outside, 'written.txt']), GLib.FileTest.EXISTS), 'nothing landed outside');
    await refused('deleting through a link', () => api.deleteFile('folder'));
    await refused('playing a linked sound', () => api.sounds.play(inData('link.wav')));
    await refused('copying a linked picture', () => api.clipboard.setImage(inData('link.png')));
    await refused('copying a linked file', () => api.clipboard.setFiles([inData('link.txt')]));
    await refused('copying a file people never chose', () => api.clipboard.setFiles([GLib.build_filenamev([outside, 'secret.txt'])]));
    await refused('a linked icon', () => api.taskbar.addItem({icon: inData('link.svg'), label: 'Hostile'}));
    await refused('a linked picture in a popup', () => api.popups.open({anchor: 'top-right', title: 'Hostile', content: {type: 'image', path: inData('link.png'), width: 16, height: 16}}));
    await refused('a linked sprite sheet', () => api.wallpaper.addSprites().loadSheet({path: inData('link.png'), cell: 16}));
    await refused('opening a linked file', () => api.open(`file://${inData('link.txt')}`));
    await refused('opening a launcher of its own', () => api.open(`file://${inData('launcher.desktop')}`));
    await refused('opening a program', () => api.open('file:///usr/bin/true'));
    await refused('opening a plain web link', () => api.open('http://example.com'));
    await refused('opening another kind of link', () => api.open('ssh://example.com'));
    require((await listed(HOSTILE))?.state === 'running', 'refusing them leaves the extension running');
  } finally {
    await request('Remove', HOSTILE);
  }
}
