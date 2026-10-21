import { Cursor, fold } from './text.js';
import { AM, CLOCK_SUFFIX, MIDNIGHT, NOON, PM } from './vocabulary.js';

export interface Place {
  zone: string;
  words: number;
}

export interface Clock {
  hour: number;
  minute: number;
}

const ABBREVIATIONS: Record<string, string> = {
  utc: 'UTC', gmt: 'UTC', est: 'America/New_York', edt: 'America/New_York', et: 'America/New_York', cst: 'America/Chicago',
  cdt: 'America/Chicago', mst: 'America/Denver', mdt: 'America/Denver', pst: 'America/Los_Angeles', pdt: 'America/Los_Angeles',
  pt: 'America/Los_Angeles', cet: 'Europe/Paris', cest: 'Europe/Paris', eet: 'Europe/Athens', eest: 'Europe/Athens', wet: 'Europe/Lisbon',
  bst: 'Europe/London', ist: 'Asia/Kolkata', jst: 'Asia/Tokyo', kst: 'Asia/Seoul', aest: 'Australia/Sydney', aedt: 'Australia/Sydney',
  nzst: 'Pacific/Auckland', nzdt: 'Pacific/Auckland', hkt: 'Asia/Hong_Kong', sgt: 'Asia/Singapore',
};

const CITIES: Record<string, string> = {
  'America/Los_Angeles': 'san francisco, sf, seattle, portland, las vegas, san diego, san jose, silicon valley, la',
  'America/New_York': 'washington, washington dc, dc, boston, miami, atlanta, philadelphia, nyc, njujork, nju jork',
  'America/Chicago': 'dallas, houston, austin, minneapolis, new orleans',
  'America/Denver': 'salt lake city, albuquerque',
  'America/Toronto': 'montreal, ottawa',
  'America/Sao_Paulo': 'rio, rio de janeiro, brasilia',
  'Asia/Shanghai': 'beijing, peking, pekin, shenzhen, guangzhou',
  'Asia/Kolkata': 'kolkata, calcutta, delhi, new delhi, mumbai, bombay, bangalore, bengaluru, chennai, hyderabad',
  'Asia/Tokyo': 'tokio, osaka, kyoto',
  'Asia/Dubai': 'abu dhabi',
  'Asia/Jerusalem': 'tel aviv',
  'Asia/Ho_Chi_Minh': 'ho chi minh, saigon, hanoi',
  'Africa/Johannesburg': 'cape town, pretoria',
  'Pacific/Auckland': 'wellington',
  'Europe/London': 'londra, londer, edinburgh, manchester',
  'Europe/Paris': 'pariz, parisi',
  'Europe/Berlin': 'munich, munchen, minhen, frankfurt, hamburg, cologne, koln, stuttgart, dusseldorf, leipzig, dresden, hannover, nuremberg, nurnberg',
  'Europe/Vienna': 'wien, bec, vjena, salzburg, graz',
  'Europe/Zurich': 'geneva, geneve, genf, zeneva, bern',
  'Europe/Rome': 'milan, milano, rim, rom, roma, napoli, naples',
  'Europe/Madrid': 'barcelona, valencia, sevilla',
  'Europe/Moscow': 'moskva, moskau, st petersburg, saint petersburg',
  'Europe/Kyiv': 'kyiv, kiev, kijev',
  'Europe/Warsaw': 'varsava, warschau, krakow',
  'Europe/Prague': 'prag, praga',
  'Europe/Athens': 'atena, athen, athina, thessaloniki, solun',
  'Europe/Copenhagen': 'kopenhagen',
  'Europe/Lisbon': 'lisabon, lissabon, lisbona',
  'Europe/Brussels': 'brisel, bruksel, brussel',
  'Europe/Budapest': 'budimpesta',
  'Europe/Bucharest': 'bukurest, bukuresht, bukarest',
  'Europe/Sofia': 'sofija',
  'Europe/Skopje': 'skoplje, shkup, tetovo',
  'Europe/Belgrade': 'beograd, belgrad, novi sad, nis, pristina, prishtina, prishtine, prizren, peja, ferizaj, gjakova',
  'Europe/Tirane': 'tirana, durres, vlore, shkoder, elbasan',
  'Europe/Zagreb': 'split, rijeka, dubrovnik, osijek, zadar',
  'Europe/Sarajevo': 'mostar, banja luka, tuzla, zenica',
  'Europe/Ljubljana': 'lubiana, maribor',
  'Europe/Istanbul': 'carigrad, stamboll, ankara',
};

