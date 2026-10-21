<script lang="ts">
	import { i18n, t } from '@luft/i18n';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Star from '@lucide/svelte/icons/star';
	import { bytes, MenuButton, MenuItem, ProgressBar } from '@luft/ui';
	import { openStorePage, type StoreItem } from './api';
	import { cursors } from './cursors.svelte';

	interface Props {
		item: StoreItem;
		current: string;
		onuse: (theme: string) => void;
	}

	let { item, current, onuse }: Props = $props();

	const ARCHIVE = /\.(tar\.(gz|bz2|xz)|tgz|tbz2?|txz|tar|zip)$/i;

	let count = $derived(new Intl.NumberFormat(i18n.formats, { notation: 'compact', maximumFractionDigits: 1 }));
	let rating = $derived(new Intl.NumberFormat(i18n.formats, { minimumFractionDigits: 1, maximumFractionDigits: 1 }));
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
				<span class="rating"><Star size={12} aria-hidden="true" />{rating.format(item.rating)}</span>
			{/if}
			<span>{t('settings-cursors-downloads', { count: item.downloads, downloads: count.format(item.downloads) })}</span>
		</span>
		{#if install?.state === 'failed'}
			<span class="error">{install.error}</span>
		{/if}
	</div>
	<div class="action">
		{#if busy}
			<ProgressBar {fraction} label={t('settings-cursors-installing', { name: item.name })} class="w-[72px]" />
		{:else if installed && installed === current}
			<span class="in-use">{t('settings-cursors-in-use')}</span>
		{:else if installed}
			<button type="button" class="button" onclick={() => onuse(installed)}>{t('settings-cursors-use')}</button>
		{:else if item.files.length === 1}
			<button type="button" class="button" onclick={() => cursors.install(item.id, item.files[0].index)}>{t('settings-cursors-get')}</button>
		{:else if item.files.length}
			<MenuButton label={t('settings-cursors-choose-download', { name: item.name })} class="button" align="end" minWidth={260}>
				{#snippet trigger()}
					{t('settings-cursors-get')}
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
			<button type="button" class="plain-button" onclick={() => openStorePage(item.id)}>{t('settings-cursors-view-online')}</button>
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
</style>
