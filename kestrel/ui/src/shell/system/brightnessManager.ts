import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import { clamp } from '../../shared/math.js';
import * as Main from '../main.js';
import { DdcDisplays } from './ddcutil.js';
import {
  activeBacklights,
  BacklightBrightnessScale,
  BrightnessScale,
  DdcBrightnessScale,
  SCALE_VALUE_N_STEPS,
  type MonitorScale,
} from './brightnessScales.js';

const KEYBINDING_SCHEMA = 'com.lantharos.kestrel.keybindings';
const POWER_SCHEMA = 'com.lantharos.kestrel.power';

type MonitorIdTuple = [vendor: string, product: string, serial: string, colorMode: string, connector: string];
type SavedBrightness = { id: MonitorId; brightness: number };

class MonitorId {
  constructor(
    private readonly vendor: string,
    private readonly product: string,
    private readonly serial: string,
    private readonly colorMode: string,
    private readonly connector: string,
  ) {}

  static fromMonitor(logicalMonitor: Meta.LogicalMonitor): MonitorId {
    const monitor = logicalMonitor.get_monitors()[0];
    return new MonitorId(monitor.get_vendor(), monitor.get_product(), monitor.get_serial(),
      monitor.get_color_mode_string(), monitor.get_connector());
  }

  static fromTuple(tuple: MonitorIdTuple): MonitorId {
    return new MonitorId(...tuple);
  }

  equals(other: MonitorId): boolean {
    return this.vendor === other.vendor &&
      this.product === other.product &&
      this.serial === other.serial &&
      this.colorMode === other.colorMode;
  }

  equalsExact(other: MonitorId): boolean {
    return this.equals(other) && this.connector === other.connector;
  }

  toTuple(): MonitorIdTuple {
    return [this.vendor, this.product, this.serial, this.colorMode, this.connector];
  }
}

function loadState(): SavedBrightness[] {
  return global.get_persistent_state('a(sssssd)', 'brightnesses')
    ?.deepUnpack<[...MonitorIdTuple, number][]>().map(tuple => {
      const brightness = tuple.pop() as number;
      return { id: MonitorId.fromTuple(tuple as unknown as MonitorIdTuple), brightness };
    }) ?? [];
}

function storeState(values: SavedBrightness[]): void {
  const tuple = new GLib.Variant('a(sssssd)', values.map(({ id, brightness }) => [...id.toTuple(), brightness]));
  global.set_persistent_state('brightnesses', tuple);
}

function savedBrightnesses(monitors: Meta.LogicalMonitor[]): Map<Meta.LogicalMonitor, number> {
  const map = new Map<Meta.LogicalMonitor, number>();
  const saved = loadState();

  for (const logicalMonitor of monitors) {
    const mId = MonitorId.fromMonitor(logicalMonitor);
    const { brightness } = saved.find(s => s.id.equalsExact(mId)) ??
      saved.find(s => s.id.equals(mId)) ??
      { brightness: -1.0 };

    map.set(logicalMonitor, brightness);
  }

  return map;
}

function showBrightnessOSD(monitorScales: Iterable<MonitorScale>): void {
  const osdMonitors: Record<number, { level: number }> = {};
  for (const scale of monitorScales) osdMonitors[scale.monitor.get_number()] = { level: scale.value };

  Main.osdWindowManager.show(Gio.Icon.new_for_string('display-brightness-symbolic'), null, osdMonitors);
}

export namespace BrightnessManager {
  export interface Signals extends GObject.Object.SignalSignatures {
    'changed': () => void;
    'user-update': () => void;
  }
}

export class BrightnessManager extends GObject.Object {
  static [GObject.signals] = {
    'changed': {},
    'user-update': {},
  };

  static {
    GObject.registerClass(this);
  }

  declare connect: GObject.SignalMethods<this, BrightnessManager.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, BrightnessManager.Signals>['emit'];

  private globalScaleValue: BrightnessScale | null = null;
  private readonly monitorScales = new Map<Meta.LogicalMonitor, MonitorScale>();
  private readonly dimmingTarget: number;
  private dimmingEnabled = false;
  private abTarget = -1.0;
  private readonly ddc: DdcDisplays;
  private saveBrightnessId = 0;
  private inhibitUpdates = false;
  private globalScaleChanged = false;

  constructor() {
    super();

    const powerSettings = new Gio.Settings({ schema_id: POWER_SCHEMA });
    this.dimmingTarget = powerSettings.get_int('idle-brightness') / 100;

    const keybindings: [string, () => void][] = [
      ['screen-brightness-up', () => this.globalScaleValue?.stepUp()],
      ['screen-brightness-up-monitor', () => this.currentMonitorScale()?.stepUp()],
      ['screen-brightness-down', () => this.globalScaleValue?.stepDown()],
      ['screen-brightness-down-monitor', () => this.currentMonitorScale()?.stepDown()],
      ['screen-brightness-cycle', () => this.globalScaleValue?.cycleUp()],
      ['screen-brightness-cycle-monitor', () => this.currentMonitorScale()?.cycleUp()],
    ];
    for (const [name, handler] of keybindings) {
      Main.wm.addKeybinding(name, new Gio.Settings({ schema_id: KEYBINDING_SCHEMA }),
        Meta.KeyBindingFlags.NONE, Shell.ActionMode.ALL, handler);
    }

    this.ddc = new DdcDisplays(() => this.rebuildScales());

    global.backend.get_monitor_manager().connectObject('monitors-changed', () => this.monitorsChanged(), this);
    this.monitorsChanged();
  }

