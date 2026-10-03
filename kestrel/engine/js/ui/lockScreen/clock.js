import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Shell from 'gi://Shell';
import St from 'gi://St';

import {formatDateWithCFormatString} from '../../misc/dateUtils.js';
import {timeFormat} from '../../misc/timeFormats.js';
import {WallClock} from '../../misc/wallClock.js';

const HINT_TIMEOUT = 4;
const CROSSFADE_TIME = 300;

export const Clock = GObject.registerClass(
class LockClock extends St.BoxLayout {
    _init() {
        super._init({
            style_class: 'unlock-dialog-clock',
            orientation: Clutter.Orientation.VERTICAL,
        });

        this._time = new St.Label({
            style_class: 'unlock-dialog-clock-time',
            x_align: Clutter.ActorAlign.CENTER,
        });
        this._date = new St.Label({
            style_class: 'unlock-dialog-clock-date',
            x_align: Clutter.ActorAlign.CENTER,
        });
        this._hint = new St.Label({
            style_class: 'unlock-dialog-clock-hint',
            x_align: Clutter.ActorAlign.CENTER,
            opacity: 0,
        });

        this.add_child(this._time);
        this.add_child(this._date);
        this.add_child(this._hint);

        this._seat = this.get_context().get_backend().get_default_seat();
        this._seat.connectObject('notify::touch-mode', this._updateHint.bind(this), this);

        global.backend.get_monitor_manager().connectObject('power-save-mode-changed',
            () => (this._hint.opacity = 0), this);

        this._idleMonitor = global.backend.get_core_idle_monitor();
        this._idleWatchId = this._idleMonitor.add_idle_watch(HINT_TIMEOUT * 1000, () => {
            this._hint.ease({opacity: 255, duration: CROSSFADE_TIME});
        });

        this._wallClock = new WallClock(this._updateClock.bind(this));
        this._updateHint();

        this.connect('destroy', () => {
            this._wallClock.destroy();
            this._idleMonitor.remove_watch(this._idleWatchId);
        });
    }

    _updateClock(now, clock) {
        this._time.text = now.format(timeFormat(clock.twelveHour, clock.showSeconds)).trim();
        const dateFormat = Shell.util_translate_time_string(N_('%A %B %-d'));
        this._date.text = formatDateWithCFormatString(new Date(), dateFormat);
    }

    _updateHint() {
        this._hint.text = this._seat.touch_mode ? _('Swipe up') : _('Click or press a key');
    }
});
