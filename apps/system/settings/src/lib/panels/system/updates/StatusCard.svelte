<script lang="ts">
	import { t } from '@luft/i18n';
	import Laptop from '@luft/symbols/icons/laptop';
	import HeroCard from '#lib/components/HeroCard.svelte';
	import { commands } from '#lib/bindings.js';
	import type { Activity, UpdatesOverview } from '#lib/bindings.js';
	import { versionLabel } from '../version';
	import { headline, subline } from './headline';
	import { Spinner } from '@luft/ui';

	interface Props {
		system: string;
		overview: UpdatesOverview | null;
		activity: Activity;
		failure: string | null;
		attempt: (action: () => Promise<unknown>) => void;
	}

	let { system, overview, activity, failure, attempt }: Props = $props();

	const busy = $derived(activity.running !== null);
	const current = $derived(overview?.system.current ?? null);
	const version = $derived(current?.version ? versionLabel(current.version) : null);
	const status = $derived([headline(overview, activity), subline(overview, activity, failure)].filter(Boolean).join(' · '));
</script>

<HeroCard title={system} detail={version} {status} icon={Laptop}>
	{#snippet actions()}
		<button type="button" class="button" disabled={busy} onclick={() => attempt(commands.updatesCheck)}>
			{#if activity.running === 'check'}<Spinner />{t('settings-updates-checking-button')}{:else}{t('settings-updates-check')}{/if}
		</button>
	{/snippet}
</HeroCard>
