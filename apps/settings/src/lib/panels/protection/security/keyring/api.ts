import { invoke, listen } from '#lib/bridge/index.js';

const WAIT_FOR_PROMPT = { timeoutMs: 300_000 };

export type Chip = 'ready' | 'missing' | 'unsupported' | 'disabled' | 'failing' | 'no-pcr-bank' | 'unavailable' | '';
export type Action = 'read' | 'saved' | 'deleted' | 'denied' | 'signed';
export type KeyKind = 'ed25519' | 'ecdsa' | 'rsa';

export interface Identity {
	key: string;
	name: string;
	id: string | null;
	icon: string | null;
}

export interface AppStore extends Identity {
	secrets: number;
}

export interface AccessEvent {
	time: number;
	app: string;
	action: Action;
	what: string;
}

export interface SshKey {
	fingerprint: string;
	name: string;
	kind: KeyKind;
	chip: boolean;
	confirm: boolean;
	added: number;
}

export interface Access {
	stores: AppStore[];
	history: AccessEvent[];
}

export interface Ssh {
	socket: string;
	chipKeys: boolean;
	keys: SshKey[];
}

export interface Keyring {
	locked: boolean;
	tpmSealed: boolean;
	fingerprintUnlock: boolean;
	pin: boolean;
	itemCount: number;
	chip: Chip;
	lockWithScreen: boolean;
	access: Access | null;
	ssh: Ssh | null;
}

export const keyring = () => invoke<Keyring | null>('keyring');
export const onKeyring = (callback: (keyring: Keyring) => void) => listen<Keyring>('keyring.changed', callback);

export const lock = () => invoke<void>('keyring_lock');
export const unlock = () => invoke<boolean>('keyring_unlock', {}, WAIT_FOR_PROMPT);
export const setPin = (enabled: boolean) => invoke<boolean>('keyring_set_pin', { enabled }, WAIT_FOR_PROMPT);
export const reseal = () => invoke<void>('keyring_reseal', {}, WAIT_FOR_PROMPT);
export const setLockWithScreen = (enabled: boolean) => invoke<void>('keyring_lock_with_screen', { enabled });

export const forgetApp = (app: string) => invoke<boolean>('keyring_forget_app', { app }, WAIT_FOR_PROMPT);
export const clearHistory = () => invoke<boolean>('keyring_clear_history', {}, WAIT_FOR_PROMPT);

export const generateKey = (name: string, chip: boolean) => invoke<string>('keyring_ssh_generate', { name, chip }, WAIT_FOR_PROMPT);
export const publicKey = (fingerprint: string) => invoke<string>('keyring_ssh_public_key', { fingerprint });
export const setConfirm = (fingerprint: string, confirm: boolean) => invoke<void>('keyring_ssh_confirm', { fingerprint, confirm });
export const removeKey = (fingerprint: string) => invoke<void>('keyring_ssh_remove', { fingerprint });
