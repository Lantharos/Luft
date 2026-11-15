<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, Dialog, ProgressBar } from '@luft/ui';
	import { commands, events } from '#lib/bindings.js';
	import type { InterruptedMove } from '#lib/bindings.js';
	import { WAIT } from '#lib/bridge/index.js';
	import { disks } from '#lib/state/disks.svelte.js';

	interface Props {
		move: InterruptedMove;
		onclose: () => void;
	}

	let { move, onclose }: Props = $props();

	let working = $state(false);
	let progress = $state.raw({ copied: 0, total: 0 });

	let drive = $derived(disks.drives.find((candidate) => candidate.block === move.drive)?.name ?? null);

	async function finish() {
		working = true;
		const stop = events.disksPlan((next) => (progress = next));
		await disks.run(move.drive, () => commands.disksFinishMove({ id: move.id }, WAIT));
		stop();
		onclose();
	}
</script>

<Dialog
	title={t('disks-finish-move-title', { name: move.label })}
	description={drive ? t('disks-finish-move-description', { drive }) : t('disks-finish-move-description-unnamed')}
	onclose={() => !working && onclose()}
>
	{#if working}
		<div class="flex flex-col gap-2">
			<ProgressBar fraction={progress.total ? progress.copied / progress.total : null} label={t('disks-finish-move-moving')} />
			<p class="text-[13px] text-[var(--text-muted)] tabular-nums">{t('disks-image-progress-total', { copied: bytes(progress.copied), total: bytes(progress.total) })}</p>
		</div>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" disabled={working} onclick={onclose}>{t('disks-not-now')}</button>
		<button type="button" class="button primary" disabled={working} onclick={finish}>{t('disks-finish-move-action')}</button>
	{/snippet}
</Dialog>
