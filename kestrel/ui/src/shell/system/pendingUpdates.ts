import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { loadInterfaceXML } from '../runtime/fileUtils.js';

export const UpdateAction = {
  REBOOT: 'reboot',
  POWER_OFF: 'power-off',
} as const;

export type UpdateAction = typeof UpdateAction[keyof typeof UpdateAction];

const COMPOSEFS_ROOT = /(^|\s)composefs(\.digest)?=/;
const VERSION_LABEL = 'org.opencontainers.image.version';

const UPDATER = 'com.lantharos.Updater1';
const UPDATER_PATH = '/com/lantharos/Updater1';
const CALL_TIMEOUT = 10000;

interface OfflineUpdatesRemote {
  readonly UpdateTriggered: boolean | null;
  readonly UpdatePrepared: boolean | null;
  TriggerAsync(action: UpdateAction): Promise<[]>;
  CancelAsync(): Promise<[]>;
}

type OfflineUpdatesProxy = Gio.DBusProxy & OfflineUpdatesRemote;

const OfflineUpdatesProxy = Gio.DBusProxy.makeProxyWrapper(loadInterfaceXML('org.freedesktop.PackageKit.Offline')) as unknown as {
  newAsync(bus: Gio.DBusConnection, name: string, path: string): Promise<OfflineUpdatesProxy>;
};

export interface PendingUpdates {
  readonly scheduled: boolean;
  readonly prepared: boolean;
  readonly switching: boolean;
  readonly version: string | null;
  installThroughRestart(action: UpdateAction): Promise<boolean>;
  skip(): Promise<void>;
}

class OfflineUpdates implements PendingUpdates {
  readonly scheduled: boolean;
  readonly prepared: boolean;
  readonly switching = false;
  readonly version = null;

  constructor(private readonly proxy: OfflineUpdatesProxy) {
    this.scheduled = proxy.UpdateTriggered ?? false;
    this.prepared = !this.scheduled && (proxy.UpdatePrepared ?? false);
  }

  static async load(): Promise<OfflineUpdates | null> {
    const proxy = await OfflineUpdatesProxy.newAsync(Gio.DBus.system, 'org.freedesktop.PackageKit', '/org/freedesktop/PackageKit');
    return proxy.g_name_owner === null ? null : new OfflineUpdates(proxy);
  }

  async installThroughRestart(action: UpdateAction): Promise<boolean> {
    await this.proxy.TriggerAsync(action);
    return true;
  }

  async skip(): Promise<void> {
    await this.proxy.CancelAsync();
  }
}

function startedFromImage(): boolean {
  const [, commandLine] = GLib.file_get_contents('/proc/cmdline');
  return COMPOSEFS_ROOT.test(new TextDecoder().decode(commandLine));
}

async function callUpdater<T>(method: string, flags = Gio.DBusCallFlags.NONE): Promise<T> {
  const reply = await Gio.DBus.system.call(UPDATER, UPDATER_PATH, UPDATER, method, null, null, flags, CALL_TIMEOUT, null);
  return reply.deepUnpack<T>();
}

interface ImageReference {
  image?: { image?: string };
  imageDigest?: string;
  version?: string | null;
}

interface Deployment {
  downloadOnly: boolean;
  image?: ImageReference;
}

interface UpdaterStatus {
  host: { status: { staged: Deployment | null; booted: Deployment | null } };
  configs: Record<string, { config?: { Labels?: Record<string, string> } }>;
}

const followedImage = (deployment: Deployment | null): string | null => deployment?.image?.image?.image ?? null;

class StagedImage implements PendingUpdates {
  readonly scheduled: boolean;
  readonly prepared: boolean;
  readonly switching: boolean;

  constructor(staged: Deployment, booted: Deployment | null, readonly version: string | null) {
    this.scheduled = !staged.downloadOnly;
    this.prepared = staged.downloadOnly;
    this.switching = followedImage(staged) !== followedImage(booted);
  }

  static async load(): Promise<StagedImage | null> {
    const [json] = await callUpdater<[string]>('Status');
    const { host, configs }: UpdaterStatus = JSON.parse(json);
    const { staged, booted } = host.status;
    if (!staged) return null;
    const label = configs[staged.image?.imageDigest ?? '']?.config?.Labels?.[VERSION_LABEL];
    return new StagedImage(staged, booted, label ?? staged.image?.version ?? null);
  }

  async installThroughRestart(): Promise<boolean> {
    await callUpdater('Apply', Gio.DBusCallFlags.ALLOW_INTERACTIVE_AUTHORIZATION);
    return false;
  }

  async skip(): Promise<void> {}
}

export async function loadPendingUpdates(): Promise<PendingUpdates | null> {
  try {
    if (startedFromImage()) return await StagedImage.load();
    return await OfflineUpdates.load();
  } catch (error) {
    log(`Pending updates: ${(error as Error).message}`);
    return null;
  }
}
