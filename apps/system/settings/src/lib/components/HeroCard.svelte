<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import { Spinner } from '@luft/ui';

	interface Props {
		title: string;
		detail?: string | null;
		status?: string | null;
		working?: boolean;
		icon?: Component;
		good?: boolean;
		leading?: Snippet;
		actions?: Snippet;
		children?: Snippet;
	}

	let { title, detail, status, working = false, icon: Icon, good = false, leading, actions, children }: Props = $props();
</script>

<div class="row-group">
	<div class="hero">
		{#if Icon}
			<span class="plate" class:good><Icon size={22} /></span>
		{:else}
			{@render leading?.()}
		{/if}
		<div class="flex min-w-0 flex-1 flex-col gap-0.5">
			<span class="truncate text-[16px] font-semibold">
				{title}
				{#if detail}<span class="font-normal text-[var(--text-muted)]">{detail}</span>{/if}
			</span>
			{#if status}
				<span class="flex min-w-0 items-center gap-2 text-[13.5px] text-[var(--text-muted)]">
					{#if working}<Spinner size={14} />{/if}
					<span class="truncate">{status}</span>
				</span>
			{/if}
			{@render children?.()}
		</div>
		{@render actions?.()}
	</div>
</div>

<style>
	.hero {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 16px;
	}

	.plate {
		display: grid;
		flex: none;
		width: 44px;
		height: 44px;
		place-items: center;
		border-radius: 12px;
		background: var(--control);
		color: var(--text);
	}

	.plate.good {
		color: var(--success);
	}
</style>
