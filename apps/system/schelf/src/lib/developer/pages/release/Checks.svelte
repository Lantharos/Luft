<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section } from '@luft/ui';
	import { checkTitle } from '../../format';
	import type { CheckResult, Release } from '../../store';
	import CheckDialog from './CheckDialog.svelte';
	import { CHECK_ICONS } from './checks';
	import ChecksDialog from './ChecksDialog.svelte';

	let { release }: { release: Release } = $props();
	let open = $state<CheckResult | null>(null);
	let all = $state(false);

	const flagged = $derived(release.checks.filter((check) => check.status !== 'passed'));
	const passed = $derived(release.checks.length - flagged.length);
</script>

{#if release.checks.length}
	<Section title={t('developer-checks-title')}>
		{#each flagged as check (check.name)}
			<Row title={checkTitle(check.name)} description={check.summary} icon={CHECK_ICONS[check.status]}>
				{#if check.detail !== undefined}
					<button type="button" class="button" onclick={() => (open = check)}>{t('developer-checks-details')}</button>
				{/if}
			</Row>
		{/each}
		{#if passed}
			<Row title={t(flagged.length ? 'developer-checks-more-passed' : 'developer-checks-all-passed', { count: passed })} icon={CHECK_ICONS.passed}>
				<button type="button" class="button" onclick={() => (all = true)}>{t('developer-show')}</button>
			</Row>
		{/if}
	</Section>
{/if}

{#if open}
	<CheckDialog check={open} {release} onclose={() => (open = null)} />
{/if}

{#if all}
	<ChecksDialog {release} onclose={() => (all = false)} ondetail={(check) => ((all = false), (open = check))} />
{/if}
