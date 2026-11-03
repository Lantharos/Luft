import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { ApiContext } from './context.js';
import type { Coordinates, Location } from './types.js';

const GEOCLUE = 'org.freedesktop.GeoClue2';
const CITY_ACCURACY = 4;
const FRESH_FOR_US = 10 * 60 * GLib.USEC_PER_SEC;
const GIVE_UP_AFTER_S = 30;
const CHECK_EVERY_S = 10 * 60;
const MOVED_KM = 5;
const EARTH_RADIUS_KM = 6371;

let known: { coordinates: Coordinates; at: number } | null = null;
let pending: Promise<Coordinates | null> | null = null;

let locationSettings: Gio.Settings | null = null;

async function call(path: string, iface: string, method: string, parameters: GLib.Variant | null = null): Promise<GLib.Variant> {
  return Gio.DBus.system.call(GEOCLUE, path, iface, method, parameters, null, Gio.DBusCallFlags.NONE, -1, null);
}

async function property(path: string, iface: string, name: string): Promise<unknown> {
  const reply = await call(path, 'org.freedesktop.DBus.Properties', 'Get', new GLib.Variant('(ss)', [iface, name]));
  return (reply.deepUnpack() as [GLib.Variant])[0].deepUnpack();
}

async function locate(): Promise<Coordinates | null> {
  const [client] = (await call('/org/freedesktop/GeoClue2/Manager', `${GEOCLUE}.Manager`, 'GetClient')).deepUnpack() as [string];
  const set = (name: string, value: GLib.Variant) =>
    call(client, 'org.freedesktop.DBus.Properties', 'Set', new GLib.Variant('(ssv)', [`${GEOCLUE}.Client`, name, value]));
  await set('DesktopId', new GLib.Variant('s', 'kestrel'));
  await set('RequestedAccuracyLevel', new GLib.Variant('u', CITY_ACCURACY));
  const located = new Promise<string | null>(resolve => {
    const timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, GIVE_UP_AFTER_S, () => {
      finish(null);
      return GLib.SOURCE_REMOVE;
    });
    const subscription = Gio.DBus.system.signal_subscribe(GEOCLUE, `${GEOCLUE}.Client`, 'LocationUpdated', client, null,
      Gio.DBusSignalFlags.NONE, (_connection, _sender, _path, _iface, _signal, parameters) => finish((parameters.deepUnpack() as [string, string])[1]));
    const finish = (path: string | null) => {
      GLib.source_remove(timeout);
      Gio.DBus.system.signal_unsubscribe(subscription);
      resolve(path);
    };
  });
  await call(client, `${GEOCLUE}.Client`, 'Start');
  const path = await located;
  await call(client, `${GEOCLUE}.Client`, 'Stop').catch(() => {});
  if (!path) return null;
  const read = (name: string) => property(path, `${GEOCLUE}.Location`, name) as Promise<number>;
  const [latitude, longitude, accuracy] = await Promise.all([read('Latitude'), read('Longitude'), read('Accuracy')]);
  return { latitude, longitude, accuracy };
}

/** Where the computer roughly is, asked of GeoClue at most every ten minutes and only while location services are on. */
export async function whereabouts(): Promise<Coordinates | null> {
  locationSettings ??= new Gio.Settings({ schema_id: 'org.gnome.system.location' });
  if (!locationSettings.get_boolean('enabled')) return null;
  if (known && GLib.get_monotonic_time() - known.at < FRESH_FOR_US) return known.coordinates;
  pending ??= locate().catch(() => null).then(coordinates => {
    pending = null;
    if (coordinates) known = { coordinates, at: GLib.get_monotonic_time() };
    return coordinates;
  });
  return pending;
}

function kilometresBetween(a: Coordinates, b: Coordinates): number {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const latitude = radians(b.latitude - a.latitude);
  const longitude = radians(b.longitude - a.longitude);
  const h = Math.sin(latitude / 2) ** 2 + Math.cos(radians(a.latitude)) * Math.cos(radians(b.latitude)) * Math.sin(longitude / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** Tells its listeners when the computer moved to another city, asking GeoClue only while someone listens. */
class Moves {
  private readonly listeners = new Set<(coordinates: Coordinates) => void>();
  private last: Coordinates | null = null;
  private timer = 0;

  watch(changed: (coordinates: Coordinates) => void): () => void {
    this.listeners.add(changed);
    if (!this.timer) {
      void this.check();
      this.timer = GLib.timeout_add_seconds(GLib.PRIORITY_LOW, CHECK_EVERY_S, () => {
        void this.check();
        return GLib.SOURCE_CONTINUE;
      });
    }
    return () => {
      this.listeners.delete(changed);
      if (this.listeners.size || !this.timer) return;
      GLib.source_remove(this.timer);
      this.timer = 0;
    };
  }

  private async check(): Promise<void> {
    const now = await whereabouts();
    if (!now) return;
    if (!this.last) {
      this.last = now;
      return;
    }
    if (kilometresBetween(this.last, now) < MOVED_KM) return;
    this.last = now;
    for (const listener of [...this.listeners]) listener(now);
  }
}

const moves = new Moves();

export function locationApi({ scope }: ApiContext): Location {
  return {
    current: () => whereabouts(),
    onChanged: changed => scope.disposable(moves.watch(scope.guard(changed))),
  };
}
