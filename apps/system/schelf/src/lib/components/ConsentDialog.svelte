<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Dialog } from '@luft/ui';
	import type { Access } from '#lib/app/permissions.js';

	interface Props {
		title: string;
		description: string;
		access?: Access[];
		facts?: string[];
		note?: string;
		confirm: string;
		danger?: boolean;
		onconfirm: () => void;
		onclose: () => void;
		children?: Snippet;
	}

	let { title, description, access = [], facts = [], note, confirm, danger = false, onconfirm, onclose, children }: Props = $props();
</script>

<Dialog {title} {description} wide={!!children} {onclose}>
	{#if access.length || facts.length || note || children}
		<div class="flex flex-col gap-4 text-[13.5px]">
			{#if access.length}
				<ul class="flex flex-col gap-3">
					{#each access as entry (entry.title)}
						<li class="flex items-start gap-3">
							<span class="mt-0.5 text-[var(--text-soft)]"><entry.icon size={18} /></span>
							<span class="flex flex-col gap-0.5">
								<span class="font-medium">{entry.title}</span>
								{#if entry.description}
									<span class="text-[var(--text-muted)]">{entry.description}</span>
								{/if}
							</span>
						</li>
					{/each}
				</ul>
			{/if}
			{#if facts.length}
				<ul class="flex flex-col gap-1.5">
					{#each facts as fact (fact)}
						<li class="fact">{fact}</li>
					{/each}
				</ul>
			{/if}
			{#if note}
				<p class="text-[13px] text-[var(--text-muted)]">{note}</p>
			{/if}
			{@render children?.()}
		</div>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" data-autofocus={danger || undefined} onclick={onclose}>Cancel</button>
		<button type="button" class="button {danger ? 'danger' : 'primary'}" onclick={onconfirm}>{confirm}</button>
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
