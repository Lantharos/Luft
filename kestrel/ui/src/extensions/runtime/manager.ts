import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { onLocaleChanged } from '../../shared/i18n/index.js';
import { openSettings } from '../../system/settingsPages.js';
import { runTurnedOffHelper } from '../api/v1/core/helper.js';
import { forgetSecrets } from '../api/v1/services/secrets.js';
import type { SettingValue } from '../api/v1/types.js';
import { EffectsStage } from '../api/v1/visuals/screenEffects/stage.js';
import { LayerStage } from '../api/v1/visuals/wallpaper/stage.js';
import type { ExtensionHost } from '../host.js';
import { CrashGuard } from './crashes.js';
import { dataFolder, discover, findOne, removeTree, type Installed } from './folders.js';
import { ExtensionInstance, type RuntimeServices } from './instance.js';
import { noticeTurnedOff } from './notices.js';
import { ExtensionStore, type Problem, type ProblemKind } from './store.js';

const hasManifest = (installed: Installed): installed is Installed & { manifest: NonNullable<Installed['manifest']> } => !!installed.manifest;

export class ExtensionManager {
  readonly store = new ExtensionStore();
  private readonly crashes = new CrashGuard();
  private readonly services: RuntimeServices;
  private installed: Installed[] = [];
  private readonly instances = new Map<string, ExtensionInstance>();
  private readonly listeners = new Set<() => void>();
  private readonly pageListeners = new Set<(id: string) => void>();
  private readonly disconnectors: (() => void)[];
  private snapshots: string | null = null;
  private loads = 0;

  constructor(host: ExtensionHost) {
    this.services = {
      host,
      store: this.store,
      layers: new LayerStage(host),
      screenEffects: new EffectsStage(host),
      snapshotPath: id => GLib.build_filenamev([this.snapshots ??= GLib.dir_make_tmp('kestrel-extensions-XXXXXX'), `${id}-${++this.loads}.js`]),
      failed: (id, error) => this.failed(id, error),
      openSettings: id => openSettings(`extensions/${id}`),
      pageChanged: id => this.pageListeners.forEach(listener => listener(id)),
    };
    const culprits = this.crashes.culprits;
    for (const id of culprits) this.keepOff(id, { kind: 'crash', detail: '' });
    this.disconnectors = [
      this.store.watchValues(id => {
        this.instances.get(id)?.settingsChanged();
        this.changed();
      }),
      this.store.watchStates(() => this.sync()),
      this.store.watchShortcuts(() => this.changed()),
      onLocaleChanged(() => this.restartAll()),
    ];
    this.rescan();
    for (const id of culprits) this.notice(id, 'crash');
  }

  get all(): readonly Installed[] {
    return this.installed;
  }

  instance(id: string): ExtensionInstance | null {
    return this.instances.get(id) ?? null;
  }

  watch(changed: () => void): () => void {
    this.listeners.add(changed);
    return () => this.listeners.delete(changed);
  }

  watchPages(changed: (id: string) => void): () => void {
    this.pageListeners.add(changed);
    return () => this.pageListeners.delete(changed);
  }

  private changed(): void {
    for (const listener of [...this.listeners]) listener();
  }

  rescan(): void {
    this.installed = discover();
    for (const id of [...this.instances.keys()].filter(id => !this.installed.some(installed => installed.id === id))) this.drop(id);
    for (const installed of this.installed.filter(hasManifest)) {
      const instance = this.instances.get(installed.id);
      if (instance?.installed.path === installed.path && instance.manifest.version === installed.manifest.version) continue;
      this.replace(installed);
    }
    this.sync();
  }

  reload(id: string): void {
    const found = findOne(id);
    const previous = this.instances.get(id);
    if (found?.manifest && previous && this.store.problem(id) && previous.manifest.version !== found.manifest.version) {
      this.store.setProblem(id, null);
      this.store.setDisabled(id, false);
    }
    this.installed = [...this.installed.filter(installed => installed.id !== id), ...found ? [found] : []].sort((a, b) => a.id.localeCompare(b.id));
    const current = this.installed.find(installed => installed.id === id);
    if (current && hasManifest(current)) this.replace(current);
    else this.drop(id);
    this.sync();
  }

