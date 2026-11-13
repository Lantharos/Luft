<script lang="ts">
	import { bytes, Dialog, errorText, ProgressBar, Spinner } from '@luft/ui';
	import { commands, events } from '#lib/bindings.js';
	import type { Drive, LuftGift } from '#lib/bindings.js';
	import { CANCELLED, WAIT } from '#lib/bridge/index.js';
	import { KeyRequest } from '#lib/encryption.svelte.js';
	import { inner } from '#lib/format.js';
	import { luftVolume, roomAfter } from '#lib/luft.js';
	import { dialogs } from '../dialogs.svelte';
	import KeyPrompt from '../encryption/KeyPrompt.svelte';

	interface Props {
		drive: Drive;
		offset: number;
		size: number;
		onclose: () => void;
	}

	let { drive, offset, size, onclose }: Props = $props();

	type Phase = 'loading' | 'confirm' | 'working' | 'key' | 'grown' | 'at-start' | 'failed';

	const request = new KeyRequest();

	let phase = $state<Phase>('loading');
	let gift = $state.raw<LuftGift | null>(null);
	let moved = $state<{ copied: number; total: number } | null>(null);
	let grown = $state(0);
	let error = $state('');

	let after = $derived(roomAfter(drive));
	let luft = $derived(luftVolume(drive));
	let used = $derived(luft ? inner(luft).used : null);
	let growth = $derived(gift && gift.kind !== 'refused' ? gift.growth : null);
	let alsoAfter = $derived(growth === 'at-start' && after !== null && after.offset !== offset ? after.size : 0);

	let title = $derived.by(() => {
		if (phase === 'grown') return `Luft grew by ${bytes(grown)}`;
		if (phase === 'at-start') return 'Luft grows at the next start';
		if (phase === 'failed') return 'Luft didn’t get the space';
		if (gift?.kind === 'refused') return 'Luft can’t take this space';
		return `Give Luft ${bytes(size + alsoAfter)}?`;
	});

	let moving = $derived.by(() => {
		if (gift?.kind !== 'move-first') return '';
		return `First ${gift.name} moves to the other side of the free space, which copies its ${bytes(gift.size)}. Keep the computer on and the drive connected until that’s done, or what’s on ${gift.name} can be lost.`;
	});

	let growing = $derived.by(() => {
		if (growth === 'now') return 'Luft grows into the space right away, while you keep using the computer.';
		if (growth !== 'at-start') return '';
		const copies = used === null ? 'all of Luft’s files' : `all of Luft’s files, about ${bytes(used)}`;
		const rest = alsoAfter ? `, then grows over the ${bytes(alsoAfter)} free right after it` : ', then grows to fill it';
		return `Luft moves into the space in front of it the next time the computer starts${rest}. Moving copies ${copies}, which can take an hour or more on a full drive. Keep the computer plugged in; if it turns off partway, Luft carries on at the next start.`;
	});

	$effect(() => {
		void commands
			.disksLuftGift({ offset }, WAIT)
			.then((preview) => {
				gift = preview;
				phase = 'confirm';
			})
			.catch((caught) => {
				error = errorText(caught);
				phase = 'failed';
			});
	});

	async function give() {
		phase = 'working';
		error = '';
		const stop = events.disksPlan((progress) => (moved = progress));
		try {
			const given = await commands.disksGiveLuft({ offset }, WAIT);
			if (given.kind === 'grown') {
				grown = given.bytes;
				phase = 'grown';
			} else if (given.kind === 'at-start') {
				phase = 'at-start';
			} else {
				request.asking = true;
				phase = 'key';
			}
		} catch (caught) {
			const message = errorText(caught);
			if (message === CANCELLED && !moved) {
				phase = 'confirm';
			} else {
				error = message === CANCELLED ? 'Administrator rights are needed to continue.' : message;
				phase = 'failed';
			}
		} finally {
			stop();
			moved = null;
		}
	}

	async function unlockAndGrow() {
		phase = 'working';
		try {
			let gained = 0;
			const done = await request.run(async (unlock) => {
				const outcome = await commands.disksGrowSystem({ unlock }, WAIT);
				if (outcome.done !== undefined) gained = outcome.done;
				return outcome;
			});
			grown = gained;
			phase = done ? 'grown' : 'key';
		} catch (caught) {
			const message = errorText(caught);
			if (message !== CANCELLED) request.error = message;
			phase = 'key';
		}
	}

	async function restart() {
		try {
			await commands.disksRestart(WAIT);
		} catch (caught) {
			error = errorText(caught);
		}
	}

	function makePartition() {
		dialogs.open({ kind: 'create', drive, offset, size });
	}

	function close() {
		if (phase !== 'working') onclose();
	}
