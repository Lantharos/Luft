import { commands } from '#lib/bindings.js';
import type { StoreName, Value } from '#lib/bindings.js';

export const readStore = <T>(name: StoreName) => commands.storeRead({ name }) as Promise<T | null>;
export const writeStore = (name: StoreName, value: unknown) => commands.storeWrite({ name, value: value as Value });
