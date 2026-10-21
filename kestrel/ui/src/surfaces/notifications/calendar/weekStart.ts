import Gio from 'gi://Gio';
import Shell from 'gi://Shell';

import { formatsLocale, onLocaleChanged } from '../../../shared/i18n/index.js';

const { util_get_week_start: regionWeekStart } = Shell as unknown as { util_get_week_start(locale: string): number };
const CHOSEN: Record<string, number> = { monday: 1, sunday: 0 };

function posixOf(tag: string): string {
  const { language, region } = new Intl.Locale(tag).maximize();
  return `${language}_${region}`;
}

export class WeekStart {
  private readonly kestrel = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });

  get day(): number {
    return CHOSEN[this.kestrel.get_string('week-start')] ?? regionWeekStart(posixOf(formatsLocale()));
  }

  watch(changed: () => void): () => void {
    const id = this.kestrel.connect('changed::week-start', changed);
    const forgetLocale = onLocaleChanged(changed);
    return () => {
      this.kestrel.disconnect(id);
      forgetLocale();
    };
  }
}
