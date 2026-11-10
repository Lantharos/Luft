<script lang="ts">
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

	let drive = $derived(disks.drives.find((candidate) => candidate.block === move.drive)?.name ?? 'the drive');

	async function finish() {
		working = true;
		const stop = events.disksPlan((next) => (progress = next));
		await disks.run(move.drive, () => commands.disksFinishMove({ id: move.id }, WAIT));
		stop();
		onclose();
	}
</script>

<Dialog
	title="Finish moving “{move.label}”?"
	description="Moving it on {drive} was interrupted. Nothing is lost, but it can’t be opened, and the drive can’t be changed, until the move is finished."
	onclose={() => !working && onclose()}
>
	{#if working}
		<div class="flex flex-col gap-2">
			<ProgressBar fraction={progress.total ? progress.copied / progress.total : null} label="Moving" />
			<p class="text-[13px] text-[var(--text-muted)] tabular-nums">{bytes(progress.copied)} of {bytes(progress.total)}</p>
		</div>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" disabled={working} onclick={onclose}>Not now</button>
		<button type="button" class="button primary" disabled={working} onclick={finish}>Finish moving</button>
	{/snippet}
</Dialog>
