import type { AccessEvent, Action, Chip, Keyring, KeyKind } from './api';

const CHIP_PROBLEMS: Record<Exclude<Chip, 'ready' | ''>, string> = {
	missing: 'This computer doesn’t have a security chip',
	unsupported: 'This computer’s security chip is too old to use',
	disabled: 'The security chip is turned off in the firmware settings',
	failing: 'The security chip isn’t working right now',
	'no-pcr-bank': 'The security chip can’t check how this computer started',
	unavailable: 'The security chip can’t be used right now'
};

const KINDS: Record<KeyKind, string> = { ed25519: 'Ed25519', ecdsa: 'ECDSA', rsa: 'RSA' };

const ACTIONS: Record<Action, (app: string, what: string) => string> = {
	read: (app, what) => `${app} used ${what}`,
	saved: (app, what) => `${app} saved ${what}`,
	deleted: (app, what) => `${app} deleted ${what}`,
	denied: (app, what) => `${app} wasn’t allowed to use ${what}`,
	signed: (app, what) => `${app} signed with ${what}`
};

export const sealed = (keyring: Keyring) => keyring.chip === 'ready' && keyring.tpmSealed;

export const chipProblem = (chip: Chip) => (chip === 'ready' || chip === '' ? '' : CHIP_PROBLEMS[chip]);

export const protection = (keyring: Keyring) =>
	sealed(keyring) ? 'Protected by your password and this computer’s security chip' : 'Protected by your password';

export function contents(count: number) {
	if (count === 0) return 'Nothing saved yet';
	return count === 1 ? 'Holds 1 password or key' : `Holds ${count} passwords and keys`;
}

export function fingerprintUnlock(keyring: Keyring) {
	if (sealed(keyring)) {
		return keyring.fingerprintUnlock
			? { title: 'Your fingerprint unlocks it too', description: 'Signing in or unlocking the screen with your fingerprint also unlocks your passwords' }
			: { title: 'Only your password unlocks it', description: 'Add a fingerprint in Users to unlock your passwords with it too' };
	}
	const reason = chipProblem(keyring.chip) || (keyring.chip === 'ready' ? 'Protect your keyring with the security chip first' : 'It needs this computer’s security chip');
	return { title: 'Fingerprint unlock isn’t available', description: reason };
}

export const kind = (key: KeyKind) => KINDS[key];

export const happened = (event: AccessEvent) => ACTIONS[event.action](event.app, event.what ? `“${event.what}”` : 'a saved password');
