import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import GLib from 'gi://GLib';
import St from 'gi://St';
import {dismissImmediately, toggleSurface} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {named, ofType, shown, textOf} from '../../lib/actors.js';
import {scratch} from '../../lib/processes.js';
import {settled, waitUntil} from '../../lib/wait.js';

export const start = () => named('kestrel-start') ?? named('kestrel-palette');
export const entry = () => ofType(start()!.get_first_child(), St.Entry);
const list = () => named('kestrel-search-results', start()!)!;

export const rows = () => list().get_children().filter((actor): actor is St.Button => actor instanceof St.Button)
  .filter(actor => actor.visible && actor.name?.startsWith('kestrel-search-'));
export const row = (key: string) => rows().find(actor => actor.name === `kestrel-search-${key}`) ?? null;
const texts = (actor: St.Button) => actor.child!.get_last_child()!.get_last_child()!;
export const titleOf = (actor: St.Button) => ofType(texts(actor).get_first_child(), St.Label).text;
export const descriptionOf = (actor: St.Button) => ofType(texts(actor).get_last_child(), St.Label).text;
export const bestTitle = () => rows()[0] && titleOf(rows()[0]);
export const groupTitles = () => list().get_children().filter((actor): actor is St.Widget => actor instanceof St.Widget)
  .filter(actor => actor.visible && actor.has_style_class_name('kestrel-search-group')).map(textOf);

export async function openStart() {
  await settled();
  if (!shown(start())) toggleSurface('start');
  await waitUntil(() => shown(start()), 'Start opens');
  await settled();
  entry().grab_key_focus();
  await waitUntil(() => entry().clutter_text.has_key_focus(), 'the search field takes the keyboard');
}

export function closeStart() {
  dismissImmediately();
}

export function search(text: string) {
  entry().set_text(text);
}

const read = (path: string) => GLib.file_test(path, GLib.FileTest.EXISTS)
  ? new TextDecoder().decode(GLib.file_get_contents(path)[1]).trim().split('\n').filter(Boolean)
  : [];

export async function withHandler<T>(type: string, name: string, run: (recorded: () => string[]) => Promise<T>) {
  const record = scratch(`kestrel-search-${name.toLowerCase().replaceAll(' ', '-')}.txt`);
  const applications = GLib.build_filenamev([GLib.get_user_data_dir(), 'applications']);
  GLib.mkdir_with_parents(applications, 0o755);
  const desktop = GLib.build_filenamev([applications, `com.lantharos.SearchCheck${name.replaceAll(' ', '')}.desktop`]);
  GLib.file_set_contents(desktop, `[Desktop Entry]\nType=Application\nName=${name}\nExec=sh -c 'printf "%%s\\n" "$1" >> ${record}' check %u\nMimeType=${type};\nNoDisplay=true\n`);
  const previous = Gio.AppInfo.get_default_for_type(type, false);
  try {
    GioUnix.DesktopAppInfo.new_from_filename(desktop).set_as_default_for_type(type);
    return await run(() => read(record));
  } finally {
    if (previous) previous.set_as_default_for_type(type);
    else Gio.AppInfo.reset_type_associations(type);
    GLib.unlink(desktop);
    GLib.unlink(record);
  }
}
