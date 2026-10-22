<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Dialog } from '@luft/ui';

	interface Props {
		title: string;
		description: string;
		facts?: string[];
		confirm: string;
		onconfirm: () => void;
		onclose: () => void;
		children?: Snippet;
	}

	let { title, description, facts = [], confirm, onconfirm, onclose, children }: Props = $props();
</script>

<Dialog {title} {description} wide={!!children} {onclose}>
	{#if facts.length || children}
		<div class="flex flex-col gap-4 text-[13.5px]">
			{#if facts.length}
				<ul class="flex flex-col gap-1.5">
					{#each facts as fact (fact)}
						<li class="fact">{fact}</li>
					{/each}
				</ul>
			{/if}
			{@render children?.()}
		</div>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" data-autofocus onclick={onclose}>Cancel</button>
		<button type="button" class="button danger" onclick={onconfirm}>{confirm}</button>
	{/snippet}
</Dialog>

<style>
	.fact {
		position: relative;
		padding-left: 14px;
		color: var(--text-soft);
	}

	.fact::before {
		content: '';
		position: absolute;
		top: 0.6em;
		left: 2px;
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: var(--text-muted);
	}
</style>
