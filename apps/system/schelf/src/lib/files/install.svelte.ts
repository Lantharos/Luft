import { commands, type CatalogApp, type InstalledApp, type Job, type OpenedFile, type StoreDetails } from '#lib/bindings.js';
import { storeJob } from '#lib/app/jobs.js';
import { describe } from '#lib/app/permissions.js';
import { broadPermissions } from '#lib/catalog/flathub.js';
import { catalogKey } from '#lib/catalog/types.js';
import type { InstallDialog } from '#lib/install/dialogs/dialog.js';
import { library } from '#lib/state/library.svelte.js';
import { operations } from '#lib/state/operations.svelte.js';

export type Consent = 'source' | 'unverified' | 'unsandboxed' | 'broad';
export type VersionChange = 'up' | 'none' | 'down';
export type Ask = (dialog: InstallDialog) => Promise<boolean | null>;

/** The same app on schelf.store or Flathub, which keeps it up to date. */
export interface Listed {
	listing: CatalogApp;
	store: StoreDetails | null;
	version: string | null;
}

const APP_ID = /^[A-Za-z_][\w-]*(\.[A-Za-z_][\w-]*){2,}$/;
const versions = new Intl.Collator(undefined, { numeric: true });

function job(opened: OpenedFile): Job {
	if (opened.kind === 'flatpakRef') return { kind: 'installFlatpakRef', path: opened.path };
	if (opened.kind === 'flatpakBundle') return { kind: 'installFlatpakBundle', path: opened.path };
	if (opened.kind === 'deb') return { kind: 'installDeb', path: opened.path };
	if (opened.kind === 'flatpakRepo') return { kind: 'addFlatpakRepo', path: opened.path, name: opened.name };
	if (opened.kind === 'package')
		return { kind: 'installSystemPackageFile', path: opened.path, package: opened.package, repository: opened.repository?.draft ?? null };
	return { kind: 'installAppImage', path: opened.path, fullAccess: !!opened.unsandboxed };
}

function appId(file: OpenedFile) {
	const id = file.kind === 'flatpakBundle' ? file.id : file.kind === 'package' || file.kind === 'deb' || file.kind === 'appImage' ? file.desktop?.replace(/\.desktop$/, '') : null;
	return id && APP_ID.test(id) ? id : null;
}

async function flathubVersion(id: string) {
	const appstream = await commands.flathubAppstream({ id });
	return (appstream.releases?.find((release) => release.type !== 'development') ?? appstream.releases?.[0])?.version ?? null;
}

async function listed(id: string): Promise<Listed | null> {
	const listing = await commands.storeEntry({ id });
	if (listing?.origin === 'schelf') {
		const store = await commands.storeDetails({ id: listing.id });
		return store.installer ? { listing, store, version: store.version } : null;
	}
	if (listing?.origin === 'flathub') return { listing, store: null, version: await flathubVersion(listing.id).catch(() => null) };
	return null;
}

function existing(file: OpenedFile, name: string): InstalledApp | null {
	if (file.kind === 'flatpakRef' || file.kind === 'flatpakBundle') return library.flatpak(file.id);
	if (file.kind === 'deb') return library.deb(file.package);
	if (file.kind === 'package') return library.system(file.package);
	if (file.kind === 'appImage') return library.installed.find((app) => app.source === 'appImage' && app.name === name) ?? null;
	return null;
}

/** An app file someone opened, and installing it with the consents it needs. */
export class FileInstall {
	readonly path: string;
	file = $state<OpenedFile | null>(null);
	error = $state<string | null>(null);
	started = $state(false);
	listed = $state<Listed | null>(null);
	listedStarted = $state(false);
	#ask: Ask;
	#asking = false;

	constructor(path: string, ask: Ask) {
		this.path = path;
		this.#ask = ask;
	}

