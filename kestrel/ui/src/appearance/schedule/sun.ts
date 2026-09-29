export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type Daylight = { sunrise: number; sunset: number } | 'polar-day' | 'polar-night';

const UNIX_EPOCH_JULIAN = 2440587.5;
const J2000 = 2451545;
const DAY_MS = 86400000;
const OBLIQUITY = 23.4397;
const HORIZON = -0.833;

const radians = (degrees: number) => degrees * Math.PI / 180;
const degrees = (value: number) => value * 180 / Math.PI;

export const dayNumber = (time: number) => Math.round(time / DAY_MS + UNIX_EPOCH_JULIAN - J2000);

export const dayStart = (day: number) => (day + J2000 - UNIX_EPOCH_JULIAN - 0.5) * DAY_MS;

export function daylight({ latitude, longitude }: Coordinates, day: number): Daylight {
  const meanNoon = day - longitude / 360;
  const anomaly = (357.5291 + 0.98560028 * meanNoon) % 360;
  const center = 1.9148 * Math.sin(radians(anomaly)) + 0.02 * Math.sin(radians(2 * anomaly)) + 0.0003 * Math.sin(radians(3 * anomaly));
  const eclipticLongitude = (anomaly + center + 180 + 102.9372) % 360;
  const transit = J2000 + meanNoon + 0.0053 * Math.sin(radians(anomaly)) - 0.0069 * Math.sin(radians(2 * eclipticLongitude));
  const declination = Math.asin(Math.sin(radians(eclipticLongitude)) * Math.sin(radians(OBLIQUITY)));
  const hourAngle = (Math.sin(radians(HORIZON)) - Math.sin(radians(latitude)) * Math.sin(declination)) /
    (Math.cos(radians(latitude)) * Math.cos(declination));
  if (hourAngle > 1) return 'polar-night';
  if (hourAngle < -1) return 'polar-day';
  const offset = degrees(Math.acos(hourAngle)) / 360;
  const toTime = (julian: number) => (julian - UNIX_EPOCH_JULIAN) * DAY_MS;
  return { sunrise: toTime(transit - offset), sunset: toTime(transit + offset) };
}
