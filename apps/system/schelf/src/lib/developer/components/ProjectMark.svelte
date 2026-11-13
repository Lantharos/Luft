<script lang="ts">
	import AppWindow from '@lucide/svelte/icons/app-window';
	import Package from '@lucide/svelte/icons/package';
	import Puzzle from '@lucide/svelte/icons/puzzle';
	import type { DashboardApp } from '../store';

	let { project, size = 18 }: { project: DashboardApp; size?: number } = $props();
	let broken = $state(false);
</script>

{#if project.icon && !broken}
	<img src={project.icon} alt="" width={size} height={size} class="rounded-[5px]" style:width="{size}px" style:height="{size}px" onerror={() => (broken = true)} />
{:else if project.kind === 'extension'}
	<Puzzle {size} />
{:else if project.format === 'files'}
	<Package {size} />
{:else}
	<AppWindow {size} />
{/if}
