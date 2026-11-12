import type { Capability, Manifest } from '../types.js';

export const grantedCapabilities = (manifest: Manifest): Capability[] => [
  ...manifest.permissions ?? [], ...manifest.helper ? ['helper' as const] : [], ...manifest.shortcuts?.length ? ['shortcuts' as const] : [],
  ...manifest.network?.hosts.length ? ['network' as const] : [],
];

export const capabilityProperty = (capability: Capability) => capability.replace(/-(\w)/g, (_, letter: string) => letter.toUpperCase());
