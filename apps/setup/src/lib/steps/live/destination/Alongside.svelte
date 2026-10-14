<script lang="ts">
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import type { Drive, WindowsVolume } from '#lib/api/installer.js';
	import SplitBar from '#lib/components/SplitBar.svelte';
	import { install } from '#lib/state/install.svelte.js';
	import { whyWindowsCantShrink } from './explain.js';
	import WindowsOptions from './WindowsOptions.svelte';

	interface Props {
		drive: Drive & { windows: WindowsVolume };
		smallest: number;
		onsize: (size: number) => void;
	}

	const GIB = 1024 ** 3;
	const SHARE = 0.4;

	let { drive, smallest, onsize }: Props = $props();

	let windows = $derived(drive.windows);
	let min = $derived(smallest + drive.startupSpace);
	let max = $derived(windows.room);
	let blocked = $derived(windows.blocked ?? (max < min ? 'full' : null));
	let size = $state(0);

	$effect(() => {
		size = Math.min(max, Math.max(min, Math.round((windows.size * SHARE) / GIB) * GIB));
	});

	$effect(() => onsize(blocked ? 0 : size));
</script>

{#if blocked}
	<div class="flex gap-3 rounded-[18px] bg-[var(--surface)] p-4 text-[14px] leading-relaxed">
		<TriangleAlert size={20} class="mt-0.5 flex-none text-[var(--danger)]" />
		<p>{whyWindowsCantShrink({ ...windows, blocked }, min)}</p>
	</div>
{:else}
	<div class="flex flex-col gap-6">
		<SplitBar total={windows.size} used={windows.used} value={size} {min} {max} step={GIB} onchange={(next) => (size = next)} />
		<p class="text-[13.5px] leading-relaxed text-[var(--text-soft)]">
			Drag to share {drive.name} between Windows and Luft. Windows keeps all of its files and some room to grow.
		</p>
		<WindowsOptions {windows} />
		{#if install.startError}
			<p class="text-[13.5px] text-[var(--danger)]">{install.startError}</p>
		{/if}
	</div>
{/if}
