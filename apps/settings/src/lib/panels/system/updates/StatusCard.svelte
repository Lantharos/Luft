<script lang="ts">
	import { t } from '@luft/i18n';
	import Laptop from '@lucide/svelte/icons/laptop';
	import { ProgressBar } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { Activity, Release, UpdatesOverview } from '#lib/bindings.js';
	import { percent } from '#lib/format.js';
	import { versionLabel } from '../version';
	import { downloading, fractionOf } from './activity';
	import { headline, subline } from './headline';
	import NotesDialog from './image/NotesDialog.svelte';

	interface Props {
		system: string | null;
		overview: UpdatesOverview | null;
		activity: Activity;
		failure: string | null;
		attempt: (action: () => Promise<unknown>) => void;
	}

	let { system, overview, activity, failure, attempt }: Props = $props();

	let notes = $state<Release | null>(null);

	const busy = $derived(activity.running !== null);
	const fraction = $derived(fractionOf(activity));
	const current = $derived(overview?.system.current ?? null);
	const version = $derived(current?.version ? versionLabel(current.version) : null);
	const status = $derived([headline(overview, activity), subline(overview, activity, failure)].filter(Boolean).join(' · '));
</script>

<div class="row-group">
	<div class="status">
		<span class="mark"><Laptop size={22} /></span>
		<div class="flex min-w-0 flex-1 flex-col gap-0.5">
			<span class="truncate text-[16px] font-semibold">
				{system ?? ''}
				{#if version}<span class="font-normal text-[var(--text-muted)]">{version}</span>{/if}
			</span>
			<span class="truncate text-[13.5px] text-[var(--text-muted)]">{status}</span>
			{#if downloading(activity)}
				<div class="mt-2 flex items-center gap-3">
					<ProgressBar {fraction} class="flex-1" />
					<span class="w-10 text-right text-[12.5px] text-[var(--text-muted)] tabular-nums">{fraction === null ? '' : percent(fraction)}</span>
				</div>
			{/if}
		</div>
		{#if current?.notes}
			<button type="button" class="button" onclick={() => (notes = current)}>{t('settings-updates-whats-new')}</button>
		{/if}
		{#if downloading(activity)}
			<button type="button" class="button" onclick={() => attempt(commands.updatesCancel)}>{t('settings-updates-stop')}</button>
		{:else}
			<button type="button" class="button" disabled={busy} onclick={() => attempt(commands.updatesCheck)}>
				{activity.running === 'check' ? t('settings-updates-checking-button') : t('settings-updates-check')}
			</button>
		{/if}
	</div>
</div>

{#if notes}
	<NotesDialog release={notes} onclose={() => (notes = null)} />
{/if}

<style>
	.status {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 16px;
	}

	.mark {
		display: grid;
		flex: none;
		width: 44px;
		height: 44px;
		place-items: center;
		border-radius: 12px;
		background: var(--control);
		color: var(--text);
	}
</style>
