import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { ExtensionHost } from '../host.js';
import { API_VERSIONS } from '../api/versions.js';
import type { Manifest } from '../api/v1/types.js';
import { OpenPanels } from '../api/v1/popups/popups.js';
import type { LayerStage } from '../api/v1/wallpaper/stage.js';
import { dataFolder, type Installed } from './folders.js';
import { Gestures } from './gestures.js';
import { ExtensionPage } from './page.js';
import { MODULE } from './manifest.js';
import { Scope } from './scope.js';
import type { GrabbedShortcuts } from './shortcuts.js';
import { StoredValues } from './storage.js';
import type { ExtensionStore } from './store.js';
import { Translations } from './translations.js';
import { measure, type Usage } from './usage.js';
import { SettingValues } from './values.js';

export interface RuntimeServices {
  readonly host: ExtensionHost;
  readonly store: ExtensionStore;
  readonly layers: LayerStage;
  /** A file name for this load of an extension's module, since a module loads only once per path. */
  snapshotPath(id: string): string;
  failed(id: string, error: unknown): void;
  openSettings(id: string): void;
  pageChanged(id: string): void;
}

type Enable = (extension: object) => unknown;

/** One installed extension with a valid manifest: its settings always, and its code while it runs. */
export class ExtensionInstance {
  readonly values: SettingValues;
  readonly translations: Translations;
  readonly stored: StoredValues;
  readonly gestures = new Gestures();
  readonly shortcuts: { current: GrabbedShortcuts | null } = { current: null };
  readonly page: ExtensionPage;
  private scope: Scope | null = null;
  private readonly helpers = new Set<Gio.Subprocess>();
  private startedAt = 0;

  constructor(readonly installed: Installed & { manifest: Manifest }, private readonly services: RuntimeServices) {
    this.values = new SettingValues(installed.id, installed.manifest.settings ?? [], services.store);
    this.translations = new Translations(installed.path);
    this.stored = new StoredValues(installed.id);
    this.page = new ExtensionPage(() => services.pageChanged(installed.id));
  }

  get id(): string {
    return this.installed.id;
  }

  get manifest(): Manifest {
    return this.installed.manifest;
  }

  get name(): string {
    return this.translations.has('extension-name') ? this.translations.t('extension-name') : this.manifest.name;
  }

  get description(): string {
    return this.translations.has('extension-description') ? this.translations.t('extension-description') : this.manifest.description ?? '';
  }

  get running(): boolean {
    return this.scope !== null;
  }

  usage(): Usage | null {
    return this.scope ? measure(this.scope.cpuMicros, this.startedAt, this.helpers) : null;
  }

  async start(): Promise<void> {
    if (this.scope) return;
    const scope = this.scope = new Scope(error => this.services.failed(this.id, error));
    this.startedAt = GLib.get_monotonic_time();
    try {
      const enable = await this.load();
      if (this.scope !== scope) return;
      const gestures = this.gestures;
      const api = API_VERSIONS[this.manifest.api]({
        manifest: this.manifest, name: this.name, path: this.installed.path, dataPath: dataFolder(this.id), host: this.services.host, scope,
        translations: this.translations, values: this.values, stored: this.stored, store: this.services.store, shortcuts: this.shortcuts, gestures, panels: new OpenPanels(), page: this.page, layers: this.services.layers, helpers: this.helpers,
        openSettings: () => this.services.openSettings(this.id),
        fromPerson: callback => (...args) => scope.run(() => {
          gestures.used();
          return callback(...args);
        }),
      });
      await enable(api);
    } catch (error) {
      if (this.scope === scope) this.stop();
      throw error;
    }
  }

  private async load(): Promise<Enable> {
    const snapshot = this.services.snapshotPath(this.id);
    Gio.File.new_for_path(GLib.build_filenamev([this.installed.path, MODULE])).copy(Gio.File.new_for_path(snapshot), Gio.FileCopyFlags.OVERWRITE, null, null);
    try {
      const module = await import(GLib.filename_to_uri(snapshot, null)) as { default?: unknown };
      if (typeof module.default !== 'function') throw new Error(`${MODULE} has no default export to call`);
      return module.default as Enable;
    } finally {
      GLib.unlink(snapshot);
    }
  }

  stop(): void {
    const scope = this.scope;
    this.scope = null;
    scope?.dispose();
    this.stored.flush();
  }

  settingsChanged(): void {
    this.values.refresh();
    this.page.changed();
  }
}
