<script lang="ts">
	import type { Strength } from './strength';

	let { strength }: { strength: Strength } = $props();
</script>

<div class="flex flex-col gap-1.5 px-1">
	<div class="meter" aria-hidden="true">
		{#each [1, 2, 3] as step (step)}
			<span class:filled={strength.level >= step} data-level={strength.level}></span>
		{/each}
	</div>
	<p class="text-[12.5px] text-[var(--text-muted)]">{strength.label}</p>
</div>

<style>
	.meter {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 4px;
	}

	.meter span {
		height: 4px;
		border-radius: var(--radius-pill);
		background: var(--control);
		transition: background-color 200ms var(--ease);
	}

	.meter .filled[data-level='1'] {
		background: var(--danger);
	}

	.meter .filled[data-level='2'] {
		background: var(--accent);
	}

	.meter .filled[data-level='3'] {
		background: var(--success);
	}
</style>
