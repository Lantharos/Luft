import { invoke } from '#lib/bridge/index.js';

export const clearHistory = () => invoke<void>('privacy_clear_history');
