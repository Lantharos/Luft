<script lang="ts">
	import { bytes, Row, Section } from '@luft/ui';
	import type { InstalledApp, Job, OpenedFile } from '#lib/bridge/types.js';
	import AppArt from '#lib/components/AppArt.svelte';
	import Description from '#lib/components/Description.svelte';
	import ProgressButton from '#lib/components/ProgressButton.svelte';
	import SourceTrustDialog from '#lib/components/SourceTrustDialog.svelte';
	import TrustDialog from '#lib/components/TrustDialog.svelte';
	import { fedora } from '#lib/fedora/fedora.svelte.js';
	import { backend } from '#lib/bridge/index.js';
	import { library } from '#lib/state/library.svelte.js';
	import { navigation } from '#lib/state/navigation.svelte.js';
	import { operations } from '#lib/state/operations.svelte.js';

	let { path }: { path: string } = $props();

	let file = $state<OpenedFile | null>(null);
	let error = $state<string | null>(null);
	let started = $state(false);
	let trusting = $state(false);
	let confirming = $state(false);

	const key = $derived(`file:${path}`);
	const operation = $derived(operations.forKey(key));
	const name = $derived.by(() => {
		if (!file) return '';
		if (file.kind === 'flatpakRef' || file.kind === 'flatpakRepo') return file.title;
		return file.kind === 'package' ? file.package : file.name;
	});
	const installed = $derived.by((): InstalledApp | null => {
		if (!file) return null;
		if (file.kind === 'flatpakRef') return library.flatpak(file.id);
		if (file.kind === 'package' && file.system) return library.system(file.package);
		if (file.kind === 'package') return fedora.available ? library.package(file.package) : library.tool(file.package);
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
		backend
			.inspectFile(current)
			.then((result) => current === path && (file = result))
			.catch((reason) => current === path && (error = String(reason)));
	});

	function job(opened: OpenedFile): Job {
		if (opened.kind === 'flatpakRef') return { kind: 'installFlatpakRef', path: opened.path };
		if (opened.kind === 'flatpakRepo') return { kind: 'addFlatpakRepo', path: opened.path, name: opened.name };
		if (opened.kind === 'package' && opened.system)
			return { kind: 'installSystemPackageFile', path: opened.path, package: opened.package, repository: opened.repository?.draft ?? null };
		if (opened.kind === 'package') return fedora.available ? { kind: 'installPackageFile', path: opened.path } : { kind: 'installToolFile', path: opened.path };
		return { kind: 'installAppImage', path: opened.path };
	}

	const unverified = $derived(file?.kind === 'package' && !file.repository && !file.verified);

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
		trusting = false;
		confirming = false;
		if (operation?.state === 'failed') void operations.cancel(operation.id);
		started = true;
		void operations.run(key, name, job(file));
	}

	const ACTION: Record<OpenedFile['kind'], string> = { flatpakRef: 'Install', flatpakRepo: 'Add source', package: 'Install', appImage: 'Install' };
	const KIND: Record<OpenedFile['kind'], string> = {
		flatpakRef: 'Flatpak app',
		flatpakRepo: 'Flatpak app source',
		package: fedora.available ? 'System package' : 'Command-line tool',
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
				<AppArt icon={file.kind === 'appImage' || file.kind === 'flatpakRef' ? file.icon : null} size={80} />
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
						<button type="button" class="button primary large" onclick={() => backend.launch(desktop)}>Open</button>
					{:else if finished && file.kind === 'flatpakRepo'}
						<button type="button" class="button large" onclick={() => navigation.open({ page: 'discover' })}>Done</button>
					{:else if file.kind === 'package' && (file.installed || installed)}
						<span class="text-[13px] text-[var(--text-muted)]">Already installed</span>
					{:else}
						<button type="button" class="button primary large" onclick={install}>{ACTION[file.kind]}</button>
					{/if}
					{#if operation?.state === 'failed'}
						<p class="max-w-[320px] text-right text-[12.5px] text-[var(--danger)]">{operation.error}</p>
					{/if}
				</div>
			</header>

			{#if file.kind === 'package' && file.description}
				<Description html={`<p>${file.description.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</p>`} />
			{/if}

			<Section title="Details">
				{#if file.kind === 'package' || file.kind === 'appImage'}
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
				{#if file.kind === 'appImage'}
					<Row title="Installs to" description="It gets a place in your app menu, and Schelf keeps it up to date when it can."><span>Applications folder</span></Row>
				{:else if file.kind === 'package' && file.system}
					<Row title="Installs to" description="For everyone on this computer, rebuilt with every update of Luft."><span>System</span></Row>
					{#if source && sourceName}
						<Row title="Updates from" description={source.described.sources[0]?.url}><span class="max-w-[320px] truncate">{sourceName}</span></Row>
					{/if}
				{:else if file.kind === 'package' && !fedora.available}
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