</script>

<Dialog {title} wide onclose={close}>
	{#if phase === 'loading'}
		<div class="flex items-center gap-3 text-[13.5px] text-[var(--text-muted)]"><Spinner />Looking at the space next to Luft</div>
	{:else if phase === 'confirm' && gift?.kind === 'refused'}
		<p class="text-[13.5px] leading-relaxed">{gift.reason}</p>
	{:else if phase === 'confirm'}
		{#if moving}
			<p class="text-[13.5px] leading-relaxed">{moving}</p>
		{/if}
		<p class="text-[13.5px] leading-relaxed">{growing}</p>
	{:else if phase === 'working' && moved}
		<div class="flex flex-col gap-2">
			<ProgressBar fraction={moved.total ? moved.copied / moved.total : null} label="Moving the partition next to Luft" />
			<p class="text-[13px] text-[var(--text-muted)]">{bytes(moved.copied)} of {bytes(moved.total)} copied. Keep the computer on until this is done.</p>
		</div>
	{:else if phase === 'working'}
		<p class="text-[13px] text-[var(--text-muted)]">Keep the computer on until this is done.</p>
	{:else if phase === 'key'}
		<p class="text-[13.5px] leading-relaxed">Enter the disk’s passphrase or recovery key to give the space to Luft.</p>
		<KeyPrompt {request} onsubmit={unlockAndGrow} />
	{:else if phase === 'at-start'}
		<p class="text-[13.5px] leading-relaxed">{growing}</p>
		{#if error}
			<p class="text-[13px] leading-relaxed text-[var(--danger)]">{error}</p>
		{/if}
	{:else if phase === 'grown'}
		<p class="text-[13.5px] leading-relaxed">It has {bytes(luft?.size ?? 0)} now.</p>
	{:else if phase === 'failed'}
		<p class="text-[13px] leading-relaxed text-[var(--danger)]">{error}</p>
	{/if}

	{#snippet actions()}
		{#if phase === 'confirm' && gift?.kind === 'refused'}
			<button type="button" class="button" onclick={makePartition}>Make a partition</button>
			<button type="button" class="button primary" onclick={onclose}>Close</button>
		{:else if phase === 'confirm' || phase === 'loading'}
			<button type="button" class="button" onclick={onclose}>Cancel</button>
			<button type="button" class="button primary" disabled={phase === 'loading'} onclick={give}>Give to Luft</button>
		{:else if phase === 'working'}
			<button type="button" class="button" disabled>{#if !moved}<Spinner />{/if}{moved ? 'Moving' : 'Giving'}</button>
		{:else if phase === 'key'}
			<button type="button" class="button" onclick={onclose}>Later</button>
			<button type="button" class="button primary" disabled={!request.key} onclick={unlockAndGrow}>Give to Luft</button>
		{:else if phase === 'at-start'}
			<button type="button" class="button" onclick={onclose}>Later</button>
			<button type="button" class="button primary" onclick={restart}>Restart now</button>
		{:else}
			<button type="button" class="button primary" onclick={onclose}>Done</button>
		{/if}
	{/snippet}
</Dialog>
