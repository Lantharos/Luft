import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import * as Main from '../ui/main.js';
import {DdcDisplays} from './ddcutil.js';
import {
    activeBacklights,
    BacklightBrightnessScale,
    BrightnessScale,
    DdcBrightnessScale,
    SCALE_VALUE_N_STEPS,
} from './brightnessScales.js';

const KEYBINDING_SCHEMA = 'dev.lantharos.kestrel.keybindings';
const POWER_SCHEMA = 'org.gnome.settings-daemon.plugins.power';

class MonitorId {
    constructor(options) {
        this._vendor = options.vendor;
        this._product = options.product;
        this._serial = options.serial;
        this._colorMode = options.colorMode;
        this._connector = options.connector;
    }

    static fromMonitor(logicalMonitor) {
        const monitor = logicalMonitor.get_monitors()[0];
        return new MonitorId({
            vendor: monitor.get_vendor(),
            product: monitor.get_product(),
            serial: monitor.get_serial(),
            colorMode: monitor.get_color_mode_string(),
            connector: monitor.get_connector(),
        });
    }

    equals(other) {
        return this._vendor === other._vendor &&
               this._product === other._product &&
               this._serial === other._serial &&
               this._colorMode === other._colorMode;
    }

    equalsExact(other) {
        return this.equals(other) &&
               this._connector === other._connector;
    }

    toTuple() {
        return [
            this._vendor,
            this._product,
            this._serial,
            this._colorMode,
            this._connector,
        ];
    }

    static fromTuple(tuple) {
        return new MonitorId({
            vendor: tuple[0],
            product: tuple[1],
            serial: tuple[2],
            colorMode: tuple[3],
            connector: tuple[4],
        });
    }
}

