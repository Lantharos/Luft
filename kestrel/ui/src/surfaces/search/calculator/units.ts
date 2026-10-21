import { evaluate, type Decimal } from './expression.js';

export type Dimension = 'length' | 'mass' | 'temperature' | 'data' | 'time' | 'volume' | 'speed' | 'currency';

export interface Unit {
  dimension: Dimension;
  symbol: string;
  scale: number;
  offset: number;
  partner?: string;
}

export interface Conversion {
  value: number;
  from: Unit;
  to: Unit;
  amount: number;
}

const CONNECTORS = new Set(['to', 'in', 'into', 'as', '=', '->', '→']);
const PATTERN = /^(.*?[\d)π])\s*([^\s\d()]+)(?:\s+(.*))?$/;

const SYMBOL_FIRST = /^([$€£¥₺₹₽₴])\s*([\d.,]+)(.*)$/;

const units = new Map<string, Unit>();

function define(dimension: Dimension, symbol: string, scale: number, aliases: string[], partner?: string, offset = 0): void {
  const unit = { dimension, symbol, scale, offset, partner };
  for (const alias of [symbol.toLocaleLowerCase(), ...aliases]) units.set(alias, unit);
}

const currencyAliases: string[] = [];

export function defineCurrencies(currencies: { code: string; perEuro: number; aliases: string[] }[], home: string): void {
  for (const alias of currencyAliases.splice(0)) units.delete(alias);
  const known = new Set(currencies.map(({ code }) => code));
  const fallback = home === 'USD' ? 'EUR' : 'USD';
  for (const { code, perEuro, aliases } of currencies) {
    const unit: Unit = { dimension: 'currency', symbol: code, scale: 1 / perEuro, offset: 0, partner: code === home || !known.has(home) ? fallback : home };
    for (const alias of [code.toLowerCase(), ...aliases]) {
      if (units.has(alias)) continue;
      units.set(alias, unit);
      currencyAliases.push(alias);
    }
  }
}

define('length', 'mm', 0.001, ['millimeter', 'millimeters', 'millimetre', 'millimetres'], 'in');
define('length', 'cm', 0.01, ['centimeter', 'centimeters', 'centimetre', 'centimetres'], 'in');
define('length', 'm', 1, ['meter', 'meters', 'metre', 'metres'], 'ft');
define('length', 'km', 1000, ['kilometer', 'kilometers', 'kilometre', 'kilometres'], 'mi');
define('length', 'in', 0.0254, ['inch', 'inches', '"'], 'cm');
define('length', 'ft', 0.3048, ['foot', 'feet', "'"], 'm');
define('length', 'yd', 0.9144, ['yard', 'yards'], 'm');
define('length', 'mi', 1609.344, ['mile', 'miles'], 'km');
define('length', 'nmi', 1852, ['nautical mile', 'nautical miles'], 'km');

define('mass', 'mg', 1e-6, ['milligram', 'milligrams'], 'g');
define('mass', 'g', 0.001, ['gram', 'grams'], 'oz');
define('mass', 'kg', 1, ['kilo', 'kilos', 'kilogram', 'kilograms'], 'lb');
define('mass', 't', 1000, ['tonne', 'tonnes', 'ton', 'tons'], 'lb');
define('mass', 'oz', 0.028349523125, ['ounce', 'ounces'], 'g');
define('mass', 'lb', 0.45359237, ['lbs', 'pound', 'pounds'], 'kg');
define('mass', 'st', 6.35029318, ['stone', 'stones'], 'kg');

define('temperature', '°C', 1, ['c', 'celsius', 'degc'], '°F', 273.15);
define('temperature', '°F', 5 / 9, ['f', 'fahrenheit', 'degf'], '°C', 273.15 - 32 * 5 / 9);
define('temperature', 'K', 1, ['kelvin'], '°C');

