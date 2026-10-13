<script lang="ts">
	import HardDrive from '@lucide/svelte/icons/hard-drive';
	import { bytes } from '@luft/ui';
	import OptionRow from '#lib/components/OptionRow.svelte';
	import { install } from '#lib/state/install.svelte.js';
	import { describeDrive } from './explain.js';

	interface Props {
		selected: string | null;
		onselect: (block: string) => void;
	}

	let { selected, onselect }: Props = $props();
</script>

<div class="flex flex-col gap-1" role="radiogroup" aria-label="Drives">
	{#each install.usableDrives as drive (drive.block)}
		<OptionRow icon={HardDrive} title="{drive.name}, {bytes(drive.size)}" detail={describeDrive(drive)} selected={selected === drive.block} onclick={() => onselect(drive.block)} />
	{:else}
		<p class="text-[14px] text-[var(--text-soft)]">There’s no drive Luft can use. Connect one and look again.</p>
	{/each}
</div>