  get dimming(): boolean {
    return this.dimmingEnabled;
  }

  set dimming(enable: boolean) {
    this.dimmingEnabled = enable;
    this.sync();
  }

  get autoBrightnessTarget(): number {
    return this.abTarget;
  }

  set autoBrightnessTarget(target: number) {
    this.abTarget = target;
    this.sync();
  }

  get globalScale(): BrightnessScale | null {
    return this.globalScaleValue;
  }

  get scales(): MonitorScale[] {
    return [...this.monitorScales.values()];
  }

  private currentMonitorScale(): MonitorScale | undefined {
    return this.monitorScales.get(global.backend.get_current_logical_monitor()!);
  }

  private saveBrightnesses(): void {
    if (this.saveBrightnessId) GLib.source_remove(this.saveBrightnessId);

    this.saveBrightnessId = GLib.timeout_add_once(GLib.PRIORITY_DEFAULT, 300, () => {
      this.saveBrightnessId = 0;

      let values = loadState();

      for (const scale of this.monitorScales.values()) {
        const mId = MonitorId.fromMonitor(scale.monitor);

        values = values.filter(v => !v.id.equalsExact(mId));
        values.push({ id: mId, brightness: scale.value });
      }

      storeState(values);
    });
  }

  private monitorsChanged(): void {
    const withoutBacklight = global.backend.get_monitor_manager()
      .get_logical_monitors()!
      .filter(lm => activeBacklights(lm).length === 0);
    this.ddc.detect(withoutBacklight.flatMap(lm => lm.get_monitors().filter(m => m.is_active())));
    this.rebuildScales();
  }

  private createScale(monitor: Meta.LogicalMonitor, brightnesses: Map<Meta.LogicalMonitor, number>): MonitorScale | null {
    if (activeBacklights(monitor).length > 0) return new BacklightBrightnessScale(monitor, brightnesses.get(monitor));
    const displays = this.ddc.displaysFor(monitor);
    return displays.length > 0 ? new DdcBrightnessScale(monitor, displays) : null;
  }

  private rebuildScales(): void {
    const monitors = global.backend.get_monitor_manager().get_logical_monitors()!;

    this.monitorScales.values().forEach(scale => scale.destroy());
    this.monitorScales.clear();

    const brightnesses = savedBrightnesses(monitors);

    for (const monitor of monitors) {
      const scale = this.createScale(monitor, brightnesses);
      if (!scale) continue;

      scale.connectObject(
        'backlights-changed', () => this.sync(),
        'notify::value', () => {
          if (this.inhibitUpdates) return;
          scale.scaleChanged = true;
          this.sync();
          this.emit('user-update');
        }, this);

      this.monitorScales.set(monitor, scale);
    }

    if (this.monitorScales.size === 0) {
      this.globalScaleValue = null;
    } else if (!this.globalScaleValue) {
      const maxSteps = Math.max(...this.scales.map(s => s.nSteps));
      const nSteps = Math.min(maxSteps, SCALE_VALUE_N_STEPS);

      this.globalScaleValue = new BrightnessScale(null, 1.0, nSteps);
      this.globalScaleValue.connect('notify::value', () => {
        if (this.inhibitUpdates) return;
        this.globalScaleChanged = true;
        this.sync();
        this.emit('user-update');
      });
    }

    this.sync({ showOSD: false });

    this.emit('changed');
  }

  private sync({ showOSD = true } = {}): void {
    if (!this.globalScaleValue) return;
    if (this.inhibitUpdates) return;
    this.inhibitUpdates = true;

    for (const scale of this.monitorScales.values()) {
      if (scale.syncWithBacklight()) this.dimmingEnabled = false;
    }

    const changedScales = this.scales.filter(s => {
      const changed = s.scaleChanged;
      s.scaleChanged = false;
      return changed;
    });

    let scalesUpdated = true;

    if (changedScales.length > 0) {
      const max = Math.max(...this.scales.map(s => s.value));

      if (max > 0.01) {
        for (const scale of this.monitorScales.values()) scale.updateScaleFactor(max);
      }

      this.globalScaleValue.value = max;

      if (showOSD) showBrightnessOSD(changedScales);
    } else if (this.globalScaleChanged) {
      this.globalScaleChanged = false;

      for (const scale of this.monitorScales.values()) scale.syncWithScale(this.globalScaleValue);

      if (showOSD) showBrightnessOSD(this.monitorScales.values());
    } else {
      scalesUpdated = false;
    }

    for (const scale of this.monitorScales.values()) {
      const target = this.abTarget >= 0.0
        ? clamp(this.abTarget + scale.value - 0.5, 0.0, 1.0)
        : scale.value;

      const max = this.dimmingEnabled ? this.dimmingTarget : 1.0;
      scale.setBacklight(Math.min(max, target));
    }

    if (scalesUpdated) this.saveBrightnesses();

    this.inhibitUpdates = false;
  }
}
