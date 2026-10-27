import type { Passkey } from '#lib/bindings.js';

export const siteLabel = (passkey: Passkey) => passkey.siteName || passkey.site;
export const accountLabel = (passkey: Passkey) => passkey.nickname || passkey.account || passkey.displayName;
