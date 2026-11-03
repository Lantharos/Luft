import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { onLocaleChanged } from '../../shared/i18n/index.js';
import { openSettings } from '../../system/settingsPages.js';
import type { SettingValue } from '../api/v1/types.js';
import { LayerStage } from '../api/v1/wallpaper/stage.js';
import type { ExtensionHost } from '../host.js';
import { CrashGuard } from './crashes.js';
import { discover, findOne, type Installed } from './folders.js';
import { ExtensionInstance, type RuntimeServices } from './instance.js';
import { noticeTurnedOff } from './notices.js';
import { ExtensionStore, type Problem, type ProblemKind } from './store.js';

const hasManifest = (installed: Installed): installed is Installed & { manifest: NonNullable<Installed['manifest']> } => !!installed.manifest;

/** Finds the installed extensions, runs the ones that are on, and keeps them in step with what the person chose. */
export class ExtensionManager {
  readonly store = new ExtensionStore();
  private readonly crashes = new CrashGuard();
  private readonly services: RuntimeServices;
  private installed: Installed[] = [];
  private readonly instances = new Map<string, ExtensionInstance>();
  private readonly listeners = new Set<() => void>();
  private readonly disconnectors: (() => void)[];
  private snapshots: string | null = null;
  private loads = 0;

  constructor(host: ExtensionHost) {
    this.services = {
      host,
      store: this.store,
      layers: new LayerStage(host),
      snapshotPath: id => GLib.build_filenamev([this.snapshots ??= GLib.dir_make_tmp('kestrel-extensions-XXXXXX'), `${id}-${++this.loads}.js`]),
      failed: (id, error) => this.failed(id, error),
      openSettings: id => openSettings(`extensions/${id}`),
    };
    const culprits = this.crashes.culprits;
    for (const id of culprits) this.keepOff(id, { kind: 'crash', detail: '' });
    this.disconnectors = [
      this.store.watchValues(id => {
        this.instances.get(id)?.settingsChanged();
        this.changed();
      }),
      this.store.watchStates(() => this.sync()),
      this.store.watchRemoved(() => this.rescan()),
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

  private changed(): void {
    for (const listener of [...this.listeners]) listener();
  }

  rescan(): void {
    this.installed = discover(this.store.removed);
    for (const id of [...this.instances.keys()].filter(id => !this.installed.some(installed => installed.id === id))) this.drop(id);
    for (const installed of this.installed.filter(hasManifest)) {
      const instance = this.instances.get(installed.id);
      if (instance?.installed.path === installed.path && instance.manifest.version === installed.manifest.version) continue;
      this.replace(installed);
    }
    this.sync();
  }

  reload(id: string): void {
    const found = findOne(id, this.store.removed);
    const previous = this.instances.get(id);
    if (found?.manifest && previous && this.store.problem(id) && previous.manifest.version !== found.manifest.version) {
      this.store.setProblem(id, null);
      this.store.setDisabled(id, false);
    }
    this.installed = [...this.installed.filter(installed => installed.id !== id), ...found ? [found] : []].sort((a, b) => a.id.localeCompare(b.id));
    if (found && hasManifest(found)) this.replace(found);
    else this.drop(id);
    this.sync();
  }

  enable(id: string): void {
    this.store.setProblem(id, null);
    this.store.setDisabled(id, false);
  }

  disable(id: string): void {
    this.store.setDisabled(id, true);
  }

  remove(id: string): void {
    const installed = this.installed.find(candidate => candidate.id === id);
    if (!installed) return;
    this.drop(id);
    if (installed.origin === 'user') removeFolder(installed.path);
    if (installed.origin === 'system' || installed.overrides) this.store.setRemoved(id, true);
    this.store.forgetValues(id);
    this.store.setProblem(id, null);
    this.store.setDisabled(id, false);
    this.rescan();
  }

  setSetting(id: string, key: string, value: SettingValue): void {
    const instance = this.instances.get(id);
    if (!instance) throw new Error(`${id} isn't installed`);
    instance.values.set(key, value);
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

function removeFolder(path: string): void {
  const remove = (file: Gio.File) => {
    if (file.query_file_type(Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null) === Gio.FileType.DIRECTORY) {
      const children = file.enumerate_children('standard::name', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);
      for (let info = children.next_file(null); info; info = children.next_file(null)) remove(file.get_child(info.get_name()));
    }
    file.delete(null);
  };
  remove(Gio.File.new_for_path(path));
}