define('data', 'bit', 0.125, ['bits'], 'B');
define('data', 'kbit', 125, ['kilobit', 'kilobits'], 'kB');
define('data', 'Mbit', 125e3, ['megabit', 'megabits'], 'MB');
define('data', 'Gbit', 125e6, ['gigabit', 'gigabits'], 'GB');
define('data', 'B', 1, ['byte', 'bytes'], 'KiB');
define('data', 'kB', 1e3, ['kilobyte', 'kilobytes'], 'KiB');
define('data', 'MB', 1e6, ['megabyte', 'megabytes'], 'MiB');
define('data', 'GB', 1e9, ['gigabyte', 'gigabytes'], 'GiB');
define('data', 'TB', 1e12, ['terabyte', 'terabytes'], 'TiB');
define('data', 'PB', 1e15, ['petabyte', 'petabytes'], 'PiB');
define('data', 'KiB', 1024, ['kibibyte', 'kibibytes'], 'kB');
define('data', 'MiB', 1024 ** 2, ['mebibyte', 'mebibytes'], 'MB');
define('data', 'GiB', 1024 ** 3, ['gibibyte', 'gibibytes'], 'GB');
define('data', 'TiB', 1024 ** 4, ['tebibyte', 'tebibytes'], 'TB');
define('data', 'PiB', 1024 ** 5, ['pebibyte', 'pebibytes'], 'PB');

define('time', 'ms', 0.001, ['millisecond', 'milliseconds']);
define('time', 's', 1, ['sec', 'secs', 'second', 'seconds']);
define('time', 'min', 60, ['mins', 'minute', 'minutes']);
define('time', 'h', 3600, ['hr', 'hrs', 'hour', 'hours']);
define('time', 'd', 86400, ['day', 'days']);
define('time', 'wk', 604800, ['week', 'weeks']);
define('time', 'yr', 31556952, ['y', 'year', 'years']);

define('volume', 'ml', 0.001, ['milliliter', 'milliliters', 'millilitre', 'millilitres'], 'fl oz');
define('volume', 'l', 1, ['liter', 'liters', 'litre', 'litres'], 'gal');
define('volume', 'fl oz', 0.0295735295625, ['floz', 'fluid ounce', 'fluid ounces'], 'ml');
define('volume', 'cup', 0.2365882365, ['cups'], 'ml');
define('volume', 'pt', 0.473176473, ['pint', 'pints'], 'ml');
define('volume', 'qt', 0.946352946, ['quart', 'quarts'], 'l');
define('volume', 'gal', 3.785411784, ['gallon', 'gallons'], 'l');

define('speed', 'm/s', 1, ['mps'], 'km/h');
define('speed', 'km/h', 1 / 3.6, ['kmh', 'kph'], 'mph');
define('speed', 'mph', 0.44704, [], 'km/h');
define('speed', 'kn', 0.514444, ['knot', 'knots'], 'km/h');

function lookup(name: string): Unit | undefined {
  return units.get(name) ?? units.get(name.replace(/s$/, ''));
}

function byMagnitude(from: Unit, base: number): Unit {
  const candidates = [...new Set(units.values())]
    .filter(unit => unit.dimension === from.dimension && unit !== from)
    .sort((a, b) => b.scale - a.scale);
  return candidates.find(unit => Math.abs(base / unit.scale) >= 1) ?? candidates[candidates.length - 1];
}

function target(from: Unit, rest: string, base: number): Unit {
  const words = rest.split(/\s+/).filter(Boolean);
  if (CONNECTORS.has(words[0])) words.shift();
  const named = words.length ? lookup(words.join(' ')) ?? lookup(words.join('')) : undefined;
  if (named?.dimension === from.dimension && named !== from) return named;
  if (from.partner) return units.get(from.partner.toLocaleLowerCase())!;
  return byMagnitude(from, base);
}

export function convert(text: string, decimal: Decimal = '.'): Conversion | null {
  const lowered = text.trim().toLocaleLowerCase();
  const symbolFirst = SYMBOL_FIRST.exec(lowered);
  const match = PATTERN.exec(symbolFirst ? `${symbolFirst[2]} ${symbolFirst[1]}${symbolFirst[3]}` : lowered);
  if (!match) return null;
  const [, amountText, unitText, rest = ''] = match;
  const [next = '', ...after] = rest.split(/\s+/);
  const single = lookup(unitText);
  const from = single ?? lookup(`${unitText} ${next}`);
  const amount = from ? evaluate(amountText, false, decimal) : null;
  if (!from || amount === null) return null;
  const base = amount * from.scale + from.offset;
  const to = target(from, single ? rest : after.join(' '), base);
  return { amount, from, to, value: (base - to.offset) / to.scale };
}
