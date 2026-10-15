<script lang="ts">
	import type { Component } from 'svelte';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	interface Props {
		icon: Component<{ size?: number }>;
		title: string;
		description: string;
		note?: string;
		selected?: boolean;
		disabled?: boolean;
		onclick: () => void;
	}

	let { icon: Icon, title, description, note, selected = false, disabled = false, onclick }: Props = $props();
</script>

<button type="button" class="choice" class:selected {disabled} {onclick}>
	<span class="icon"><Icon size={22} /></span>
	<span class="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
		<span class="text-[16px] font-semibold">{title}</span>
		<span class="text-[13.5px] leading-snug text-[var(--text-soft)]">{description}</span>
		{#if note}
			<span class="mt-1 text-[12.5px] leading-snug text-[var(--text-muted)]">{note}</span>
		{/if}
	</span>
	<ChevronRight size={18} class="flex-none text-[var(--text-muted)]" />
</button>

<style>
	.choice {
		display: flex;
		width: 100%;
		align-items: center;
		gap: 16px;
		border-radius: 18px;
		padding: 14px 16px 14px 14px;
		transition:
			background-color 160ms var(--ease),
			transform 160ms var(--ease);
	}

	.choice:hover:not(:disabled),
	.choice.selected {
		background: var(--surface-hover);
	}

	.choice:active:not(:disabled) {
		transform: scale(0.985);
	}

	.choice:disabled {
		opacity: 0.45;
	}

	.icon {
		display: grid;
		height: 46px;
		width: 46px;
		flex: none;
		place-items: center;
		border-radius: 14px;
		background: var(--accent-soft);
		color: var(--accent);
	}
</style>
