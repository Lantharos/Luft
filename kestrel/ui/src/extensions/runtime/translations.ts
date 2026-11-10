import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { type Args, Catalog, SOURCE_LOCALE, sourceLocaleOf } from '../../../../../packages/i18n/src/core.js';
import { locale } from '../../shared/i18n/index.js';

const decoder = new TextDecoder();

function messages(folder: string): string {
  try {
    const enumerator = Gio.File.new_for_path(folder).enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null);
    const files: string[] = [];
    for (let info = enumerator.next_file(null); info; info = enumerator.next_file(null))
      if (info.get_name().endsWith('.ftl')) files.push(info.get_name());
    return files.sort().map(name => decoder.decode(GLib.file_get_contents(GLib.build_filenamev([folder, name]))[1])).join('\n');
  } catch {
    return '';
  }
}

export class Translations {
  private readonly chosen: Catalog;
  private readonly english: Catalog;

  constructor(folder: string) {
    const load = (language: string) => new Catalog(language, messages(GLib.build_filenamev([folder, 'locales', sourceLocaleOf(language)])));
    this.english = load(SOURCE_LOCALE);
    this.chosen = locale() === SOURCE_LOCALE ? this.english : load(locale());
  }

  has(id: string): boolean {
    return this.chosen.has(id) || this.english.has(id);
  }

  t(id: string, args?: Args): string {
    return (this.chosen.has(id) ? this.chosen : this.english).format(id, args);
  }
}
