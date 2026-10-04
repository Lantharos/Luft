<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import { bytes, Dialog } from '@luft/ui';
	import * as api from '#lib/api.js';
	import type { ChosenImage } from '#lib/api.js';
	import DriveIcon from '#lib/components/DriveIcon.svelte';
	import { disks } from '#lib/state/disks.svelte.js';

	interface Props {
		image: ChosenImage;
		onclose: () => void;
	}

	let { image, onclose }: Props = $props();

	let candidates = $derived(disks.drives.filter((drive) => !drive.system && !drive.readOnly && drive.size >= image.size));
	let chosenId = $state<string | null>(null);
	let chosen = $derived(candidates.find((drive) => drive.id === chosenId) ?? (candidates.length === 1 ? candidates[0] : null));
	let confirming = $state(false);
	let working = $state(false);

	async function submit() {
		if (!chosen) return;
		working = true;
		const drive = chosen;
		const done = await disks.run(drive.block, () => api.restoreImage(drive.block, image.path));
		working = false;
		if (done) {
			disks.select(drive.id);
			onclose();
		}
	}
</script>

{#if confirming && chosen}
	<Dialog
		title="Write “{image.name}” to {chosen.name}?"
		description="Everything on {chosen.name} ({bytes(chosen.size)}) will be erased and replaced by this {bytes(image.size)} image. This can't be undone."
		{onclose}
	>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (confirming = false)}>Back</button>
			<button type="button" class="button danger" disabled={working} onclick={submit}>Erase and write</button>
		{/snippet}
	</Dialog>
{:else}
	<Dialog title="Write “{image.name}” to a drive" {onclose}>
		<div class="row-group" role="radiogroup" aria-label="Drives">
			{#each candidates as drive (drive.id)}
				<button type="button" role="radio" aria-checked={chosen?.id === drive.id} class="choice" onclick={() => (chosenId = drive.id)}>
					<DriveIcon kind={drive.kind} size={20} />
					<span class="min-w-0 truncate text-[14px] font-medium">{drive.name}</span>
					<span class="flex-1 text-[13px] text-[var(--text-muted)]">{bytes(drive.size)}</span>
					{#if chosen?.id === drive.id}
						<Check size={18} />
					{/if}
				</button>
			{:else}
				<p class="px-4 py-3 text-[13px] text-[var(--text-muted)]">Plug in a drive of at least {bytes(image.size)}.</p>
			{/each}
		</div>
		{#snippet actions()}
			<button type="button" class="button" onclick={onclose}>Cancel</button>
			<button type="button" class="button primary" disabled={!chosen} onclick={() => (confirming = true)}>Continue</button>
		{/snippet}
	</Dialog>
{/if}

<style>
	.choice {
		display: flex;
		min-height: 48px;
		align-items: center;
		gap: 12px;
		padding: 0 16px;
		text-align: left;
		color: var(--text-soft);
		transition: background-color 160ms var(--ease);
	}

	.choice:hover {
		background: var(--surface-hover);
	}

	.choice[aria-checked='true'] {
		color: var(--text);
	}
</style>
