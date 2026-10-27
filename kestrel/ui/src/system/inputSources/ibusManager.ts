import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type GObject from 'gi://GObject';
import IBus from 'gi://IBus';
import Shell from 'gi://Shell';

import { EventEmitter } from '../../core/runtime/signals.js';
import { logErrorUnlessCancelled } from '../../core/runtime/errorUtils.js';
import { PopupAnimation } from '../../shared/popups/boxpointer.js';
import { CandidatePopup } from './ibusCandidatePopup.js';
import * as Main from '../../core/main.js';

Gio._promisify(IBus.Bus.prototype, 'list_engines_async', 'list_engines_async_finish');
Gio._promisify(IBus.Bus.prototype, 'list_active_engines_async', 'list_active_engines_async_finish');
Gio._promisify(IBus.Bus.prototype, 'request_name_async', 'request_name_async_finish');
Gio._promisify(IBus.Bus.prototype, 'get_global_engine_async', 'get_global_engine_async_finish');
Gio._promisify(IBus.Bus.prototype, 'set_global_engine_async', 'set_global_engine_async_finish');
Gio._promisify(Shell, 'util_systemd_unit_exists');

const IBUS_SYSTEMD_SERVICE = 'org.freedesktop.IBus.session.generic.service';
const X11_ENVIRONMENT = ['DISPLAY', 'XAUTHORITY'];
const TYPING_BOOSTER_ENGINE = 'typing-booster';
const FALLBACK_ENGINE_ID = 'xkb:us::eng';
const ENGINES_SETTLE_MS = 200;
const MAX_INPUT_SOURCE_ACTIVATION_MS = 4000;
const PRELOAD_ENGINES_DELAY_S = 30;

function hasIBusVersion(major: number, minor: number, micro: number): boolean {
  return IBus.MAJOR_VERSION > major ||
    (IBus.MAJOR_VERSION === major && IBus.MINOR_VERSION > minor) ||
    (IBus.MAJOR_VERSION === major && IBus.MINOR_VERSION === minor && IBus.MICRO_VERSION >= micro);
}

if (!hasIBusVersion(1, 5, 2))
  throw new Error(`Found IBus version ${IBus.MAJOR_VERSION}.${IBus.MINOR_VERSION}.${IBus.MICRO_VERSION} but required is 1.5.2`);

export interface CursorLocation {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface IBusManagerSignals {
  'ready': (ready: boolean) => void;
  'engines-changed': () => void;
  'set-cursor-location': (location: CursorLocation) => void;
  'focus-in': () => void;
  'focus-out': () => void;
  'properties-registered': (engineName: string | null, props: IBus.PropList) => void;
  'property-updated': (engineName: string | null, prop: IBus.Property) => void;
  'set-content-type': (purpose: number, hints: number) => void;
}

class IBusManager extends EventEmitter {
  declare connect: GObject.SignalMethods<this, IBusManagerSignals>['connect'];
  declare emit: GObject.SignalMethods<this, IBusManagerSignals>['emit'];

  private readonly candidatePopup = new CandidatePopup();
  private readonly ibus: IBus.Bus;
  private panelService: IBus.PanelService | null = null;
  private currentCaret: CursorLocation | null = null;
  private engines = new Map<string, IBus.EngineDesc>();
  private ready = false;
  private registerPropertiesId = 0;
  private currentEngineName: string | null = null;
  private preloadEnginesId = 0;
  private enginesChangedId = 0;
  private nameOwnerChangedId = 0;
  private connection: Gio.DBusConnection | null = null;
  private cancellable: Gio.Cancellable | null = null;
  private ibusIsSystemdService = false;
  private oskCompletion = false;
  private preOskEngine: string | null = null;

  constructor() {
    super();
    IBus.init();
    this.ibus = IBus.Bus.new_async();
    this.ibus.connect('connected', () => this.onConnected());
    this.ibus.connect('disconnected', () => this.clear());
    this.ibus.set_watch_ibus_signal(true);
    this.ibus.connect('global-engine-changed', (_bus, engineName) => this.engineChanged(engineName));
    this.queueSpawn();
  }

  get caret(): CursorLocation | null {
    return this.currentCaret;
  }

  private async systemdServiceExists(): Promise<boolean> {
    if (this.ibusIsSystemdService) return true;
    try {
      this.ibusIsSystemdService = await Shell.util_systemd_unit_exists(IBUS_SYSTEMD_SERVICE, null);
    } catch {
      this.ibusIsSystemdService = false;
    }
    return this.ibusIsSystemdService;
  }

  private async queueSpawn(): Promise<void> {
    if (Main.sessionMode.isGreeter) return;
    if (!await this.systemdServiceExists()) this.spawn([]);
  }

