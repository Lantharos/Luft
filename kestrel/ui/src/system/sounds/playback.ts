import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

export interface Sender {
  app: Shell.App | null;
  pid: number;
}

interface Playback {
  startedAt: number;
  lineage: number[];
  names: string[];
}

const REMEMBER_US = 2_000_000;
const decoder = new TextDecoder();

const recent: Playback[] = [];
const listeners = new Set<(playback: Playback) => void>();

function parentOf(pid: number): number {
  try {
    const stat = decoder.decode(GLib.file_get_contents(`/proc/${pid}/stat`)[1]);
    return Number(stat.slice(stat.lastIndexOf(')') + 2).split(' ')[1]);
  } catch {
    return 0;
  }
}

function lineageOf(pid: number): number[] {
  const lineage = [];
  for (let current = pid; current > 1; current = parentOf(current)) lineage.push(current);
  return lineage;
}

export function followPlayback(): void {
  Shell.Mixer.get_default().connect('playback-started', (_mixer, pid, appId, binary, name) => {
    const playback = {
      startedAt: GLib.get_monotonic_time(),
      lineage: lineageOf(pid),
      names: [appId, binary, name].filter(value => value !== null).map(value => value.toLowerCase()),
    };
    while (recent.length > 0 && recent[0].startedAt < playback.startedAt - REMEMBER_US) recent.shift();
    recent.push(playback);
    for (const listener of listeners) listener(playback);
  });
}

function namesOf(app: Shell.App): Set<string> {
  const id = app.get_id().replace(/\.desktop$/, '');
  return new Set([id, id.split('.').at(-1)!, app.get_name()].map(name => name.toLowerCase()));
}

function belongsTo(sender: Sender): (playback: Playback) => boolean {
  const pids = new Set([sender.pid, ...(sender.app?.get_pids() ?? [])].filter(pid => pid > 1));
  const names = sender.app ? namesOf(sender.app) : new Set<string>();
  return playback => playback.lineage.some(pid => pids.has(pid)) || playback.names.some(name => names.has(name));
}

export function unlessSenderPlays(sender: Sender, leadUs: number, waitMs: number, play: () => void): void {
  if (!sender.app && sender.pid <= 1) {
    play();
    return;
  }
  const isSenders = belongsTo(sender);
  const since = GLib.get_monotonic_time() - leadUs;
  if (recent.some(playback => playback.startedAt >= since && isSenders(playback))) return;

  const listener = (playback: Playback): void => {
    if (!isSenders(playback)) return;
    listeners.delete(listener);
    GLib.source_remove(timeout);
  };
  listeners.add(listener);
  const timeout = GLib.timeout_add(GLib.PRIORITY_DEFAULT, waitMs, () => {
    listeners.delete(listener);
    play();
    return GLib.SOURCE_REMOVE;
  });
}
