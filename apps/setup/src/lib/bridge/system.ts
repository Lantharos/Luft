import { activationToken } from '@luft/ui';
import { commands, type Hardware } from '#lib/bindings.js';

export const WAIT_FOR_PERSON = { timeoutMs: 300_000 };

export const NO_HARDWARE: Hardware = { nvidia: false, portable: false, onBattery: false, touchpad: false, fingerprint: false };

export const openDisks = async () => commands.sessionOpenDisks({ token: await activationToken() });
