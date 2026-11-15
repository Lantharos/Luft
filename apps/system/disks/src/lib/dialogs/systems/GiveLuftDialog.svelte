<script lang="ts">
	import { t } from '@luft/i18n';
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
		if (phase === 'grown') return t('disks-give-grown', { size: bytes(grown) });
		if (phase === 'at-start') return t('disks-give-at-start');
		if (phase === 'failed') return t('disks-give-failed');
		if (gift?.kind === 'refused') return t('disks-give-refused');
		return t('disks-give-title', { size: bytes(size + alsoAfter) });
	});

	let moving = $derived.by(() => {
		if (gift?.kind !== 'move-first') return '';
		return `${t('disks-give-move-first', { name: gift.name, size: bytes(gift.size) })} ${t('disks-give-move-first-keep-on', { name: gift.name })}`;
	});

	let growing = $derived.by(() => {
		if (growth === 'now') return t('disks-give-now');
		if (growth !== 'at-start') return '';
		const moves = alsoAfter ? t('disks-give-moves-then-grows', { size: bytes(alsoAfter) }) : t('disks-give-moves-then-fills');
		const copies = used === null ? t('disks-give-copies') : t('disks-give-copies-size', { size: bytes(used) });
		return `${moves} ${copies} ${t('disks-give-plugged-in')}`;
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
				error = message === CANCELLED ? t('disks-admin-needed') : message;
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
		<div class="flex items-center gap-3 text-[13.5px] text-[var(--text-muted)]"><Spinner />{t('disks-give-loading')}</div>
	{:else if phase === 'confirm' && gift?.kind === 'refused'}
		<p class="text-[13.5px] leading-relaxed">{gift.reason}</p>
	{:else if phase === 'confirm'}
		{#if moving}
			<p class="text-[13.5px] leading-relaxed">{moving}</p>
		{/if}
		<p class="text-[13.5px] leading-relaxed">{growing}</p>
	{:else if phase === 'working' && moved}
		<div class="flex flex-col gap-2">
			<ProgressBar fraction={moved.total ? moved.copied / moved.total : null} label={t('disks-give-moving')} />
			<p class="text-[13px] text-[var(--text-muted)]">{t('disks-give-copied', { copied: bytes(moved.copied), total: bytes(moved.total) })}</p>
		</div>
	{:else if phase === 'working'}
		<p class="text-[13px] text-[var(--text-muted)]">{t('disks-keep-on')}</p>
	{:else if phase === 'key'}
		<p class="text-[13.5px] leading-relaxed">{t('disks-give-key')}</p>
		<KeyPrompt {request} onsubmit={unlockAndGrow} />
	{:else if phase === 'at-start'}
		<p class="text-[13.5px] leading-relaxed">{growing}</p>
		{#if error}
			<p class="text-[13px] leading-relaxed text-[var(--danger)]">{error}</p>
		{/if}
	{:else if phase === 'grown'}
		<p class="text-[13.5px] leading-relaxed">{t('disks-give-has', { size: bytes(luft?.size ?? 0) })}</p>
	{:else if phase === 'failed'}
		<p class="text-[13px] leading-relaxed text-[var(--danger)]">{error}</p>
	{/if}

	{#snippet actions()}
		{#if phase === 'confirm' && gift?.kind === 'refused'}
			<button type="button" class="button" onclick={makePartition}>{t('disks-make-partition')}</button>
			<button type="button" class="button primary" onclick={onclose}>{t('disks-close')}</button>
		{:else if phase === 'confirm' || phase === 'loading'}
			<button type="button" class="button" onclick={onclose}>{t('disks-cancel')}</button>
			<button type="button" class="button primary" disabled={phase === 'loading'} onclick={give}>{t('disks-free-give-luft')}</button>
		{:else if phase === 'working'}
			<button type="button" class="button" disabled>{#if !moved}<Spinner />{/if}{moved ? t('disks-give-working-moving') : t('disks-give-working')}</button>
		{:else if phase === 'key'}
			<button type="button" class="button" onclick={onclose}>{t('disks-later')}</button>
			<button type="button" class="button primary" disabled={!request.key} onclick={unlockAndGrow}>{t('disks-free-give-luft')}</button>
		{:else if phase === 'at-start'}
			<button type="button" class="button" onclick={onclose}>{t('disks-later')}</button>
			<button type="button" class="button primary" onclick={restart}>{t('disks-restart')}</button>
		{:else}
			<button type="button" class="button primary" onclick={onclose}>{t('disks-done')}</button>
		{/if}
	{/snippet}
</Dialog>
