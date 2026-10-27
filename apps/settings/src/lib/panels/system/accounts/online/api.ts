import { activationToken } from '@luft/ui';
import { commands } from '#lib/bindings.js';

export const remove = (account: string) => commands.accountsRemove({ account }, { timeoutMs: 600_000 });
export const openAddress = async (url: string) => commands.accountsOpen({ url, token: await activationToken() });
