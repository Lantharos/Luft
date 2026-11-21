import { activationToken } from '@luft/ui';
import { commands } from '#lib/bindings.js';

export const openLink = async (uri: string) => commands.openLink({ uri, token: await activationToken() });
