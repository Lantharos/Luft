<script lang="ts">
	import CircleAlert from '@luft/symbols/icons/circle-alert';
	import CircleCheck from '@luft/symbols/icons/circle-check';
	import Store from '@luft/symbols/icons/store';
	import { t } from '@luft/i18n';
	import { fade, revealContents } from '@luft/ui';
	import AppArt from '#lib/components/AppArt.svelte';
	import type { FileInstall } from '#lib/files/install.svelte.js';
	import { operations } from '#lib/state/operations.svelte.js';
	import Actions from './Actions.svelte';
	import { facts } from './facts.js';

	let { install }: { install: FileInstall } = $props();

	const file = $derived(install.file);
	const removal = $derived(install.existing ? operations.forKey(install.existing.key) : null);
	const candidates = $derived([install.operation, install.listedOperation, removal]);
	const running = $derived(candidates.find((operation) => operation && operation.state !== 'failed') ?? null);
	const failure = $derived(candidates.find((operation) => operation?.state === 'failed') ?? null);
	const done = $derived(install.finished || install.finishedFromListing);
	const doneName = $derived(install.finishedFromListing && install.listed ? install.listed.listing.name : install.name);
	const phase = $derived(install.error ? 'unreadable' : running ? 'running' : failure ? 'failed' : done ? 'done' : 'ready');

	const byline = $derived.by(() => {
		const { publisher, version } = install;
		if (publisher && version) return t('install-byline', { publisher, version });
		if (version) return t('install-version', { version });
		return publisher;
	});
	const lines = $derived(phase === 'ready' || phase === 'running' ? facts(install) : []);
	const fileName = $derived(install.path.split('/').at(-1) ?? install.path);

	const offer = $derived.by(() => {
		const listed = install.listed;
		if (!listed) return null;
		const source = t(listed.store ? 'install-source-store' : 'install-source-flathub');
		if (install.fromListing) return t('install-listed-installed', { source });
		if (!listed.version || !install.listedVersionChange) return t('install-listed', { source });
		if (install.listedVersionChange === 'none') return t('install-listed-same', { source });
		if (install.listedVersionChange === 'down') return t('install-listed-older', { source, version: listed.version });
		return t('install-listed-newer', { source, version: listed.version });
	});

	function remove() {
		if (install.existing) void install.ask({ kind: 'remove', app: install.existing });
	}

	function details() {
		if (file) void install.ask({ kind: 'details', file });
	}

	function retry() {
		if (!failure) return;
		if (failure === removal) {
			void operations.cancel(failure.id);
			remove();
		} else if (failure === install.listedOperation) install.installListed();
		else install.install();
	}
</script>

<div class="flex min-h-0 flex-1 flex-col p-7 pb-6">
	<div class="drag-region flex items-center gap-4 pr-8">
		<AppArt icon={install.icon} size={72} source={file?.kind === 'package' ? 'system' : null} />
		<div class="flex min-w-0 flex-1 flex-col gap-1">
			<h1 class="truncate text-[21px] font-semibold">{phase === 'unreadable' ? fileName : install.name}</h1>
			{#if byline && phase !== 'unreadable'}
				<span class="truncate text-[13px] text-[var(--text-muted)]">{byline}</span>
			{/if}
		</div>
	</div>

	<div class="mt-5 -mx-2 min-h-0 flex-1 overflow-y-auto px-2">
		{#key phase}
			<div in:fade>
				{#if phase === 'unreadable'}
					<p class="line warning"><CircleAlert size={16} />{install.error}</p>
				{:else if phase === 'failed' && failure}
					<p class="line warning"><CircleAlert size={16} />{t(failure === removal ? 'install-remove-failed' : 'install-failed', { app: install.name })}</p>
					<p class="mt-1.5 pl-[26px] text-[13px] text-[var(--text-muted)]">{failure.error}</p>
				{:else if phase === 'done'}
					<p class="line"><CircleCheck size={16} style="color: var(--success)" />{t(file?.kind === 'flatpakRepo' ? 'install-done-source' : 'install-done', { app: doneName })}</p>
				{:else if lines.length}
					{#if offer}
						<p class="line offer mb-2.5" in:fade><Store size={16} />{offer}</p>
					{/if}
					<ul class="flex flex-col gap-2.5" {@attach revealContents}>
						{#each lines as line (line.text)}
							<li class="line" class:warning={line.warning}><line.icon size={16} />{line.text}</li>
						{/each}
					</ul>
					<button type="button" class="quiet mt-3 -ml-2" onclick={details}>{t('install-details')}</button>
				{/if}
			</div>
		{/key}
	</div>

	<footer class="flex h-10 flex-none items-center justify-end gap-2">
		<Actions {install} {phase} {running} {retry} onremove={remove} />
	</footer>
</div>

<style>
	.line {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		font-size: 13.5px;
		line-height: 1.4;
		color: var(--text-soft);
	}

	.line :global(svg) {
		flex: none;
		margin-top: 1px;
		color: var(--text-muted);
	}

	.line.warning,
	.line.warning :global(svg) {
		color: var(--danger);
	}

	.line.offer {
		color: var(--text);
	}

	.quiet {
		height: 32px;
		border-radius: var(--radius-pill);
		padding-inline: 8px;
		font-size: 13px;
		font-weight: 500;
		color: var(--text-muted);
		transition:
			background-color var(--motion-tap) var(--ease-decelerate),
			color var(--motion-tap) var(--ease-decelerate);
	}

	.quiet:hover {
		background: var(--surface-hover);
		color: var(--text);
	}
</style>
