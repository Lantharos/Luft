<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, Dialog, errorText, Spinner } from '@luft/ui';
	import { commands, events } from '#lib/bindings.js';
	import type { OtherSystem, Removed } from '#lib/bindings.js';
	import { CANCELLED, WAIT, openFolder } from '#lib/bridge/index.js';
	import { KeyRequest } from '#lib/encryption.svelte.js';
	import { inner } from '#lib/format.js';
	import { luftRoom } from '#lib/luft.js';
	import { disks } from '#lib/state/disks.svelte.js';
	import { systems } from '#lib/state/systems.svelte.js';
	import { growStep, plannedSteps, shortName, stepKey } from '#lib/systems.js';
	import { dialogs } from '../dialogs.svelte';
	import KeyPrompt from '../encryption/KeyPrompt.svelte';
	import Steps from './Steps.svelte';
	import WhatGoes from './WhatGoes.svelte';

	interface Props {
		system: OtherSystem;
		onclose: () => void;
	}

	let { system, onclose }: Props = $props();

	type Phase = 'confirm' | 'working' | 'failed' | 'done';

	const request = new KeyRequest();

	let phase = $state<Phase>('confirm');
	let growStarted = $state(false);
	let current = $state<string | null>(null);
	let removed = $state<Removed | null>(null);
	let error = $state('');
	let growing = $state(false);
	let givingBack = $state(false);
	let givenBack = $state(false);

	let steps = $derived([...plannedSteps(system), ...(growStarted ? [growStep()] : [])]);
	let drive = $derived(disks.drives.find((candidate) => candidate.id === (removed?.drive ?? system.drive)) ?? null);
	let room = $derived(drive && removed?.free ? luftRoom(drive, removed.free.offset) : null);
	let canOpen = $derived(Boolean(system.folder || system.files));
	let holdsFiles = $derived(system.parts.length > 0 || system.kept !== null);
	let title = $derived(
		t('disks-remove-title', { phase, name: system.name })
	);

	function contentsOf(block: string) {
		for (const candidate of disks.drives) {
			for (const segment of candidate.segments) {
				if (segment.kind !== 'volume') continue;
				const contents = inner(segment);
				if (segment.block === block || contents.block === block) return contents;
			}
		}
		return null;
	}

	async function openFiles() {
		try {
			if (system.folder) return await openFolder(system.folder);
			if (!system.files) return;
			const mounted = contentsOf(system.files)?.mountPoints[0];
			await openFolder(mounted ?? (await commands.disksMount({ block: system.files }, WAIT)));
		} catch (caught) {
			disks.fail(caught);
		}
	}

	async function remove() {
		phase = 'working';
		error = '';
		const stop = events.disksSystem((step) => {
			const key = stepKey(step);
			if (key === 'grow') growStarted = true;
			current = key;
		});
		try {
			removed = await commands.disksRemoveSystem({ id: system.id }, WAIT);
			request.asking = removed.needsKey;
			phase = 'done';
		} catch (caught) {
			const message = errorText(caught);
			if (message === CANCELLED && current === null) {
				phase = 'confirm';
			} else {
				error = message === CANCELLED ? t('disks-admin-needed') : message;
				phase = 'failed';
			}
		} finally {
			stop();
			void systems.load();
		}
	}

	async function grow() {
		if (!removed) return;
		growing = true;
		let grown = 0;
		try {
			const done = await request.run(async (unlock) => {
				const outcome = await commands.disksGrowSystem({ unlock }, WAIT);
				if (outcome.done !== undefined) grown = outcome.done;
				return outcome;
			});
			if (done) {
				request.asking = false;
				removed = { ...removed, grown: removed.grown + grown, needsKey: false };
			}
		} catch (caught) {
			const message = errorText(caught);
			if (message !== CANCELLED) request.error = message;
		} finally {
			growing = false;
		}
	}

	async function giveBack() {
		const target = removed?.giveBack;
		if (!target) return;
		givingBack = true;
		try {
			await commands.disksGiveBack({ block: target.block, size: target.size }, WAIT);
			givenBack = true;
		} catch (caught) {
			const message = errorText(caught);
			if (message !== CANCELLED) error = message;
		} finally {
			givingBack = false;
		}
	}

	function makePartition() {
		if (!drive || !removed?.free) return;
		dialogs.open({ kind: 'create', drive, offset: removed.free.offset, size: removed.free.size });
	}

	function giveLuft() {
		if (!drive || !removed?.free) return;
		dialogs.open({ kind: 'give-luft', drive, offset: removed.free.offset, size: removed.free.size });
	}

	function close() {
		if (phase !== 'working') onclose();
	}
