import { activationToken } from '@luft/ui';
import { commands } from '#lib/bindings.js';

export const openFont = async (file: string) => commands.appearanceFontOpen({ file, token: await activationToken() });
