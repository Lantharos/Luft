import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { PortalRequest } from './request.js';

export const SCREENSHOT_XML = `<node><interface name="org.freedesktop.impl.portal.Screenshot">
  <method name="Screenshot">
    <arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="a{sv}" direction="in"/>
    <arg type="u" direction="out"/><arg type="a{sv}" direction="out"/>
  </method>
  <method name="PickColor">
    <arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="a{sv}" direction="in"/>
    <arg type="u" direction="out"/><arg type="a{sv}" direction="out"/>
  </method>
  <property name="version" type="u" access="read"/>
</interface></node>`;

const SUCCESS = 0;
const CANCELLED = 1;
const FAILED = 2;
const SHELL_SCREENSHOT = ['org.gnome.Shell.Screenshot', '/org/gnome/Shell/Screenshot', 'org.gnome.Shell.Screenshot'] as const;

type Options = Record<string, GLib.Variant>;
type Invocation = Gio.DBusMethodInvocation;

function callShell(method: string, parameters: GLib.Variant | null, replyType: string): Promise<GLib.Variant> {
  return Gio.DBus.session.call(...SHELL_SCREENSHOT, method, parameters, new GLib.VariantType(replyType), Gio.DBusCallFlags.NONE, -1, null);
}

function screenshotPath(): string {
  const directory = GLib.build_filenamev([GLib.get_user_cache_dir(), 'kestrel', 'screenshots']);
  GLib.mkdir_with_parents(directory, 0o700);
  return GLib.build_filenamev([directory, `Screenshot ${GLib.DateTime.new_now_local().format('%Y-%m-%d %H-%M-%S')}.png`]);
}

async function capture(interactive: boolean): Promise<string | null> {
  if (interactive) {
    const [success, uri] = (await callShell('InteractiveScreenshot', null, '(bs)')).deep_unpack() as [boolean, string];
    return success ? uri : null;
  }
  const [success, filename] = (await callShell('Screenshot', new GLib.Variant('(bbs)', [false, true, screenshotPath()]), '(bs)'))
    .deep_unpack() as [boolean, string];
  return success ? Gio.File.new_for_path(filename).get_uri() : null;
}

function respond(invocation: Invocation, response: number, results: Options = {}): void {
  invocation.return_value(new GLib.Variant('(ua{sv})', [response, results]));
}

export class ScreenshotPortal {
  readonly version = 2;

  ScreenshotAsync([handle, , , options]: [string, string, string, Options], invocation: Invocation): void {
    let cancelled = false;
    const request = new PortalRequest(handle, () => { cancelled = true; });
    capture(options.interactive?.get_boolean() ?? false)
      .then(uri => {
        if (cancelled || !uri) respond(invocation, CANCELLED);
        else respond(invocation, SUCCESS, { uri: new GLib.Variant('s', uri) });
      })
      .catch(error => {
        console.warn(`Screenshot for an app failed: ${error}`);
        respond(invocation, FAILED);
      })
      .finally(() => request.finish());
  }

  PickColorAsync([handle]: [string, string, string, Options], invocation: Invocation): void {
    const request = new PortalRequest(handle, () => {});
    callShell('PickColor', null, '(a{sv})')
      .then(reply => {
        const [result] = reply.deep_unpack() as [Options];
        respond(invocation, SUCCESS, { color: result.color });
      })
      .catch(() => respond(invocation, CANCELLED))
      .finally(() => request.finish());
  }
}