	/** Asks in a dialog, unless one is already open. */
	async ask(dialog: InstallDialog) {
		if (this.#asking) return null;
		this.#asking = true;
		try {
			return await this.#ask(dialog);
		} finally {
			this.#asking = false;
		}
	}

	get key() {
		return `file:${this.path}`;
	}

	async load() {
		try {
			this.file = await commands.filesInspect({ path: this.path });
		} catch (reason) {
			this.error = reason instanceof Error ? reason.message : String(reason);
			return;
		}
		const id = appId(this.file);
		if (id) this.listed = await listed(id).catch(() => null);
	}

	job = $derived(this.file ? job(this.file) : null);
	operation = $derived(operations.forKey(this.key));
	active = $derived(this.operation && this.operation.state !== 'failed' ? this.operation : null);
	failed = $derived(this.operation?.state === 'failed' ? this.operation : null);
	finished = $derived(this.started && !this.operation);

	name = $derived.by(() => {
		const file = this.file;
		if (!file) return '';
		if (file.kind === 'flatpakRef' || file.kind === 'flatpakBundle' || file.kind === 'flatpakRepo') return file.title;
		return file.kind === 'package' ? file.package : file.name;
	});

	existing = $derived(this.file ? existing(this.file, this.name) : null);
	desktop = $derived(this.existing?.desktop ?? (this.existing && this.file?.kind === 'package' ? this.file.desktop : null));
	icon = $derived(this.file?.kind === 'appImage' || this.file?.kind === 'flatpakBundle' || this.file?.kind === 'deb' ? this.file.icon : null);
	version = $derived(this.file && 'version' in this.file ? this.file.version : null);
	publisher = $derived.by(() => {
		const file = this.file;
		if (file?.kind === 'package') return file.vendor;
		if (file?.kind === 'deb') return file.maintainer;
		if (file?.kind === 'flatpakBundle') return file.developer;
		return null;
	});

	versionChange = $derived.by((): VersionChange | null => {
		if (!this.version || !this.existing?.version) return null;
		const order = versions.compare(this.version, this.existing.version);
		return order > 0 ? 'up' : order < 0 ? 'down' : 'none';
	});

	unverified = $derived(this.file?.kind === 'package' && !this.file.repository && !this.file.verified);
	source = $derived(this.file?.kind === 'package' ? this.file.repository : null);
	sourceName = $derived(this.source ? (this.source.described.sources[0]?.name ?? this.source.described.file) : null);
	permissions = $derived(this.file?.kind === 'appImage' || this.file?.kind === 'flatpakBundle' ? this.file.permissions : null);
	broad = $derived(this.file?.kind === 'flatpakBundle' && this.permissions ? describe(this.permissions).filter((entry) => entry.notable) : []);

	listedKey = $derived(this.listed ? catalogKey(this.listed.listing) : null);
	listedOperation = $derived(this.listedKey ? operations.forKey(this.listedKey) : null);
	fromListing = $derived(this.listed ? library.forListing(this.listed.listing) : null);
	finishedFromListing = $derived(this.listedStarted && !this.listedOperation);
	listedVersionChange = $derived.by((): VersionChange | null => {
		if (!this.version || !this.listed?.version) return null;
		const order = versions.compare(this.listed.version, this.version);
		return order > 0 ? 'up' : order < 0 ? 'down' : 'none';
	});

	#needed(): Consent[] {
		const file = this.file;
		const needed: Consent[] = [];
		if (file?.kind === 'package' && file.repository && !file.repository.added) needed.push('source');
		if (this.unverified) needed.push('unverified');
		if (file?.kind === 'appImage' && file.unsandboxed) needed.push('unsandboxed');
		if (this.broad.length) needed.push('broad');
		return needed;
	}

	async install() {
		const file = this.file;
		if (!file) return;
		for (const consent of this.#needed()) if (!(await this.ask({ kind: 'consent', consent, file }))) return;
		if (this.failed) void operations.cancel(this.failed.id);
		this.started = true;
		void operations.run(this.key, this.name, job(file));
	}

	async installListed() {
		const listed = this.listed;
		if (!listed) return;
		if (listed.store) {
			const fullAccess = await this.ask({ kind: 'store', store: listed.store });
			if (fullAccess !== null) this.#runListed(storeJob(listed.store, fullAccess));
			return;
		}
		const permissions = await broadPermissions(listed.listing.id);
		if (permissions && !(await this.ask({ kind: 'flathub', name: listed.listing.name, permissions }))) return;
		this.#runListed({ kind: 'installFlathub', id: listed.listing.id });
	}

	#runListed(job: Job | null) {
		if (!this.listed || !this.listedKey || !job) return;
		if (this.listedOperation?.state === 'failed') void operations.cancel(this.listedOperation.id);
		this.listedStarted = true;
		void operations.run(this.listedKey, this.listed.listing.name, job);
	}
}
