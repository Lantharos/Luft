import { defineCurrencies } from './units.js';

const EURO_REGIONS = new Set('AT BE BG HR CY EE FI FR DE GR IE IT LV LT LU MT NL PT SK SI ES XK ME AD MC SM VA'.split(' '));
const HOME: Record<string, string> = {
  GB: 'GBP', CH: 'CHF', LI: 'CHF', SE: 'SEK', NO: 'NOK', DK: 'DKK', IS: 'ISK', PL: 'PLN', CZ: 'CZK', HU: 'HUF', RO: 'RON', RS: 'RSD',
  BA: 'BAM', MK: 'MKD', AL: 'ALL', TR: 'TRY', UA: 'UAH', RU: 'RUB', MD: 'MDL', GE: 'GEL', US: 'USD', CA: 'CAD', AU: 'AUD', NZ: 'NZD',
  BR: 'BRL', JP: 'JPY', CN: 'CNY', IN: 'INR',
};
const NAMES: Record<string, string[]> = {
  USD: ['$', 'dollar', 'dolar', 'dolara', 'dollari', 'dollare'],
  EUR: ['€', 'euro', 'eura', 'eure', 'euron', 'evro', 'evra'],
  GBP: ['£', 'sterling', 'pound sterling'],
  JPY: ['¥', 'yen'],
  CNY: ['yuan', 'renminbi', 'rmb'],
  TRY: ['₺', 'lira', 'lire'],
  INR: ['₹', 'rupee'],
  RUB: ['₽', 'ruble', 'rouble', 'rubel', 'rubla'],
  UAH: ['₴', 'hryvnia'],
  PLN: ['zł', 'zloty'],
  CZK: ['kč', 'koruna'],
  HUF: ['forint'],
  RON: ['leu', 'lei'],
  CHF: ['franc', 'franken'],
  ALL: ['lek', 'leke', 'lekë'],
  RSD: ['dinar', 'dinara', 'dinari'],
  MKD: ['denar', 'denari', 'denara'],
  BAM: ['marka', 'marke', 'maraka'],
};

let codes: Set<string> | null = null;
let mentions: Set<string> | null = null;

function isoCodes(): Set<string> {
  codes ??= new Set(Intl.supportedValuesOf('currency'));
  return codes;
}

export function homeCurrency(locale: string): string {
  const region = new Intl.Locale(locale).maximize().region ?? '';
  return EURO_REGIONS.has(region) ? 'EUR' : HOME[region] ?? 'EUR';
}

export function mentionsCurrency(text: string): boolean {
  mentions ??= new Set([...[...isoCodes()].map(code => code.toLowerCase()), ...Object.values(NAMES).flat()]);
  const lowered = text.toLocaleLowerCase();
  return /\d/.test(lowered) && (lowered.split(/[\s\d.,]+/).some(word => mentions!.has(word) || mentions!.has(word.replace(/s$/, ''))) || /[$€£¥₺₹₽₴]/.test(lowered));
}

export function useRates(perEuro: Record<string, number>, locale: string): void {
  const known = isoCodes();
  const names = [...new Set([locale, 'en'])].map(language => new Intl.DisplayNames(language, { type: 'currency' }));
  const currencies = Object.entries({ ...perEuro, eur: 1 })
    .map(([code, rate]) => [code.toUpperCase(), rate] as const)
    .filter(([code, rate]) => known.has(code) && rate > 0)
    .map(([code, rate]) => {
      const named = names.map(display => display.of(code)?.toLocaleLowerCase(locale)).filter((name): name is string => !!name && name !== code.toLowerCase());
      return { code, perEuro: rate, aliases: [...NAMES[code] ?? [], ...named, ...named.map(name => name.replace(/-/g, ' '))] };
    });
  defineCurrencies(currencies, homeCurrency(locale));
}
