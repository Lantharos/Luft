import { activationToken } from '@luft/ui';
import { commands } from '#lib/bindings.js';

export const SLOW = { timeoutMs: 300_000 };

export const openUrl = async (url: string) => commands.appOpenUrl({ url, token: await activationToken() });
