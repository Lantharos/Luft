import { invoke } from '@lantharos/sabine';
import type { Appearance } from '@luft/ui';

export interface Hardware {
	nvidia: boolean;
	portable: boolean;
	onBattery: boolean;
	touchpad: boolean;
	fingerprint: boolean;
}

export const NO_HARDWARE: Hardware = { nvidia: false, portable: false, onBattery: false, touchpad: false, fingerprint: false };

export interface AppState extends Appearance {
	hardware: Hardware;
	meet: 'try' | 'install' | 'replace' | null;
}

export interface TrustState {
	secureBoot: 'on' | 'off' | 'setup' | 'unsupported';
	key: 'none' | 'pending' | 'enrolled';
	keyAvailable: boolean;
	tpm: boolean;
	encrypted: boolean;
	encryption: string;
}

export interface Check {
	id: string;
	passed: boolean;
	sentence: string;
}

export interface KeyboardLayout {
	layout: string;
	variant: string;
	name: string;
}

export interface Zone {
	id: string;
	city: string;
	country: string;
	code: string;
}

export interface Catalog {
	keyboards: KeyboardLayout[];
	zones: Zone[];
}

export interface Location {
	time_zone: string | null;
	country_code: string | null;
}

const WAIT_FOR_PERSON = 300_000;

export const appState = () => invoke<AppState>('app_state');

export const trustState = () => invoke<TrustState | null>('trust_state');
export const enrollKey = () => invoke<string>('trust_enroll', {}, { timeoutMs: WAIT_FOR_PERSON });
export const encryptionChecks = () => invoke<Check[]>('trust_checks', {}, { timeoutMs: WAIT_FOR_PERSON });
export const recoveryKey = () => invoke<string>('trust_recovery_key');
export const saveKey = (key: string) => invoke<boolean>('trust_save_key', { key }, { timeoutMs: WAIT_FOR_PERSON });
export const printKey = (key: string) => invoke<boolean>('trust_print_key', { key }, { timeoutMs: WAIT_FOR_PERSON });
export const encrypt = (recoveryKey: string, passphrase: string) =>
	invoke<void>('trust_encrypt', { recoveryKey, passphrase }, { timeoutMs: WAIT_FOR_PERSON });

export const catalog = () => invoke<Catalog>('regional_catalog');
export const locate = () => invoke<Location | null>('regional_locate');
export const useKeyboard = (layout: string, variant: string) => invoke<void>('regional_keyboard', { layout, variant }, { timeoutMs: WAIT_FOR_PERSON });
export const useZone = (zone: string) => invoke<void>('regional_zone', { zone }, { timeoutMs: WAIT_FOR_PERSON });
export const formatsCountry = () => invoke<string | null>('regional_formats_country');
export const setFormats = (region: string) => invoke<void>('regional_set_formats', { region });

export const finishSetup = () => invoke<boolean>('session_finish');
export const restart = () => invoke<void>('session_restart', {}, { timeoutMs: WAIT_FOR_PERSON });
export const openDisks = () => invoke<void>('session_open_disks');
