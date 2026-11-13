import { errorText } from '@luft/ui';
import type { Fetched } from '#lib/bindings.js';
import { developer } from './developer.svelte';
import type { Problem } from './resource.svelte';

export function problemText(problem: Problem) {
	switch (problem.state) {
		case 'offline':
			return "You're offline, or schelf.store couldn't be reached.";
		case 'signedOut':
			return 'Your schelf.store sign-in ended.';
		case 'failed':
			return problem.error;
	}
}

/** Does something the app may do by itself, and says how it went. */
export async function act<T>(doing: Promise<Fetched<T>>, done?: string): Promise<T | null> {
	const answer = await doing.catch((reason): Fetched<T> => ({ state: 'failed', error: errorText(reason) }));
	if (answer.state === 'ready') {
		if (done) developer.notices.show(done);
		return answer.data;
	}
	if (answer.state === 'signedOut') developer.ended();
	else developer.notices.show(problemText(answer), { failed: true });
	return null;
}
