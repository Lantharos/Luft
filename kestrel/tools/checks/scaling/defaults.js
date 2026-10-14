import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {checks} from '../lib/check.js';

const {require} = checks('scaling');
const PANELS = GLib.build_filenamev([GLib.path_get_dirname(GLib.filename_from_uri(import.meta.url)[0]), '..', '..', 'fixtures', 'scaling', 'panels.tsv']);
const TOLERANCE = 0.001;

function panels() {
  const [, contents] = Gio.File.new_for_path(PANELS).load_contents(null);
  return new TextDecoder().decode(contents).trim().split('\n').map(line => {
    const [spec, scale, description] = line.split('\t');
    return {spec, scale: Number(scale), description};
  });
}

function scaleOf(manager, serial) {
  const monitor = manager.get_monitors().find(candidate => candidate.get_serial() === serial);
  const index = manager.get_monitor_for_connector(monitor.get_connector());
  return global.display.get_monitor_scale(index);
}

export function checkDefaultScales() {
  const manager = global.backend.get_monitor_manager();
  panels().forEach(({scale, description}, index) => {
    const chosen = scaleOf(manager, `0x${index.toString(16).padStart(2, '0')}`);
    require(Math.abs(chosen - scale) < TOLERANCE, `${description} starts at ${Math.round(scale * 100)}% (got ${Math.round(chosen * 100)}%)`);
  });
}
