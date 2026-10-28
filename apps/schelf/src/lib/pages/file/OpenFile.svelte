<script lang="ts">
	import { bytes, Row, Section } from '@luft/ui';
	import { FULL_ACCESS_ABILITIES } from '#lib/app/fullAccess.js';
	import { commands, type InstalledApp, type Job, type OpenedFile } from '#lib/bindings.js';
	import AccessList from '#lib/components/AccessList.svelte';
	import AppArt from '#lib/components/AppArt.svelte';
	import Description from '#lib/components/Description.svelte';
	import ProgressButton from '#lib/components/ProgressButton.svelte';
	import SourceTrustDialog from '#lib/components/SourceTrustDialog.svelte';
	import TrustDialog from '#lib/components/TrustDialog.svelte';
	import { launch } from '#lib/bridge/index.js';
	import { library } from '#lib/state/library.svelte.js';
	import { navigation } from '#lib/state/navigation.svelte.js';
	import { operations } from '#lib/state/operations.svelte.js';

	let { path }: { path: string } = $props();

	let file = $state<OpenedFile | null>(null);
	let error = $state<string | null>(null);
	let started = $state(false);
	let trusting = $state(false);
	let confirming = $state(false);
	let unsandboxing = $state(false);
	let fullAccess = $state(false);

	const key = $derived(`file:${path}`);
	const operation = $derived(operations.forKey(key));
	const name = $derived.by(() => {
		if (!file) return '';
		if (file.kind === 'flatpakRef' || file.kind === 'flatpakBundle' || file.kind === 'flatpakRepo') return file.title;
		return file.kind === 'package' ? file.package : file.name;
	});
	const installed = $derived.by((): InstalledApp | null => {
		if (!file) return null;
		if (file.kind === 'flatpakRef' || file.kind === 'flatpakBundle') return library.flatpak(file.id);
		if (file.kind === 'deb') return library.deb(file.package);
		if (file.kind === 'package' && file.system) return library.system(file.package);
		if (file.kind === 'package') return library.tool(file.package);
		if (file.kind === 'appImage' && started) return library.installed.find((app) => app.source === 'appImage' && app.name === name) ?? null;
		return null;
	});
	const finished = $derived(started && !operation);
	const desktop = $derived(installed?.desktop ?? (installed && file?.kind === 'package' ? file.desktop : null));

	$effect(() => {
		const current = path;
		file = null;
		error = null;
		started = false;
		commands
			.filesInspect({ path: current })
			.then((result) => current === path && (file = result))
			.catch((reason) => current === path && (error = String(reason)));
	});

	function job(opened: OpenedFile): Job {
		if (opened.kind === 'flatpakRef') return { kind: 'installFlatpakRef', path: opened.path };
		if (opened.kind === 'flatpakBundle') return { kind: 'installFlatpakBundle', path: opened.path };
		if (opened.kind === 'deb') return { kind: 'installDeb', path: opened.path };
		if (opened.kind === 'flatpakRepo') return { kind: 'addFlatpakRepo', path: opened.path, name: opened.name };
		if (opened.kind === 'package' && opened.system)
			return { kind: 'installSystemPackageFile', path: opened.path, package: opened.package, repository: opened.repository?.draft ?? null };
		if (opened.kind === 'package') return { kind: 'installToolFile', path: opened.path };
		return { kind: 'installAppImage', path: opened.path, fullAccess };
	}

	const unverified = $derived(file?.kind === 'package' && !file.repository && !file.verified);

	// A .deb's app on Flathub installs better, sandboxed and updating itself, so it's offered first
	const flathub = $derived(file?.kind === 'deb' && !file.installed ? file.flathub : null);
	const flathubKey = $derived(flathub ? `flathub:${flathub.id}` : null);
	const flathubOperation = $derived(flathubKey ? operations.forKey(flathubKey) : null);
	const fromFlathub = $derived(flathub ? library.flatpak(flathub.id) : null);

	function installFromFlathub() {
		if (!flathub || !flathubKey) return;
		if (flathubOperation?.state === 'failed') void operations.cancel(flathubOperation.id);
		void operations.run(flathubKey, flathub.name, { kind: 'installFlathub', id: flathub.id });
	}

	function install() {
		if (!file) return;
		if (file.kind === 'package' && file.repository && !file.repository.added && !trusting) {
			trusting = true;
			return;
		}
		if (unverified && !confirming) {
			confirming = true;
			return;
		}
		if (file.kind === 'appImage' && file.unsandboxed && !unsandboxing) {
			unsandboxing = true;
			return;
		}
		trusting = false;
		confirming = false;
		unsandboxing = false;
		if (operation?.state === 'failed') void operations.cancel(operation.id);
		started = true;
		void operations.run(key, name, job(file));
	}

	const ACTION: Record<OpenedFile['kind'], string> = { flatpakRef: 'Install', flatpakBundle: 'Install', flatpakRepo: 'Add source', package: 'Install', appImage: 'Install', deb: 'Install' };
	const KIND: Record<OpenedFile['kind'], string> = {
		flatpakRef: 'Flatpak app',
		flatpakBundle: 'Flatpak app',
		deb: 'App for Debian and Ubuntu',
		flatpakRepo: 'Flatpak app source',
		package: 'Command-line tool',
		appImage: 'AppImage'
	};
	const kind = $derived(file?.kind === 'package' && file.system ? 'System package' : file ? KIND[file.kind] : '');
	const source = $derived(file?.kind === 'package' ? file.repository : null);
	const sourceName = $derived(source ? (source.described.sources[0]?.name ?? source.described.file) : null);
