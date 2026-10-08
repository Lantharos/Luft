import { invoke, listen } from '#lib/bridge.js';

export type Protection = 'chip' | 'password' | 'unavailable';

export interface Passkey {
	id: string;
	site: string;
	siteName: string;
	account: string;
	displayName: string;
	nickname: string;
	created: number;
	used: number;
	chip: boolean;
}

export interface Passkeys {
	protection: Protection;
	ready: boolean;
	passkeys: Passkey[];
}

export const passkeys = () => invoke<Passkeys | null>('passkeys');
export const onPasskeys = (callback: (passkeys: Passkeys) => void) => listen<Passkeys>('passkeys.changed', callback);
export const renamePasskey = (id: string, name: string) => invoke<void>('passkeys_rename', { id, name });
export const deletePasskey = (id: string) => invoke<void>('passkeys_delete', { id });

export const siteLabel = (passkey: Passkey) => passkey.siteName || passkey.site;
export const accountLabel = (passkey: Passkey) => passkey.nickname || passkey.account || passkey.displayName;