  private spawn(extraArgs: string[]): void {
    try {
      const cmdLine = ['ibus-daemon', '--panel', 'disable', ...extraArgs];
      const env = global.create_app_launch_context(0, -1).get_environment();
      const pid = Shell.util_spawn_async(null, cmdLine, env, GLib.SpawnFlags.SEARCH_PATH | GLib.SpawnFlags.DO_NOT_REAP_CHILD);
      GLib.child_watch_add(GLib.PRIORITY_DEFAULT, pid, () => GLib.spawn_close_pid(pid));
    } catch (e) {
      log(`Failed to launch ibus-daemon: ${(e as Error).message}`);
    }
  }

  async restartDaemon(extraArgs: string[] = []): Promise<void> {
    if (await this.systemdServiceExists()) await this.restartSystemdService(extraArgs);
    else this.spawn(['-r', ...extraArgs]);
  }

  private async restartSystemdService(extraArgs: string[]): Promise<void> {
    const x11 = X11_ENVIRONMENT.filter(name => GLib.getenv(name));
    const environment = [
      `IBUS_DAEMON_ARGS=${['--panel', 'disable', ...extraArgs].join(' ')}`,
      ...x11.map(name => `${name}=${GLib.getenv(name)}`),
    ];
    const unset = X11_ENVIRONMENT.filter(name => !x11.includes(name));
    try {
      await this.callSystemd('UnsetAndSetEnvironment', new GLib.Variant('(asas)', [unset, environment]));
      await this.callSystemd('RestartUnit', new GLib.Variant('(ss)', [IBUS_SYSTEMD_SERVICE, 'replace']));
    } catch (e) {
      logError(e as Error, 'Failed to restart the input method service');
    }
  }

  private callSystemd(method: string, parameters: GLib.Variant): Promise<GLib.Variant> {
    return Gio.DBus.session.call(
      'org.freedesktop.systemd1', '/org/freedesktop/systemd1', 'org.freedesktop.systemd1.Manager',
      method, parameters, null, Gio.DBusCallFlags.NONE, -1, null);
  }

  private clear(): void {
    this.cancellable?.cancel();
    this.cancellable = null;
    if (this.preloadEnginesId) {
      GLib.source_remove(this.preloadEnginesId);
      this.preloadEnginesId = 0;
    }
    this.panelService?.destroy();
    if (this.enginesChangedId) {
      GLib.source_remove(this.enginesChangedId);
      this.enginesChangedId = 0;
    }
    if (this.nameOwnerChangedId) {
      this.connection!.signal_unsubscribe(this.nameOwnerChangedId);
      this.nameOwnerChangedId = 0;
    }
    this.panelService = null;
    this.currentCaret = null;
    this.candidatePopup.setPanelService(null);
    this.engines.clear();
    this.ready = false;
    this.registerPropertiesId = 0;
    this.currentEngineName = null;
    this.emit('ready', false);
  }

  private onConnected(): void {
    const cancellable = new Gio.Cancellable();
    this.cancellable = cancellable;
    this.connection = this.ibus.get_connection();
    this.nameOwnerChangedId = this.connection.signal_subscribe(null,
      'org.freedesktop.DBus', 'NameOwnerChanged', '/org/freedesktop/DBus',
      null, Gio.DBusSignalFlags.NONE, (_connection, _sender, _path, _iface, _signal, parameters) => this.nameOwnerChanged(parameters));
    this.initEngines(cancellable);
    this.initPanelService(cancellable);
  }

  private async listEngines(cancellable: Gio.Cancellable | null): Promise<Map<string, IBus.EngineDesc>> {
    const [installed, registered] = await Promise.all([
      this.ibus.list_engines_async(-1, cancellable),
      this.ibus.list_active_engines_async(-1, cancellable),
    ]);
    return new Map([...installed, ...registered].map(engine => [engine.get_name(), engine]));
  }

  private async initEngines(cancellable: Gio.Cancellable): Promise<void> {
    try {
      this.engines = await this.listEngines(cancellable);
      this.updateReadiness();
    } catch (e) {
      if (logErrorUnlessCancelled(e)) this.clear();
    }
  }

  private nameOwnerChanged(parameters: GLib.Variant): void {
    const [name] = parameters.deepUnpack<[string, string, string]>();
    if (name.startsWith(':') || this.enginesChangedId) return;
    this.enginesChangedId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, ENGINES_SETTLE_MS, () => {
      this.enginesChangedId = 0;
      this.refreshEngines(this.cancellable);
      return GLib.SOURCE_REMOVE;
    });
  }

  private async refreshEngines(cancellable: Gio.Cancellable | null): Promise<void> {
    const names = (engines: Map<string, IBus.EngineDesc>) => [...engines.keys()].sort().join();
    try {
      const engines = await this.listEngines(cancellable);
      if (names(engines) === names(this.engines)) return;
      this.engines = engines;
      this.emit('engines-changed');
    } catch (e) {
      logErrorUnlessCancelled(e);
    }
  }

