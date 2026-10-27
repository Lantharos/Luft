import { activationToken } from '@luft/ui';
import { commands } from '#lib/bindings.js';
import type { Engine } from '#lib/bindings.js';

export type EngineChoice = 'automatic' | Engine;

export const openHomepage = async (url: string) => commands.dictationOpenHomepage({ url, token: await activationToken() });
