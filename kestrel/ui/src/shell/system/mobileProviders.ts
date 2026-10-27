import GLib from 'gi://GLib';

const DATABASE = 'mobile-broadband-provider-info/serviceproviders.xml';

const ENTITIES: Record<string, string> = { amp: '&', apos: "'", quot: '"', lt: '<', gt: '>' };

interface ProviderDatabase {
  networks: Map<string, string>;
  sids: Map<number, string>;
}

let database: ProviderDatabase | null = null;

function unescape(text: string): string {
  return text.replace(/&(amp|apos|quot|lt|gt);/g, (_match, name: string) => ENTITIES[name]);
}

function readDatabase(): string {
  for (const dir of GLib.get_system_data_dirs()) {
    const path = GLib.build_filenamev([dir, DATABASE]);
    if (GLib.file_test(path, GLib.FileTest.EXISTS))
      return new TextDecoder().decode(GLib.file_get_contents(path)[1]);
  }
  return '';
}

function providerName(provider: string, languages: string[]): string | null {
  const header = provider.split(/<(?:gsm|cdma)\b/, 1)[0];
  const names = new Map<string, string>();
  for (const [, language = '', name] of header.matchAll(/<name(?:\s+xml:lang="([^"]*)")?\s*>([^<]*)<\/name>/g)) {
    if (!names.has(language)) names.set(language, unescape(name.trim()));
  }
  const language = languages.find(candidate => names.has(candidate)) ?? '';
  return names.get(language) ?? names.values().next().value ?? null;
}

function loadDatabase(): ProviderDatabase {
  const networks = new Map<string, string>();
  const sids = new Map<number, string>();
  const languages = GLib.get_language_names().map(locale => locale.split(/[_.@]/)[0]);
  const contents = readDatabase().replace(/<!--[\s\S]*?-->/g, '');

  for (const [provider] of contents.matchAll(/<provider\b[\s\S]*?<\/provider>/g)) {
    const name = providerName(provider, languages);
    if (!name) continue;

    for (const [, mcc, mnc] of provider.matchAll(/<network-id\s+mcc="(\d+)"\s+mnc="(\d+)"\s*\/>/g)) {
      const code = `${mcc}${mnc}`;
      if (!networks.has(code)) networks.set(code, name);
    }
    for (const [, sid] of provider.matchAll(/<sid\s+value="(\d+)"\s*\/>/g)) {
      if (!sids.has(Number(sid))) sids.set(Number(sid), name);
    }
  }
  return { networks, sids };
}

function getDatabase(): ProviderDatabase {
  database ??= loadDatabase();
  return database;
}

export function lookup3gppMccMnc(mccMnc: string): string | null {
  const { networks } = getDatabase();
  const mcc = mccMnc.slice(0, 3);
  const mnc = mccMnc.slice(3);
  return networks.get(mccMnc) ??
    networks.get(`${mcc}${mnc.length === 3 ? mnc.replace(/^0/, '') : `0${mnc}`}`) ??
    null;
}

export function lookupCdmaSid(sid: number): string | null {
  return getDatabase().sids.get(sid) ?? null;
}
