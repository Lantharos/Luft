import Gio from 'gi://Gio';
import type Shell from 'gi://Shell';

import { identifyProcess, verifiedApp } from '../../shared/apps/identity.js';
import { LEVEL_METERS } from '../../shared/apps/levelMeters.js';
import { runsProgram } from '../../shared/apps/luftApps.js';
import { t } from '../../shared/i18n/index.js';
import { statOf } from '../peek/access/processes.js';

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
const RECORDER = 'Stream/Input/Audio';

const PULSE_CLIENT = 'pipewire-pulse';

type Props = Record<string, string | number | boolean>;
type Consumer = { kind: 'level-meter' } | { kind: 'verified'; name: string; app: Shell.App | null; pid: number } | { kind: 'reported'; name: string };

function consumerOf(client: Props | undefined, stream: Props): Consumer {
  const pid = Number(client?.['pipewire.sec.pid'] ?? 0);
  const identity = client?.['client.api'] === PULSE_CLIENT ? null : identifyProcess(pid);
  if (!identity) return { kind: 'reported', name: String(stream['application.name'] ?? stream['node.name'] ?? t('privacy-unknown-app')) };
  if ('program' in identity && runsProgram(identity.program, LEVEL_METERS)) return { kind: 'level-meter' };
  return { kind: 'verified', pid, ...verifiedApp(identity) };
}

function dictates(pid: number, dictationPid: number): boolean {
  return !!dictationPid && !!pid && (pid === dictationPid || statOf(pid)?.parent === dictationPid);
}

export async function mediaUsers(dictationPid: number): Promise<MediaUser[]> {
  const process = Gio.Subprocess.new(['pw-dump'], Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_SILENCE);
  const [, stdout] = await new Promise<[boolean, string | null, string | null]>((resolve, reject) =>
    process.communicate_utf8_async(null, null, (_process, result) => {
      try { resolve(process.communicate_utf8_finish(result)); } catch (error) { reject(error); }
    }));
  const objects = JSON.parse(stdout ?? '[]') as DumpObject[];
  const nodes = new Map(objects.filter(object => object.type === 'PipeWire:Interface:Node').map(node => [node.id, node]));
  const clients = new Map(objects.filter(object => object.type === 'PipeWire:Interface:Client').map(client => [client.id, client.info?.props]));
  const linked = objects.filter(object => object.type === 'PipeWire:Interface:Link')
    .map(link => [SOURCES[String(nodes.get(link.info?.['output-node-id'] ?? -1)?.info?.props?.['media.class'])], nodes.get(link.info?.['input-node-id'] ?? -1)] as const);
  const recorders = [...nodes.values()].filter(node => node.info?.props?.['media.class'] === RECORDER).map(node => ['microphone', node] as const);
  const users = new Map<string, MediaUser>();
  for (const [kind, consumer] of [...linked, ...recorders]) {
    const props = consumer?.info?.props;
    if (!kind || !consumer || !props) continue;
    const user = consumerOf(clients.get(Number(props['client.id'])), props);
    if (user.kind === 'level-meter' || (user.kind === 'verified' && dictates(user.pid, dictationPid))) continue;
    users.set(`${kind}:${consumer.id}`, {
      kind, node: consumer.id,
      app: user.kind === 'verified' ? user.app : null,
      name: user.kind === 'verified' ? user.name : t('privacy-reported-app', { name: user.name }),
      muted: !!consumer.info?.params?.Props?.some(entry => entry.mute),
    });
  }
  return [...users.values()];
}

export function setMuted(user: MediaUser, muted: boolean): void {
  Gio.Subprocess.new(['wpctl', 'set-mute', `${user.node}`, muted ? '1' : '0'], Gio.SubprocessFlags.NONE);
}
