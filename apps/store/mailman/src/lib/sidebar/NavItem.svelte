<script lang="ts">
	import { t } from '@luft/i18n';
	import { tooltip } from '@luft/ui';
	import type { Component } from 'svelte';

	interface Props {
		label: string;
		icon: Component;
		active: boolean;
		count?: number;
		strong?: boolean;
		rail?: boolean;
		onclick: () => void;
	}

	let { label, icon: Icon, active, count = 0, strong = false, rail = false, onclick }: Props = $props();

	let shownCount = $derived(count > 999 ? t('mailman-sidebar-count-capped') : `${count}`);
</script>

{#if rail}
	<button type="button" class="nav-item rail" class:active aria-label={count > 0 ? t('mailman-sidebar-folder-count', { folder: label, count: shownCount }) : label} aria-current={active ? 'page' : undefined} {onclick} {@attach tooltip(count > 0 ? t('mailman-sidebar-folder-count-tooltip', { folder: label, count: shownCount }) : label)}>
		<Icon size={18} />
		{#if count > 0}
			<span class="dot" class:strong></span>
		{/if}
	</button>
{:else}
	<button type="button" class="nav-item" class:active aria-current={active ? 'page' : undefined} {onclick}>
		<Icon size={18} />
		<span class="min-w-0 flex-1 truncate">{label}</span>
		{#if count > 0}
			<span class="nav-count" class:strong>{shownCount}</span>
		{/if}
	</button>
{/if}

<style>
	.rail {
		height: 40px;
		justify-content: center;
		padding: 0;
	}

	.nav-count.strong {
		color: var(--text);
		font-weight: 600;
	}

	.dot {
		position: absolute;
		top: 9px;
		left: calc(50% + 7px);
		height: 7px;
		width: 7px;
		border-radius: 50%;
		background: var(--sidebar-text-muted);
	}

	.dot.strong {
		background: var(--accent);
	}
</style>
