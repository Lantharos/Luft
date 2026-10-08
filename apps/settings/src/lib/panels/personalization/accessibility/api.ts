import { invoke } from '#lib/bridge.js';

export const screenReaderInstalled = () => invoke<boolean>('accessibility_screen_reader');