</script>

<div class="soft-scroll h-full overflow-y-auto">
	<div class="mx-auto flex w-full max-w-[760px] flex-col gap-7 px-8 pt-2 pb-10">
		{#if error}
			<p class="px-2 text-[14px] text-[var(--text-muted)]">{error}</p>
		{:else if file}
			<header class="flex items-center gap-5">
				<AppArt icon={file.kind === 'appImage' || file.kind === 'flatpakRef' || file.kind === 'flatpakBundle' || file.kind === 'deb' ? file.icon : null} size={80} />
				<div class="flex min-w-0 flex-1 flex-col gap-1">
					<h2 class="truncate text-[24px] font-semibold">{name}</h2>
					<span class="text-[13px] text-[var(--text-muted)]">{kind}</span>
					{#if 'summary' in file && file.summary}
						<p class="text-[14px] text-[var(--text-soft)]">{file.summary}</p>
					{/if}
				</div>
				<div class="flex flex-col items-end gap-2">
					{#if operation && operation.state !== 'failed'}
						<ProgressButton {operation} large />
					{:else if desktop && (finished || file.kind !== 'appImage')}
						<button type="button" class="button primary large" onclick={() => launch(desktop)}>Open</button>
					{:else if finished && file.kind === 'flatpakRepo'}
						<button type="button" class="button large" onclick={() => navigation.open({ page: 'discover' })}>Done</button>
					{:else if (file.kind === 'package' || file.kind === 'deb') && (file.installed || installed)}
						<span class="text-[13px] text-[var(--text-muted)]">Already installed</span>
					{:else if file.kind === 'deb' && !file.runsHere}
						<span class="max-w-[260px] text-right text-[13px] text-[var(--text-muted)]">This package is made for a different kind of computer.</span>
					{:else if flathub}
						<button type="button" class="button large" onclick={install}>Install the .deb anyway</button>
					{:else}
						<button type="button" class="button primary large" onclick={install}>{ACTION[file.kind]}</button>
					{/if}
					{#if operation?.state === 'failed'}
						<p class="max-w-[320px] text-right text-[12.5px] text-[var(--danger)]">{operation.error}</p>
					{/if}
				</div>
			</header>

			{#if flathub}
				<Section title="Also on Flathub">
					<div class="flex items-center gap-4 px-4 py-3">
						<AppArt icon={flathub.icon} size={48} />
						<div class="flex min-w-0 flex-1 flex-col gap-0.5">
							<span class="truncate text-[15px] font-medium">{flathub.name}{flathub.verified ? ' · Verified' : ''}</span>
							<span class="text-[13px] text-[var(--text-muted)]">
								The better way to get it: sandboxed, and it keeps itself up to date, without an Ubuntu container under it.
							</span>
						</div>
						{#if flathubOperation && flathubOperation.state !== 'failed'}
							<ProgressButton operation={flathubOperation} />
						{:else if fromFlathub?.desktop}
							<button type="button" class="button primary" onclick={() => launch(fromFlathub.desktop!)}>Open</button>
						{:else}
							<button type="button" class="button primary" onclick={installFromFlathub}>Install from Flathub</button>
						{/if}
					</div>
					{#if flathubOperation?.state === 'failed'}
						<p class="px-4 pb-3 text-[12.5px] text-[var(--danger)]">{flathubOperation.error}</p>
					{/if}
				</Section>
			{/if}

			{#if file.kind === 'appImage' && file.permissions}
				<AccessList permissions={file.permissions} />
			{/if}

			{#if (file.kind === 'package' || file.kind === 'deb') && file.description}
				<Description html={`<p>${file.description.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</p>`} />
			{/if}

			<Section title="Details">
				{#if file.kind === 'package' || file.kind === 'appImage' || file.kind === 'deb'}
					{#if file.version}
						<Row title="Version"><span>{file.version}</span></Row>
					{/if}
					<Row title="Size"><span>{bytes(file.size)}</span></Row>
				{/if}
				{#if file.kind === 'package'}
					<Row title="License"><span class="max-w-[320px] truncate">{file.license}</span></Row>
				{/if}
				{#if file.kind === 'flatpakRef' || file.kind === 'flatpakRepo'}
					<Row title="Source" description={file.url}><span>{new URL(file.url).host}</span></Row>
				{/if}
				{#if file.kind === 'flatpakBundle'}
					<Row title="Size"><span>{bytes(file.size)}</span></Row>
					{#if file.runtime}
						<Row title="Needs" description="Installed from Flathub along with it, unless you have it already."><span class="max-w-[320px] truncate">{file.runtime.split('/')[0]}</span></Row>
					{/if}
					{#if file.origin}
						<Row title="Updates from" description={file.origin}><span>{new URL(file.origin).host}</span></Row>
					{:else}
						<Row title="Updates" description="It doesn't update by itself. Install a newer file when one comes out."><span>From newer files</span></Row>
					{/if}
				{/if}
				{#if file.kind === 'deb'}
					<Row
						title="Installs to"
						description="A container with Ubuntu's software, which shares your home folder. Installing the first app downloads Ubuntu itself, a few hundred megabytes."
						><span>Ubuntu container</span></Row
					>
					<Row title="Updates" description="From its maker's software source when the package adds one, as many do. Otherwise, install a newer file when one comes out."
						><span>When its maker has them</span></Row
					>
				{/if}
				{#if file.kind === 'appImage'}
					<Row title="Installs to" description="It gets a place in your app menu, and Schelf keeps it up to date when it can."><span>Applications folder</span></Row>
				{:else if file.kind === 'package' && file.system}
					<Row title="Installs to" description="For everyone on this computer, rebuilt with every update of Luft."><span>System</span></Row>
					{#if source && sourceName}
						<Row title="Updates from" description={source.described.sources[0]?.url}><span class="max-w-[320px] truncate">{sourceName}</span></Row>
					{/if}
				{:else if file.kind === 'package'}
					<Row title="Installs to" description="Its commands run in Tern."><span>Tools container</span></Row>
				{/if}
				<Row title="File" description={path} />
			</Section>

			{#if file.kind === 'package' && source}
				<p class="px-2 text-[13px] text-[var(--text-muted)]">
					{file.package} installs from {sourceName}, checked against its key, so it keeps getting updates. {source.added
						? "It's one of your software sources already."
						: 'Installing adds it to your software sources.'}
				</p>
			{:else if file.kind === 'package' && file.repositoryError}
				<p class="px-2 text-[13px] text-[var(--text-muted)]">
					It brings a software source Luft can't use, so it installs by itself and won't get updates. {file.repositoryError}
				</p>
			{/if}
		{:else}
			<div class="skeleton h-20 w-full"></div>
		{/if}
	</div>
</div>

{#if trusting && source}
	<SourceTrustDialog {source} confirm="Add and install" onconfirm={install} onclose={() => (trusting = false)} />
{/if}

{#if unsandboxing && file?.kind === 'appImage' && file.unsandboxed}
	<TrustDialog
		title="Give {file.name} full access?"
		description="{file.name} asks to run outside a sandbox: “{file.unsandboxed}” There it can do anything a program you start yourself can, without asking. You can take full access away on its page later."
		facts={FULL_ACCESS_ABILITIES}
		confirm="Install with full access"
		onconfirm={() => {
			fullAccess = true;
			install();
		}}
		onclose={() => (unsandboxing = false)}
	/>
{/if}

{#if confirming && file?.kind === 'package'}
	<TrustDialog
		title="Install {file.package} without checking it?"
		description="Nobody vouches for this package file: it isn't signed by Fedora or by a software source you added. Only install it if you trust whoever gave it to you."
		facts={file.system
			? ['Not verified', 'Installs for everyone on this computer', 'Can run as administrator while it installs', "Won't get updates"]
			: ['Not verified', 'Installs in your tools container, where it can read and change your files', "Won't get updates"]}
		confirm="Install anyway"
		onconfirm={install}
		onclose={() => (confirming = false)}
	/>
{/if}

