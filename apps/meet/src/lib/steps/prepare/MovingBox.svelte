<script lang="ts">
	import { onMount } from 'svelte';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { t } from '@luft/i18n';
	import { bytes, Checkbox } from '@luft/ui';
	import * as meet from '#lib/bridge/meet.js';
	import type { Belongings, FolderKind } from '#lib/bridge/meet.js';
	import type { Failure } from '#lib/state/meet.svelte.js';
	import Frame from '#lib/components/Frame.svelte';
	import Problem from '#lib/components/Problem.svelte';
	import { session } from '#lib/state/meet.svelte.js';

	const NAMES: Record<FolderKind, string> = {
		desktop: 'box-folder-desktop',
		documents: 'box-folder-documents',
		downloads: 'box-folder-downloads',
		music: 'box-folder-music',
		pictures: 'box-folder-pictures',
		videos: 'box-folder-videos'
	};
	const BYTES_PER_MINUTE = 6 * 1000 ** 3;
	const A_WHILE = 20 * 1000 ** 3;

	let found = $state<Belongings | null>(null);
	let problem = $state<Failure | null>(null);
	let folders = $state<Record<string, boolean>>({});
	let wallpaper = $state(true);
	let wifi = $state(false);
	let bluetooth = $state(true);
	let paired = $derived(session.windows?.bluetooth ?? 0);
	let account = $state(true);

	let chosen = $derived(found?.folders.filter((folder) => folders[folder.kind]) ?? []);
	let total = $derived(chosen.reduce((sum, folder) => sum + folder.bytes, 0));
	let minutes = $derived(Math.max(1, Math.round(total / BYTES_PER_MINUTE)));

	async function look() {
		problem = null;
		try {
			found = await meet.belongings();
			folders = Object.fromEntries(found.folders.map((folder) => [folder.kind, folder.kind !== 'downloads' && folder.bytes > 0]));
		} catch (error) {
			console.error('Meet Luft couldn’t look through the folders:', error);
			problem = { task: 'folders', declined: false, retry: look };
		}
	}

	onMount(look);

	function pack() {
		if (!found) return;
		void session.pack({
			folders: chosen.map(({ kind, path }) => ({ kind, path })),
			wallpaper: wallpaper ? found.wallpaper : null,
			account: account ? $state.snapshot(found.account) : null,
			wifi,
			bluetooth: bluetooth && paired > 0
		});
	}
</script>

<Frame title={t('box-title')} description={t('box-description')} onback={() => session.go('ready')}>
	{#if !found}
		<div class="flex items-center gap-3 py-2 text-[14px] text-[var(--text-soft)]">
			{#if problem}
				<Problem failure={problem} />
			{:else}
				<LoaderCircle size={18} class="animate-spin" />{t('box-looking')}
			{/if}
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-x-8 gap-y-1">
			{#each found.folders as folder (folder.kind)}
				{@const name = t(NAMES[folder.kind])}
				<div class="row">
					<Checkbox label={name} checked={folders[folder.kind]} onchange={(next) => (folders[folder.kind] = next)}>
						<span class="flex flex-col">
							<span class="text-[14.5px] font-medium text-[var(--text)]">{name}</span>
							<span class="text-[12.5px] text-[var(--text-muted)]">{t('box-folder-size', { size: bytes(folder.bytes), files: folder.files })}</span>
						</span>
					</Checkbox>
				</div>
			{/each}
			<div class="row">
				<Checkbox label={t('box-wifi-title')} checked={wifi} onchange={(next) => (wifi = next)}>
					<span class="flex flex-col">
						<span class="text-[14.5px] font-medium text-[var(--text)]">{t('box-wifi-title')}</span>
						<span class="text-[12.5px] text-[var(--text-muted)]">{t('box-wifi-description')}</span>
					</span>
				</Checkbox>
			</div>
			{#if paired > 0}
				<div class="row">
					<Checkbox label={t('box-bluetooth-title')} checked={bluetooth} onchange={(next) => (bluetooth = next)}>
						<span class="flex flex-col">
							<span class="text-[14.5px] font-medium text-[var(--text)]">{t('box-bluetooth-title')}</span>
							<span class="text-[12.5px] text-[var(--text-muted)]">{t('box-bluetooth-description', { devices: paired })}</span>
						</span>
					</Checkbox>
				</div>
			{/if}
			{#if found.wallpaper}
				<div class="row">
					<Checkbox label={t('box-wallpaper-title')} checked={wallpaper} onchange={(next) => (wallpaper = next)}>
						<span class="flex flex-col">
							<span class="text-[14.5px] font-medium text-[var(--text)]">{t('box-wallpaper-title')}</span>
							<span class="text-[12.5px] text-[var(--text-muted)]">{t('box-wallpaper-description')}</span>
						</span>
					</Checkbox>
				</div>
			{/if}
			<div class="row">
				<Checkbox label={t('box-account-title')} checked={account} onchange={(next) => (account = next)}>
					<span class="flex flex-col">
						<span class="text-[14.5px] font-medium text-[var(--text)]">{t('box-account-title')}</span>
						<span class="text-[12.5px] text-[var(--text-muted)]">{found.account.fullName}</span>
					</span>
				</Checkbox>
			</div>
		</div>
		{#if session.failure}
			<div class="mt-4"><Problem failure={session.failure} /></div>
		{/if}
	{/if}
	{#snippet actions()}
		{#if found}
			<span class="mr-2 text-[13px] text-[var(--text-muted)]">
				{total > A_WHILE ? t('box-total-slow', { size: bytes(total), minutes }) : bytes(total)}
			</span>
			<button type="button" class="button primary large px-6" onclick={pack}>{t('box-pack')}</button>
		{/if}
	{/snippet}
</Frame>

<style>
	.row {
		padding: 8px 4px;
	}
</style>
