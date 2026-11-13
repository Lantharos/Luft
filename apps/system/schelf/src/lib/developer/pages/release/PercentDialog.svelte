<script lang="ts">
	import { untrack } from 'svelte';
	import { Dialog, Slider } from '@luft/ui';
	import type { ReleaseSummary } from '../../store';

	let { release, onclose, onset }: { release: ReleaseSummary; onclose: () => void; onset: (percent: number) => Promise<boolean | void> } = $props();

	let percent = $state(untrack(() => Math.max(release.rollout_percent, 50)));
	let busy = $state(false);

	async function set() {
		busy = true;
		if ((await onset(percent)) !== false) onclose();
		busy = false;
	}
</script>

<Dialog title="Set the rollout" description="It keeps rising a step a day from there unless you pause it." {onclose}>
	<div class="flex items-center gap-4">
		<div class="flex-1">
			<Slider label="Rollout percentage" value={percent} min={1} max={100} step={1} oninput={(value) => (percent = value)} onchange={(value) => (percent = value)} />
		</div>
		<span class="w-12 text-right text-[14px] tabular-nums">{percent}%</span>
	</div>
	{#snippet actions()}
		<button type="button" class="button" disabled={busy} onclick={onclose}>Cancel</button>
		<button type="button" class="button primary" disabled={busy} onclick={set}>Set to {percent}%</button>
	{/snippet}
</Dialog>
