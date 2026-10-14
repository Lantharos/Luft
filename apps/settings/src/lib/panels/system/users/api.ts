import { invoke } from '#lib/bridge.js';

const WAIT_FOR_PERMISSION = 300_000;

export interface User {
	userName: string;
	realName: string;
	picture: string | null;
	administrator: boolean;
	hasPassword: boolean;
}

export interface Users {
	me: User;
	others: User[];
}

export type PasswordOutcome = 'changed' | 'wrongPassword' | 'tooShort' | 'tooSimilar' | 'dictionaryWord' | 'tooSimple' | 'rejected';

export const users = () => invoke<Users>('users');
export const rename = (name: string) => invoke<void>('users_rename', { name });
export const choosePicture = () => invoke<boolean>('users_choose_picture', undefined, { timeoutMs: WAIT_FOR_PERMISSION });
export const changePassword = (current: string | null, password: string) =>
	invoke<PasswordOutcome>('users_change_password', { current, password }, { timeoutMs: WAIT_FOR_PERMISSION });

export const displayName = (user: User) => user.realName || user.userName;
export const accountType = (user: User) => (user.administrator ? 'Administrator' : 'Standard account');
