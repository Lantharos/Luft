import { invoke } from '#lib/bridge.js';

export const clearHistory = () => invoke<void>('privacy_clear_history');
