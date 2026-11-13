import { commands, events, type AccountState, type Approval } from '#lib/bindings.js';
import { openUrl } from '#lib/bridge/index.js';

export type SignInStep = { step: 'idle' } | { step: 'starting' } | { step: 'waiting'; approval: Approval } | { step: 'declined' } | { step: 'expired' } | { step: 'failed'; error: string };

class Account {
	state = $state<AccountState | null>(null);
	signIn = $state<SignInStep>({ step: 'idle' });
	open = $state(false);

	private timer: ReturnType<typeof setTimeout> | undefined;

	readonly signedIn = $derived(this.state?.account ?? null);
	readonly notices = $derived(this.state?.notices ?? { lost: [], ended: false });

	async start() {
		events.schelfLibrary(() => void this.reload());
		await this.reload();
		if (this.state?.account) void commands.accountRefresh().then((state) => (this.state = state), () => {});
	}

	async reload() {
		this.state = await commands.accountState();
	}

	show() {
		this.open = true;
	}

	close() {
		this.stop();
		this.open = false;
	}

	async begin() {
		this.stop();
		this.signIn = { step: 'starting' };
		try {
			const approval = await commands.accountSignIn();
			this.signIn = { step: 'waiting', approval };
			void openUrl(approval.page);
			this.wait(approval.intervalMs);
		} catch (reason) {
			this.signIn = { step: 'failed', error: String(reason) };
		}
	}

	private wait(intervalMs: number) {
		this.timer = setTimeout(() => void this.poll(intervalMs), intervalMs);
	}

	private async poll(intervalMs: number) {
		if (this.signIn.step !== 'waiting') return;
		const answer = await commands.accountSignInPoll({ intervalMs }).catch((reason) => ({ state: 'failed' as const, error: String(reason) }));
		if (this.signIn.step !== 'waiting') return;
		if (answer.state === 'waiting') return this.wait(answer.intervalMs);
		if (answer.state === 'approved') {
			this.signIn = { step: 'idle' };
			return this.reload();
		}
		this.signIn = answer.state === 'failed' ? { step: 'failed', error: answer.error } : { step: answer.state };
	}

	private stop() {
		clearTimeout(this.timer);
		if (this.signIn.step === 'waiting') void commands.accountSignInCancel();
		this.signIn = { step: 'idle' };
	}

	async signOut() {
		this.state = await commands.accountSignOut();
	}

	async dismiss() {
		this.state = await commands.accountDismiss();
	}
}

export const account = new Account();
