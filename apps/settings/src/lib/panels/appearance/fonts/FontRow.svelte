<script lang="ts">
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import { MenuButton, MenuItem, MenuSeparator, tooltip } from '@luft/ui';
	import type { FontFamily, FontRole } from './api';

	interface Props {
		family: FontFamily;
		divided: boolean;
		onopen: () => void;
		onuse: (role: FontRole) => void;
		onremove: () => void;
	}

	let { family, divided, onopen, onuse, onremove }: Props = $props();
</script>

<div class="font-row" class:divided>
	<button type="button" class="main" title="Open {family.name}" onclick={onopen}>
		<span class="name">{family.name}</span>
		<span class="sample" style:font-family="'{family.name}', var(--font-sans)" aria-hidden="true">The quick brown fox jumps over the lazy dog</span>
		<span class="styles">{family.styles === 1 ? '1 style' : `${family.styles} styles`}</span>
	</button>
	<MenuButton class="icon-button" label="More for {family.name}" align="end" {@attach tooltip('More')}>
		{#snippet trigger()}<Ellipsis size={18} />{/snippet}
		{#snippet children(close)}
			<MenuItem
				onclick={() => {
					close();
					onuse('interface');
				}}>Use as system font</MenuItem
			>
			{#if family.monospace}
				<MenuItem
					onclick={() => {
						close();
						onuse('monospace');
					}}>Use as monospace font</MenuItem
				>
			{/if}
			{#if family.removable}
				<MenuSeparator />
				<MenuItem
					danger
					onclick={() => {
						close();
						onremove();
					}}>Remove</MenuItem
				>
			{/if}
		{/snippet}
	</MenuButton>
</div>

<style>
	.font-row {
		display: flex;
		height: 100%;
		align-items: center;
		gap: 4px;
		padding-right: 10px;
		transition: background-color 160ms var(--ease);
	}

	.divided {
		box-shadow: inset 0 1px 0 var(--hairline);
	}

	.font-row:has(.main:hover) {
		background: var(--surface-hover);
	}

	.main {
		display: flex;
		height: 100%;
		min-width: 0;
		flex: 1;
		align-items: center;
		gap: 14px;
		padding-inline: 16px 6px;
		text-align: left;
	}

	.sample {
		min-width: 0;
		flex: 1;
		overflow: hidden;
		font-size: 19px;
		color: var(--text-soft);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.name {
		width: 30%;
		flex: none;
		overflow: hidden;
		font-size: 14px;
		font-weight: 500;
		color: var(--text);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.styles {
		flex: none;
		font-size: 13px;
		color: var(--text-muted);
	}
</style>
