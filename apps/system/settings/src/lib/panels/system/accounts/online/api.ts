import { activationToken } from '@luft/ui';
import { commands } from '#lib/bindings.js';

export const remove = (account: string, discardUnsynced: boolean) => commands.accountsRemove({ account, discardUnsynced }, { timeoutMs: 600_000 });
export const openAddress = async (url: string) => commands.accountsOpen({ url, token: await activationToken() });
