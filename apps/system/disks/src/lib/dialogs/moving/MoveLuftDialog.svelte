<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, Dialog, errorText, Spinner } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { LuftMove, MoveDestination } from '#lib/bindings.js';
	import { CANCELLED, WAIT } from '#lib/bridge/index.js';
	import DriveIcon from '#lib/components/DriveIcon.svelte';
	import { luftVolume } from '#lib/luft.js';
	import { choice, driveNote, fits, largest, shrunkSize, usable, type Place } from '#lib/moving.js';
	import { disks } from '#lib/state/disks.svelte.js';
	import SizeField from '../format/SizeField.svelte';
	import EraseDialog from './EraseDialog.svelte';
	import Options from './Options.svelte';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	type Phase = 'loading' | 'drive' | 'place' | 'confirm' | 'erase' | 'working' | 'waiting' | 'failed';

	let phase = $state<Phase>('loading');
	let options = $state.raw<LuftMove | null>(null);
	let destination = $state.raw<MoveDestination | null>(null);
	let place = $state.raw<Place | null>(null);
	let luft = $state(0);
	let error = $state('');

	let here = $derived(disks.drives.find((drive) => luftVolume(drive) !== null) ?? null);
	let encrypted = $derived(Boolean(here && luftVolume(here)?.encryption));
	let needs = $derived(options?.needs.luft ?? 0);
	let shrinking = $derived(place?.kind === 'shrink' ? place.block : null);
	let shrink = $derived(destination?.shrink.find((candidate) => candidate.block === shrinking) ?? null);
	let most = $derived(destination && place ? largest(destination, place) : 0);
	let places = $derived.by(() => {
		if (!destination) return [];
		const all: Place[] = [{ kind: 'free' }, ...destination.shrink.map((candidate): Place => ({ kind: 'shrink', block: candidate.block })), { kind: 'erase' }];
		return all.filter((candidate) => candidate.kind !== 'free' || destination?.free);
	});

	let title = $derived.by(() => {
		if (phase === 'waiting') return t('disks-move-waiting-title');
		if (phase === 'failed' && options?.state.failed) return t('disks-move-failed-title', { drive: options.state.failedTo });
		if (phase === 'failed') return t('disks-move-refused-title');
		if (phase === 'place' || phase === 'confirm') return t('disks-move-to', { drive: destination?.name ?? '' });
		return t('disks-move-title');
	});

	function placeKey(candidate: Place) {
		return candidate.kind === 'shrink' ? candidate.block : candidate.kind;
	}

	function placeDisabled(candidate: Place) {
		if (!options || !destination) return true;
		if (candidate.kind === 'erase' && destination.erase.refused) return true;
		return !fits(options, destination, candidate);
	}

	function placeTitle(candidate: Place) {
		if (candidate.kind === 'free') return t('disks-move-place-free');
		if (candidate.kind === 'erase') return t('disks-move-place-erase', { drive: destination?.name ?? '' });
		return t('disks-move-place-shrink', { name: destination?.shrink.find((item) => item.block === candidate.block)?.name ?? '' });
	}

	function placeNote(candidate: Place) {
		if (!destination) return '';
		const room = largest(destination, candidate);
		if (candidate.kind === 'erase') return destination.erase.refused ?? t('disks-move-place-erase-note');
		if (candidate.kind === 'free') return t('disks-move-place-free-note', { free: bytes(destination.free?.size ?? 0), room: bytes(room) });
		return room >= needs ? t('disks-move-place-shrink-note', { room: bytes(room) }) : t('disks-move-place-shrink-small', { room: bytes(room) });
	}

	async function load() {
		phase = 'loading';
		try {
			options = await commands.disksMoveOptions(WAIT);
			if (options.state.stage === 'waiting' || options.state.stage === 'copied') phase = 'waiting';
			else if (options.state.failed || options.refused) phase = 'failed';
			else phase = 'drive';
		} catch (caught) {
			error = errorText(caught);
			phase = 'failed';
		}
	}

	$effect(() => {
		void load();
	});

	function chooseDrive(chosen: MoveDestination) {
		destination = chosen;
		place = null;
	}

	function choosePlace(chosen: Place) {
		place = chosen;
		luft = chosen.kind === 'shrink' || !destination ? needs : largest(destination, chosen);
	}

	async function move() {
		if (!destination || !place) return;
		phase = 'working';
		error = '';
		try {
			await commands.disksMoveLuft({ choice: choice(destination, place, luft) }, WAIT);
			await load();
		} catch (caught) {
			const message = errorText(caught);
			error = message === CANCELLED ? '' : message;
			phase = message === CANCELLED ? 'confirm' : 'failed';
		}
	}

	async function callOff() {
		phase = 'working';
		try {
			await commands.disksCancelMove(WAIT);
			await load();
		} catch (caught) {
			error = errorText(caught);
			phase = 'failed';
		}
	}

	async function tryAgain() {
		await commands.disksForgetMoveFailure(WAIT).catch(() => undefined);
		error = '';
		await load();
	}

	async function dismiss() {
		if (options?.state.failed) await commands.disksForgetMoveFailure(WAIT).catch(() => undefined);
		onclose();
	}

	async function restart() {
		try {
			await commands.disksRestart(WAIT);
		} catch (caught) {
			error = errorText(caught);
		}
	}

	function close() {
		if (phase !== 'working') void dismiss();
	}
