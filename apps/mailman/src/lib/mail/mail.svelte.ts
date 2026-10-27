import { commands } from '#lib/bindings.js';
import type { Account, AppState, Counts, Identity, Mailbox, Provider, Settings, SyncStatus } from '#lib/bindings.js';

const CHECK_FEEDBACK = 700;
const EMPTY_COUNTS: Counts = { inbox: 0, screener: 0, later: 0, drafts: 0, newsletter: 0, receipt: 0, notification: 0, mailboxes: [] };

class MailState {
	accounts = $state<Account[]>([]);
	identities = $state<Identity[]>([]);
	mailboxes = $state<Mailbox[]>([]);
	counts = $state<Counts>(EMPTY_COUNTS);
	settings = $state<Settings>({ screener: true, bundles: true, notifications: true, undoSeconds: 10, darkMail: true });
	oauth = $state<Provider[]>([]);
	status = $state<Record<number, SyncStatus>>({});
	ready = $state(false);
	syncing = $derived(Object.values(this.status).some((status) => status.state === 'syncing'));
	private requested = $state(false);
	checking = $derived(this.requested || this.syncing);

	private unread = $derived(new Map(this.counts.mailboxes));
	private refreshing: Promise<void> | null = null;
	private pending = false;

	start(state: AppState) {
		this.accounts = state.accounts;
		this.identities = state.identities;
		this.mailboxes = state.mailboxes;
		this.settings = state.settings;
		this.oauth = state.oauth;
		this.ready = true;
		void this.refresh();
	}

	refresh = async () => {
		if (this.refreshing) {
			this.pending = true;
			return this.refreshing;
		}
		this.refreshing = (async () => {
			const [counts, mailboxes] = await Promise.all([commands.counts(), commands.mailboxes()]);
			this.counts = counts;
			this.mailboxes = mailboxes;
		})().finally(() => {
			this.refreshing = null;
			if (this.pending) {
				this.pending = false;
				void this.refresh();
			}
		});
		return this.refreshing;
	};

	async reloadAccounts() {
		[this.accounts, this.identities] = await Promise.all([commands.accounts(), commands.identities()]);
		await this.refresh();
	}

	reloadIdentities = async () => {
		this.identities = await commands.identities();
	};

	reloadSenders = async () => {
		[this.accounts, this.identities] = await Promise.all([commands.accounts(), commands.identities()]);
	};

	async preferIdentity(identity: Identity) {
		if (identity.preferred) return;
		this.identities = this.identities.map((candidate) => (candidate.account === identity.account ? { ...candidate, preferred: candidate.id === identity.id } : candidate));
		await commands.preferIdentity({ id: identity.id });
	}

	identitiesOf(account: number) {
		return this.identities.filter((identity) => identity.account === account);
	}

	preferredIdentity(account: number) {
		const own = this.identitiesOf(account);
		return own.find((identity) => identity.preferred) ?? own[0];
	}

	checkNow = () => {
		if (this.requested) return;
		this.requested = true;
		void commands.syncNow();
		setTimeout(() => (this.requested = false), CHECK_FEEDBACK);
	};

	receiveStatus = (status: SyncStatus) => {
		this.status = { ...this.status, [status.account]: status };
	};

	account(id: number) {
		return this.accounts.find((account) => account.id === id);
	}

	unreadIn(mailbox: number) {
		return this.unread.get(mailbox) ?? 0;
	}

	folders(account: number) {
		return this.mailboxes.filter((mailbox) => mailbox.account === account && mailbox.selectable && !mailbox.role);
	}

	async updateSettings(change: Partial<Settings>) {
		this.settings = { ...this.settings, ...change };
		await commands.saveSettings({ settings: this.settings });
		await this.refresh();
	}
}

export const mail = new MailState();
