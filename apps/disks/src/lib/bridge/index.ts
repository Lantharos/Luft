import type { InvokeOptions } from '@lantharos/sabine';
import { activationToken } from '@luft/ui';
import { commands } from '#lib/bindings.js';

export const CANCELLED = 'cancelled';
export const WAIT: InvokeOptions = { timeoutMs: 2_147_483_647 };

export const openFolder = async (path: string) => commands.disksOpenFolder({ path, token: await activationToken() });
export const showInRover = async (path: string[]) => commands.spaceShow({ path, token: await activationToken() });
