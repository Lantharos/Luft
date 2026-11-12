<script lang="ts">
	import BatteryFull from '@lucide/svelte/icons/battery-full';
	import Puzzle from '@lucide/svelte/icons/puzzle';
	import Volume2 from '@lucide/svelte/icons/volume-2';
	import Wifi from '@lucide/svelte/icons/wifi';
	import { AppIcon, appearance, MARK_HEIGHT, MARK_LAYERS, MARK_SCALE, MARK_WIDTH } from '@luft/ui';
	import type { App } from '#lib/bindings.js';
	import PreviewClock from './PreviewClock.svelte';

	interface Props {
		id: string;
		vertical: boolean;
		apps: App[];
		button: number;
		icon: number;
		plate: number;
		mark: { shade: string; ink: string } | undefined;
	}

	let { id, vertical, apps, button, icon, plate, mark }: Props = $props();

	const RUNNING = 2;
	const VERTICAL_APPS = 3;
	let originals = $derived((appearance.appIcons?.style ?? 'default') === 'default');
	let markSize = $derived(Math.round(button * MARK_SCALE));
	let appIcon = $derived(originals ? icon : plate);
	let shownApps = $derived(vertical ? apps.slice(0, VERTICAL_APPS) : apps);
	let small = $derived(plate * 0.62);
</script>

<span class="element" class:vertical style:--button="{button}px">
	{#if id === 'start'}
		<span class="slot">
			<span class="mark" style:width="{markSize}px" style:height="{markSize}px">
				{#each MARK_LAYERS as layer, index (index)}
					<svg viewBox="0 0 {MARK_WIDTH} {MARK_HEIGHT}" width={markSize} height={markSize} class:halo={layer.halo} fill={mark?.[layer.fill]}>
						<path d={layer.path} />
					</svg>
				{/each}
			</span>
		</span>
	{:else if id === 'dock'}
		{#each shownApps as app, index (app.id)}
			<span class="slot" class:focused={index === 0}>
				<span class="icon"><AppIcon icon={app.icon} id={app.id} size={appIcon} /></span>
				{#if index < RUNNING}
					<span class="dot"></span>
				{/if}
			</span>
		{/each}
	{:else if id === 'tray'}
		<span class="tray"><span></span><span></span></span>
	{:else if id === 'status'}
		<span class="status">
			<Wifi size={small} />
			<Volume2 size={small} />
			<BatteryFull size={small} />
		</span>
	{:else if id === 'clock'}
		<PreviewClock {vertical} />
	{:else}
		<span class="status"><Puzzle size={small} /></span>
	{/if}
</span>

<style>
	.element {
		display: flex;
		align-items: center;
		gap: 1px;
		color: var(--ink);
	}

	.element.vertical {
		flex-direction: column;
	}

	.slot {
		position: relative;
		display: grid;
		width: var(--button);
		height: var(--button);
		place-items: center;
		border-radius: 8px;
	}

	.slot.focused {
		background: var(--focused);
	}

	.mark {
		display: grid;
		place-items: center;
	}

	.mark svg {
		grid-area: 1 / 1;
	}

	.mark .halo,
	.icon {
		filter: var(--icon-halo);
	}

	.icon {
		display: grid;
	}

	.dot {
		position: absolute;
		bottom: 0;
		left: 50%;
		width: 3px;
		height: 3px;
		border-radius: 1.5px;
		background: var(--dot);
		box-shadow: var(--dot-halo);
		transform: translateX(-50%);
	}

	.focused .dot {
		width: 8px;
		background: var(--focused-dot);
	}

	.vertical .dot {
		top: 50%;
		bottom: auto;
		left: 0;
		transform: translateY(-50%);
	}

	.vertical .focused .dot {
		width: 3px;
		height: 8px;
	}

	.tray {
		display: flex;
		gap: 2px;
		padding: 0 4px;
	}

	.vertical .tray {
		flex-direction: column;
		padding: 4px 0;
	}

	.tray span {
		width: 6px;
		height: 6px;
		border-radius: 2px;
		background: currentColor;
		opacity: 0.55;
	}

	.status {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 0 4px;
	}

	.vertical .status {
		flex-direction: column;
		gap: 4px;
		padding: 4px 0;
	}

	.status > :global(svg) {
		filter: var(--status-icon-halo);
	}

</style>