</script>

<Dialog {title} wide onclose={close}>
	{#if phase === 'confirm'}
		<p class="text-[13.5px] leading-relaxed">{holdsFiles ? t('disks-remove-deleted-files') : t('disks-remove-deleted')}</p>
		<WhatGoes {system} />
		{#if system.bitlocker}
			<p class="text-[13px] leading-relaxed text-[var(--danger)]">{t('disks-remove-bitlocker')}</p>
		{:else if canOpen}
			<div class="flex items-center gap-3">
				<p class="min-w-0 flex-1 text-[13px] leading-relaxed text-[var(--text-muted)]">{t('disks-remove-copy-first')}</p>
				<button type="button" class="button" onclick={openFiles}>{t('disks-remove-open')}</button>
			</div>
		{/if}
	{:else if phase === 'working' || phase === 'failed'}
		<Steps {steps} {current} finished={false} failed={phase === 'failed'} />
		{#if error}
			<p class="text-[13px] leading-relaxed text-[var(--danger)]">{error}</p>
		{/if}
		{#if phase === 'working'}
			<p class="text-[13px] text-[var(--text-muted)]">{t('disks-keep-on')}</p>
		{/if}
	{:else if removed}
		<Steps {steps} current={null} finished failed={false} />
		{#if removed.grown > 0}
			<p class="text-[13.5px] leading-relaxed">{t('disks-remove-grown', { size: bytes(removed.grown) })}</p>
		{/if}
		{#if request.asking}
			<p class="text-[13.5px] leading-relaxed">{t('disks-remove-key')}</p>
			<KeyPrompt {request} onsubmit={grow} />
		{/if}
		{#if givenBack && removed.giveBack}
			<p class="text-[13.5px] leading-relaxed">{t('disks-remove-given-back', { size: bytes(removed.giveBack.size) })}</p>
		{:else if removed.free && removed.giveBack}
			<p class="text-[13.5px] leading-relaxed">
				{t('disks-remove-free-windows', { size: bytes(removed.free.size) })}
			</p>
		{:else if removed.free}
			<p class="text-[13.5px] leading-relaxed">
				{drive ? t('disks-remove-free', { size: bytes(removed.free.size), drive: drive.name }) : t('disks-remove-free-unnamed', { size: bytes(removed.free.size) })}
				{room ? t('disks-remove-free-luft') : t('disks-remove-free-partition')}
			</p>
		{/if}
		{#if error}
			<p class="text-[13px] leading-relaxed text-[var(--danger)]">{error}</p>
		{/if}
	{/if}

	{#snippet actions()}
		{#if phase === 'confirm'}
			<button type="button" class="button" onclick={onclose}>{t('disks-cancel')}</button>
			<button type="button" class="button danger" onclick={remove}>{t('disks-remove-action', { name: shortName(system) })}</button>
		{:else if phase === 'working'}
			<button type="button" class="button" disabled><Spinner />{t('disks-remove-working')}</button>
		{:else if phase === 'failed'}
			<button type="button" class="button primary" onclick={onclose}>{t('disks-close')}</button>
		{:else}
			{#if request.asking}
				<button type="button" class="button" disabled={growing || !request.key} onclick={grow}>{t('disks-remove-grow')}</button>
			{/if}
			{#if removed?.free && drive && !givenBack}
				<button type="button" class="button" disabled={givingBack} onclick={makePartition}>{t('disks-make-partition')}</button>
			{/if}
			{#if removed?.giveBack && !givenBack}
				<button type="button" class="button" disabled={givingBack} onclick={giveBack}>{#if givingBack}<Spinner />{/if}{t('disks-remove-give-back')}</button>
			{/if}
			{#if room}
				<button type="button" class="button" onclick={giveLuft}>{t('disks-free-give-luft')}</button>
			{/if}
			<button type="button" class="button primary" onclick={onclose}>{t('disks-done')}</button>
		{/if}
	{/snippet}
</Dialog>
