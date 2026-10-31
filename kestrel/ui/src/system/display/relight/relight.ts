import GLib from 'gi://GLib';

import { mutterCall, mutterObject } from '../../../portal/sharing/mutter.js';

const NAME = 'org.gnome.Mutter.DisplayConfig';
const DISPLAY_CONFIG = mutterObject(NAME, '/org/gnome/Mutter/DisplayConfig', NAME);
const STATE = '(ua((ssss)a(siiddada{sv})a{sv})a(iiduba(ssss)a{sv})a{sv})';
const TEMPORARY = 1;
const WAKE_RATE = 60;
const WAKE_MS = 2000;

type Properties = Record<string, unknown>;
type MonitorSpec = [connector: string, vendor: string, product: string, serial: string];
type Mode = [id: string, width: number, height: number, refresh: number, preferredScale: number, scales: number[], properties: Properties];
type MonitorState = [spec: MonitorSpec, modes: Mode[], properties: Properties];
type LogicalState = [x: number, y: number, scale: number, transform: number, primary: boolean, monitors: MonitorSpec[], properties: Properties];
type State = [serial: number, monitors: MonitorState[], logicalMonitors: LogicalState[], properties: Properties];
type Applied = Record<string, GLib.Variant>;
type AppliedLogical = [number, number, number, number, boolean, [string, string, Applied][]];

let relighting: Promise<string[]> | null = null;

async function currentState(): Promise<State> {
  return (await mutterCall(DISPLAY_CONFIG, 'GetCurrentState', null, STATE)).recursiveUnpack() as State;
}

function currentMode([, modes]: MonitorState): Mode | undefined {
  return modes.find(([, , , , , , properties]) => properties['is-current']);
}

function wakeMode(monitor: MonitorState): Mode | undefined {
  const current = currentMode(monitor);
  if (!current) return undefined;
  const [, width, height, refresh] = current;
  return monitor[1]
    .filter(([id, w, h, rate]) => id !== current[0] && w === width && h === height && rate < refresh)
    .sort((a, b) => Math.abs(a[3] - WAKE_RATE) - Math.abs(b[3] - WAKE_RATE))[0];
}

function layout([, monitors, logicalMonitors]: State, modeFor: (monitor: MonitorState) => Mode | undefined): AppliedLogical[] {
  return logicalMonitors.map(([x, y, scale, transform, primary, specs]) => [x, y, scale, transform, primary,
    specs.flatMap(([connector]) => {
      const monitor = monitors.find(([spec]) => spec[0] === connector);
      const mode = monitor && modeFor(monitor);
      return mode ? [[connector, mode[0], {}] as [string, string, Applied]] : [];
    })]);
}

async function apply(serial: number, logicalMonitors: AppliedLogical[], properties: Properties): Promise<void> {
  const layoutMode = properties['layout-mode'] as number | undefined;
  const applied: Applied = layoutMode === undefined ? {} : { 'layout-mode': new GLib.Variant('u', layoutMode) };
  await mutterCall(DISPLAY_CONFIG, 'ApplyMonitorsConfig',
    new GLib.Variant('(uua(iiduba(ssa{sv}))a{sv})', [serial, TEMPORARY, logicalMonitors, applied]));
}

function wait(milliseconds: number): Promise<void> {
  return new Promise(resolve => GLib.timeout_add(GLib.PRIORITY_DEFAULT, milliseconds, () => {
    resolve();
    return GLib.SOURCE_REMOVE;
  }));
}

async function relightIn(connectors: string[] | null): Promise<string[]> {
  const before = await currentState();
  const target = (monitor: MonitorState) => connectors === null || connectors.includes(monitor[0][0]);
  const relit = before[1].filter(monitor => target(monitor) && wakeMode(monitor)).map(([[connector]]) => connector);
  if (!relit.length) return relit;
  const restored = layout(before, currentMode);
  await apply(before[0], layout(before, monitor => (target(monitor) && wakeMode(monitor)) || currentMode(monitor)), before[3]);
  await wait(WAKE_MS);
  const [serial] = await currentState();
  await apply(serial, restored, before[3]);
  return relit;
}

/** Lights the given screens, or all of them, again through a slower mode of the same size, which brings back monitors that missed the first picture. */
export function relight(connectors: string[] | null = null): Promise<string[]> {
  relighting ??= relightIn(connectors).finally(() => { relighting = null; });
  return relighting;
}
