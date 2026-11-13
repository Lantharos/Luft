import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const UDISKS = 'org.freedesktop.UDisks2';
const ROOT = '/org/freedesktop/UDisks2';
const MANAGER = 'org.freedesktop.DBus.ObjectManager';
const BLOCK = 'org.freedesktop.UDisks2.Block';
const FILESYSTEM = 'org.freedesktop.UDisks2.Filesystem';
const OBJECTS = new GLib.VariantType('(a{oa{sa{sv}}})');

type Objects = Record<string, Record<string, Record<string, unknown>>>;

/** A mounted drive as UDisks describes it. */
export interface MountedDrive {
  label: string;
  size: number;
}

/** The one mounted filesystem whose UUID is `uuid`, read from UDisks rather than taken from whoever asks. */
export async function mountedDrive(uuid: string): Promise<MountedDrive | null> {
  const reply = await Gio.DBus.system.call(UDISKS, ROOT, MANAGER, 'GetManagedObjects', null, OBJECTS, Gio.DBusCallFlags.NONE, -1, null);
  const objects = reply.get_child_value(0).recursiveUnpack() as Objects;
  const mounted = Object.values(objects).filter(object =>
    object[BLOCK]?.IdUUID === uuid && ((object[FILESYSTEM]?.MountPoints as unknown[] | undefined)?.length ?? 0) > 0);
  if (mounted.length !== 1) return null;
  const block = mounted[0][BLOCK];
  return { label: block.IdLabel as string, size: Number(block.Size) };
}
