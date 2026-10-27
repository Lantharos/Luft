import Gio from 'gi://Gio';

const VERSION_LABEL = 'org.opencontainers.image.version';

const UPDATER = 'com.lantharos.Updater1';
const UPDATER_PATH = '/com/lantharos/Updater1';
const CALL_TIMEOUT = 10000;

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

export class StagedImage {
  readonly scheduled: boolean;
  readonly prepared: boolean;
  readonly switching: boolean;

  constructor(staged: Deployment, booted: Deployment | null, readonly version: string | null) {
    this.scheduled = !staged.downloadOnly;
    this.prepared = staged.downloadOnly;
    this.switching = followedImage(staged) !== followedImage(booted);
  }

  async apply(): Promise<void> {
    await callUpdater('Apply', Gio.DBusCallFlags.ALLOW_INTERACTIVE_AUTHORIZATION);
  }
}

export async function loadStagedImage(): Promise<StagedImage | null> {
  try {
    const [json] = await callUpdater<[string]>('Status');
    const { host, configs }: UpdaterStatus = JSON.parse(json);
    const { staged, booted } = host.status;
    if (!staged) return null;
    const label = configs[staged.image?.imageDigest ?? '']?.config?.Labels?.[VERSION_LABEL];
    return new StagedImage(staged, booted, label ?? staged.image?.version ?? null);
  } catch (error) {
    log(`Staged image: ${(error as Error).message}`);
    return null;
  }
}
