import { activationToken } from '@luft/ui';
import { commands } from '#lib/bindings.js';

export const openKeys = async (link: string) => commands.keyboardOpenKeys({ link, token: await activationToken() });
