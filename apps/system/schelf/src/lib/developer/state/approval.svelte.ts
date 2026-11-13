import { errorText } from '@luft/ui';
import { commands, type ApprovalAction, type Fetched } from '#lib/bindings.js';
import { openUrl } from '#lib/bridge/index.js';
import type { Approval } from '../store';
import { developer } from './developer.svelte';
import type { Problem } from './resource.svelte';

const POLL_MS = 2000;

export type Asking = { step: 'starting' } | { step: 'asked'; approval: Approval } | { step: 'problem'; problem: Problem };

/** Something the app may only do once it's approved in the browser: it asks
 * schelf.store, opens the page that approves it and waits for the answer. */
class Approvals {
	title = $state('');
	asking = $state.raw<Asking | null>(null);

	private timer: ReturnType<typeof setTimeout> | undefined;
	private settled: (() => void) | null = null;

	async ask(title: string, actions: ApprovalAction[], settled: () => void) {
		this.stop();
		this.title = title;
		this.settled = settled;
		this.asking = { step: 'starting' };
		const answer = await commands.developerAsk({ actions }).catch(failed);
		if (this.asking?.step !== 'starting') return;
		this.show(answer);
		if (answer.state === 'ready') void openUrl(answer.data.url);
	}

	async openPage() {
		if (this.asking?.step === 'asked') await openUrl(this.asking.approval.url);
	}

	async cancel() {
		const asking = this.asking;
		this.close();
		if (asking?.step === 'asked' && asking.approval.status === 'pending') await commands.developerCancelApproval({ id: asking.approval.id }).catch(() => null);
	}

	close() {
		this.stop();
		this.asking = null;
	}

	private show(answer: Fetched<Approval>) {
		if (answer.state !== 'ready') {
			this.asking = { step: 'problem', problem: answer };
			return;
		}
		this.asking = { step: 'asked', approval: answer.data };
		if (answer.data.status === 'pending') this.timer = setTimeout(() => void this.poll(answer.data.id), POLL_MS);
		else {
			this.settled?.();
			developer.resources.refreshWatched();
		}
	}

	private async poll(id: string) {
		const answer = await commands.developerApproval({ id }).catch(failed);
		if (this.asking?.step === 'asked' && this.asking.approval.id === id) this.show(answer);
	}

	private stop() {
		clearTimeout(this.timer);
	}
}

function failed(reason: unknown): Fetched<Approval> {
	return { state: 'failed', error: errorText(reason) };
}

export const approvals = new Approvals();
