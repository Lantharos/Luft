import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const XCURSOR_MAGIC = 0x72756358;
const XCURSOR_IMAGE = 0xfffd0002;
const CURSOR_NAMES = ['default', 'left_ptr'];

function xcursor(sizes: number[], pixel: number) {
  const headerLength = 16;
  const tocLength = 12 * sizes.length;
  const chunkLength = 36;
  const view = new DataView(new ArrayBuffer(headerLength + tocLength + sizes.reduce((total, size) => total + chunkLength + size * size * 4, 0)));
  let offset = 0;
  const write = (word: number) => {
    view.setUint32(offset, word, true);
    offset += 4;
  };
  [XCURSOR_MAGIC, headerLength, 0x10000, sizes.length].forEach(write);
  let position = headerLength + tocLength;
  for (const size of sizes) {
    [XCURSOR_IMAGE, size, position].forEach(write);
    position += chunkLength + size * size * 4;
  }
  for (const size of sizes) {
    [chunkLength, XCURSOR_IMAGE, size, 1, size, size, 0, 0, 0].forEach(write);
    for (let index = 0; index < size * size; index++) write(pixel);
  }
  return new Uint8Array(view.buffer);
}

export function installCursorTheme(name: string, sizes: number[], pixel = 0xff000000) {
  const root = GLib.build_filenamev([GLib.get_user_data_dir(), 'icons', name]);
  GLib.mkdir_with_parents(`${root}/cursors`, 0o755);
  GLib.file_set_contents(`${root}/index.theme`, `[Icon Theme]\nName=${name}\n`);
  const cursor = xcursor(sizes, pixel);
  for (const cursorName of CURSOR_NAMES) GLib.file_set_contents(`${root}/cursors/${cursorName}`, cursor);
  return () => {
    for (const path of [...CURSOR_NAMES.map(cursorName => `cursors/${cursorName}`), 'index.theme', 'cursors', '']) Gio.File.new_for_path(`${root}/${path}`).delete(null);
  };
}
