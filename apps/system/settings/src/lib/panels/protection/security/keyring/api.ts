import { commands } from '#lib/bindings.js';

const WAIT_FOR_PROMPT = { timeoutMs: 300_000 };

export const keyringAccess = () => commands.keyringAccess(WAIT_FOR_PROMPT);

export const unlock = () => commands.keyringUnlock(WAIT_FOR_PROMPT);
export const setPin = (enabled: boolean) => commands.keyringSetPin({ enabled }, WAIT_FOR_PROMPT);
export const reseal = () => commands.keyringReseal(WAIT_FOR_PROMPT);

export const forgetApp = (app: string) => commands.keyringForgetApp({ app }, WAIT_FOR_PROMPT);
export const clearHistory = () => commands.keyringClearHistory(WAIT_FOR_PROMPT);

export const generateKey = (name: string, chip: boolean) => commands.keyringSshGenerate({ name, chip }, WAIT_FOR_PROMPT);
