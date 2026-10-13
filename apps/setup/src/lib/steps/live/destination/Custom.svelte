<script lang="ts">
	import Box from '@lucide/svelte/icons/box';
	import { bytes } from '@luft/ui';
	import { openDisks } from '#lib/api/system.js';
	import OptionRow from '#lib/components/OptionRow.svelte';
	import { install } from '#lib/state/install.svelte.js';

	interface Props {
		selected: string | null;
		onselect: (key: string) => void;
	}

	let { selected, onselect }: Props = $props();
	let problem = $state('');

	async function open() {
		problem = '';
		await openDisks().catch((error) => (problem = String(error)));
	}
</script>

<div class="flex flex-col gap-5">
	<div class="flex flex-wrap items-center gap-2">
		<button type="button" class="button large" onclick={open}>Open Disks</button>
		<button type="button" class="plain-button large" disabled={install.surveying} onclick={() => install.look()}>
			{install.surveying ? 'Looking…' : 'Look again'}
		</button>
		{#if problem}
			<span class="text-[13px] text-[var(--danger)]">{problem}</span>
		{/if}
	</div>
	<div class="flex flex-col gap-1" role="radiogroup" aria-label="Free space">
		{#each install.freeSpaces as { drive, space } (`${drive.block}@${space.offset}`)}
			{@const key = `${drive.block}@${space.offset}`}
			<OptionRow icon={Box} title="{bytes(space.size)} of free space" detail="On {drive.name}" selected={selected === key} onclick={() => onselect(key)} />
		{:else}
			<p class="text-[14px] leading-relaxed text-[var(--text-soft)]">
				Make at least {bytes(install.survey?.smallestSystem ?? 0)} of free space in Disks, then look again. Luft goes into the space you leave free.
			</p>
		{/each}
	</div>
</div>
