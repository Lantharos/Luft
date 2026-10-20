<script lang="ts">
	import type { Activity } from './api';
	import { fractionOf } from './activity';
	import ProgressTrack from '#lib/components/ProgressTrack.svelte';
	import { percent } from '#lib/format.js';

	let { activity }: { activity: Activity } = $props();

	const fraction = $derived(fractionOf(activity));
</script>

{#if fraction !== null}
	<span class="ml-auto text-[13px] text-[var(--sidebar-text-muted)] tabular-nums">{percent(fraction)}</span>
{/if}
<ProgressTrack {fraction} class="absolute right-3 bottom-1 left-[42px] h-[3px] bg-[var(--sidebar-control)]" />
