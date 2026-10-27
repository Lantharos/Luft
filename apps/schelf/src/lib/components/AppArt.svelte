<script lang="ts">
	import AppWindow from '@lucide/svelte/icons/app-window';
	import Server from '@lucide/svelte/icons/server';
	import SquareTerminal from '@lucide/svelte/icons/square-terminal';
	import { AppIcon } from '@luft/ui';
	import type { Source } from '#lib/bindings.js';

	interface Props {
		icon: string | null;
		desktop?: string | null;
		size?: number;
		source?: Source | null;
	}

	let { icon, desktop = null, size = 48, source = null }: Props = $props();
	let broken = $state(false);
	const remote = $derived(icon?.startsWith('http') ?? false);

	$effect(() => {
		void icon;
		broken = false;
	});
</script>

{#if source === 'tool'}
	<span class="fallback" style:width="{size}px" style:height="{size}px"><SquareTerminal size={size * 0.5} /></span>
{:else if source === 'system'}
	<span class="fallback" style:width="{size}px" style:height="{size}px"><Server size={size * 0.5} /></span>
{:else if remote && !broken}
	<img src={icon} alt="" width={size} height={size} loading="lazy" decoding="async" style:width="{size}px" style:height="{size}px" onerror={() => (broken = true)} />
{:else if remote}
	<span class="fallback" style:width="{size}px" style:height="{size}px"><AppWindow size={size * 0.5} /></span>
{:else}
	<AppIcon {icon} id={desktop ?? undefined} {size} />
{/if}

<style>
	img {
		flex: none;
		object-fit: contain;
	}

	.fallback {
		display: grid;
		flex: none;
		place-items: center;
		border-radius: 24%;
		background: var(--control);
		color: var(--text-muted);
	}
</style>
