<script lang="ts">
	export interface Segment {
		label: string;
		value: number;
		display: string;
		tone: 'accent' | 'soft' | 'empty';
	}

	interface Props {
		label: string;
		segments: Segment[];
		total: number;
	}

	let { label, segments, total }: Props = $props();
</script>

<div class="flex flex-col gap-3">
	<div class="bar" role="img" aria-label={label}>
		{#each segments as segment (segment.label)}
			<span class={['part', segment.tone]} style:flex-grow={total > 0 ? segment.value / total : 0}></span>
		{/each}
	</div>
	<div class="flex flex-wrap gap-x-6 gap-y-2 px-1">
		{#each segments as segment (segment.label)}
			<span class="key">
				<span class={['dot', segment.tone]}></span>
				<span class="text-[var(--text-muted)]">{segment.label}</span>
				<span class="tabular-nums">{segment.display}</span>
			</span>
		{/each}
	</div>
</div>

<style>
	.bar {
		display: flex;
		height: 12px;
		gap: 3px;
		overflow: hidden;
		border-radius: var(--radius-pill);
	}

	.part {
		min-width: 0;
		flex-basis: 0;
		border-radius: 3px;
	}

	.key {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		font-size: 12.5px;
	}

	.dot {
		height: 8px;
		width: 8px;
		border-radius: var(--radius-pill);
	}

	.accent {
		background: var(--accent);
	}

	.soft {
		background: color-mix(in srgb, var(--accent) 45%, var(--control));
	}

	.empty {
		background: var(--control);
	}
</style>
