import * as Gettext from 'gettext';
import GLib from 'gi://GLib';

const ISO_CODES = '/usr/share/iso-codes/json';

type Standard = '639-2' | '639-3';

interface IsoEntry {
  name: string;
  common_name?: string;
  inverted_name?: string;
  alpha_2?: string;
  alpha_3?: string;
  bibliographic?: string;
}

type CodeField = 'alpha_2' | 'alpha_3' | 'bibliographic';

const CODE_FIELDS: Record<Standard, CodeField[]> = {
  '639-2': ['alpha_2', 'alpha_3', 'bibliographic'],
  '639-3': ['alpha_3'],
};

const tables = new Map<Standard, Map<string, string>>();

function table(standard: Standard): Map<string, string> {
  let names = tables.get(standard);
  if (names) return names;

  names = new Map();
  const [, contents] = GLib.file_get_contents(`${ISO_CODES}/iso_${standard}.json`);
  const entries: IsoEntry[] = JSON.parse(new TextDecoder().decode(contents))[standard];
  for (const entry of entries) {
    const name = entry.common_name ?? entry.inverted_name ?? entry.name;
    for (const field of CODE_FIELDS[standard]) {
      const code = entry[field];
      if (code) names.set(code, name);
    }
  }
  tables.set(standard, names);
  return names;
}

export function getLanguageName(code: string): string | null {
  let name: string | undefined;
  let domain: string | undefined;
  if (code.length === 2) {
    name = table('639-2').get(code);
    domain = 'iso_639-2';
  } else if (code.length === 3) {
    name = table('639-3').get(code) ?? table('639-2').get(code);
    domain = 'iso_639-3';
  }
  if (!name) return null;

  const [first, ...rest] = Gettext.dgettext(domain!, name).split('; ')[0];
  return first.toUpperCase() + rest.join('');
}
