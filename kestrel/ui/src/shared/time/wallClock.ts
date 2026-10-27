import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

const FORMAT_KEYS = new Set(['clock-format', 'clock-show-seconds', 'clock-show-weekday', 'clock-show-date']);

export class WallClock {
  readonly settings = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });
  private readonly settingsId: number;
  private zone = GLib.TimeZone.new_local();
  private readonly zoneMonitor = Gio.File.new_for_path('/etc/localtime').monitor_file(Gio.FileMonitorFlags.NONE, null);
  private readonly timeChange = Shell.time_change_source_new();
  private timer = 0;

  constructor(private readonly onTick: (now: GLib.DateTime, clock: WallClock) => void) {
    this.settingsId = this.settings.connect('changed', (_settings, key) => {
      if (FORMAT_KEYS.has(key)) this.tick();
    });
    this.zoneMonitor.connect('changed', () => {
      this.zone = GLib.TimeZone.new_local();
      this.tick();
    });
    this.timeChange.set_callback(() => {
      this.tick();
      return GLib.SOURCE_CONTINUE;
    });
    this.timeChange.attach(null);
    this.tick();
  }

  get showSeconds(): boolean {
    return this.settings.get_boolean('clock-show-seconds');
  }

  get twelveHour(): boolean {
    return this.settings.get_string('clock-format') === '12h';
  }

  private tick(): void {
    if (this.timer) GLib.source_remove(this.timer);
    const now = GLib.DateTime.new_now(this.zone);
    const elapsed = Math.floor(now.get_microsecond() / 1000) + (this.showSeconds ? 0 : now.get_second() * 1000);
    const period = this.showSeconds ? 1000 : 60000;
    this.timer = GLib.timeout_add(GLib.PRIORITY_HIGH, period - elapsed, () => {
      this.timer = 0;
      this.tick();
      return GLib.SOURCE_REMOVE;
    });
    this.onTick(now, this);
  }

  destroy(): void {
    if (this.timer) GLib.source_remove(this.timer);
    this.timer = 0;
    this.settings.disconnect(this.settingsId);
    this.zoneMonitor.cancel();
    this.timeChange.destroy();
  }
}
