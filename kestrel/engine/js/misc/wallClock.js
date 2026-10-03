import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

const FORMAT_KEYS = new Set(['clock-format', 'clock-show-seconds', 'clock-show-weekday', 'clock-show-date']);

export class WallClock {
    /**
     * @param {(now: GLib.DateTime, clock: WallClock) => void} onTick
     */
    constructor(onTick) {
        this._onTick = onTick;
        this.settings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
        this._settingsId = this.settings.connect('changed', (settings, key) => {
            if (FORMAT_KEYS.has(key))
                this._tick();
        });
        this._zone = GLib.TimeZone.new_local();
        this._zoneMonitor = Gio.File.new_for_path('/etc/localtime').monitor_file(Gio.FileMonitorFlags.NONE, null);
        this._zoneMonitor.connect('changed', () => {
            this._zone = GLib.TimeZone.new_local();
            this._tick();
        });
        this._timeChange = Shell.time_change_source_new();
        this._timeChange.set_callback(() => {
            this._tick();
            return GLib.SOURCE_CONTINUE;
        });
        this._timeChange.attach(null);
        this._timer = 0;
        this._tick();
    }

    get showSeconds() {
        return this.settings.get_boolean('clock-show-seconds');
    }

    get twelveHour() {
        return this.settings.get_string('clock-format') === '12h';
    }

    _tick() {
        if (this._timer)
            GLib.source_remove(this._timer);
        const now = GLib.DateTime.new_now(this._zone);
        const elapsed = Math.floor(now.get_microsecond() / 1000) + (this.showSeconds ? 0 : now.get_second() * 1000);
        const period = this.showSeconds ? 1000 : 60000;
        this._timer = GLib.timeout_add(GLib.PRIORITY_HIGH, period - elapsed, () => {
            this._timer = 0;
            this._tick();
            return GLib.SOURCE_REMOVE;
        });
        this._onTick(now, this);
    }

    destroy() {
        if (this._timer)
            GLib.source_remove(this._timer);
        this._timer = 0;
        this.settings.disconnect(this._settingsId);
        this._zoneMonitor.cancel();
        this._timeChange.destroy();
    }
}
