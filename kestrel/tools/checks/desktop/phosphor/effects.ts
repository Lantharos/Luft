import type Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

import {descendants} from '../../lib/actors.js';
import {call} from '../../lib/dbus.js';
import {request, install, installBuilt, setSetting} from '../../extensions/lib/extensions.js';

const PATH = '/com/lantharos/Kestrel/Extensions';
const IFACE = 'com.lantharos.Kestrel.Extensions';
export const PHOSPHOR = 'com.lantharos.Phosphor';
export const SHADERS = 'com.example.Shaders';

export interface Handle {
  problem: string | null;
  set(name: string, ...values: number[]): void;
  dispose(): void;
}

export interface Shaders {
  problems: {label: string; problem: string; detail: string}[];
  check(source: {kind: string; shader: string}): string | null;
  windowShader(shader: string): Handle;
  overlay(shader: string): Handle;
  filter(shader: string, options?: object): Handle;
  surfaces(shader: string, surfaces: string[]): Handle;
  transition(shader: string, kinds: string[], duration: number): Handle;
  turnBackOn(): void;
  off(): boolean;
}

export const shaders = () => (globalThis as {shaders?: Shaders}).shaders!;
export const shadersRun = () => !!(globalThis as {shaders?: Shaders}).shaders?.check;

export async function installProbes() {
  install('shaders', SHADERS);
  await request('Reload', SHADERS);
  await installBuilt(PHOSPHOR);
}

const value = (input: boolean | number | string | string[]) => {
  if (typeof input === 'boolean') return new GLib.Variant('b', input);
  if (typeof input === 'number') return new GLib.Variant('d', input);
  return typeof input === 'string' ? new GLib.Variant('s', input) : new GLib.Variant('as', input);
};

interface Section {items: {type?: string; title?: string; action?: string; options?: {value: string}[]; actions?: {label: string; action: string}[]}[]}

export async function pageItems() {
  const reply = await call('com.lantharos.Kestrel', PATH, IFACE, 'Page', new GLib.Variant('(s)', [PHOSPHOR]), '(s)');
  return (JSON.parse(reply.deepUnpack<[string]>()[0]) as Section[]).flatMap(section => section.items);
}

export const act = (action: string, value: GLib.Variant) => call('com.lantharos.Kestrel', PATH, IFACE, 'Act', new GLib.Variant('(ssv)', [PHOSPHOR, action, value]));

export const choose = (key: string, input: boolean | number | string | string[]) => setSetting(PHOSPHOR, key, value(input));

export function attachedEffects() {
  const views = global.stage.peek_stage_views().filter(view => view.get_filter());
  const overlays = descendants(global.window_group).filter(actor => actor.constructor.name.includes('Overlay'));
  const effects = [...descendants(global.stage)].flatMap((actor: Clutter.Actor) =>
    actor.get_effects().filter(effect => effect.constructor.name.startsWith('ExtensionWindow') || effect.constructor.name.startsWith('ExtensionSurface')));
  const layers = [...descendants(global.stage)].flatMap((actor: Clutter.Actor) => actor.get_effects().filter(effect => effect instanceof Shell.DesktopFilterEffect));
  return {views: views.length, overlays: overlays.length, effects: effects.length, layers: layers.length};
}

export const nothingAttached = () => {
  const {views, overlays, effects, layers} = attachedEffects();
  return views + overlays + effects + layers === 0;
};
