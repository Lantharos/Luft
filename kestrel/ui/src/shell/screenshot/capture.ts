import Cogl from 'gi://Cogl';
import type GdkPixbuf from 'gi://GdkPixbuf';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as KestrelUi from '../../kestrelUi.js';
import * as Main from '../main.js';
import * as MessageTray from '../notifications/messageTray.js';
import { addShowInFilesAction, openFile, screenshotNotificationSource } from './notifications.js';

Gio._promisify(Shell.Screenshot, 'composite_to_stream');

interface Compositor {
  composite_to_stream(
    texture: Cogl.Texture, x: number, y: number, width: number, height: number, scale: number,
    cursor: Cogl.Texture | null, cursorX: number, cursorY: number, cursorScale: number,
    stream: Gio.OutputStream): Promise<GdkPixbuf.Pixbuf>;
}

export interface CursorCapture {
  texture: Cogl.Texture | null;
  x: number;
  y: number;
  scale: number;
}

const NO_CURSOR: CursorCapture = { texture: null, x: 0, y: 0, scale: 1 };

function saveRecentFile(file: Gio.File): void {
  const recentFile = GLib.build_filenamev([GLib.get_user_data_dir(), 'recently-used.xbel']);
  const uri = file.get_uri();
  const bookmarks = new GLib.BookmarkFile();
  try {
    bookmarks.load_from_file(recentFile);
  } catch (e) {
    if (!(e as GLib.Error).matches(GLib.FileError, GLib.FileError.NOENT)) {
      log(`Could not open recent file ${uri}: ${(e as GLib.Error).message}`);
      return;
    }
  }

  try {
    bookmarks.add_application(uri, GLib.get_prgname(), 'gio open %u');
    bookmarks.to_file(recentFile);
  } catch (e) {
    log(`Could not save recent file ${uri}: ${(e as GLib.Error).message}`);
  }
}

function makeScreenshotsFolder(): Gio.File {
  const dir = Gio.File.new_for_path(GLib.build_filenamev([
    GLib.get_user_special_dir(GLib.UserDirectory.DIRECTORY_PICTURES) || GLib.get_home_dir(),
    KestrelUi.t('screenshot-screenshots-folder'),
  ]));

  try {
    dir.make_directory_with_parents(null);
  } catch (e) {
    if (!(e as GLib.Error).matches(Gio.IOErrorEnum, Gio.IOErrorEnum.EXISTS)) throw e;
  }
  return dir;
}

function writeScreenshot(bytes: GLib.Bytes, time: GLib.DateTime): Gio.File {
  const dir = makeScreenshotsFolder();
  const name = KestrelUi.t('screenshot-file', { timestamp: time.format('%Y-%m-%d %H-%M-%S')! });

  for (let index = 0; ; index++) {
    const suffix = index === 0 ? '' : `-${index}`;
    const file = Gio.File.new_for_path(GLib.build_filenamev([dir.get_path()!, `${name}${suffix}.png`]));
    try {
      file.create(Gio.FileCreateFlags.NONE, null).write_bytes(bytes, null);
      return file;
    } catch (e) {
      if (!(e as GLib.Error).matches(Gio.IOErrorEnum, Gio.IOErrorEnum.EXISTS)) throw e;
    }
  }
}

function thumbnail(pixbuf: GdkPixbuf.Pixbuf): St.ImageContent {
  const coglContext = global.stage.context.get_backend().get_cogl_context();
  const content = St.ImageContent.new_with_preferred_size(pixbuf.width, pixbuf.height) as St.ImageContent;
  content.set_bytes(coglContext, pixbuf.read_pixel_bytes(), Cogl.PixelFormat.RGBA_8888,
    pixbuf.width, pixbuf.height, pixbuf.rowstride);
  return content;
}

function storeScreenshot(bytes: GLib.Bytes, pixbuf: GdkPixbuf.Pixbuf): Gio.File | null {
  St.Clipboard.get_default().set_content(St.ClipboardType.CLIPBOARD, 'image/png', bytes);

  const time = GLib.DateTime.new_now_local();
  const lockdown = new Gio.Settings({ schema_id: 'org.gnome.desktop.lockdown' });
  const file = lockdown.get_boolean('disable-save-to-disk') ? null : writeScreenshot(bytes, time);
  if (file) saveRecentFile(file);

  const source = screenshotNotificationSource();
  const notification = new MessageTray.Notification({
    source,
    title: KestrelUi.t('screenshot-captured'),
    body: KestrelUi.t('screenshot-captured-body'),
    datetime: time,
    gicon: thumbnail(pixbuf),
    isTransient: true,
  });

  if (file) {
    addShowInFilesAction(notification, file);
    notification.connect('activated', () => {
      openFile(file);
      Main.closeShellPopups();
    });
  }

  source.addNotification(notification);
  return file;
}

export async function captureScreenshot(
  texture: Cogl.Texture,
  geometry: [number, number, number, number] | null,
  scale: number,
  cursor: CursorCapture | null,
): Promise<Gio.File | null> {
  const stream = Gio.MemoryOutputStream.new_resizable();
  const [x, y, w, h] = geometry ?? [0, 0, -1, -1];
  const { texture: cursorTexture, x: cursorX, y: cursorY, scale: cursorScale } = cursor ?? NO_CURSOR;

  const pixbuf = await (Shell.Screenshot as unknown as Compositor).composite_to_stream(
    texture, x, y, w, h, scale, cursorTexture, cursorX, cursorY, cursorScale, stream);

  stream.close(null);
  const file = storeScreenshot(stream.steal_as_bytes(), pixbuf);
  KestrelUi.playSound('screenshot');
  return file;
}
