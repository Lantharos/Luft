import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const NAME = 'com.lantharos.Handwriting1';
const PATH = '/com/lantharos/Handwriting1';
const NOT_INSTALLED = 'com.lantharos.Handwriting1.Error.NotInstalled';

export type Line = [number, number][][];

export class NotInstalled extends Error {}

/** Reads a line of handwriting as text, through the handwriting service. */
export async function recognize(strokes: Line): Promise<string> {
  try {
    const reply = await Gio.DBus.session.call(NAME, PATH, NAME, 'Recognize', new GLib.Variant('(aa(dd))', [strokes]),
      new GLib.VariantType('(s)'), Gio.DBusCallFlags.NONE, -1, null);
    return (reply.deep_unpack() as [string])[0];
  } catch (error) {
    if (error instanceof GLib.Error && Gio.DBusError.get_remote_error(error) === NOT_INSTALLED) throw new NotInstalled();
    throw error;
  }
}
