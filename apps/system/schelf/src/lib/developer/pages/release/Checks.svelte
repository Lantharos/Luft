<script lang="ts">
	import { Row, Section } from '@luft/ui';
	import { CHECK_TITLES } from '../../format';
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
	<Section title="Checks">
		{#each flagged as check (check.name)}
			<Row title={CHECK_TITLES[check.name]} description={check.summary} icon={CHECK_ICONS[check.status]}>
				{#if check.detail !== undefined}
					<button type="button" class="button" onclick={() => (open = check)}>Details</button>
				{/if}
			</Row>
		{/each}
		{#if passed}
			<Row title={flagged.length ? `${passed} more passed` : `All ${passed} passed`} icon={CHECK_ICONS.passed}>
				<button type="button" class="button" onclick={() => (all = true)}>Show</button>
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
