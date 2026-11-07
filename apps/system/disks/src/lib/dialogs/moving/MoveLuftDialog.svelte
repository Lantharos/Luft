<script lang="ts">
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
		if (phase === 'waiting') return 'Luft moves at the next start';
		if (phase === 'failed' && options?.state.failed) return `Luft didn’t move to ${options.state.failedTo}`;
		if (phase === 'failed') return 'Luft can’t move right now';
		if (phase === 'place' || phase === 'confirm') return `Move Luft to ${destination?.name}`;
		return 'Move Luft to another drive';
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
		if (candidate.kind === 'free') return 'Use the free space';
		if (candidate.kind === 'erase') return `Erase ${destination?.name}`;
		return `Make room on ${destination?.shrink.find((item) => item.block === candidate.block)?.name}`;
	}

	function placeNote(candidate: Place) {
		if (!destination) return '';
		const room = largest(destination, candidate);
		if (candidate.kind === 'erase') return destination.erase.refused ?? 'Everything on it is deleted, and Luft gets the whole drive';
		if (candidate.kind === 'free') return `${bytes(destination.free?.size ?? 0)} free, room for Luft to have up to ${bytes(room)}`;
		return room >= needs ? `It shrinks to make room, keeping its files. Luft can have up to ${bytes(room)}` : `It can only make ${bytes(room)} of room`;
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
			<div class="flex items-center gap-3 text-[13.5px] text-[var(--text-muted)]"><Spinner />Looking at your drives</div>
		{:else if phase === 'drive' && options}
			<p class="text-[13.5px] leading-relaxed">
				Luft needs {bytes(needs)} on the other drive. Your files, apps and settings come along, about {bytes(options.needs.copies)} in all.
			</p>
			{#if options.destinations.length}
				<Options
					label="Drives"
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
				<p class="text-[13.5px] leading-relaxed text-[var(--text-muted)]">There’s no other drive in this computer to move Luft to.</p>
			{/if}
		{:else if phase === 'place' && destination}
			<Options label="Where on {destination.name}" items={places} key={placeKey} chosen={place ? placeKey(place) : null} disabled={placeDisabled} onchoose={choosePlace}>
				{#snippet row(item)}
					<span class="flex min-w-0 flex-col">
						<span class={['text-[14px] font-medium', item.kind === 'erase' && !placeDisabled(item) && 'text-[var(--danger)]']}>{placeTitle(item)}</span>
						<span class="text-[13px] leading-snug text-[var(--text-muted)]">{placeNote(item)}</span>
					</span>
				{/snippet}
			</Options>
			{#if place && place.kind !== 'erase' && most > needs}
				<SizeField bind:value={luft} min={needs} max={most} label="Space for Luft" />
			{/if}
		{:else if phase === 'confirm' && destination && place && options}
			{#if shrink}
				<p class="text-[13.5px] leading-relaxed">First, {shrink.name} shrinks to {bytes(shrunkSize(shrink, luft))}. Its files stay as they are.</p>
			{/if}
			<p class="text-[13.5px] leading-relaxed">
				Luft moves to {destination.name} the next time the computer starts, with {bytes(place.kind === 'erase' ? destination.erase.luft : luft)} of space. Copying
				your files, apps and settings, about {bytes(options.needs.copies)}, takes from a few minutes to an hour on a full drive. Keep the computer on and plugged in
				until Luft starts from {destination.name}.
			</p>
			<p class="text-[13.5px] leading-relaxed">
				{encrypted ? 'The new copy is encrypted the same way and opens with the same recovery key. ' : ''}The copy on {here?.name ?? 'this drive'} keeps working
				until Luft has started from {destination.name}. Then you can remove it here.
			</p>
		{:else if phase === 'working'}
			<p class="text-[13px] text-[var(--text-muted)]">Keep the computer on until this is done.</p>
		{:else if phase === 'waiting' && options}
			<p class="text-[13.5px] leading-relaxed">
				Luft moves to {options.state.to} the next time the computer starts. The startup shows how far it is; keep the computer on and plugged in until Luft starts
				from there. If it turns off partway, Luft carries on where it left off at the next start.
			</p>
			{#if error}
				<p class="text-[13px] leading-relaxed text-[var(--danger)]">{error}</p>
			{/if}
		{:else if phase === 'failed'}
			{#if options?.state.failed}
				<p class="text-[13.5px] leading-relaxed">{options.state.failed}</p>
				<p class="text-[13.5px] leading-relaxed text-[var(--text-muted)]">Luft stayed where it was, and took back what it had made on {options.state.failedTo}.</p>
			{:else}
				<p class="text-[13.5px] leading-relaxed">{error || options?.refused}</p>
			{/if}
		{/if}

		{#snippet actions()}
			{#if phase === 'drive'}
				<button type="button" class="button" onclick={onclose}>Cancel</button>
				<button type="button" class="button primary" disabled={!destination} onclick={() => (phase = 'place')}>Continue</button>
			{:else if phase === 'place'}
				<button type="button" class="button" onclick={() => (phase = 'drive')}>Back</button>
				<button type="button" class="button primary" disabled={!place} onclick={() => (phase = place?.kind === 'erase' ? 'erase' : 'confirm')}>Continue</button>
			{:else if phase === 'confirm'}
				<button type="button" class="button" onclick={() => (phase = 'place')}>Back</button>
				<button type="button" class="button primary" onclick={move}>Move Luft</button>
			{:else if phase === 'working' || phase === 'loading'}
				<button type="button" class="button" disabled>{#if phase === 'working'}<Spinner />Preparing{:else}Cancel{/if}</button>
			{:else if phase === 'waiting'}
				{#if options?.state.stage === 'waiting'}
					<button type="button" class="button" onclick={callOff}>Call off</button>
				{/if}
				<button type="button" class="button" onclick={onclose}>Later</button>
				<button type="button" class="button primary" onclick={restart}>Restart now</button>
			{:else if options?.state.failed}
				<button type="button" class="button" onclick={dismiss}>Close</button>
				<button type="button" class="button primary" onclick={tryAgain}>Try again</button>
			{:else if error && destination}
				<button type="button" class="button" onclick={onclose}>Close</button>
				<button type="button" class="button primary" onclick={() => ((error = ''), (phase = 'place'))}>Back</button>
			{:else}
				<button type="button" class="button primary" onclick={onclose}>Close</button>
			{/if}
		{/snippet}
	</Dialog>
{/if}