  private async initPanelService(cancellable: Gio.Cancellable): Promise<void> {
    try {
      await this.ibus.request_name_async(IBus.SERVICE_PANEL, IBus.BusNameFlag.REPLACE_EXISTING, -1, cancellable);
    } catch (e) {
      if (logErrorUnlessCancelled(e)) this.clear();
      return;
    }

    const panelService = new IBus.PanelService({ connection: this.ibus.get_connection(), object_path: IBus.PATH_PANEL });
    this.panelService = panelService;
    this.candidatePopup.setPanelService(panelService);
    panelService.connect('update-property', (_panel, prop) => this.emit('property-updated', this.currentEngineName, prop));
    panelService.connect('set-cursor-location', (_panel, x, y, width, height) => {
      const cursorLocation = { x, y, width, height };
      this.currentCaret = cursorLocation;
      this.emit('set-cursor-location', cursorLocation);
    });
    panelService.connect('focus-in', (_panel, path) => {
      this.currentCaret = null;
      if (!GLib.str_has_suffix(path, '/InputContext_1')) this.emit('focus-in');
    });
    panelService.connect('focus-out', () => {
      this.currentCaret = null;
      this.emit('focus-out');
    });
    if (hasIBusVersion(1, 5, 10))
      panelService.connect('set-content-type', (_panel, purpose, hints) => this.emit('set-content-type', purpose, hints));
    this.updateReadiness();

    try {
      const engine = await this.ibus.get_global_engine_async(-1, cancellable);
      this.engineChanged(engine.get_name());
    } catch {
    }
  }

  private updateReadiness(): void {
    this.ready = this.engines.size > 0 && this.panelService != null;
    this.emit('ready', this.ready);
  }

  private engineChanged(engineName: string): void {
    if (!this.ready) return;
    this.currentEngineName = engineName;
    this.candidatePopup.close(PopupAnimation.NONE);
    if (this.registerPropertiesId !== 0) return;

    const panelService = this.panelService!;
    this.registerPropertiesId = panelService.connect('register-properties', (_panel, props) => {
      if (!props.get(0)) return;
      panelService.disconnect(this.registerPropertiesId);
      this.registerPropertiesId = 0;
      this.emit('properties-registered', this.currentEngineName, props);
    });
  }

  activateProperty(key: string, state: IBus.PropState): void {
    this.panelService!.property_activate(key, state);
  }

  getEngineDesc(id: string): IBus.EngineDesc | null {
    if (!this.ready) return null;
    return this.engines.get(id) ?? null;
  }

  private async applyEngine(id: string): Promise<void> {
    if (!this.ready) return;
    const cancellable = this.cancellable;
    try {
      await this.ibus.set_global_engine_async(id, MAX_INPUT_SOURCE_ACTIVATION_MS, cancellable);
    } catch (e) {
      if (!logErrorUnlessCancelled(e)) return;
      try {
        await this.ibus.set_global_engine_async(FALLBACK_ENGINE_ID, MAX_INPUT_SOURCE_ACTIVATION_MS, cancellable);
      } catch (e2) {
        logErrorUnlessCancelled(e2);
      }
    }
  }

  async setEngine(id: string): Promise<void> {
    if (this.oskCompletion) await this.updateCompletion(id);
    else await this.applyEngine(id);
  }

  private async updateCompletion(id: string): Promise<void> {
    this.preOskEngine = id;
    if (!id.startsWith('xkb:')) await this.setCompletionEnabled(false);
  }

  preloadEngines(ids: string[]): void {
    if (!this.ready) return;
    if (!ids.includes(TYPING_BOOSTER_ENGINE)) ids.push(TYPING_BOOSTER_ENGINE);
    if (this.preloadEnginesId !== 0) GLib.source_remove(this.preloadEnginesId);
    this.preloadEnginesId = GLib.timeout_add_seconds_once(GLib.PRIORITY_DEFAULT, PRELOAD_ENGINES_DELAY_S, () => {
      this.ibus.preload_engines_async(ids, -1, this.cancellable, null);
      this.preloadEnginesId = 0;
    });
  }

  async setCompletionEnabled(enabled: boolean): Promise<boolean> {
    if (enabled && !this.engines.has(TYPING_BOOSTER_ENGINE)) return false;
    if (enabled && !this.currentEngineName?.startsWith('xkb:')) return false;
    if (this.oskCompletion === enabled) return enabled;

    this.oskCompletion = enabled;
    if (enabled) {
      this.preOskEngine = this.currentEngineName;
      await this.applyEngine(TYPING_BOOSTER_ENGINE);
    } else if (this.preOskEngine) {
      await this.applyEngine(this.preOskEngine);
      this.preOskEngine = null;
    }
    return this.oskCompletion;
  }
}

export type { IBusManager };

let ibusManager: IBusManager | null = null;

export function getIBusManager(): IBusManager {
  ibusManager ??= new IBusManager();
  return ibusManager;
}
