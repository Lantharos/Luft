import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { formatsLocale, onLocaleChanged } from '../../../shared/i18n/index.js';
import { askLuft, lookupsAllowed } from '../../../shared/network/luftSite.js';
import { mentionsCurrency, parseRates, useRates } from './currencies.js';

Gio._promisify(Gio.File.prototype, 'load_contents_async');
Gio._promisify(Gio.File.prototype, 'query_info_async');
Gio._promisify(Gio.File.prototype, 'replace_contents_bytes_async', 'replace_contents_finish');

const RATES = '/api/rates';
const MAX_BYTES = 64 * 1024;
const FRESH_FOR = 12 * GLib.TIME_SPAN_HOUR;
const RETRY_AFTER = GLib.TIME_SPAN_HOUR;
const SAVED_ATTRIBUTES = `${Gio.FILE_ATTRIBUTE_TIME_MODIFIED},${Gio.FILE_ATTRIBUTE_STANDARD_SIZE}`;
const decoder = new TextDecoder();

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
    if (this.busy || GLib.get_real_time() - this.fetchedAt < FRESH_FOR || !mentionsCurrency(text) || !lookupsAllowed()) return;
    this.busy = true;
    void this.download().finally(() => (this.busy = false));
  }

  destroy(): void {
    this.forgetLocale();
  }

  private apply(): void {
    if (this.rates) useRates(this.rates, formatsLocale());
  }

  private receive(contents: Uint8Array, fetchedAt: number): void {
    this.rates = parseRates(decoder.decode(contents));
    this.fetchedAt = fetchedAt;
    this.apply();
    this.changed();
  }

  private async readSaved(): Promise<void> {
    try {
      const info = await this.file.query_info_async(SAVED_ATTRIBUTES, Gio.FileQueryInfoFlags.NONE, GLib.PRIORITY_LOW, null);
      if (info.get_size() > MAX_BYTES) throw new Error(`they are larger than ${MAX_BYTES} bytes`);
      const [contents] = await this.file.load_contents_async(null);
      this.receive(contents, info.get_modification_date_time()!.to_unix() * GLib.USEC_PER_SEC);
    } catch (error) {
      if (!(error instanceof GLib.Error && error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND)))
        console.warn(`Saved currency rates could not be read: ${error}`);
    }
  }

  private async download(): Promise<void> {
    try {
      const contents = await askLuft(RATES, MAX_BYTES);
      this.receive(contents, GLib.get_real_time());
      GLib.mkdir_with_parents(this.file.get_parent()!.get_path()!, 0o755);
      await this.file.replace_contents_bytes_async(new GLib.Bytes(contents), null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null);
    } catch (error) {
      console.warn(`Currency rates could not be downloaded: ${error}`);
      this.fetchedAt = GLib.get_real_time() - FRESH_FOR + RETRY_AFTER;
    }
  }
}
