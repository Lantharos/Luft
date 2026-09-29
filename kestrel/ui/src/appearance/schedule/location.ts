import Geoclue from 'gi://Geoclue';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { readText } from '../files.js';
import type { Coordinates } from './sun.js';

const DESKTOP_ID = 'org.gnome.Shell';
const ZONE_TABLES = ['/usr/share/zoneinfo/zone1970.tab', '/usr/share/zoneinfo/zone.tab'];
const ISO_6709 = /^([+-]\d{2})(\d{2})(\d{2})?([+-]\d{3})(\d{2})(\d{2})?$/;

function angle(degrees: string, minutes: string, seconds = '0'): number {
  const sign = degrees.startsWith('-') ? -1 : 1;
  return sign * (Math.abs(parseInt(degrees, 10)) + parseInt(minutes, 10) / 60 + parseInt(seconds, 10) / 3600);
}

async function timeZoneCoordinates(): Promise<Coordinates | null> {
  const zone = GLib.TimeZone.new_local().get_identifier();
  for (const path of ZONE_TABLES) {
    const row = (await readText(Gio.File.new_for_path(path)))?.split('\n').map(line => line.split('\t')).find(columns => columns[2] === zone);
    const match = row?.[1].match(ISO_6709);
    if (match) return { latitude: angle(match[1], match[2], match[3]), longitude: angle(match[4], match[5], match[6]) };
  }
  return null;
}

export class Location {
  coordinates: Coordinates | null = null;
  private readonly locationSettings = new Gio.Settings({ schema_id: 'org.gnome.system.location' });
  private cancellable = new Gio.Cancellable();

  constructor(private readonly changed: () => void) {}

  refresh(): void {
    this.cancellable.cancel();
    const cancellable = this.cancellable = new Gio.Cancellable();
    if (!this.coordinates) {
      void timeZoneCoordinates().then(coordinates => {
        if (cancellable.is_cancelled() || this.coordinates || !coordinates) return;
        this.coordinates = coordinates;
        this.changed();
      });
    }
    if (!this.locationSettings.get_boolean('enabled')) return;
    Geoclue.Simple.new(DESKTOP_ID, Geoclue.AccuracyLevel.CITY, cancellable, (_source, result) => {
      let simple: Geoclue.Simple;
      try {
        simple = Geoclue.Simple.new_finish(result);
      } catch {
        return;
      }
      const location = simple.get_location()!;
      simple.get_client()?.call_stop(null, null);
      this.coordinates = { latitude: location.latitude, longitude: location.longitude };
      this.changed();
    });
  }

  destroy(): void {
    this.cancellable.cancel();
  }
}
