import { invoke } from '#lib/bridge/index.js';

export const setLanguage = (language: string) => invoke<void>('region_set_language', { language });