export function knownZone(zone: string): boolean {
  try {
    new Intl.DateTimeFormat('en', { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}

let places: { exact: Map<string, string>; stems: [string, string][] } | null = null;

export function placeIndex(): NonNullable<typeof places> {
  if (places) return places;
  const exact = new Map<string, string>();
  for (const zone of Intl.supportedValuesOf('timeZone')) {
    if (!zone.includes('/') || zone.startsWith('Etc/')) continue;
    const city = fold(zone.slice(zone.lastIndexOf('/') + 1).replaceAll('_', ' '));
    if (!exact.has(city)) exact.set(city, zone);
    if (city.includes(' ') && !exact.has(city.replaceAll(' ', ''))) exact.set(city.replaceAll(' ', ''), zone);
  }
  for (const [zone, names] of Object.entries(CITIES)) if (knownZone(zone)) for (const name of names.split(', ')) exact.set(name, zone);
  const stems = [...exact].filter(([name]) => name.length >= 4 && !name.includes(' ')).sort(([a], [b]) => b.length - a.length);
  for (const [name, zone] of Object.entries(ABBREVIATIONS)) exact.set(name, zone);
  places = { exact, stems };
  return places;
}

export function abbreviation(name: string): boolean {
  return name in ABBREVIATIONS;
}

export function parsePlace(cursor: Cursor): Place | null {
  const { exact, stems } = placeIndex();
  for (let length = 4; length >= 1; length--) {
    const parts = cursor.tokens.slice(cursor.at, cursor.at + length);
    if (parts.length < length) continue;
    const zone = exact.get(parts.join(' ')) ?? exact.get(parts.join(''));
    if (zone) {
      cursor.at += length;
      return { zone, words: length };
    }
  }
  const token = cursor.peek();
  if (token === undefined || token.length < 5 || /\d/.test(token)) return null;
  const stem = stems.find(([name]) => token.startsWith(name.slice(0, -1)) && Math.abs(token.length - name.length) <= 2);
  if (!stem) return null;
  cursor.at++;
  return { zone: stem[1], words: 1 };
}

function meridiem(hour: number, cursor: Cursor): number | null {
  if (cursor.word(AM)) return hour === 12 ? 0 : hour <= 12 ? hour : null;
  if (cursor.word(PM)) return hour === 12 ? 12 : hour < 12 ? hour + 12 : null;
  return hour;
}

export function parseClock(cursor: Cursor): Clock | null {
  if (cursor.word(NOON)) return { hour: 12, minute: 0 };
  if (cursor.word(MIDNIGHT)) return { hour: 0, minute: 0 };
  const token = cursor.peek() ?? '';
  const written = token.match(/^(\d{1,2}):(\d{2})$/);
  const bare = token.match(/^(\d{1,2})$/);
  if (!written && !bare) return null;
  cursor.at++;
  const minute = written ? Number(written[2]) : 0;
  const hasSuffix = AM.has(cursor.peek() ?? '') || PM.has(cursor.peek() ?? '') || CLOCK_SUFFIX.has(cursor.peek() ?? '');
  if (!written && !hasSuffix) return null;
  const hour = meridiem(Number((written ?? bare)![1]), cursor);
  cursor.word(CLOCK_SUFFIX);
  return hour !== null && hour <= 24 && minute < 60 ? { hour: hour % 24, minute } : null;
}
