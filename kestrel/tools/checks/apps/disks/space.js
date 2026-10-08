import GLib from 'gi://GLib';

import {children, write} from '../lib/files.js';

export function writeSpace() {
  const root = GLib.build_filenamev([GLib.get_home_dir(), 'Space']);
  const fill = (name, bytes) => write(GLib.build_filenamev([root, name]), new Uint8Array(bytes).fill(1));
  fill('Videos/trip.mov', 48 << 20);
  fill('Videos/raw/take-1.mov', 24 << 20);
  fill('Music/album/track.flac', 16 << 20);
  for (let index = 0; index < 40; index++) fill(`Notes/note-${index}.md`, 2048);
  return root;
}

export function trashed(prefix) {
  return children(GLib.build_filenamev([GLib.get_user_data_dir(), 'Trash', 'files'])).filter(info => info.get_name().startsWith(prefix)).length;
}
