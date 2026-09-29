import GObject from 'gi://GObject';

import * as SignalTracker from './signalTracker.js';

export const SCALE_VALUE_N_STEPS = 20;
const SCALE_VALUE_CHANGE_EPSILON = 0.001;

export function activeBacklights(logicalMonitor) {
    return logicalMonitor.get_monitors()
        .filter(m => m.get_backlight() && m.is_active())
        .map(m => m.get_backlight());
}

export const BrightnessScale = GObject.registerClass({
    Properties: {
        'value': GObject.ParamSpec.float(
            'value', null, null,
            GObject.ParamFlags.READWRITE,
            0, 1.0, 1.0),
    },
    Signals: {
        'destroy': {},
    },
}, class BrightnessScale extends GObject.Object {
    constructor(name, value = 1.0, nSteps = SCALE_VALUE_N_STEPS) {
        super();

        this._name = name;
        this._value = value;
        this._nSteps = nSteps;
    }

    get name() {
        return this._name;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._setValue(value);
    }

    get nSteps() {
        return this._nSteps;
    }

    stepUp() {
        this._setValue(Math.min(1.0, this._value + (1.0 / this._nSteps)));
    }

    stepDown() {
        this._setValue(Math.max(0.0, this._value - (1.0 / this._nSteps)));
    }

    cycleUp() {
        if (Math.abs(1.0 - this._value) < SCALE_VALUE_CHANGE_EPSILON)
            this._setValue(0.0);
        else
            this.stepUp();
    }

    _setValue(value) {
        this._value = Math.clamp(value, 0.0, 1.0);
        this.notify('value');
    }

    destroy() {
        this.emit('destroy');
    }
});
SignalTracker.registerDestroyableType(BrightnessScale);

const MonitorBrightnessScale = GObject.registerClass({
    Signals: {
        'backlights-changed': {},
    },
}, class MonitorBrightnessScale extends BrightnessScale {
    constructor(monitor, value, nSteps) {
        super(monitor.get_monitors()[0].get_display_name(), value, nSteps);

        this._monitor = monitor;
        this._scaleFactor = 1.0;
    }

    get monitor() {
        return this._monitor;
    }

    syncWithScale(globalScale) {
        this.value = globalScale.value * this._scaleFactor;
    }

    updateScaleFactor(max) {
        this._scaleFactor = this.value / max;
    }
});

export const BacklightBrightnessScale = GObject.registerClass(
class BacklightBrightnessScale extends MonitorBrightnessScale {
    constructor(monitor, initialValue = -1.0) {
        // Handle backlights with just a few steps
        const maxSteps = Math.max(...activeBacklights(monitor)
            .map(b => b.brightnessMax - b.brightnessMin));
        const nSteps = Math.min(maxSteps, SCALE_VALUE_N_STEPS);

        super(monitor, initialValue >= 0 ? initialValue : 1.0, nSteps);

        this._currentBacklightBrightness = -1;

        if (initialValue >= 0)
            this.setBacklight(initialValue);
        else
            this.syncWithBacklight();

        for (const backlight of activeBacklights(monitor)) {
            backlight.connectObject('notify::brightness', () => {
                this.emit('backlights-changed');
            }, this);
        }
    }

    _getRelativeBrightness(backlight) {
        const {brightness, brightnessMin: min, brightnessMax: max} = backlight;
        return (brightness - min) / (max - min);
    }

    _setRelativeBrightness(backlight, brightness) {
        const {brightnessMin: min, brightnessMax: max} = backlight;
        backlight.brightness = min + ((max - min) * brightness);
    }

    syncWithBacklight() {
        const [backlight] = activeBacklights(this.monitor);

        if (backlight.brightness === this._currentBacklightBrightness)
            return false;
        this._currentBacklightBrightness = backlight.brightness;

        this.value = this._getRelativeBrightness(backlight);
        return true;
    }

    setBacklight(brightness) {
        const backlights = activeBacklights(this.monitor);
        for (const backlight of backlights)
            this._setRelativeBrightness(backlight, brightness);

        this._currentBacklightBrightness = backlights[0].brightness;
    }
});

export const DdcBrightnessScale = GObject.registerClass(
class DdcBrightnessScale extends MonitorBrightnessScale {
    constructor(monitor, displays) {
        super(monitor, Math.max(...displays.map(d => d.level)), SCALE_VALUE_N_STEPS);

        this._displays = displays;
    }

    syncWithBacklight() {
        return false;
    }

    setBacklight(brightness) {
        for (const display of this._displays)
            display.set(brightness);
    }
});
