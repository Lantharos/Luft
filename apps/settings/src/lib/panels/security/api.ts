import { invoke, listen } from '$lib/bridge';

const WAIT_FOR_PERMISSION = { timeoutMs: 300_000 };

export type SecureBoot = 'on' | 'off' | 'setup' | 'unsupported';
export type DiskState = 'off' | 'starting' | 'encrypting' | 'decrypting' | 'on';
export type UnlockMethod = 'tpm' | 'pin' | 'passphrase' | 'recovery-key' | 'security-key';

export interface Tpm {
	present: boolean;
	version: string;
	usable: boolean;
	reason: string;
}

export interface SigningKey {
	state: 'none' | 'pending' | 'enrolled';
	available: boolean;
	reason: string;
	protection: 'tpm' | 'disk' | '';
	driverKeyEnrolled: boolean;
	missed: number;
}

export interface Startup {
	installed: boolean;
	measured: boolean;
	available: boolean;
	reason: string;
}

export interface Disk {
	device: string;
	encrypted: boolean;
	state: DiskState;
	progress: number;
	remaining: number;
	unlock: UnlockMethod[];
	recoveryKeyStored: boolean;
	tpmRefused: boolean;
}

export interface Trust {
	secureBoot: SecureBoot;
	tpm: Tpm;
	signingKey: SigningKey;
	startup: Startup;
	disk: Disk;
}

export interface Check {
	id: string;
	passed: boolean;
	sentence: string;
}

export type Fix = 'maker' | 'firmware' | 'system' | 'unknown';

export interface Protection {
	id: string;
	name: string;
	fix: Fix;
}

export interface HostSecurity {
	level: number;
	highest: number;
	missing: Protection[];
	runtime: Protection[];
}

export interface UsbProtection {
	enabled: boolean;
	guarding: boolean;
	held: { id: string; name: string }[];
}

export type Outcome<T> = { done: T } | { wrongKey: string };

export const problem = (reason: unknown) => (reason instanceof Error ? reason.message : String(reason));

export const trust = () => invoke<Trust | null>('security_trust');
export const onTrust = (callback: (trust: Trust) => void) => listen<Trust>('security.trust', callback);
export const hostSecurity = () => invoke<HostSecurity | null>('security_host', {}, { timeoutMs: 120_000 });

export const usbProtection = () => invoke<UsbProtection | null>('security_usb');
export const onUsbProtection = (callback: (usb: UsbProtection) => void) => listen<UsbProtection>('security.usb', callback);
export const setUsbProtection = (enabled: boolean) => invoke<void>('security_set_usb', { enabled }, WAIT_FOR_PERMISSION);

export const checkEncryption = () => invoke<Check[]>('security_check_encryption', {}, WAIT_FOR_PERMISSION);
export const generateRecoveryKey = () => invoke<string>('security_generate_key', {}, WAIT_FOR_PERMISSION);
export const turnOnEncryption = (recoveryKey: string, pin: string, passphrase: string) =>
	invoke<void>('security_turn_on', { recoveryKey, pin, passphrase }, WAIT_FOR_PERMISSION);
export const turnOffEncryption = (unlock: string) => invoke<Outcome<null>>('security_turn_off', { unlock }, WAIT_FOR_PERMISSION);
export const setUpTpmUnlock = (pin: string) => (unlock: string) => invoke<Outcome<string>>('security_set_up_tpm', { unlock, pin }, WAIT_FOR_PERMISSION);
export const removeTpmUnlock = (unlock: string) => invoke<Outcome<null>>('security_remove_tpm', { unlock }, WAIT_FOR_PERMISSION);
export const showRecoveryKey = () => invoke<string>('security_show_key', {}, WAIT_FOR_PERMISSION);
export const replaceRecoveryKey = (unlock: string) => invoke<Outcome<string>>('security_replace_key', { unlock }, WAIT_FOR_PERMISSION);

export const enrollSigningKey = () => invoke<string>('security_enroll_key', {}, WAIT_FOR_PERMISSION);
export const cancelSigningKey = () => invoke<void>('security_cancel_enrollment', {}, WAIT_FOR_PERMISSION);
export const installSignedStartup = () => invoke<void>('security_install_startup', {}, WAIT_FOR_PERMISSION);

export const saveRecoveryKey = (key: string) => invoke<boolean>('security_save_key', { key }, WAIT_FOR_PERMISSION);
export const printRecoveryKey = (key: string) => invoke<void>('security_print_key', { key });
export const restart = () => invoke<void>('security_restart', {}, WAIT_FOR_PERMISSION);
