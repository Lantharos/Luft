import GLib from 'gi://GLib';

import { helperApi } from '../../api/v1/core/helper.js';
import { capabilityProperty, grantedCapabilities } from '../../api/v1/core/granted.js';
import type { Capability, SettingValue } from '../../api/v1/types.js';
import { MODULE } from '../../runtime/layout.js';
import { Scope } from '../../runtime/scope.js';
import { Translations } from '../../runtime/translations.js';
import type { Init } from '../protocol.js';
import { basicsApi, type HostContext, SettingsMirror } from './basics.js';
import { Link } from './link.js';
import { clipboardApi, doNotDisturbApi, locationApi, networkApi, shortcutsApi, weatherApi } from './services.js';
import { callsApi, inputSoundsApi, lockedSoundsApi, mediaApi, soundsApi } from './sound.js';
import { notificationsApi, popupsApi, quickSettingsApi, searchApi, taskbarApi } from './surfaces.js';

type Part = (context: HostContext) => unknown;

const PARTS: Partial<Record<Capability, Part>> = {
  'quick-settings': quickSettingsApi,
  'taskbar': taskbarApi,
  'search': searchApi,
  'notifications': notificationsApi,
  'weather': weatherApi,
  'location': locationApi,
  'media': mediaApi,
  'popups': popupsApi,
  'sounds': soundsApi,
  'calls': callsApi,
  'locked-sounds': lockedSoundsApi,
  'input-sounds': inputSoundsApi,
  'do-not-disturb': doNotDisturbApi,
  'clipboard': clipboardApi,
  'helper': context => helperApi({ ...context, helpers: new Set() }),
  'shortcuts': shortcutsApi,
  'network': networkApi,
};

const loop = new GLib.MainLoop(null, false);
let scope: Scope | null = null;
let settings: SettingsMirror | null = null;
const writing = new Set<Promise<unknown>>();

Object.assign(globalThis, { print: (...args: unknown[]) => console.log(...args) });

async function enable(init: Init): Promise<void> {
  const running = scope = new Scope(error => link.failed(error));
  const context: HostContext = {
    link, scope: running, manifest: init.manifest, path: init.path, dataPath: init.dataPath, translations: new Translations(init.path, init.locale), writing,
  };
  settings = new SettingsMirror(context, new Map(Object.entries(init.settings)));
  const extension: Record<string, unknown> = basicsApi(context, init, settings) as never;
  for (const capability of grantedCapabilities(init.manifest)) {
    const part = PARTS[capability];
    if (!part) throw new Error(`${capability} isn't available to extensions from your own folder`);
    extension[capabilityProperty(capability)] = part(context);
  }
  const module = await import(GLib.filename_to_uri(GLib.build_filenamev([init.path, MODULE]), null)) as { default?: unknown };
  if (typeof module.default !== 'function') throw new Error(`${MODULE} has no default export to call`);
  await (module.default as (extension: object) => unknown)(Object.freeze(extension));
}

async function disable(): Promise<void> {
  scope?.dispose();
  scope = null;
  await Promise.allSettled([...writing]);
  loop.quit();
}

const link = new Link({
  init: init => enable(init).then(() => link.ready(), error => link.failed(error)),
  setting: (key, value) => settings?.changed(key, value as SettingValue),
  disable: () => void disable(),
});

loop.run();
