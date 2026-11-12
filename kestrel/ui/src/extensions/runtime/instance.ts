import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { locale } from '../../shared/i18n/index.js';
import type { ExtensionHost } from '../host.js';
import { API_VERSIONS } from '../api/versions.js';
import type { ApiContext } from '../api/v1/core/context.js';
import { grantedCapabilities } from '../api/v1/core/granted.js';
import type { Manifest } from '../api/v1/types.js';
import { OpenPopups } from '../api/v1/ui/popups/popups.js';
import type { EffectsStage } from '../api/v1/visuals/screenEffects/stage.js';
import type { LayerStage } from '../api/v1/visuals/wallpaper/stage.js';
import { HostConnection } from '../sandbox/shell/connection.js';
import type { Api } from '../sandbox/shell/served.js';
import { dataFolder, type Installed } from './installed/folders.js';
import { Gestures } from './gestures.js';
import { ExtensionPage } from './page.js';
import { MODULE } from './layout.js';
import { Scope } from './scope.js';
import type { GrabbedShortcuts } from './shortcuts.js';
import { StoredValues } from './storage.js';
import type { ExtensionStore } from './store.js';
import { Translations } from './translations.js';
import { SettingValues } from './values.js';

export interface RuntimeServices {
  readonly host: ExtensionHost;
  readonly store: ExtensionStore;
  readonly layers: LayerStage;
  readonly screenEffects: EffectsStage;
  snapshotPath(id: string): string;
  failed(id: string, error: unknown): void;
  readonly desktopReady: Promise<void>;
  openSettings(id: string): void;
  pageChanged(id: string): void;
}

type Enable = (extension: object) => unknown;

export class ExtensionInstance {
  readonly values: SettingValues;
  readonly translations: Translations;
  readonly stored: StoredValues;
  readonly gestures = new Gestures();
  readonly shortcuts: { current: GrabbedShortcuts | null } = { current: null };
  readonly page: ExtensionPage;
  private scope: Scope | null = null;
  private readonly helpers = new Set<Gio.Subprocess>();

  constructor(readonly installed: Installed & { manifest: Manifest }, private readonly services: RuntimeServices) {
    this.values = new SettingValues(installed.id, installed.manifest.settings ?? [], services.store);
    this.translations = new Translations(installed.path, locale());
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

  async start(): Promise<void> {
    if (this.scope) return;
    const scope = this.scope = new Scope(error => this.services.failed(this.id, error));
    try {
      if (this.installed.inShell) await this.runInShell(scope);
      else await this.runSandboxed(scope);
    } catch (error) {
      if (this.scope !== scope) return;
      this.stop();
      throw error;
    }
  }

  private async runInShell(scope: Scope): Promise<void> {
    const enable = await this.load();
    if (this.scope !== scope) return;
    await enable(API_VERSIONS[this.manifest.api](this.context(scope)));
  }

  private async runSandboxed(scope: Scope): Promise<void> {
    await this.services.desktopReady;
    if (this.scope !== scope) return;
    const context = this.context(scope);
    const api = API_VERSIONS[this.manifest.api](context) as Api;
    const host = new HostConnection(api, context, new Set(grantedCapabilities(this.manifest)), error => this.services.failed(this.id, error));
    scope.disposable(() => host.stop());
    await host.start();
  }

  private context(scope: Scope): ApiContext {
    const gestures = this.gestures;
    return {
      manifest: this.manifest, name: this.name, path: this.installed.path, dataPath: dataFolder(this.id), host: this.services.host, scope,
      translations: this.translations, values: this.values, stored: this.stored, store: this.services.store, shortcuts: this.shortcuts, gestures, popups: new OpenPopups(), page: this.page, layers: this.services.layers, screenEffects: this.services.screenEffects, helpers: this.helpers, chosen: new Set(),
      openSettings: () => this.services.openSettings(this.id),
      fromPerson: callback => (...args) => scope.run(() => {
        gestures.used();
        return callback(...args);
      }),
    };
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
