<script lang="ts">
	import { onMount } from 'svelte';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { bytes, Checkbox, plural } from '@luft/ui';
	import * as meet from '#lib/api/meet.js';
	import type { Belongings, FolderKind } from '#lib/api/meet.js';
	import type { Failure } from '#lib/state/meet.svelte.js';
	import Frame from '#lib/components/Frame.svelte';
	import Problem from '#lib/components/Problem.svelte';
	import { session } from '#lib/state/meet.svelte.js';

	const NAMES: Record<FolderKind, string> = {
		desktop: 'Desktop',
		documents: 'Documents',
		downloads: 'Downloads',
		music: 'Music',
		pictures: 'Pictures',
		videos: 'Videos'
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
	let regional = $state(true);

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
			regional: regional ? $state.snapshot(found.regional) : null,
			wifi,
			bluetooth: bluetooth && paired > 0
		});
	}
</script>

<Frame title="Bring your things" description="Choose what to take along. Luft unpacks it into your new account when it’s installed, and nothing is removed from Windows." onback={() => session.go('ready')}>
	{#if !found}
		<div class="flex items-center gap-3 py-2 text-[14px] text-[var(--text-soft)]">
			{#if problem}
				<Problem failure={problem} />
			{:else}
				<LoaderCircle size={18} class="animate-spin" />Looking through your folders…
			{/if}
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-x-8 gap-y-1">
			{#each found.folders as folder (folder.kind)}
				<div class="row">
					<Checkbox label={NAMES[folder.kind]} checked={folders[folder.kind]} onchange={(next) => (folders[folder.kind] = next)}>
						<span class="flex flex-col">
							<span class="text-[14.5px] font-medium text-[var(--text)]">{NAMES[folder.kind]}</span>
							<span class="text-[12.5px] text-[var(--text-muted)]">{bytes(folder.bytes)}, {plural(folder.files, 'file')}</span>
						</span>
					</Checkbox>
				</div>
			{/each}
			<div class="row">
				<Checkbox label="Wi-Fi networks" checked={wifi} onchange={(next) => (wifi = next)}>
					<span class="flex flex-col">
						<span class="text-[14.5px] font-medium text-[var(--text)]">Wi-Fi networks</span>
						<span class="text-[12.5px] text-[var(--text-muted)]">With their passwords, so Luft is online right away</span>
					</span>
				</Checkbox>
			</div>
			{#if paired > 0}
				<div class="row">
					<Checkbox label="Bluetooth devices" checked={bluetooth} onchange={(next) => (bluetooth = next)}>
						<span class="flex flex-col">
							<span class="text-[14.5px] font-medium text-[var(--text)]">Bluetooth devices</span>
							<span class="text-[12.5px] text-[var(--text-muted)]">{plural(paired, 'device')}, ready without pairing again</span>
						</span>
					</Checkbox>
				</div>
			{/if}
			{#if found.wallpaper}
				<div class="row">
					<Checkbox label="Wallpaper" checked={wallpaper} onchange={(next) => (wallpaper = next)}>
						<span class="flex flex-col">
							<span class="text-[14.5px] font-medium text-[var(--text)]">Wallpaper</span>
							<span class="text-[12.5px] text-[var(--text-muted)]">The picture on your Windows desktop</span>
						</span>
					</Checkbox>
				</div>
			{/if}
			<div class="row">
				<Checkbox label="Your name and picture" checked={account} onchange={(next) => (account = next)}>
					<span class="flex flex-col">
						<span class="text-[14.5px] font-medium text-[var(--text)]">Your name and picture</span>
						<span class="text-[12.5px] text-[var(--text-muted)]">{found.account.fullName}</span>
					</span>
				</Checkbox>
			</div>
			<div class="row">
				<Checkbox label="Time zone, keyboard and language" checked={regional} onchange={(next) => (regional = next)}>
					<span class="flex flex-col">
						<span class="text-[14.5px] font-medium text-[var(--text)]">Time zone, keyboard and language</span>
						<span class="text-[12.5px] text-[var(--text-muted)]">So Luft is set up like Windows</span>
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
				{bytes(total)}{total > A_WHILE ? `, which takes about ${minutes} minutes to pack` : ''}
			</span>
			<button type="button" class="button primary large px-6" onclick={pack}>Pack</button>
		{/if}
	{/snippet}
</Frame>

<style>
	.row {
		padding: 8px 4px;
	}
</style>
