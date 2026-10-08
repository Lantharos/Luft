import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import { createThumbnail } from '../../surfaces/clipboard/thumbnail.js';
import { appNames } from '../core/apps.js';
import { openDialog } from '../core/dialog.js';
import { ENDED, SUCCESS, option, type Invocation, type Options } from '../core/request.js';

Gio._promisify(Gio.File.prototype, 'load_bytes_async');

const WALLPAPER_XML = `<node><interface name="org.freedesktop.impl.portal.Wallpaper">
  <method name="SetWallpaperURI">
    <arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="a{sv}" direction="in"/>
    <arg type="u" direction="out"/>
  </method>
</interface></node>`;

const PREVIEW_BOUNDS = { width: 392, height: 245, radius: 14 };

async function store(bytes: GLib.Bytes, name: string): Promise<string> {
  const extension = name.includes('.') ? name.slice(name.lastIndexOf('.')) : '';
  const checksum = GLib.compute_checksum_for_bytes(GLib.ChecksumType.SHA256, bytes)!.slice(0, 16);
  const directory = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_data_dir(), 'backgrounds']));
  GLib.mkdir_with_parents(directory.get_path()!, 0o755);
  const file = directory.get_child(`${checksum}${extension}`);
  await file.replace_contents_bytes_async(bytes, null, false, Gio.FileCreateFlags.NONE, null);
  return file.get_uri();
}

function apply(uri: string): void {
  const background = new Gio.Settings({ schema_id: 'org.gnome.desktop.background' });
  background.set_string('picture-uri', uri);
  background.set_string('picture-uri-dark', uri);
  background.set_string('picture-options', 'zoom');
}

async function confirm(handle: string, appId: string, bytes: GLib.Bytes): Promise<number> {
  const preview = await createThumbnail(bytes, PREVIEW_BOUNDS);
  if (!preview) return ENDED;
  const [response] = await openDialog(handle, {
    title: 'Set as your wallpaper?',
    description: `${appNames(appId).subject} wants to change your wallpaper. It's used in light and dark style and on the lock screen.`,
    icon: 'preferences-desktop-wallpaper-symbolic',
  }, dialog => {
    dialog.content.add_child(new St.Widget({ content: preview.content, width: preview.width, height: preview.height, x_align: Clutter.ActorAlign.CENTER }));
    dialog.buttons([
      { label: 'Cancel', action: dialog.cancel },
      { label: 'Set Wallpaper', action: () => dialog.finish(SUCCESS), default: true },
    ]);
  });
  return response;
}

export class WallpaperPortal {
  readonly dbus = Gio.DBusExportedObject.wrapJSObject(WALLPAPER_XML, this);

  async SetWallpaperURIAsync([handle, appId, , uri, options]: [string, string, string, string, Options], invocation: Invocation): Promise<void> {
    const reply = (response: number) => invocation.return_value(new GLib.Variant('(u)', [response]));
    try {
      const file = Gio.File.new_for_uri(uri);
      const [bytes] = await file.load_bytes_async(null);
      const response = option<boolean>(options, 'show-preview') ? await confirm(handle, appId, bytes) : SUCCESS;
      if (response === SUCCESS) apply(await store(bytes, file.get_basename() ?? ''));
      reply(response);
    } catch (error) {
      console.warn(`Couldn't set the wallpaper for ${appId}: ${error}`);
      reply(ENDED);
    }
  }
}
