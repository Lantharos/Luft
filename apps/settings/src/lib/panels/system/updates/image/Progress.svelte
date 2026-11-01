<script lang="ts">
	import { ProgressBar } from '@luft/ui';
	import type { Activity } from '#lib/bindings.js';
	import { percent } from '#lib/format.js';
	import { fractionOf } from '../activity';

	let { activity }: { activity: Activity } = $props();

	const fraction = $derived(fractionOf(activity));
</script>

<div class="flex items-center gap-3">
	<ProgressBar {fraction} class="flex-1" />
	<span class="w-10 text-right text-[12.5px] text-[var(--text-muted)] tabular-nums">{fraction === null ? '' : percent(fraction)}</span>
</div>
