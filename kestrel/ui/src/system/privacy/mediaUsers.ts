import Gio from 'gi://Gio';
import Shell from 'gi://Shell';

import { t } from '../../shared/i18n/index.js';

type MediaKind = 'camera' | 'microphone';

export interface MediaUser {
  kind: MediaKind;
  node: number;
  name: string;
  app: Shell.App | null;
  muted: boolean;
}

interface DumpObject {
  id: number;
  type: string;
  info?: {
    props?: Record<string, string | number | boolean>;
    'output-node-id'?: number;
    'input-node-id'?: number;
    params?: { Props?: { mute?: boolean }[] };
  };
}

const SOURCES: Record<string, MediaKind> = { 'Video/Source': 'camera', 'Audio/Source': 'microphone' };
const LEVEL_METERS = ['com.lantharos.settings', 'org.gnome.VolumeControl', 'org.PulseAudio.pavucontrol'];
const DICTATION = 'com.lantharos.Speech';

function appFor(props: Record<string, string | number | boolean>): Shell.App | null {
  const portalId = props['pipewire.access.portal.app_id'];
  if (typeof portalId === 'string' && portalId)
    return Shell.AppSystem.get_default().lookup_app(`${portalId}.desktop`);
  const pid = Number(props['application.process.id']);
  return pid ? Shell.WindowTracker.get_default().get_app_from_pid(pid) : null;
}

export async function mediaUsers(ownDictation: boolean): Promise<MediaUser[]> {
  const process = Gio.Subprocess.new(['pw-dump'], Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_SILENCE);
  const [, stdout] = await new Promise<[boolean, string | null, string | null]>((resolve, reject) =>
    process.communicate_utf8_async(null, null, (_process, result) => {
      try { resolve(process.communicate_utf8_finish(result)); } catch (error) { reject(error); }
    }));
  const objects = JSON.parse(stdout ?? '[]') as DumpObject[];
  const nodes = new Map(objects.filter(object => object.type === 'PipeWire:Interface:Node').map(node => [node.id, node]));
  const users = new Map<string, MediaUser>();
  for (const link of objects.filter(object => object.type === 'PipeWire:Interface:Link')) {
    const source = nodes.get(link.info?.['output-node-id'] ?? -1);
    const consumer = nodes.get(link.info?.['input-node-id'] ?? -1);
    const kind = SOURCES[String(source?.info?.props?.['media.class'])];
    const props = consumer?.info?.props;
    const id = String(props?.['application.id']);
    if (!kind || !consumer || !props || LEVEL_METERS.includes(id) || (ownDictation && id === DICTATION)) continue;
    const app = appFor(props);
    users.set(`${kind}:${consumer.id}`, {
      kind, node: consumer.id, app,
      name: app?.get_name() ?? String(props['application.name'] ?? props['node.name'] ?? t('privacy-unknown-app')),
      muted: !!consumer.info?.params?.Props?.some(entry => entry.mute),
    });
  }
  return [...users.values()];
}

export function setMuted(user: MediaUser, muted: boolean): void {
  Gio.Subprocess.new(['wpctl', 'set-mute', `${user.node}`, muted ? '1' : '0'], Gio.SubprocessFlags.NONE);
}
