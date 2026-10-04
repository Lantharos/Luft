<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';

	interface Props {
		open: boolean;
		hint?: Attachment<HTMLElement>;
		children: Snippet;
	}

	let { open = $bindable(), hint, children }: Props = $props();
</script>

<button type="button" class={['disclosure', open && 'open']} aria-expanded={open} {@attach hint} onclick={() => (open = !open)}>
	{@render children()}
	<ChevronDown size={14} />
</button>

<style>
	.disclosure {
		display: inline-flex;
		height: 32px;
		flex: none;
		align-items: center;
		gap: 3px;
		align-self: center;
		justify-self: start;
		border-radius: var(--radius-pill);
		padding-inline: 10px 8px;
		font-size: 13px;
		color: var(--text-muted);
		transition:
			background-color 160ms var(--ease),
			color 160ms var(--ease);
	}

	.disclosure:hover,
	.disclosure.open {
		background: var(--surface-hover);
		color: var(--text);
	}

	.disclosure :global(svg) {
		transition: transform 200ms var(--ease);
	}

	.disclosure.open :global(svg) {
		transform: rotate(180deg);
	}
</style>
