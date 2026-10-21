import { activationToken } from '@luft/ui';
import { invoke, listen } from '#lib/bridge/index.js';

export type Provider = 'onedrive' | 'dropbox' | 'icloud' | 'nextcloud' | 'webdav';

export type Standing = { kind: 'ready' } | { kind: 'signInAgain'; reason: string };

export interface Account {
	id: string;
	provider: Provider;
	name: string;
	user: string;
	server: string | null;
	services: 'files'[];
	standing: Standing;
}

export type DriveState = 'connecting' | 'ready' | 'offline' | 'signInAgain' | 'problem';

export interface Conflict {
	path: string;
	copy: string;
	copyFrom: 'thisDevice' | 'cloud';
	at: number;
}

export interface Drive {
	account: string;
	provider: Provider;
	name: string;
	path: string;
	state: DriveState;
	problem: string | null;
	paused: 'metered' | 'battery' | null;
	syncing: number;
	usage: { used: number; total: number } | null;
	kept: string[];
	conflicts: Conflict[];
	shareLinks: boolean;
	web: boolean;
}

export interface Snapshot {
	accounts: Account[];
	drives: Drive[];
}

export interface Credentials {
	server?: string;
	user?: string;
	password?: string;
}

export interface Phone {
	id: string;
	number: string;
}

export type Step =
	| { step: 'working' }
	| { step: 'browser'; url: string }
	| { step: 'code'; prompt: string; texted: boolean }
	| { step: 'phones'; phones: Phone[] }
	| { step: 'approve' }
	| { step: 'done'; account: string }
	| { step: 'failed'; message: string };

export type Answer = { kind: 'code'; code: string } | { kind: 'text' } | { kind: 'phone'; id: string };

export const accounts = () => invoke<Snapshot>('accounts');
export const onAccounts = (callback: (snapshot: Snapshot) => void) => listen<Snapshot>('accounts.changed', callback);
export const onStep = (callback: (update: { session: string; step: Step }) => void) => listen<{ session: string; step: Step }>('accounts.step', callback);
export const signIn = (provider: Provider, credentials: Credentials) => invoke<string>('accounts_sign_in', { provider, credentials });
export const signInAgain = (account: string, credentials: Credentials) => invoke<string>('accounts_sign_in_again', { account, credentials });
export const step = (session: string) => invoke<Step>('accounts_step', { session });
export const answer = (session: string, reply: Answer) => invoke<void>('accounts_answer', { session, answer: reply });
export const cancel = (session: string) => invoke<void>('accounts_cancel', { session });
export const rename = (account: string, name: string) => invoke<void>('accounts_rename', { account, name });
export const remove = (account: string) => invoke<void>('accounts_remove', { account }, { timeoutMs: 600_000 });
export const openAddress = async (url: string) => invoke<void>('accounts_open', { url, token: await activationToken() });
