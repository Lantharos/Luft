<script lang="ts">
	import { Row, Switch } from '@luft/ui';
	import { setChargeLimit, type ChargeLimit } from './api';

	let { limit }: { limit: ChargeLimit } = $props();

	let pending = $state<boolean | null>(null);
	let failed = $state(false);

	let enabled = $derived(pending ?? limit.enabled);
	let description = $derived.by(() => {
		if (failed) return "The limit couldn't be changed. Try again.";
		if (limit.elsewhere) {
			if (limit.applied === null) return 'Another app turned the limit off, so the battery charges fully';
			return enabled ? `Another app changed the limit to ${limit.applied}%` : `Another app stops charging at ${limit.applied}%`;
		}
		if (enabled) return limit.stopsAt === null ? 'Your computer decides when to stop charging' : `Stops charging at ${limit.stopsAt}%`;
		return limit.stopsAt === null ? 'Stops charging early to help the battery last longer' : `Stops at ${limit.stopsAt}% to help the battery last longer`;
	});

	$effect(() => {
		if (pending === limit.enabled) pending = null;
	});

	async function toggle(on: boolean) {
		pending = on;
		failed = false;
		try {
			await setChargeLimit(on);
		} catch {
			pending = null;
			failed = true;
		}
	}
</script>

{#if limit.adjustable}
	<Row title="Limit charging" {description}>
		<Switch label="Limit charging" checked={enabled} onchange={toggle} />
	</Row>
{:else if limit.applied !== null}
	<Row title="Charging stops at {limit.applied}%" description="Another app on this computer sets this limit. You can change it there." />
{/if}
