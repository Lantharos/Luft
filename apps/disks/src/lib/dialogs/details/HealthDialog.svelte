<script lang="ts">
	import { Dialog, tooltip } from '@luft/ui';
	import * as api from '#lib/api.js';
	import type { Drive, Health } from '#lib/api.js';
	import { duration, healthAdvice, selftestResult } from '#lib/format.js';
	import { disks } from '#lib/state/disks.svelte.js';
	import Facts from './Facts.svelte';

	interface Props {
		drive: Drive;
		health: Health;
		onclose: () => void;
	}

	let { drive, health, onclose }: Props = $props();

	let key = $derived(`${drive.id}:test`);
	let busy = $derived(disks.busy.has(key));
	let testing = $derived(health.selftest.status === 'inprogress');
	let done = $derived(testing && health.selftest.remaining !== null ? 100 - health.selftest.remaining : null);
	let facts = $derived(
		[
			health.temperature !== null && { label: 'Temperature', value: `${Math.round(health.temperature)} °C` },
			health.powerOnHours !== null && { label: 'Powered on for', value: duration(health.powerOnHours) },
			health.badSectors > 0 && { label: 'Unreadable sectors', value: String(health.badSectors) },
			{ label: 'Self-test', value: testing ? `Running${done !== null ? `, ${done}% done` : ''}` : (selftestResult(health.selftest.status) ?? 'Never run') }
		].filter((fact) => fact !== false)
	);

	function test(extended: boolean) {
		void disks.run(key, () => api.startSelftest(drive.id, extended));
	}
</script>

<Dialog title={health.state === 'good' ? 'This drive is healthy' : 'This drive needs attention'} description={healthAdvice(health)} {onclose}>
	<Facts {facts} />
	{#if testing && done !== null}
		<div class="mx-1 h-1.5 overflow-hidden rounded-full bg-[var(--control)]">
			<div class="h-full origin-left rounded-full bg-[var(--accent)] transition-transform" style:transform="scaleX({done / 100})"></div>
		</div>
	{/if}
	{#snippet actions()}
		{#if testing}
			<button type="button" class="button mr-auto" disabled={busy} onclick={() => disks.run(key, () => api.stopSelftest(drive.id))}>Stop test</button>
		{:else}
			<button type="button" class="button" disabled={busy} onclick={() => test(false)} {@attach tooltip('A couple of minutes, while you keep using it')}>Quick test</button>
			<button type="button" class="button mr-auto" disabled={busy} onclick={() => test(true)} {@attach tooltip('Can take hours, while you keep using it')}>Full test</button>
		{/if}
		<button type="button" class="button primary" onclick={onclose}>Done</button>
	{/snippet}
</Dialog>
