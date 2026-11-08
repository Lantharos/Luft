<script lang="ts">
	import type { Component } from 'svelte';

	interface Option {
		id: string;
		label: string;
		detail?: string;
		icon?: Component;
	}

	let { options, onchoose }: { options: Option[]; onchoose: (id: string) => void } = $props();
</script>

<div class="list">
	{#each options as option (option.id)}
		<button type="button" class="option" onclick={() => onchoose(option.id)}>
			{#if option.icon}
				<option.icon size={18} class="flex-none text-[var(--text-soft)]" />
			{/if}
			<span class="flex min-w-0 flex-1 flex-col">
				<span class="truncate">{option.label}</span>
				{#if option.detail}
					<span class="detail">{option.detail}</span>
				{/if}
			</span>
		</button>
	{/each}
</div>

<style>
	.list {
		display: flex;
		flex-direction: column;
		gap: 2px;
		margin-inline: -6px;
	}

	.option {
		display: flex;
		min-height: 44px;
		align-items: center;
		gap: 12px;
		border-radius: 12px;
		padding: 6px 10px;
		text-align: left;
		font-size: 13.5px;
		color: var(--text);
		transition: background-color var(--motion-tap) var(--ease-decelerate);
	}

	.option:hover,
	.option:focus-visible {
		background: var(--surface-hover);
	}

	.detail {
		font-size: 12.5px;
		color: var(--text-soft);
	}
</style>
