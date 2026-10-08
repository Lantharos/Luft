import Clutter from 'gi://Clutter';
import GdkPixbuf from 'gi://GdkPixbuf';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import {toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';

import {named, shown} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {press} from '../lib/input.js';
import {gjs, waitForWindow} from '../lib/processes.js';
import {capture, screenshot} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';

const {require, eventually} = checks('clipboard image');
const IMAGE_LIMIT = 8;
const OVERSIZED_SIDE = 2400;
const THUMBNAIL_HEIGHT = 128;

const clipboard = St.Clipboard.get_default();
const panel = () => named('kestrel-clipboard');
const rows = () => panel().get_first_child().child.get_children();
const isImage = row => row.has_style_class_name('kestrel-clipboard-image');
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

function storedImages() {
  const directory = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_runtime_dir(), 'kestrel', GLib.getenv('WAYLAND_DISPLAY'), 'clipboard']));
  if (!directory.query_exists(null)) return [];
  return [...directory.enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null)].map(info => info.get_name());
}

async function copyImage(bytes) {
  const before = storedImages();
  clipboard.set_content(St.ClipboardType.CLIPBOARD, 'image/png', bytes);
  await eventually(() => storedImages().some(name => !before.includes(name)), 'a copied image is kept');
}

async function openHistory() {
  toggleSurface('clipboard');
  await eventually(() => shown(panel()), 'clipboard history opens');
  await settled();
}

async function closeHistory() {
  press(Clutter.KEY_Escape);
  await eventually(() => !panel().visible, 'Escape closes clipboard history');
}

async function checkScreenshot() {
  clipboard.set_text(St.ClipboardType.CLIPBOARD, 'Copied before the screenshot');
  const shot = await screenshot();
  await copyImage(shot);
  await openHistory();
  const [first] = rows();
  const thumbnail = first.child;
  const {width, height} = global.stage;
  require(isImage(first) && thumbnail.content instanceof Clutter.TextureContent && thumbnail.height === THUMBNAIL_HEIGHT &&
    Math.abs(thumbnail.width - THUMBNAIL_HEIGHT * width / height) <= 1, 'a copied screenshot appears first with a thumbnail in its proportions');
  require(rows().length > 1 && rows().slice(1).every(row => !isImage(row)), 'copied text stays listed below the screenshot');
  await capture('clipboard-images');
  await closeHistory();
  return {shot, content: thumbnail.content};
}

async function checkPaste({shot, content}) {
  gjs('clients/window.js', ['--paste']);
  const window = await waitForWindow('Kestrel window check');
  await eventually(() => window.has_focus(), 'the app takes the keyboard');
  clipboard.set_text(St.ClipboardType.CLIPBOARD, 'Copied after the screenshot');
  await openHistory();
  await eventually(() => rows().length > 2 && !isImage(rows()[0]) && rows()[1].child.content === content, 'text copied later goes above the screenshot');
  toggleSurface('clipboard');
  await eventually(() => !panel().visible, 'clipboard history closes');
  await openHistory();
  press(Clutter.KEY_Down);
  await eventually(() => global.stage.get_key_focus() === rows()[1], 'the arrow keys move to the screenshot');
  const listed = rows().length;
  clipboard.set_text(St.ClipboardType.CLIPBOARD, 'Copied while history is open');
  await eventually(() => rows().length === listed + 1 && global.stage.get_key_focus()?.child?.content === content,
    'the focused screenshot keeps the keyboard while history changes');
  press(Clutter.KEY_Return);
  await eventually(() => !panel().visible && window.title === `Kestrel paste: image/png ${checksum(shot)}`,
    'Enter pastes the screenshot into the app with its original bytes and type');
  await openHistory();
  require(rows()[0].child.content === content, 'a pasted screenshot moves to the top');
  const texts = rows().filter(row => !isImage(row)).length;
  await closeHistory();
  return texts;
}

async function checkLimits(content, texts) {
  clipboard.set_content(St.ClipboardType.CLIPBOARD, 'image/png', oversized());
  await copyImage(swatch(0));
  await openHistory();
  require(rows().length === texts + 2 && isImage(rows()[0]) && rows()[1].child.content === content,
    'an image too large to keep is left out while a later one is kept');
  await closeHistory();

  for (let index = 1; index < IMAGE_LIMIT; index++) await copyImage(swatch(index));
  await openHistory();
  const images = rows().filter(isImage);
  require(images.length === IMAGE_LIMIT && !images.some(row => row.child.content === content) && rows().length === texts + IMAGE_LIMIT,
    'the oldest image leaves history once more images are copied');
  require(storedImages().length === IMAGE_LIMIT, 'images that leave history are no longer stored');
  panel().get_last_child().get_first_child().emit('clicked', 1);
  await eventually(() => !panel().visible && storedImages().length === 0, 'Clear all deletes the stored images');
}

export async function run() {
  const screenshotted = await checkScreenshot();
  const texts = await checkPaste(screenshotted);
  await checkLimits(screenshotted.content, texts);
}
