import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import * as MessageTray from 'resource:///com/lantharos/kestrel/ui/messageTray.js';

Gio._promisify(Gio.DBusConnection.prototype, 'call');
Gio._promisify(Gio.File.prototype, 'load_contents_async');
Gio._promisify(Gio.File.prototype, 'replace_contents_async');

const TRUST = 'com.lantharos.Trust1';
const TRUST_PATH = '/com/lantharos/Trust1';
const PROPERTIES = 'org.freedesktop.DBus.Properties';
const BOOT_ID = Gio.File.new_for_path('/proc/sys/kernel/random/boot_id');
const LAST_NOTIFIED = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_state_dir(), 'kestrel', 'last-failed-start']));

function trust(interfaceName: string, method: string, parameters: GLib.Variant | null, replyType: string | null): Promise<GLib.Variant> {
  return Gio.DBus.system.call(TRUST, TRUST_PATH, interfaceName, method, parameters,
    replyType ? new GLib.VariantType(replyType) : null, Gio.DBusCallFlags.NONE, -1, null);
}

async function text(file: Gio.File): Promise<string> {
  try {
    const [contents] = await file.load_contents_async(null);
    return new TextDecoder().decode(contents).trim();
  } catch {
    return '';
  }
}

export async function confirmStartup(): Promise<void> {
  try {
    await trust(TRUST, 'StartupFinished', null, null);
  } catch (error) {
    if (!(error instanceof GLib.Error && error.matches(Gio.DBusError, Gio.DBusError.SERVICE_UNKNOWN)))
      console.warn(`This startup couldn't be marked as working: ${error}`);
  }
}

async function failedVersion(): Promise<string> {
  try {
    const reply = await trust(PROPERTIES, 'Get', new GLib.Variant('(ss)', [TRUST, 'Startup']), '(v)');
    const [startup] = reply.recursiveUnpack() as [{ FailedVersion?: string }];
    return startup.FailedVersion ?? '';
  } catch {
    return '';
  }
}

export async function notifyAboutFailedStartup(): Promise<void> {
  const version = await failedVersion();
  if (!version) return;
  const boot = await text(BOOT_ID);
  if (await text(LAST_NOTIFIED) === boot) return;
  GLib.mkdir_with_parents(LAST_NOTIFIED.get_parent()!.get_path()!, 0o700);
  await LAST_NOTIFIED.replace_contents_async(new TextEncoder().encode(`${boot}\n`), null, false, Gio.FileCreateFlags.NONE, null);
  const source = MessageTray.getSystemSource();
  source.addNotification(new MessageTray.Notification({
    source,
    title: `Linux ${version.split('-')[0]} didn't start`,
    body: 'Your computer started with the version before it instead.',
    gicon: new Gio.ThemedIcon({ name: 'computer-symbolic' }),
    privacyScope: MessageTray.PrivacyScope.SYSTEM,
  }));
}
