import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';

import * as KestrelUi from '../kestrelUi.js';
import * as PopupMenu from '../popupMenu.js';

import {QuickMenuToggle, SystemIndicator} from '../quickSettings.js';

import {formatTime} from '../../misc/dateUtils.js';

const BUS_NAME = 'org.gnome.SessionManager';
const OBJECT_PATH = '/org/gnome/SessionManager';
const INHIBIT_IDLE = 8;
const ICON_NAME = 'view-reveal-symbolic';

const DURATIONS = new Map([
    [0, 'caffeine-until-turned-off'],
    [30, 'caffeine-30-minutes'],
    [60, 'caffeine-1-hour'],
    [120, 'caffeine-2-hours'],
]);

function callSessionManager(method, parameters, replyType) {
    return Gio.DBus.session.call(BUS_NAME, OBJECT_PATH, BUS_NAME, method, parameters,
        replyType ? new GLib.VariantType(replyType) : null, Gio.DBusCallFlags.NONE, -1, null);
}

const CaffeineToggle = GObject.registerClass(
class CaffeineToggle extends QuickMenuToggle {
    _init() {
        super._init({iconName: ICON_NAME});

        this._cookie = 0;
        this._request = null;
        this._timeoutId = 0;
        this._minutes = null;
        this._until = null;
        this._durationItems = new Map();

        for (const [minutes, labelId] of DURATIONS) {
            const item = new PopupMenu.PopupMenuItem('');
            KestrelUi.bindText(item.label, labelId);
            item.connect('activate', () => this._start(minutes));
            this._durationItems.set(minutes, item);
            this.menu.addMenuItem(item);
        }

        this.connect('clicked', () => (this.checked ? this._stop() : this._start(0)));
        this.connect('destroy', () => this._stop());
        KestrelUi.localized(this, () => {
            this.title = KestrelUi.t('caffeine-title');
            this.menuButtonAccessibleName = KestrelUi.t('caffeine-open-menu');
            this.menu.setHeader(ICON_NAME, KestrelUi.t('caffeine-title'));
            this._sync();
        });
    }

    async _start(minutes) {
        this._stop();
        const request = Symbol('inhibit');
        this._request = request;
        this._minutes = minutes;
        this._until = minutes ? GLib.DateTime.new_now_local().add_minutes(minutes) : null;
        this._sync();
        if (minutes) {
            this._timeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, minutes * 60, () => {
                this._timeoutId = 0;
                this._stop();
                return GLib.SOURCE_REMOVE;
            });
        }
        try {
            const [cookie] = (await callSessionManager('Inhibit',
                new GLib.Variant('(susu)', ['org.gnome.Shell', 0, KestrelUi.t('caffeine-inhibit-reason'), INHIBIT_IDLE]),
                '(u)')).deep_unpack();
            if (this._request === request)
                this._cookie = cookie;
            else
                this._uninhibit(cookie);
        } catch (error) {
            logError(error, 'Could not keep the session awake');
            if (this._request === request)
                this._stop();
        }
    }

    _stop() {
        this._request = null;
        if (this._timeoutId)
            GLib.source_remove(this._timeoutId);
        this._timeoutId = 0;
        if (this._cookie)
            this._uninhibit(this._cookie);
        this._cookie = 0;
        this._minutes = null;
        this._until = null;
        this._sync();
    }

    _uninhibit(cookie) {
        callSessionManager('Uninhibit', new GLib.Variant('(u)', [cookie]), null)
            .catch(error => logError(error, 'Could not release the keep awake request'));
    }

    _sync() {
        const active = this._minutes !== null;
        this.set({
            checked: active,
            subtitle: this._until ? KestrelUi.t('caffeine-until', {time: formatTime(this._until)}) : null,
        });
        for (const [duration, item] of this._durationItems) {
            item.setOrnament(active && duration === this._minutes
                ? PopupMenu.Ornament.CHECK
                : PopupMenu.Ornament.NONE);
        }
    }
});

export const Indicator = GObject.registerClass(
class Indicator extends SystemIndicator {
    _init() {
        super._init();

        this.quickSettingsItems.push(new CaffeineToggle());
    }
});
