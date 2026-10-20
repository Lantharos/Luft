import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

const { util_get_week_start: regionWeekStart } = Shell as unknown as { util_get_week_start(locale: string): number };
const CHOSEN: Record<string, number> = { monday: 1, sunday: 0 };

function posixOf(tag: string): string {
  const { language, region } = new Intl.Locale(tag).maximize();
  return `${language}_${region}`;
}

function formatsLocale(region: string): string {
  const override = GLib.getenv('LUFT_LOCALE');
  if (override) return posixOf(override);
  return (region || GLib.getenv('LC_ALL') || GLib.getenv('LC_TIME') || GLib.getenv('LANG') || '').split(/[.@]/)[0];
}

export class WeekStart {
  private readonly kestrel = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });
  private readonly locale = new Gio.Settings({ schema_id: 'org.gnome.system.locale' });

  get day(): number {
    return CHOSEN[this.kestrel.get_string('week-start')] ?? regionWeekStart(formatsLocale(this.locale.get_string('region')));
  }

  watch(changed: () => void): () => void {
    const signals: [Gio.Settings, number][] = [
      [this.kestrel, this.kestrel.connect('changed::week-start', changed)],
      [this.locale, this.locale.connect('changed::region', changed)],
    ];
    return () => signals.forEach(([settings, id]) => settings.disconnect(id));
  }
}