  enable(id: string): void {
    this.store.setProblem(id, null);
    this.store.setDisabled(id, false);
  }

  disable(id: string): void {
    this.store.setDisabled(id, true);
    this.undoElsewhere(id);
  }

  remove(id: string): void {
    const installed = this.installed.find(candidate => candidate.id === id);
    if (!installed) return;
    this.undoElsewhere(id);
    this.erase(installed);
    this.rescan();
  }

  private undoElsewhere(id: string): void {
    const installed = this.installed.find(candidate => candidate.id === id);
    if (installed && hasManifest(installed)) runTurnedOffHelper(installed.path, installed.manifest);
  }

  private erase({ id, path }: Installed): void {
    this.instances.get(id)?.stored.forget();
    this.drop(id);
    removeTree(Gio.File.new_for_path(path));
    if (GLib.file_test(dataFolder(id), GLib.FileTest.IS_DIR)) removeTree(Gio.File.new_for_path(dataFolder(id)));
    forgetSecrets(id);
    this.store.forgetValues(id);
    this.store.forgetShortcuts(id);
    this.store.setProblem(id, null);
    this.store.setDisabled(id, false);
  }

  setSetting(id: string, key: string, value: SettingValue): void {
    this.installedInstance(id).values.set(key, value);
  }

  setShortcut(id: string, key: string, accelerators: string[] | null): void {
    if (!this.installedInstance(id).manifest.shortcuts?.some(shortcut => shortcut.key === key)) throw new Error(`${key} isn't a shortcut of ${id}`);
    this.store.setShortcut(id, key, accelerators);
  }

  private installedInstance(id: string): ExtensionInstance {
    const instance = this.instances.get(id);
    if (!instance) throw new Error(`${id} isn't installed`);
    return instance;
  }

  private replace(installed: Installed & { manifest: NonNullable<Installed['manifest']> }): void {
    this.drop(installed.id);
    this.instances.set(installed.id, new ExtensionInstance(installed, this.services));
  }

  private drop(id: string): void {
    this.instances.get(id)?.stop();
    this.instances.delete(id);
  }

  private restartAll(): void {
    for (const installed of this.installed.filter(hasManifest)) this.replace(installed);
    this.sync();
  }

  private sync(): void {
    const disabled = this.store.disabled;
    for (const instance of this.instances.values()) {
      const wanted = !disabled.has(instance.id);
      if (wanted && !instance.running) this.start(instance);
      else if (!wanted && instance.running) instance.stop();
    }
    this.crashes.running([...this.instances.values()].filter(instance => instance.running).map(instance => instance.id));
    this.changed();
  }

  private start(instance: ExtensionInstance): void {
    instance.start().then(() => this.changed(), error => {
      if (this.instances.get(instance.id) === instance) this.failed(instance.id, error);
    });
  }

  private failed(id: string, error: unknown): void {
    console.warn(`The extension ${id} failed and was turned off: ${error instanceof Error ? `${error.message}\n${error.stack}` : error}`);
    this.instances.get(id)?.stop();
    this.keepOff(id, { kind: 'error', detail: error instanceof Error ? error.message : String(error) });
    this.notice(id, 'error');
  }

  private keepOff(id: string, problem: Problem): void {
    this.store.setProblem(id, problem);
    this.store.setDisabled(id, true);
  }

  private notice(id: string, kind: ProblemKind): void {
    noticeTurnedOff(this.instances.get(id)?.name ?? id, kind, () => this.services.openSettings(id));
  }

  shutdown(): void {
    for (const disconnect of this.disconnectors) disconnect();
    for (const id of [...this.instances.keys()]) this.drop(id);
    if (this.snapshots) GLib.rmdir(this.snapshots);
  }
}
