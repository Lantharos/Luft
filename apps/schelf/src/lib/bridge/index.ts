import { activationToken } from '@luft/ui';
import { commands } from '#lib/bindings.js';

export const SLOW = { timeoutMs: 300_000 };

export const launch = async (desktop: string) => commands.libraryLaunch({ desktop, token: await activationToken() });
export const openUrl = async (url: string) => commands.appOpenUrl({ url, token: await activationToken() });
