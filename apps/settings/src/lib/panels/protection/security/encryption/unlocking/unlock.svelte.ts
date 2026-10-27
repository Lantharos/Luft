import type { Outcome } from '#lib/bindings.js';


interface Request {
	rejected: string | null;
	answer: (unlock: string | null) => void;
}

class UnlockPrompt {
	request = $state<Request | null>(null);

	ask(rejected: string | null) {
		return new Promise<string | null>((resolve) => {
			this.request = {
				rejected,
				answer: (unlock) => {
					this.request = null;
					resolve(unlock);
				}
			};
		});
	}
}

export const unlockPrompt = new UnlockPrompt();

export async function withUnlock<T>(change: (unlock: string) => Promise<Outcome<T>>): Promise<{ done: T } | null> {
	let typed = false;
	let outcome = await change('');
	while (outcome.wrongKey !== undefined) {
		const unlock = await unlockPrompt.ask(typed ? outcome.wrongKey : null);
		if (unlock === null) return null;
		typed = true;
		outcome = await change(unlock);
	}
	return outcome;
}
