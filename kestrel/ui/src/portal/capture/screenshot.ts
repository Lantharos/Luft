import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { CANCELLED, ENDED, PortalRequest, SUCCESS, option, respond, type Invocation, type Options, type Outcome } from '../core/request.js';

const SCREENSHOT_XML = `<node><interface name="org.freedesktop.impl.portal.Screenshot">
  <method name="Screenshot">
    <arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="a{sv}" direction="in"/>
    <arg type="u" direction="out"/><arg type="a{sv}" direction="out"/>
  </method>
  <method name="PickColor">
    <arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="a{sv}" direction="in"/>
    <arg type="u" direction="out"/><arg type="a{sv}" direction="out"/>
  </method>
  <property name="AvailableTargets" type="u" access="read"/>
  <property name="version" type="u" access="read"/>
</interface></node>`;

const SHELL_SCREENSHOT = ['org.gnome.Shell.Screenshot', '/org/gnome/Shell/Screenshot', 'org.gnome.Shell.Screenshot'] as const;
const SCREEN = 1;
const AREA = 4;
const ACTIVE_WINDOW = 8;

function callShell(method: string, parameters: GLib.Variant | null, replyType: string): Promise<GLib.Variant> {
  return Gio.DBus.session.call(...SHELL_SCREENSHOT, method, parameters, new GLib.VariantType(replyType), Gio.DBusCallFlags.NONE, -1, null);
}

function screenshotPath(): string {
  const directory = GLib.build_filenamev([GLib.get_user_cache_dir(), 'kestrel', 'screenshots']);
  GLib.mkdir_with_parents(directory, 0o700);
  return GLib.build_filenamev([directory, `Screenshot ${GLib.DateTime.new_now_local().format('%Y-%m-%d %H-%M-%S')}.png`]);
}

async function saved(method: string, parameters: (boolean | number)[], signature: string): Promise<string | null> {
  const type: string = `(${signature}s)`;
  const reply = await callShell(method, new GLib.Variant(type, [...parameters, screenshotPath()]), '(bs)');
  const [success, filename] = reply.deep_unpack() as [boolean, string];
  return success ? Gio.File.new_for_path(filename).get_uri() : null;
}

async function capture(target: number | undefined, interactive: boolean): Promise<string | null> {
  if (target === ACTIVE_WINDOW) return saved('ScreenshotWindow', [true, false, true], 'bbb');
  if (target === AREA) {
    const area = (await callShell('SelectArea', null, '(iiii)')).deep_unpack() as number[];
    return saved('ScreenshotArea', [...area, true], 'iiiib');
  }
  if (interactive && target !== SCREEN) {
    const [success, uri] = (await callShell('InteractiveScreenshot', null, '(bs)')).deep_unpack() as [boolean, string];
    return success ? uri : null;
  }
  return saved('Screenshot', [false, true], 'bb');
}

function failed(error: GLib.Error): Outcome {
  if (error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED)) return [CANCELLED, {}];
  console.warn(`Couldn't take a screenshot for an app: ${error.message}`);
  return [ENDED, {}];
}

export class ScreenshotPortal {
  readonly dbus = Gio.DBusExportedObject.wrapJSObject(SCREENSHOT_XML, this);
  readonly version = 3;
  readonly AvailableTargets = SCREEN | AREA | ACTIVE_WINDOW;

  ScreenshotAsync([handle, , , options]: [string, string, string, Options], invocation: Invocation): void {
    let closed = false;
    const request = new PortalRequest(handle, () => { closed = true; });
    capture(option<number>(options, 'target'), option<boolean>(options, 'interactive') ?? false)
      .then(uri => respond(invocation, closed ? [ENDED, {}] : uri ? [SUCCESS, { uri: new GLib.Variant('s', uri) }] : [CANCELLED, {}]))
      .catch(error => respond(invocation, failed(error)))
      .finally(() => request.finish());
  }

  PickColorAsync([handle]: [string, string, string, Options], invocation: Invocation): void {
    const request = new PortalRequest(handle, () => {});
    callShell('PickColor', null, '(a{sv})')
      .then(reply => {
        const [result] = reply.deep_unpack() as [Options];
        respond(invocation, [SUCCESS, { color: result.color }]);
      })
      .catch(error => respond(invocation, failed(error)))
      .finally(() => request.finish());
  }
}
