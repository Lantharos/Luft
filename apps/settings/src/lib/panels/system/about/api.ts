import { activationToken } from '@luft/ui';
import { commands } from '#lib/bindings.js';

export const openDisks = async () => commands.aboutOpenDisks({ token: await activationToken() });

export const removeSystem = async (id: string) => commands.aboutRemoveSystem({ id, token: await activationToken() });

