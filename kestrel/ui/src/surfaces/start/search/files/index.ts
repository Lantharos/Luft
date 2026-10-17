import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const NAME = 'com.lantharos.Search';
const PATH = '/com/lantharos/Search';

export interface NamedFile {
  path: string;
  folder: boolean;
  score: number;
}

export interface MentioningFile {
  path: string;
  snippet: string;
}

function call(method: string, parameters: GLib.Variant | null, reply: string | null, cancellable: Gio.Cancellable | null): Promise<GLib.Variant> {
  return Gio.DBus.session.call(NAME, PATH, NAME, method, parameters, reply ? new GLib.VariantType(reply) : null,
    Gio.DBusCallFlags.NO_AUTO_START, -1, cancellable);
}

function ignoreCancelled(error: unknown): null {
  if (!(error instanceof GLib.Error && error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED)))
    console.warn(`File search failed: ${error}`);
  return null;
}

export const fileIndex = {
  async names(query: string, limit: number, cancellable: Gio.Cancellable): Promise<NamedFile[] | null> {
    try {
      const [found] = (await call('Find', new GLib.Variant('(su)', [query, limit]), '(a(sbd))', cancellable)).deepUnpack() as [[string, boolean, number][]];
      return found.map(([path, folder, score]) => ({ path, folder, score }));
    } catch (error) {
      return ignoreCancelled(error);
    }
  },

  async contents(query: string, limit: number, cancellable: Gio.Cancellable): Promise<MentioningFile[] | null> {
    try {
      const [found] = (await call('FindText', new GLib.Variant('(su)', [query, limit]), '(a(ss))', cancellable)).deepUnpack() as [[string, string][]];
      return found.map(([path, snippet]) => ({ path, snippet }));
    } catch (error) {
      return ignoreCancelled(error);
    }
  },

  refresh(): void {
    call('Refresh', null, null, null).catch(ignoreCancelled);
  },
};
