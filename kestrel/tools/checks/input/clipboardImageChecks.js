import Clutter from 'gi://Clutter';
import GdkPixbuf from 'gi://GdkPixbuf';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import St from 'gi://St';
import {toggleSurface} from 'resource:///org/gnome/shell/ui/kestrelUi.js';

const IMAGE_LIMIT = 8;
const OVERSIZED_SIDE = 2400;
const THUMBNAIL_HEIGHT = 128;

const checksum = bytes => GLib.compute_checksum_for_bytes(GLib.ChecksumType.SHA1, bytes);

function png(pixbuf, options = [[], []]) {
  const [, data] = pixbuf.save_to_bufferv('png', ...options);
  return new GLib.Bytes(data);
}

function swatch(index) {
  const pixbuf = GdkPixbuf.Pixbuf.new(GdkPixbuf.Colorspace.RGB, false, 8, 320, 180);
  pixbuf.fill(((60 + index * 20) << 24 | (180 - index * 15) << 16 | (90 + index * 12) << 8 | 0xff) >>> 0);
  return png(pixbuf);
}

function oversized() {
  const pixels = new Uint8Array(OVERSIZED_SIDE * OVERSIZED_SIDE * 3);
  let seed = 7;
  for (let index = 0; index < pixels.length; index++) pixels[index] = (seed = seed * 1103515245 + 12345 >>> 0) >>> 24;
  const pixbuf = GdkPixbuf.Pixbuf.new_from_bytes(new GLib.Bytes(pixels), GdkPixbuf.Colorspace.RGB, false, 8,
    OVERSIZED_SIDE, OVERSIZED_SIDE, OVERSIZED_SIDE * 3);
  return png(pixbuf, [['compression'], ['0']]);
}

async function screenshot() {
  const stream = Gio.MemoryOutputStream.new_resizable();
  const shooter = new Shell.Screenshot();
  await new Promise((resolve, reject) => shooter.screenshot(false, stream, (source, result) => {
    try {
      source.screenshot_finish(result);
      resolve();
    } catch (error) {
      reject(error);
    }
  }));
  stream.close(null);
  return stream.steal_as_bytes();
}

function storedImages() {
  const directory = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_runtime_dir(), 'kestrel', GLib.getenv('WAYLAND_DISPLAY'), 'clipboard']));
  if (!directory.query_exists(null)) return [];
  return [...directory.enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null)].map(info => info.get_name());
}

export async function checkClipboardImages({pause, capture, actorNamed, keyboard, output}) {
  const require = (condition, label) => {
    if (!condition) throw new Error(`Kestrel clipboard image check failed: ${label}`);
    console.log(`Kestrel clipboard image check: ${label}`);
  };
  const key = symbol => {
    keyboard.notify_keyval(GLib.get_monotonic_time(), symbol, Clutter.KeyState.PRESSED);
    keyboard.notify_keyval(GLib.get_monotonic_time(), symbol, Clutter.KeyState.RELEASED);
  };
  const clipboard = St.Clipboard.get_default();
  const panel = actorNamed(global.stage, 'kestrel-clipboard');
  const rows = () => panel.get_first_child().child.get_children();
  const isImage = row => row.has_style_class_name('kestrel-clipboard-image');
  const copyImage = async bytes => {
    const before = storedImages();
    clipboard.set_content(St.ClipboardType.CLIPBOARD, 'image/png', bytes);
    for (let waited = 0; waited < 5000 && storedImages().every(name => before.includes(name)); waited += 100) await pause(100);
  };
  const openHistory = async () => {
    toggleSurface('clipboard');
    await pause(400);
  };
  const closeHistory = async () => {
    key(Clutter.KEY_Escape);
    await pause(300);
  };

  const shot = await screenshot();
  await copyImage(shot);
  await openHistory();
  const [first] = rows();
  const thumbnail = first.child;
  const shotContent = thumbnail.content;
  const {width, height} = global.stage;
  require(isImage(first) && shotContent instanceof Clutter.TextureContent && thumbnail.height === THUMBNAIL_HEIGHT &&
    Math.abs(thumbnail.width - THUMBNAIL_HEIGHT * width / height) <= 1, 'a copied screenshot appears first with a thumbnail in its proportions');
  const texts = rows().length - 1;
  require(texts > 0 && rows().slice(1).every(row => !isImage(row)), 'copied text stays listed below the screenshot');
  await capture(`${output}/clipboard-images.png`);
  await closeHistory();

  const app = Gio.Subprocess.new(['gjs', '-m', GLib.getenv('KESTREL_WINDOW_SCRIPT'), '--paste'], Gio.SubprocessFlags.NONE);
  try {
    await pause(1200);
    const window = global.display.focus_window;
    clipboard.set_text(St.ClipboardType.CLIPBOARD, 'Copied after the screenshot');
    await pause(150);
    await openHistory();
    key(Clutter.KEY_Down);
    await pause(150);
    require(global.stage.get_key_focus() === rows()[1] && isImage(rows()[1]), 'the arrow keys move to the screenshot');
    key(Clutter.KEY_Return);
    await pause(900);
    require(!panel.visible && window.title === `Kestrel paste: image/png ${checksum(shot)}`,
      'Enter pastes the screenshot into the app with its original bytes and type');
    await openHistory();
    require(rows()[0].child.content === shotContent, 'a pasted screenshot moves to the top');
    await closeHistory();
  } finally {
    app.force_exit();
  }
  await pause(300);

  clipboard.set_content(St.ClipboardType.CLIPBOARD, 'image/png', oversized());
  await pause(1500);
  await copyImage(swatch(0));
  await openHistory();
  require(rows().length === texts + 3 && isImage(rows()[0]) && rows()[1].child.content === shotContent,
    'an image too large to keep is left out while a later one is kept');
  await closeHistory();

  for (let index = 1; index < IMAGE_LIMIT; index++) await copyImage(swatch(index));
  await openHistory();
  const images = rows().filter(isImage);
  require(images.length === IMAGE_LIMIT && !images.some(row => row.child.content === shotContent) && rows().length === texts + 1 + IMAGE_LIMIT,
    'the oldest image leaves history once more images are copied');
  require(storedImages().length === IMAGE_LIMIT, 'images that leave history are no longer stored');
  panel.get_last_child().get_first_child().emit('clicked', 1);
  await pause(300);
  require(!panel.visible && storedImages().length === 0, 'Clear all deletes the stored images');
}