</script>

{#if phase === 'erase' && destination}
	<EraseDialog {destination} onback={() => (phase = 'place')} onerase={move} />
{:else}
	<Dialog {title} wide onclose={close}>
		{#if phase === 'loading'}
			<div class="flex items-center gap-3 text-[13.5px] text-[var(--text-muted)]"><Spinner />{t('disks-move-loading')}</div>
		{:else if phase === 'drive' && options}
			<p class="text-[13.5px] leading-relaxed">
				{t('disks-move-needs', { size: bytes(needs) })} {t('disks-move-copies', { size: bytes(options.needs.copies) })}
			</p>
			{#if options.destinations.length}
				<Options
					label={t('disks-drives')}
					items={options.destinations}
					key={(item) => item.drive}
					chosen={destination?.drive ?? null}
					disabled={(item) => !usable(options!, item)}
					onchoose={chooseDrive}
				>
					{#snippet row(item)}
						<DriveIcon kind={item.kind} size={20} />
						<span class="flex min-w-0 flex-col">
							<span class="truncate text-[14px] font-medium">{item.name} <span class="font-normal text-[var(--text-muted)]">{bytes(item.size)}</span></span>
							<span class="text-[13px] leading-snug text-[var(--text-muted)]">{driveNote(options!, item)}</span>
						</span>
					{/snippet}
				</Options>
			{:else}
				<p class="text-[13.5px] leading-relaxed text-[var(--text-muted)]">{t('disks-move-no-drives')}</p>
			{/if}
		{:else if phase === 'place' && destination}
			<Options label={t('disks-move-where', { drive: destination.name })} items={places} key={placeKey} chosen={place ? placeKey(place) : null} disabled={placeDisabled} onchoose={choosePlace}>
				{#snippet row(item)}
					<span class="flex min-w-0 flex-col">
						<span class={['text-[14px] font-medium', item.kind === 'erase' && !placeDisabled(item) && 'text-[var(--danger)]']}>{placeTitle(item)}</span>
						<span class="text-[13px] leading-snug text-[var(--text-muted)]">{placeNote(item)}</span>
					</span>
				{/snippet}
			</Options>
			{#if place && place.kind !== 'erase' && most > needs}
				<SizeField bind:value={luft} min={needs} max={most} label={t('disks-move-space')} />
			{/if}
		{:else if phase === 'confirm' && destination && place && options}
			{#if shrink}
				<p class="text-[13.5px] leading-relaxed">{t('disks-move-shrink-first', { name: shrink.name, size: bytes(shrunkSize(shrink, luft)) })} {t('disks-move-shrink-files')}</p>
			{/if}
			<p class="text-[13.5px] leading-relaxed">
				{t('disks-move-confirm-moves', { drive: destination.name, size: bytes(place.kind === 'erase' ? destination.erase.luft : luft) })}
				{t('disks-move-confirm-copying', { size: bytes(options.needs.copies) })}
				{t('disks-move-confirm-keep-on', { drive: destination.name })}
			</p>
			<p class="text-[13.5px] leading-relaxed">
				{encrypted ? t('disks-move-confirm-encrypted') : ''}
				{here ? t('disks-move-confirm-old-copy', { here: here.name, drive: destination.name }) : t('disks-move-confirm-old-copy-here', { drive: destination.name })}
				{t('disks-move-confirm-remove')}
			</p>
		{:else if phase === 'working'}
			<p class="text-[13px] text-[var(--text-muted)]">{t('disks-keep-on')}</p>
		{:else if phase === 'waiting' && options}
			<p class="text-[13.5px] leading-relaxed">
				{t('disks-move-waiting', { drive: options.state.to })}
				{t('disks-move-waiting-keep-on')}
				{t('disks-move-waiting-partway')}
			</p>
			{#if error}
				<p class="text-[13px] leading-relaxed text-[var(--danger)]">{error}</p>
			{/if}
		{:else if phase === 'failed'}
			{#if options?.state.failed}
				<p class="text-[13.5px] leading-relaxed">{options.state.failed}</p>
				<p class="text-[13.5px] leading-relaxed text-[var(--text-muted)]">{t('disks-move-failed', { drive: options.state.failedTo })}</p>
			{:else}
				<p class="text-[13.5px] leading-relaxed">{error || options?.refused}</p>
			{/if}
		{/if}

		{#snippet actions()}
			{#if phase === 'drive'}
				<button type="button" class="button" onclick={onclose}>{t('disks-cancel')}</button>
				<button type="button" class="button primary" disabled={!destination} onclick={() => (phase = 'place')}>{t('disks-continue')}</button>
			{:else if phase === 'place'}
				<button type="button" class="button" onclick={() => (phase = 'drive')}>{t('disks-back')}</button>
				<button type="button" class="button primary" disabled={!place} onclick={() => (phase = place?.kind === 'erase' ? 'erase' : 'confirm')}>{t('disks-continue')}</button>
			{:else if phase === 'confirm'}
				<button type="button" class="button" onclick={() => (phase = 'place')}>{t('disks-back')}</button>
				<button type="button" class="button primary" onclick={move}>{t('disks-move-action')}</button>
			{:else if phase === 'working' || phase === 'loading'}
				<button type="button" class="button" disabled>{#if phase === 'working'}<Spinner />{t('disks-move-preparing')}{:else}{t('disks-cancel')}{/if}</button>
			{:else if phase === 'waiting'}
				{#if options?.state.stage === 'waiting'}
					<button type="button" class="button" onclick={callOff}>{t('disks-move-call-off')}</button>
				{/if}
				<button type="button" class="button" onclick={onclose}>{t('disks-later')}</button>
				<button type="button" class="button primary" onclick={restart}>{t('disks-restart')}</button>
			{:else if options?.state.failed}
				<button type="button" class="button" onclick={dismiss}>{t('disks-close')}</button>
				<button type="button" class="button primary" onclick={tryAgain}>{t('disks-try-again')}</button>
			{:else if error && destination}
				<button type="button" class="button" onclick={onclose}>{t('disks-close')}</button>
				<button type="button" class="button primary" onclick={() => ((error = ''), (phase = 'place'))}>{t('disks-back')}</button>
			{:else}
				<button type="button" class="button primary" onclick={onclose}>{t('disks-close')}</button>
			{/if}
		{/snippet}
	</Dialog>
{/if}
