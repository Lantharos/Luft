import { Toasts } from '@luft/ui';
import { commands } from '#lib/bindings.js';
import { account } from '#lib/state/account.svelte.js';
import { navigation, type Route } from '#lib/state/navigation.svelte.js';
import type { Account, DashboardPublisher } from '../store';
import { Resources } from './resource.svelte';

const NOTICE_MS = 4000;

class Developer {
	account = $state.raw<Account | null>(null);
	chosen = $state<string | null>(null);

	readonly notices = new Toasts(NOTICE_MS);
	readonly resources = new Resources(() => this.ended());

	private loadedFor: string | null = null;
	private lastRoute: Route | null = null;

	readonly publishers = $derived(this.account?.publishers ?? []);
	readonly publisher = $derived<DashboardPublisher | null>(this.publishers.find((publisher) => publisher.id === this.chosen) ?? this.publishers[0] ?? null);

	start() {
		window.addEventListener('focus', () => {
			if (navigation.developing) this.resources.refreshWatched();
		});
	}

	/** Learns whether `email`, signed in on this computer, publishes on schelf.store. */
	async sync(email: string | null) {
		if (email === this.loadedFor) return;
		this.loadedFor = email;
		this.forget();
		if (!email) return;
		const answer = await commands.developerAccount().catch(() => null);
		if (answer?.state === 'ready' && this.loadedFor === email) this.account = answer.data;
	}

	projects(publisher: string) {
		return this.resources.get(`projects:${publisher}`, () => commands.developerProjects({ publisher }));
	}

	projectName(id: string) {
		return this.publisher ? (this.projects(this.publisher.id).data?.find((project) => project.id === id)?.name ?? '') : '';
	}

	async enter() {
		const publisher = this.publisher;
		if (!publisher) return;
		if (this.lastRoute) return navigation.develop(this.lastRoute);
		navigation.develop(await this.firstPage(publisher.id));
	}

	leave() {
		this.lastRoute = navigation.root;
		navigation.leave();
	}

	async choose(publisher: string) {
		this.chosen = publisher;
		navigation.open(await this.firstPage(publisher));
	}

	private async firstPage(publisher: string): Promise<Route> {
		const projects = this.projects(publisher);
		if (!projects.data) await projects.refresh();
		const first = projects.data?.[0];
		return first ? { page: 'project', id: first.id, tab: 'overview' } : { page: 'publisher', section: 'members' };
	}

	ended() {
		navigation.leave();
		void account.reload();
	}

	private forget() {
		this.account = null;
		this.chosen = null;
		this.lastRoute = null;
		this.resources.clear();
	}
}

export const developer = new Developer();
