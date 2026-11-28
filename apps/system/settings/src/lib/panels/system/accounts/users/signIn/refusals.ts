import { t } from '@luft/i18n';
import { errorText } from '@luft/ui';
import type { SignInChange, SignInRefusal } from '#lib/bindings.js';

const REFUSALS: Record<SignInRefusal, string> = {
	'not-authorized': 'settings-users-keys-not-authorized',
	'no-key': 'settings-users-keys-no-key',
	'no-card': 'settings-users-keys-no-card',
	'wrong-pin': 'settings-users-keys-wrong-pin',
	blocked: 'settings-users-keys-blocked',
	'pin-too-simple': 'settings-users-keys-pin-too-simple',
	'timed-out': 'settings-users-keys-timed-out',
	'already-enrolled': 'settings-users-keys-already-added',
	'nothing-else': 'settings-users-keys-nothing-else',
	failed: 'settings-users-keys-failed'
};

export const WAIT_FOR_PERMISSION = 300_000;

/** What went wrong, in words for the page, or nothing when the change went through. */
export async function attempt(change: () => Promise<SignInChange>): Promise<string | null> {
	try {
		const done = await change();
		return done.outcome === 'done' ? null : t(REFUSALS[done.refusal]);
	} catch (reason) {
		return errorText(reason);
	}
}
