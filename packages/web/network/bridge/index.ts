import type { InvokeOptions } from '@lantharos/sabine';

import type { Security } from './bindings';

export * from './bindings';

export type Family = 'ipv4' | 'ipv6';
export type MacChoice = 'builtin' | 'random' | 'stable' | 'custom';

export const waitForPerson: InvokeOptions = { timeoutMs: 300_000 };

export const needsPassword = (security: Security) => security === 'psk' || security === 'sae' || security === 'wep';
