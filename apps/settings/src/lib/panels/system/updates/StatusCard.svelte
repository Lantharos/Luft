<script lang="ts">
	import { t } from '@luft/i18n';
	import Laptop from '@lucide/svelte/icons/laptop';
	import HeroCard from '#lib/components/HeroCard.svelte';
	import { commands } from '#lib/bindings.js';
	import type { Activity, Release, UpdatesOverview } from '#lib/bindings.js';
	import { versionLabel } from '../version';
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
	const current = $derived(overview?.system.current ?? null);
	const version = $derived(current?.version ? versionLabel(current.version) : null);
	const status = $derived([headline(overview, activity), subline(overview, activity, failure)].filter(Boolean).join(' · '));
</script>

<HeroCard title={system ?? ''} detail={version} {status} icon={Laptop}>
	{#snippet actions()}
		{#if current?.notes}
			<button type="button" class="button" onclick={() => (notes = current)}>{t('settings-updates-whats-new')}</button>
		{/if}
		<button type="button" class="button" disabled={busy} onclick={() => attempt(commands.updatesCheck)}>
			{activity.running === 'check' ? t('settings-updates-checking-button') : t('settings-updates-check')}
		</button>
	{/snippet}
</HeroCard>

{#if notes}
	<NotesDialog release={notes} onclose={() => (notes = null)} />
{/if}
