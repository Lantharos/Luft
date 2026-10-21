import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Soup from 'gi://Soup?version=3.0';

import { formatsLocale, onLocaleChanged } from '../../../shared/i18n/index.js';
import { mentionsCurrency, useRates } from './currencies.js';

Gio._promisify(Gio.File.prototype, 'load_contents_async');
Gio._promisify(Gio.File.prototype, 'query_info_async');
Gio._promisify(Gio.File.prototype, 'replace_contents_bytes_async', 'replace_contents_finish');
Gio._promisify(Soup.Session.prototype, 'send_and_read_async');

const SOURCES = [
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.min.json',
  'https://latest.currency-api.pages.dev/v1/currencies/eur.min.json',
];
const FRESH_FOR = 12 * GLib.TIME_SPAN_HOUR;
const RETRY_AFTER = GLib.TIME_SPAN_HOUR;

interface Saved {
  eur: Record<string, number>;
}

export class CurrencyRates {
  private readonly file = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_cache_dir(), 'kestrel', 'currency-rates.json']));
  private rates: Record<string, number> | null = null;
  private fetchedAt = 0;
  private busy = false;
  private readonly forgetLocale = onLocaleChanged(() => this.apply());

  constructor(private readonly changed: () => void) {}

  prepare(): void {
    if (this.rates || this.busy) return;
    this.busy = true;
    void this.readSaved().finally(() => (this.busy = false));
  }

  want(text: string): void {
    if (this.busy || GLib.get_real_time() - this.fetchedAt < FRESH_FOR || !mentionsCurrency(text)) return;
    this.busy = true;
    void this.download().finally(() => (this.busy = false));
  }

  destroy(): void {
    this.forgetLocale();
  }

  private apply(): void {
    if (this.rates) useRates(this.rates, formatsLocale());
  }

  private receive(contents: Uint8Array, fetchedAt: number): boolean {
    const saved = JSON.parse(new TextDecoder().decode(contents)) as Saved;
    if (!saved.eur || typeof saved.eur !== 'object') return false;
    this.rates = saved.eur;
    this.fetchedAt = fetchedAt;
    this.apply();
    this.changed();
    return true;
  }

  private async readSaved(): Promise<void> {
    try {
      const info = await this.file.query_info_async(Gio.FILE_ATTRIBUTE_TIME_MODIFIED, Gio.FileQueryInfoFlags.NONE, GLib.PRIORITY_LOW, null);
      const [contents] = await this.file.load_contents_async(null);
      this.receive(contents, info.get_modification_date_time()!.to_unix() * GLib.USEC_PER_SEC);
    } catch (error) {
      if (!(error instanceof GLib.Error && error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND)))
        console.warn(`Saved currency rates could not be read: ${error}`);
    }
  }

  private async download(): Promise<void> {
    const session = new Soup.Session({ timeout: 10 });
    for (const source of SOURCES) {
      try {
        const message = Soup.Message.new('GET', source);
        const bytes = await session.send_and_read_async(message, GLib.PRIORITY_LOW, null);
        const contents = bytes.toArray();
        if (message.get_status() !== Soup.Status.OK || !this.receive(contents, GLib.get_real_time())) continue;
        GLib.mkdir_with_parents(this.file.get_parent()!.get_path()!, 0o755);
        await this.file.replace_contents_bytes_async(new GLib.Bytes(contents), null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null);
        return;
      } catch (error) {
        console.warn(`Currency rates could not be downloaded from ${source}: ${error}`);
      }
    }
    this.fetchedAt = GLib.get_real_time() - FRESH_FOR + RETRY_AFTER;
  }
}
