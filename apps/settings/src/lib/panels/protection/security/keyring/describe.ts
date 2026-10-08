import type { AccessEvent, Action, Keyring, KeyKind } from './api';

const KINDS: Record<KeyKind, string> = { ed25519: 'Ed25519', ecdsa: 'ECDSA', rsa: 'RSA' };

const ACTIONS: Record<Action, (app: string, what: string) => string> = {
	read: (app, what) => `${app} used ${what}`,
	saved: (app, what) => `${app} saved ${what}`,
	deleted: (app, what) => `${app} deleted ${what}`,
	denied: (app, what) => `${app} wasn’t allowed to use ${what}`,
	signed: (app, what) => `${app} signed with ${what}`
};

export const sealed = (keyring: Keyring) => keyring.chip === 'ready' && keyring.tpmSealed;

export const protection = (keyring: Keyring) => (sealed(keyring) ? 'Protected by your password and the security chip' : 'Protected by your password');

export function contents(count: number) {
	if (count === 0) return 'Nothing saved yet';
	return count === 1 ? '1 password or key' : `${count} passwords and keys`;
}

export function askedApps(count: number) {
	if (count === 0) return 'No apps have asked for them yet';
	return count === 1 ? '1 app has asked for them' : `${count} apps have asked for them`;
}

export const kind = (key: KeyKind) => KINDS[key];

export const happened = (event: AccessEvent) => ACTIONS[event.action](event.app, event.what ? `“${event.what}”` : 'a saved password');
