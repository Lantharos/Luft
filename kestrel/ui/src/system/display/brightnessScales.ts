import GObject from 'gi://GObject';
import type Meta from 'gi://Meta';

import { clamp } from '../../shared/math.js';
import * as SignalTracker from '../../core/runtime/signalTracker.js';
import type { DdcDisplay } from './ddcutil.js';

export const SCALE_VALUE_N_STEPS = 20;
const SCALE_VALUE_CHANGE_EPSILON = 0.001;

export function activeBacklights(logicalMonitor: Meta.LogicalMonitor): Meta.Backlight[] {
  return logicalMonitor.get_monitors()
    .filter(m => m.get_backlight() && m.is_active())
    .map(m => m.get_backlight()!);
}

export namespace BrightnessScale {
  export interface Signals extends GObject.Object.SignalSignatures {
    'destroy': () => void;
    'notify::value': (pspec: GObject.ParamSpec) => void;
  }
}

export class BrightnessScale extends GObject.Object {
  static [GObject.properties] = {
    'value': GObject.ParamSpec.float('value', null, null, GObject.ParamFlags.READWRITE, 0, 1.0, 1.0),
  };

  static [GObject.signals]: Record<string, Partial<GObject.SignalDefinition>> = {
    'destroy': {},
  };

  static {
    GObject.registerClass(this);
  }

  declare connect: GObject.SignalMethods<this, BrightnessScale.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, BrightnessScale.Signals>['emit'];

  private current: number;

  constructor(readonly name: string | null, value = 1.0, readonly nSteps = SCALE_VALUE_N_STEPS) {
    super();
    this.current = value;
  }

  get value(): number {
    return this.current;
  }

  set value(value: number) {
    this.setValue(value);
  }

  stepUp(): void {
    this.setValue(Math.min(1.0, this.current + (1.0 / this.nSteps)));
  }

  stepDown(): void {
    this.setValue(Math.max(0.0, this.current - (1.0 / this.nSteps)));
  }

  cycleUp(): void {
    if (Math.abs(1.0 - this.current) < SCALE_VALUE_CHANGE_EPSILON) this.setValue(0.0);
    else this.stepUp();
  }

  private setValue(value: number): void {
    this.current = clamp(value, 0.0, 1.0);
    this.notify('value');
  }

  destroy(): void {
    this.emit('destroy');
  }
}
SignalTracker.registerDestroyableType(BrightnessScale);

export namespace MonitorBrightnessScale {
  export interface Signals extends BrightnessScale.Signals {
    'backlights-changed': () => void;
  }
}

class MonitorBrightnessScale extends BrightnessScale {
  static [GObject.signals]: Record<string, Partial<GObject.SignalDefinition>> = {
    'backlights-changed': {},
  };

  static {
    GObject.registerClass(this);
  }

  declare connect: GObject.SignalMethods<this, MonitorBrightnessScale.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, MonitorBrightnessScale.Signals>['emit'];

  scaleChanged = true;
  private scaleFactor = 1.0;

  constructor(readonly monitor: Meta.LogicalMonitor, value: number, nSteps: number) {
    super(monitor.get_monitors()[0].get_display_name(), value, nSteps);
  }

  syncWithScale(globalScale: BrightnessScale): void {
    this.value = globalScale.value * this.scaleFactor;
  }

  updateScaleFactor(max: number): void {
    this.scaleFactor = this.value / max;
  }
}

function relativeBrightness({ brightness, brightness_min: min, brightness_max: max }: Meta.Backlight): number {
  return (brightness - min) / (max - min);
}

function setRelativeBrightness(backlight: Meta.Backlight, brightness: number): void {
  const { brightness_min: min, brightness_max: max } = backlight;
  backlight.brightness = min + ((max - min) * brightness);
}

export class BacklightBrightnessScale extends MonitorBrightnessScale {
  static {
    GObject.registerClass(this);
  }

  private currentBacklightBrightness = -1;

  constructor(monitor: Meta.LogicalMonitor, initialValue = -1.0) {
    const maxSteps = Math.max(...activeBacklights(monitor).map(b => b.brightness_max - b.brightness_min));
    const nSteps = Math.min(maxSteps, SCALE_VALUE_N_STEPS);

    super(monitor, initialValue >= 0 ? initialValue : 1.0, nSteps);

    if (initialValue >= 0) this.setBacklight(initialValue);
    else this.syncWithBacklight();

    for (const backlight of activeBacklights(monitor))
      backlight.connectObject('notify::brightness', () => this.emit('backlights-changed'), this);
  }

  syncWithBacklight(): boolean {
    const [backlight] = activeBacklights(this.monitor);

    if (backlight.brightness === this.currentBacklightBrightness) return false;
    this.currentBacklightBrightness = backlight.brightness;

    this.value = relativeBrightness(backlight);
    return true;
  }

  setBacklight(brightness: number): void {
    const backlights = activeBacklights(this.monitor);
    for (const backlight of backlights) setRelativeBrightness(backlight, brightness);

    this.currentBacklightBrightness = backlights[0].brightness;
  }
}

export class DdcBrightnessScale extends MonitorBrightnessScale {
  static {
    GObject.registerClass(this);
  }

  constructor(monitor: Meta.LogicalMonitor, private readonly displays: DdcDisplay[]) {
    super(monitor, Math.max(...displays.map(d => d.level)), SCALE_VALUE_N_STEPS);
  }

  syncWithBacklight(): boolean {
    return false;
  }

  setBacklight(brightness: number): void {
    for (const display of this.displays) display.set(brightness);
  }
}

export type MonitorScale = BacklightBrightnessScale | DdcBrightnessScale;
