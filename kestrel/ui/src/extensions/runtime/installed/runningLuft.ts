import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const UPDATER = 'com.lantharos.Updater1';
const UPDATER_PATH = '/com/lantharos/Updater1';
const VERSION_LABEL = 'org.opencontainers.image.version';
const BOOT_ID = '/proc/sys/kernel/random/boot_id';
const DEPLOYMENT = /(?:^|\s)(?:composefs|ostree)=(\S+)/;
const CALL_TIMEOUT = 30000;

interface Booted {
  image?: { imageDigest?: string; version?: string | null };
}

interface UpdaterStatus {
  host: { status: { booted: Booted | null } };
  configs: Record<string, { config?: { Labels?: Record<string, string> } }>;
}

const decoder = new TextDecoder();
const remembered = GLib.build_filenamev([GLib.get_user_state_dir(), 'kestrel', 'luft-version']);

function text(path: string): string | null {
  try {
    return decoder.decode(GLib.file_get_contents(path)[1]).trim();
  } catch {
    return null;
  }
}

const running = text('/proc/cmdline')?.match(DEPLOYMENT)?.[1] ?? text(BOOT_ID) ?? '';

export function rememberedLuftVersion(): string | null {
  const [deployment, version] = (text(remembered) ?? '').split(' ');
  return deployment === running && version ? version : null;
}

function bootedVersion({ host, configs }: UpdaterStatus): string | null {
  const image = host.status.booted?.image;
  return configs[image?.imageDigest ?? '']?.config?.Labels?.[VERSION_LABEL] ?? image?.version ?? null;
}

export async function askLuftVersion(): Promise<string | null> {
  try {
    const reply = await Gio.DBus.system.call(UPDATER, UPDATER_PATH, UPDATER, 'Status', null, null, Gio.DBusCallFlags.NONE, CALL_TIMEOUT, null);
    const version = bootedVersion(JSON.parse(reply.deepUnpack<[string]>()[0]) as UpdaterStatus);
    if (version) {
      GLib.mkdir_with_parents(GLib.path_get_dirname(remembered), 0o700);
      GLib.file_set_contents(remembered, `${running} ${version}`);
    }
    return version;
  } catch (error) {
    console.warn(`The version of Luft running couldn't be found: ${(error as Error).message}`);
    return null;
  }
}