export const BrightnessManager = GObject.registerClass({
    Signals: {
        'changed': {},
        'user-update': {},
    },
}, class BrightnessManager extends GObject.Object {
    constructor() {
        super();

        this._globalScale = null;
        this._monitorScales = new Map();

        // This is still being used in the power plugin for the keyboard backlight
        // so we just use that setting here
        const powerSettings = new Gio.Settings({schema_id: POWER_SCHEMA});
        this._dimmingTarget = powerSettings.get_int('idle-brightness') / 100;
        this._dimmingEnabled = false;

        this._loadBrightnesses();

        this._abTarget = -1.0;

        Main.wm.addKeybinding(
            'screen-brightness-up',
            new Gio.Settings({schema_id: KEYBINDING_SCHEMA}),
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.ALL,
            this._screenBrightnessUp.bind(this));

        Main.wm.addKeybinding(
            'screen-brightness-up-monitor',
            new Gio.Settings({schema_id: KEYBINDING_SCHEMA}),
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.ALL,
            this._screenBrightnessUpCurrentMonitor.bind(this));

        Main.wm.addKeybinding(
            'screen-brightness-down',
            new Gio.Settings({schema_id: KEYBINDING_SCHEMA}),
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.ALL,
            this._screenBrightnessDown.bind(this));

        Main.wm.addKeybinding(
            'screen-brightness-down-monitor',
            new Gio.Settings({schema_id: KEYBINDING_SCHEMA}),
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.ALL,
            this._screenBrightnessDownCurrentMonitor.bind(this));

        Main.wm.addKeybinding(
            'screen-brightness-cycle',
            new Gio.Settings({schema_id: KEYBINDING_SCHEMA}),
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.ALL,
            this._screenBrightnessCycle.bind(this));

        Main.wm.addKeybinding(
            'screen-brightness-cycle-monitor',
            new Gio.Settings({schema_id: KEYBINDING_SCHEMA}),
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.ALL,
            this._screenBrightnessCycleCurrentMonitor.bind(this));

        this._ddc = new DdcDisplays(() => this._rebuildScales());

        const monitorManager = global.backend.get_monitor_manager();
        monitorManager.connectObject('monitors-changed',
            this._monitorsChanged.bind(this), this);
        this._monitorsChanged();
    }

    get dimming() {
        return this._dimmingEnabled;
    }

    set dimming(enable) {
        this._dimmingEnabled = enable;
        this._sync();
    }

    get autoBrightnessTarget() {
        return this._abTarget;
    }

    set autoBrightnessTarget(target) {
        this._abTarget = target;
        this._sync();
    }

    get globalScale() {
        return this._globalScale;
    }

    get scales() {
        return [...this._monitorScales.values()];
    }

    _screenBrightnessUp() {
        this._globalScale?.stepUp();
    }

    _screenBrightnessUpCurrentMonitor() {
        const monitor = global.backend.get_current_logical_monitor();
        this._monitorScales.get(monitor)?.stepUp();
    }

    _screenBrightnessDown() {
        this._globalScale?.stepDown();
    }

    _screenBrightnessDownCurrentMonitor() {
        const monitor = global.backend.get_current_logical_monitor();
        this._monitorScales.get(monitor)?.stepDown();
    }

    _screenBrightnessCycle() {
        this._globalScale?.cycleUp();
    }

    _screenBrightnessCycleCurrentMonitor() {
        const monitor = global.backend.get_current_logical_monitor();
        this._monitorScales.get(monitor)?.cycleUp();
    }

    _loadBrightnesses() {
        const monitors = [...this._monitorScales.values()].map(s => s.monitor);
        const brightnesses = this._getSavedBrightnesses(monitors);

        for (const scale of this._monitorScales.values())
            scale.value = brightnesses.get(scale.monitor);
    }

    _getState() {
        return global.get_persistent_state('a(sssssd)', 'brightnesses')
            ?.deepUnpack().map(tuple => {
                const brightness = tuple.pop();
                return {id: MonitorId.fromTuple(tuple), brightness};
            }) ?? [];
    }

    _setState(values) {
        const tuple = new GLib.Variant('a(sssssd)', [...values].map(value => {
            const {id, brightness} = value;
            return [...id.toTuple(), brightness];
        }));
        global.set_persistent_state('brightnesses', tuple);
    }

    _getSavedBrightnesses(monitors) {
        const map = new Map();
        const saved = this._getState();

        for (const logicalMonitor of monitors) {
            const mId = MonitorId.fromMonitor(logicalMonitor);
            const {brightness} = saved.find(s => s.id.equalsExact(mId)) ??
                saved.find(s => s.id.equals(mId)) ??
                {brightness: -1.0};

            map.set(logicalMonitor, brightness);
        }

        return map;
    }

    _saveBrightnesses() {
        if (this._saveBrightnessId) {
            GLib.source_remove(this._saveBrightnessId);
            this._saveBrightnessId = 0;
        }

        this._saveBrightnessId = GLib.timeout_add_once(GLib.PRIORITY_DEFAULT, 300, () => {
            this._saveBrightnessId = 0;

            let values = this._getState();

            for (const scale of this._monitorScales.values()) {
                const mId = MonitorId.fromMonitor(scale.monitor);

                values = values.filter(v => !v.id.equalsExact(mId));
                values.push({id: mId, brightness: scale.value});
            }

            this._setState(values);
        });
    }

    _monitorsChanged() {
        const withoutBacklight = global.backend.get_monitor_manager()
            .get_logical_monitors()
            .filter(lm => activeBacklights(lm).length === 0);
        this._ddc.detect(withoutBacklight.flatMap(lm => lm.get_monitors().filter(m => m.is_active())));
        this._rebuildScales();
    }

    _createScale(monitor, brightnesses) {
        if (activeBacklights(monitor).length > 0)
            return new BacklightBrightnessScale(monitor, brightnesses.get(monitor));
        const displays = this._ddc.displaysFor(monitor);
        return displays.length > 0 ? new DdcBrightnessScale(monitor, displays) : null;
    }

    _rebuildScales() {
        const monitors = global.backend.get_monitor_manager().get_logical_monitors();

        this._monitorScales.values().forEach(scale => scale.destroy());
        this._monitorScales.clear();

        const brightnesses = this._getSavedBrightnesses(monitors);

        for (const monitor of monitors) {
            const scale = this._createScale(monitor, brightnesses);
            if (!scale)
                continue;
            scale._scaleChanged = true;

            scale.connectObject(
                'backlights-changed', () => this._sync(),
                'notify::value',  () => {
                    if (this._inhibitUpdates)
                        return;
                    scale._scaleChanged = true;
                    this._sync();
                    this.emit('user-update');
                }, this);

            this._monitorScales.set(monitor, scale);
        }

        if (this._monitorScales.size === 0) {
            this._globalScale = null;
        } else if (!this._globalScale) {
            // Handle scales with just a few steps
            const maxSteps = Math.max(...[...this._monitorScales.values()]
                .map(s => s.nSteps));
            const nSteps = Math.min(maxSteps, SCALE_VALUE_N_STEPS);

            this._globalScale = new BrightnessScale(_('Brightness'), 1.0, nSteps);
            this._globalScale.connect('notify::value', () => {
                if (this._inhibitUpdates)
                    return;
                this._globalScaleChanged = true;
                this._sync();
                this.emit('user-update');
            });
        }

        this._sync({showOSD: false});

        this.emit('changed');
    }

    _sync({showOSD = true} = {}) {
        if (!this._globalScale)
            return;
        if (this._inhibitUpdates)
            return;
        this._inhibitUpdates = true;

        // Handle changed backlights
        for (const scale of this._monitorScales.values()) {
            if (scale.syncWithBacklight()) {
                // disable dimming for all if we have a single system initiated
                // backlight change
                this._dimmingEnabled = false;
            }
        }

        // Find scales which have been changed (and reset _scaleChanged)
        const changedScales = [...this._monitorScales.values()].filter(s => {
            const c = s._scaleChanged;
            s._scaleChanged = false;
            return c;
        });

        let scalesUpdated = true;

        if (changedScales.length > 0) {
            // update the factors of all the scales when a scale changes

            // normalize everything to the maximum of all scales
            const max = Math.max(...[...this._monitorScales.values()]
                .map(s => s.value));

            // if max is 0 we can't deduce any ratios, so don't try
            if (max > 0.01) {
                for (const scale of this._monitorScales.values())
                    scale.updateScaleFactor(max);
            }

            // the global scale always follows the maximum, because one monitor
            // scale is at the maximum and we want the global scale to be a
            // factor we apply on the ratio of the monitor scales.
            this._globalScale.value = max;

            if (showOSD)
                this._showOSD(changedScales);
        } else if (this._globalScaleChanged) {
            // if the global scale changed, update the monitor scales according
            // to their scaleFactor and the global scale.

            this._globalScaleChanged = false;

            for (const scale of this._monitorScales.values())
                scale.syncWithScale(this._globalScale);

            if (showOSD)
                this._showOSD(this._monitorScales.values());
        } else {
            scalesUpdated = false;
        }

        // Update the actual backlight according to the new monitor brightnesses
        // and other factors, such as dimming.
        for (const scale of this._monitorScales.values()) {
            // If auto brightness is active (_abTarget >= 0) we use the scale
            // as a bias for the auto brightness target to determine the target
            // brightness.
            // Otherwise the target brightness just comes from the scale.
            const target = this._abTarget >= 0.0
                ? Math.clamp(this._abTarget + scale.value - 0.5, 0.0, 1.0)
                : scale.value;

            // the actual brightness is then determined by clipping to the
            // dimming target, if dimming is enabled
            const max = this._dimmingEnabled ? this._dimmingTarget : 1.0;
            const brightness = Math.min(max, target);

            scale.setBacklight(brightness);
        }

        if (scalesUpdated)
            this._saveBrightnesses();

        this._inhibitUpdates = false;
    }

    _showOSD(monitorScales) {
        const osdMonitors = {};
        for (const scale of monitorScales) {
            const level = scale.value;
            osdMonitors[scale.monitor.get_number()] = {level};
        }

        Main.osdWindowManager.show(
            Gio.Icon.new_for_string('display-brightness-symbolic'),
            null,
            osdMonitors
        );
    }
});
