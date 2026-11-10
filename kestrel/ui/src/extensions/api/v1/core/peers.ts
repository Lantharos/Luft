import type { ApiContext } from './context.js';
import type { Peers, Stored } from '../types.js';

type Answer = (value: Stored, from: string) => unknown;

const answering = new Map<string, Map<string, Answer>>();
const listeners = new Set<() => void>();

const changed = () => [...listeners].forEach(listener => listener());
const copy = (value: unknown): Stored | undefined => value === undefined ? undefined : JSON.parse(JSON.stringify(value)) as Stored;

export function peersApi({ manifest, scope }: ApiContext): Peers {
  return {
    handle: (name, answer) => {
      const own = answering.get(manifest.id) ?? new Map<string, Answer>();
      answering.set(manifest.id, own);
      const guarded: Answer = (value, from) => scope.run(() => answer(value, from));
      own.set(name, guarded);
      changed();
      return scope.disposable(() => {
        if (own.get(name) !== guarded) return;
        own.delete(name);
        if (!own.size) answering.delete(manifest.id);
        changed();
      });
    },
    handles: (id, name) => !!answering.get(id)?.has(name),
    request: async (id, name, value = null) => {
      const answer = answering.get(id)?.get(name);
      if (!answer) throw new Error(`${id} doesn't answer ${name}`);
      return copy(await answer(copy(value)!, manifest.id));
    },
    onChanged: listener => {
      const guarded = scope.guard(listener);
      listeners.add(guarded);
      return scope.disposable(() => listeners.delete(guarded));
    },
  };
}
