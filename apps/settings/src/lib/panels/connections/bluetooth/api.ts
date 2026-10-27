import { commands } from '#lib/bindings.js';

const PAIRING_TIMEOUT = 120_000;
const WAIT_FOR_PERSON = 300_000;

export const pair = (device: string) => commands.bluetoothPair({ device }, { timeoutMs: PAIRING_TIMEOUT });
export const importFromWindows = () => commands.bluetoothImportWindows({ timeoutMs: WAIT_FOR_PERSON });

