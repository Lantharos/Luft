import { activationToken } from '@luft/ui';
import { commands } from '#lib/bindings.js';

const SLOW = { timeoutMs: 600_000 };

export const firmware = () => commands.updatesFirmware(SLOW);
export const openApps = async () => commands.updatesOpenApps({ token: await activationToken() });
