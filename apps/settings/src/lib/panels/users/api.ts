import { invoke } from '$lib/bridge';

export interface User {
	userName: string;
	realName: string;
	picture: string | null;
	administrator: boolean;
	automaticLogin: boolean;
}

export interface Users {
	me: User;
	others: User[];
}

export const users = () => invoke<Users>('users');
export const rename = (name: string) => invoke<void>('users_rename', { name });
export const choosePicture = () => invoke<boolean>('users_choose_picture');
export const setAutomaticLogin = (enabled: boolean) => invoke<void>('users_set_automatic_login', { enabled });

export const displayName = (user: User) => user.realName || user.userName;
export const accountType = (user: User) => (user.administrator ? 'Administrator' : 'Standard account');
