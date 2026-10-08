<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Star from '@lucide/svelte/icons/star';
	import { bytes, MenuButton, MenuItem } from '@luft/ui';
	import { openStorePage, type StoreItem } from './api';
	import { cursors } from './cursors.svelte';

	interface Props {
		item: StoreItem;
		current: string;
		onuse: (theme: string) => void;
	}

	let { item, current, onuse }: Props = $props();

	const ARCHIVE = /\.(tar\.(gz|bz2|xz)|tgz|tbz2?|txz|tar|zip)$/i;
	const count = new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 });

	let install = $derived(cursors.installs[item.id]);
	let installed = $derived(
		install?.state === 'installed'
			? install.themes[0]
			: cursors.themes?.find((theme) => item.files.some((file) => file.name.replace(ARCHIVE, '') === theme.name))?.name
	);
	let busy = $derived(install?.state === 'downloading' || install?.state === 'installing');
	let fraction = $derived(install?.state === 'downloading' && install.total ? install.received / install.total : null);
</script>

<div class="item">
	<span class="preview">
		{#if item.preview}
			<img src={item.preview} alt="" loading="lazy" decoding="async" />
		{/if}
	</span>
	<div class="text">
		<span class="name">{item.name}</span>
		<span class="meta">
			{item.author}
			{#if item.rating}
				<span class="rating"><Star size={12} aria-hidden="true" />{item.rating.toFixed(1)}</span>
			{/if}
			<span>{count.format(item.downloads)} downloads</span>
		</span>
		{#if install?.state === 'failed'}
			<span class="error">{install.error}</span>
		{/if}
	</div>
	<div class="action">
		{#if busy}
			<span class="progress" role="progressbar" aria-label="Installing {item.name}" aria-valuenow={fraction === null ? undefined : Math.round(fraction * 100)}>
				<span class="bar" class:waiting={fraction === null} style:width={fraction === null ? undefined : `${fraction * 100}%`}></span>
			</span>
		{:else if installed && installed === current}
			<span class="in-use">In use</span>
		{:else if installed}
			<button type="button" class="button" onclick={() => onuse(installed)}>Use</button>
		{:else if item.files.length === 1}
			<button type="button" class="button" onclick={() => cursors.install(item.id, item.files[0].index)}>Get</button>
		{:else if item.files.length}
			<MenuButton label="Choose a download for {item.name}" class="button" align="end" minWidth={260}>
				{#snippet trigger()}
					Get
					<ChevronDown size={15} />
				{/snippet}
				{#snippet children(close)}
					{#each item.files as file (file.index)}
						<MenuItem
							onclick={() => {
								close();
								void cursors.install(item.id, file.index);
							}}
						>
							<span class="min-w-0 flex-1 truncate">{file.name}</span>
							<span class="text-[12px] text-[var(--text-muted)] tabular-nums">{bytes(file.size)}</span>
						</MenuItem>
					{/each}
				{/snippet}
			</MenuButton>
		{:else}
			<button type="button" class="plain-button" onclick={() => openStorePage(item.id)}>View online</button>
		{/if}
	</div>
</div>

<style>
	.item {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 12px 16px;
	}

	.preview {
		flex: none;
		height: 64px;
		width: 92px;
		overflow: hidden;
		border-radius: 10px;
		background: var(--control);
	}

	img {
		height: 100%;
		width: 100%;
		object-fit: cover;
	}

	.text {
		display: flex;
		min-width: 0;
		flex: 1;
		flex-direction: column;
		gap: 3px;
	}

	.name {
		overflow: hidden;
		font-size: 14px;
		font-weight: 500;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		column-gap: 10px;
		font-size: 12.5px;
		color: var(--text-muted);
	}

	.rating {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		font-variant-numeric: tabular-nums;
	}

	.error {
		font-size: 12.5px;
		color: var(--danger);
	}

	.action {
		display: flex;
		flex: none;
		justify-content: flex-end;
		min-width: 72px;
	}

	.in-use {
		font-size: 13px;
		color: var(--text-muted);
	}

	.progress {
		position: relative;
		height: 6px;
		width: 72px;
		overflow: hidden;
		border-radius: 999px;
		background: var(--control);
	}

	.bar {
		position: absolute;
		inset-block: 0;
		left: 0;
		border-radius: inherit;
		background: var(--accent);
		transition: width 200ms var(--ease);
	}

	.bar.waiting {
		width: 40%;
		animation: slide 1.1s var(--ease) infinite;
	}

	@keyframes slide {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(250%);
		}
	}
</style>
