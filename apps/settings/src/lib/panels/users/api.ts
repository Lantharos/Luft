import { invoke, listen } from '$lib/bridge';

const WAIT_FOR_PERMISSION = 300_000;

export interface User {
	userName: string;
	realName: string;
	picture: string | null;
	administrator: boolean;
	automaticLogin: boolean;
	hasPassword: boolean;
}

export interface Users {
	me: User;
	others: User[];
}

export interface Fingerprints {
	swipe: boolean;
	stages: number;
	enrolled: string[];
}

export interface EnrollProgress {
	result: string;
	done: boolean;
}

export type PasswordOutcome = 'changed' | 'wrongPassword' | 'tooShort' | 'tooSimilar' | 'dictionaryWord' | 'tooSimple' | 'rejected';

export const users = () => invoke<Users>('users');
export const rename = (name: string) => invoke<void>('users_rename', { name });
export const choosePicture = () => invoke<boolean>('users_choose_picture', undefined, { timeoutMs: WAIT_FOR_PERMISSION });
export const setAutomaticLogin = (enabled: boolean) => invoke<void>('users_set_automatic_login', { enabled }, { timeoutMs: WAIT_FOR_PERMISSION });
export const changePassword = (current: string | null, password: string) =>
	invoke<PasswordOutcome>('users_change_password', { current, password }, { timeoutMs: WAIT_FOR_PERMISSION });

export const fingerprints = () => invoke<Fingerprints | null>('users_fingerprints');
export const enroll = (finger: string) => invoke<void>('users_fingerprint_enroll', { finger }, { timeoutMs: WAIT_FOR_PERMISSION });
export const stopEnrolling = () => invoke<void>('users_fingerprint_stop');
export const deleteFingerprint = (finger: string) => invoke<void>('users_fingerprint_delete', { finger }, { timeoutMs: WAIT_FOR_PERMISSION });
export const onEnrollProgress = (callback: (progress: EnrollProgress) => void) => listen<EnrollProgress>('users.fingerprint', callback);

export const displayName = (user: User) => user.realName || user.userName;
export const accountType = (user: User) => (user.administrator ? 'Administrator' : 'Standard account');
