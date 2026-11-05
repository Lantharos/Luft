<script lang="ts">
	import HardDrive from '@lucide/svelte/icons/hard-drive';
	import LayoutPanelLeft from '@lucide/svelte/icons/layout-panel-left';
	import { t } from '@luft/i18n';
	import { bytes, Dialog, SplitBar } from '@luft/ui';
	import DriveRow from '#lib/components/DriveRow.svelte';
	import Frame from '#lib/components/Frame.svelte';
	import Problem from '#lib/components/Problem.svelte';
	import EraseConfirm from '#lib/room/EraseConfirm.svelte';
	import { placeDetail, placeTitle } from '#lib/room/describe.js';
	import { session } from '#lib/state/meet.svelte.js';

	const GIB = 1024 ** 3;

	let confirming = $state(false);
	let report = $derived(session.report!);
	let windows = $derived(session.windows!);
	let chosen = $derived(session.chosen!);
	let fromFile = $derived(session.source.kind === 'file');
	let several = $derived(session.places.length > 1);
	let size = $derived(chosen.kind === 'windows' ? session.luft : chosen.most);

	let confirmTitle = $derived(
		chosen.kind === 'free' ? t('room-confirm-free-title', { size: bytes(size) }) : t('room-confirm-title', { size: bytes(size) })
	);
	let confirmDescription = $derived.by(() => {
		if (chosen.kind === 'free') return fromFile ? t('room-confirm-free-file') : t('room-confirm-free-download', { size: bytes(report.download) });
		return fromFile ? t('room-confirm-file') : t('room-confirm-download', { size: bytes(report.download) });
	});

	let note = $derived.by(() => {
		const live = bytes(report.live);
		if (chosen.kind !== 'windows') return t('room-live-elsewhere', { room: bytes(chosen.most), size: live });
		return chosen.free > 0 ? t('room-live-free', { free: bytes(chosen.free), size: live }) : t('room-live', { size: live });
	});

	function start() {
		confirming = false;
		void session.makeRoom();
	}
</script>

<Frame
	title={several ? t('room-places-title') : t('room-title')}
	description={several ? t('room-places-description') : t('room-description')}
	onback={() => session.go('check')}
>
	<div class="flex flex-col gap-6">
		{#if several}
			<div class="-mx-2 flex flex-col gap-1" role="radiogroup" aria-label={t('room-places-label')}>
				{#each session.places as place (place.id)}
					<DriveRow
						icon={place.kind === 'windows' ? LayoutPanelLeft : HardDrive}
						title={placeTitle(place)}
						detail={placeDetail(place)}
						selected={chosen.id === place.id}
						onclick={() => (session.place = place.id)}
					/>
				{/each}
			</div>
		{/if}
		{#if chosen.kind === 'windows'}
			<SplitBar
				total={windows.windowsSize + chosen.free}
				used={windows.windowsUsed}
				free={chosen.free}
				value={session.luft}
				min={chosen.smallest}
				max={chosen.most}
				step={GIB}
				onchange={(next) => (session.luft = next)}
			/>
		{/if}
		<p class="text-[13.5px] leading-relaxed text-[var(--text-soft)]">{note}</p>
		{#if session.failure}
			<Problem failure={session.failure} />
		{/if}
	</div>
	{#snippet actions()}
		<button type="button" class="plain-button large" onclick={() => session.chooseIso()}>
			{fromFile ? t('meet-iso-using') : t('meet-iso-use')}
		</button>
		<button type="button" class="button primary large px-6" onclick={() => (confirming = true)}>{t('room-make')}</button>
	{/snippet}
</Frame>

{#if confirming && chosen.kind === 'whole'}
	<EraseConfirm place={chosen} onconfirm={start} onclose={() => (confirming = false)} />
{:else if confirming}
	<Dialog title={confirmTitle} description={confirmDescription} onclose={() => (confirming = false)}>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (confirming = false)}>{t('meet-cancel')}</button>
			<button type="button" class="button primary" onclick={start}>{t('room-make')}</button>
		{/snippet}
	</Dialog>
{/if}
