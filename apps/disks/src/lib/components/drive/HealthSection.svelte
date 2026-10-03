<script lang="ts">
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { Row, Section } from '@luft/ui';
	import * as api from '$lib/api';
	import type { Drive, Health } from '$lib/api';
	import { duration, healthAdvice, healthTitle, selftestResult } from '$lib/format';
	import { disks } from '$lib/state/disks.svelte';

	interface Props {
		drive: Drive;
		health: Health;
	}

	let { drive, health }: Props = $props();

	let testing = $derived(health.selftest.status === 'inprogress');
	let result = $derived(selftestResult(health.selftest.status));
	let busy = $derived(disks.busy.has(`${drive.id}:test`));

	function test(extended: boolean) {
		void disks.run(`${drive.id}:test`, () => api.startSelftest(drive.id, extended));
	}
</script>

<Section title="Health">
	<Row title={healthTitle(health)} description={healthAdvice(health)}>
		<span class={['state', health.state]}>
			{#if health.state === 'good'}
				<CircleCheck size={20} />
			{:else}
				<TriangleAlert size={20} />
			{/if}
		</span>
	</Row>
	{#if health.temperature !== null}
		<Row title="Temperature"><span>{Math.round(health.temperature)} °C</span></Row>
	{/if}
	{#if health.powerOnHours !== null}
		<Row title="Running time" description="How long the drive has been powered on in total">
			<span>{duration(health.powerOnHours)}</span>
		</Row>
	{/if}
	<Row
		title="Self-test"
		description={testing
			? `Testing${health.selftest.remaining !== null ? `, ${100 - health.selftest.remaining}% done` : ''}. You can keep using the drive.`
			: (result ?? 'The drive checks itself while you keep using it')}
	>
		{#if testing}
			<button type="button" class="button" disabled={busy} onclick={() => disks.run(`${drive.id}:test`, () => api.stopSelftest(drive.id))}>Stop</button>
		{:else}
			<button type="button" class="button" disabled={busy} onclick={() => test(false)}>Quick test</button>
			<button type="button" class="button" disabled={busy} onclick={() => test(true)}>Full test</button>
		{/if}
	</Row>
</Section>

<style>
	.state {
		display: grid;
		place-items: center;
	}

	.good {
		color: var(--success);
	}

	.warning,
	.failing {
		color: var(--danger);
	}
</style>
