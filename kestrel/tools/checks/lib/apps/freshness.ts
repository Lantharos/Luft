import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {repository} from '../processes.js';

const exists = (path: string) => GLib.file_test(path, GLib.FileTest.EXISTS);
const checked = new Set<string>();

function newest(path: string): number {
  const file = Gio.File.new_for_path(path);
  const info = file.query_info('standard::type,time::modified', Gio.FileQueryInfoFlags.NONE, null);
  if (info.get_file_type() !== Gio.FileType.DIRECTORY) return info.get_modification_date_time()!.to_unix();
  return Math.max(0, ...[...file.enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null)]
    .map(child => newest(GLib.build_filenamev([path, child.get_name()]))));
}

export function requireFresh(name: string): void {
  if (checked.has(name)) return;
  const app = (...parts: string[]) => repository('apps', name, ...parts);
  const builds = [
    {build: repository('target/release', name), sources: [app('desktop/src'), app('desktop/Cargo.toml'), repository('Cargo.lock')], rebuild: `cargo build --release -p ${name}`},
    {build: app('dist'), sources: [app('src'), app('index.html'), app('public'), app('locales')], rebuild: `bun run build in apps/${name}`},
  ];
  const stale = builds.filter(({build, sources}) => exists(build) && newest(build) < Math.max(...sources.filter(exists).map(newest)));
  if (stale.length) throw new Error(`${name}'s build is older than its sources, run ${stale.map(({rebuild}) => rebuild).join(' and ')}`);
  checked.add(name);
}
