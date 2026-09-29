<script lang="ts">
	import type { Snippet } from 'svelte';
	import Check from '@lucide/svelte/icons/check';

	interface Props {
		checked: boolean;
		label: string;
		disabled?: boolean;
		onchange: (checked: boolean) => void;
		children?: Snippet;
	}

	let { checked, label, disabled = false, onchange, children }: Props = $props();
</script>

<button
	type="button"
	role="checkbox"
	aria-checked={checked}
	aria-label={children ? undefined : label}
	{disabled}
	class="checkbox"
	onclick={() => onchange(!checked)}
>
	<span class="box" class:on={checked}>
		{#if checked}
			<Check size={13} strokeWidth={3} />
		{/if}
	</span>
	{#if children}
		<span class="text">{@render children()}</span>
	{/if}
</button>

<style>
	.checkbox {
		display: inline-flex;
		min-height: 28px;
		align-items: center;
		gap: 10px;
		border-radius: 10px;
		font-size: 13px;
		color: var(--text-soft);
		transition: color 160ms var(--ease), opacity 160ms var(--ease);
	}

	.checkbox:hover:not(:disabled) {
		color: var(--text);
	}

	.checkbox:disabled {
		opacity: 0.4;
	}

	.box {
		display: grid;
		height: 20px;
		width: 20px;
		flex: none;
		place-items: center;
		border-radius: 7px;
		background: var(--control);
		color: var(--accent-text);
		transition: background-color 160ms var(--ease), transform 160ms var(--ease);
	}

	.checkbox:hover:not(:disabled) .box:not(.on) {
		background: var(--control-hover);
	}

	.checkbox:active:not(:disabled) .box {
		transform: scale(0.92);
	}

	.box.on {
		background: var(--accent);
	}
</style>
