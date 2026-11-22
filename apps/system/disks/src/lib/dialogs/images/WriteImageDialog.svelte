<script lang="ts">
	import { t } from '@luft/i18n';
	import Check from '@luft/symbols/icons/check';
	import { bytes, Dialog } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { ChosenImage } from '#lib/bindings.js';
	import { WAIT } from '#lib/bridge/index.js';
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
		const done = await disks.run(drive.block, () => commands.disksImageRestore({ block: drive.block, path: image.path }, WAIT));
		working = false;
		if (done) {
			disks.select(drive.id);
			onclose();
		}
	}
</script>

{#if confirming && chosen}
	<Dialog
		title={t('disks-image-write-confirm', { name: image.name, drive: chosen.name })}
		description={t('disks-image-write-loss', { drive: chosen.name, size: bytes(chosen.size), image: bytes(image.size) })}
		{onclose}
	>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (confirming = false)}>{t('disks-back')}</button>
			<button type="button" class="button danger" disabled={working} onclick={submit}>{t('disks-restore-action')}</button>
		{/snippet}
	</Dialog>
{:else}
	<Dialog title={t('disks-image-write-title', { name: image.name })} {onclose}>
		<div class="row-group" role="radiogroup" aria-label={t('disks-drives')}>
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
				<p class="px-4 py-3 text-[13px] text-[var(--text-muted)]">{t('disks-image-write-none', { size: bytes(image.size) })}</p>
			{/each}
		</div>
		{#snippet actions()}
			<button type="button" class="button" onclick={onclose}>{t('disks-cancel')}</button>
			<button type="button" class="button primary" disabled={!chosen} onclick={() => (confirming = true)}>{t('disks-continue')}</button>
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
		transition: background-color var(--motion-tap) var(--ease-decelerate);
	}

	.choice:hover {
		background: var(--surface-hover);
	}

	.choice[aria-checked='true'] {
		color: var(--text);
	}
</style>
