import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';

import * as PopupMenu from '../popupMenu.js';

import {QuickMenuToggle, SystemIndicator} from '../quickSettings.js';

const BUS_NAME = 'org.gnome.SessionManager';
const OBJECT_PATH = '/org/gnome/SessionManager';
const INHIBIT_IDLE = 8;
const ICON_NAME = 'view-reveal-symbolic';

const DURATIONS = [
    [_('Until Turned Off'), 0],
    [_('30 Minutes'), 30],
    [_('1 Hour'), 60],
    [_('2 Hours'), 120],
];

function callSessionManager(method, parameters, replyType) {
    return Gio.DBus.session.call(BUS_NAME, OBJECT_PATH, BUS_NAME, method, parameters,
        replyType ? new GLib.VariantType(replyType) : null, Gio.DBusCallFlags.NONE, -1, null);
}

const CaffeineToggle = GObject.registerClass(
class CaffeineToggle extends QuickMenuToggle {
    _init() {
        super._init({
            title: _('Keep Awake'),
            iconName: ICON_NAME,
        });

        this._cookie = 0;
        this._request = null;
        this._timeoutId = 0;
        this._durationItems = new Map();

        this.menu.setHeader(ICON_NAME, _('Keep Awake'));
        for (const [label, minutes] of DURATIONS) {
            const item = new PopupMenu.PopupMenuItem(label);
            item.connect('activate', () => this._start(minutes));
            this._durationItems.set(minutes, item);
            this.menu.addMenuItem(item);
        }

        this.connect('clicked', () => (this.checked ? this._stop() : this._start(0)));
        this.connect('destroy', () => this._stop());
        this._sync(null);
    }

    async _start(minutes) {
        this._stop();
        const request = Symbol('inhibit');
        this._request = request;
        this._sync(minutes);
        if (minutes) {
            this._timeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, minutes * 60, () => {
                this._timeoutId = 0;
                this._stop();
                return GLib.SOURCE_REMOVE;
            });
        }
        try {
            const [cookie] = (await callSessionManager('Inhibit',
                new GLib.Variant('(susu)', ['org.gnome.Shell', 0, _('Kept awake from quick settings'), INHIBIT_IDLE]),
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
        this._sync(null);
    }

    _uninhibit(cookie) {
        callSessionManager('Uninhibit', new GLib.Variant('(u)', [cookie]), null)
            .catch(error => logError(error, 'Could not release the keep awake request'));
    }

    _sync(minutes) {
        const active = minutes !== null;
        const until = minutes
            ? GLib.DateTime.new_now_local().add_minutes(minutes).format('%H:%M')
            : null;
        this.set({
            checked: active,
            subtitle: until ? _('Until %s').format(until) : null,
        });
        for (const [duration, item] of this._durationItems) {
            item.setOrnament(active && duration === minutes
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
