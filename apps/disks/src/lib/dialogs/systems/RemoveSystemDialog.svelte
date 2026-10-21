<script lang="ts">
	import { bytes, Dialog, errorText } from '@luft/ui';
	import * as api from '#lib/api.js';
	import type { OtherSystem, Removed } from '#lib/api.js';
	import { KeyRequest } from '#lib/encryption.svelte.js';
	import { inner } from '#lib/format.js';
	import { disks } from '#lib/state/disks.svelte.js';
	import { systems } from '#lib/state/systems.svelte.js';
	import { GROW_STEP, plannedSteps, shortName, stepKey } from '#lib/systems.js';
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

	let steps = $derived([...plannedSteps(system), ...(growStarted ? [GROW_STEP] : [])]);
	let drive = $derived(disks.drives.find((candidate) => candidate.id === (removed?.drive ?? system.drive)) ?? null);
	let canOpen = $derived(Boolean(system.folder || system.files));
	let holdsFiles = $derived(system.parts.length > 0 || system.kept !== null);
	let title = $derived(
		phase === 'confirm' ? `Remove ${system.name}?` : phase === 'done' ? `${system.name} is gone` : phase === 'failed' ? `${system.name} wasn’t fully removed` : `Removing ${system.name}`
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
			if (system.folder) return await api.openFolder(system.folder);
			if (!system.files) return;
			const mounted = contentsOf(system.files)?.mountPoints[0];
			await api.openFolder(mounted ?? (await api.mount(system.files)));
		} catch (caught) {
			disks.fail(caught);
		}
	}

	async function remove() {
		phase = 'working';
		error = '';
		const stop = api.events.system((step) => {
			const key = stepKey(step);
			if (key === GROW_STEP.key) growStarted = true;
			current = key;
		});
		try {
			removed = await api.removeSystem(system.id);
			request.asking = removed.needsKey;
			phase = 'done';
		} catch (caught) {
			const message = errorText(caught);
			if (message === api.CANCELLED && current === null) {
				phase = 'confirm';
			} else {
				error = message === api.CANCELLED ? 'Administrator rights are needed to continue.' : message;
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
				const outcome = await api.growSystem(unlock);
				if ('done' in outcome) grown = outcome.done;
				return outcome;
			});
			if (done) {
				request.asking = false;
				removed = { ...removed, grown: removed.grown + grown, needsKey: false };
			}
		} catch (caught) {
			const message = errorText(caught);
			if (message !== api.CANCELLED) request.error = message;
		} finally {
			growing = false;
		}
	}

	function makePartition() {
		if (!drive || !removed?.free) return;
		dialogs.open({ kind: 'create', drive, offset: removed.free.offset, size: removed.free.size });
	}

	function close() {
		if (phase !== 'working') onclose();
	}
</script>

<Dialog {title} wide onclose={close}>
	{#if phase === 'confirm'}
		<p class="text-[13.5px] leading-relaxed">{holdsFiles ? 'These are deleted for good, along with everything on them:' : 'This is deleted for good:'}</p>
		<WhatGoes {system} />
		{#if system.bitlocker}
			<p class="text-[13px] leading-relaxed text-[var(--danger)]">Windows is locked with BitLocker, so Luft can’t read its files. They’re gone once it’s removed.</p>
		{:else if canOpen}
			<div class="flex items-center gap-3">
				<p class="min-w-0 flex-1 text-[13px] leading-relaxed text-[var(--text-muted)]">Copy anything you want to keep before you remove it.</p>
				<button type="button" class="button" onclick={openFiles}>Open in Rover</button>
			</div>
		{/if}
	{:else if phase === 'working' || phase === 'failed'}
		<Steps {steps} {current} finished={false} failed={phase === 'failed'} />
		{#if error}
			<p class="text-[13px] leading-relaxed text-[var(--danger)]">{error}</p>
		{/if}
		{#if phase === 'working'}
			<p class="text-[13px] text-[var(--text-muted)]">Keep the computer on until this is done.</p>
		{/if}
	{:else if removed}
		<Steps {steps} current={null} finished failed={false} />
		{#if removed.grown > 0}
			<p class="text-[13.5px] leading-relaxed">Luft grew by {bytes(removed.grown)}.</p>
		{/if}
		{#if request.asking}
			<p class="text-[13.5px] leading-relaxed">The space right after Luft is free. Enter the disk’s passphrase or recovery key to give it to Luft.</p>
			<KeyPrompt {request} onsubmit={grow} />
		{/if}
		{#if removed.free}
			<p class="text-[13.5px] leading-relaxed">
				{bytes(removed.free.size)} is free on {drive?.name ?? 'the drive'}.
				{#if drive?.system}
					Luft can only grow into space right after it while it runs. Make it a partition for your files now, or start Try Luft from a USB stick and move Luft into it with Disks.
				{:else}
					You can make it a partition for your files.
				{/if}
			</p>
		{/if}
	{/if}

	{#snippet actions()}
		{#if phase === 'confirm'}
			<button type="button" class="button" onclick={onclose}>Cancel</button>
			<button type="button" class="button danger" onclick={remove}>Remove {shortName(system)}</button>
		{:else if phase === 'working'}
			<button type="button" class="button" disabled>Removing…</button>
		{:else if phase === 'failed'}
			<button type="button" class="button primary" onclick={onclose}>Close</button>
		{:else}
			{#if request.asking}
				<button type="button" class="button" disabled={growing || !request.key} onclick={grow}>Give Luft the space</button>
			{/if}
			{#if removed?.free && drive}
				<button type="button" class="button" onclick={makePartition}>Make a partition</button>
			{/if}
			<button type="button" class="button primary" onclick={onclose}>Done</button>
		{/if}
	{/snippet}
</Dialog>
