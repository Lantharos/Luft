import { activationToken } from '@luft/ui';
import { commands } from '#lib/bindings.js';

export const openCursorFolder = async () => commands.appearanceCursorOpenFolder({ token: await activationToken() });
export const openStorePage = async (id: number) => commands.appearanceCursorOpenPage({ id, token: await activationToken() });
