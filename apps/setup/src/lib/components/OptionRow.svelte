<script lang="ts">
	import type { Component } from 'svelte';

	interface Props {
		icon: Component<{ size?: number }>;
		title: string;
		detail: string;
		selected: boolean;
		onclick: () => void;
	}

	let { icon: Icon, title, detail, selected, onclick }: Props = $props();
</script>

<button type="button" class="option" class:selected role="radio" aria-checked={selected} {onclick}>
	<span class="text-[var(--text-soft)]"><Icon size={22} /></span>
	<span class="flex min-w-0 flex-1 flex-col text-left">
		<span class="truncate text-[15px] font-medium">{title}</span>
		<span class="truncate text-[13px] text-[var(--text-muted)]">{detail}</span>
	</span>
	<span class="dot" aria-hidden="true"></span>
</button>

<style>
	.option {
		display: flex;
		width: 100%;
		align-items: center;
		gap: 14px;
		border-radius: 16px;
		padding: 12px 16px;
		transition: background-color var(--motion-tap) var(--ease-decelerate);
	}

	.option:hover,
	.option.selected {
		background: var(--surface-hover);
	}

	.dot {
		height: 20px;
		width: 20px;
		flex: none;
		border-radius: 50%;
		box-shadow: inset 0 0 0 1.5px var(--text-muted);
		transition: box-shadow var(--motion-tap) var(--ease-decelerate);
	}

	.selected .dot {
		box-shadow:
			inset 0 0 0 6px var(--accent),
			inset 0 0 0 20px var(--accent-text);
	}
</style>
