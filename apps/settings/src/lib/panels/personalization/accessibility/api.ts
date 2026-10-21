import { invoke } from '#lib/bridge/index.js';

export const screenReaderInstalled = () => invoke<boolean>('accessibility_screen_reader');
