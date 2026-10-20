<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import FingerprintIcon from '@lucide/svelte/icons/fingerprint';
	import { t } from '@luft/i18n';
	import { FINGERS, fingerLabel, FingerprintDial, FingerprintEnrollment, fingerprints, Select, type Fingerprints } from '@luft/ui';
	import StepFrame from '#lib/components/StepFrame.svelte';
	import { flow } from '#lib/state/flow.svelte.js';
	import { setup } from '#lib/state/setup.svelte.js';

	let reader = $state<Fingerprints | null>(null);
	let enrollment = $state<FingerprintEnrollment | null>(null);
	let finger = $state<string>(FINGERS[0][0]);
	let readerSilent = $state(false);

	let phase = $derived(enrollment?.phase ?? 'choosing');
	let enrolled = $derived(reader?.enrolled ?? []);
	let added = $derived(enrolled.length > 0);
	let options = $derived(FINGERS.filter(([value]) => !enrolled.includes(value)).map(([value]) => ({ value, label: fingerLabel(value) })));

	async function look() {
		reader = await fingerprints().catch(() => null);
		finger = options.find((option) => !setup.refusedFingers.includes(option.value))?.value ?? options[0]?.value ?? finger;
	}

	async function start() {
		readerSilent = false;
		if (!reader) await look();
		if (!reader) {
			readerSilent = true;
			return;
		}
		enrollment ??= new FingerprintEnrollment(reader);
		await enrollment.start(finger);
	}

	function choose() {
		if (enrollment?.needsOtherFinger) setup.refusedFingers = [...setup.refusedFingers, finger];
		enrollment?.choose();
		void look();
	}

	function skip() {
		enrollment?.cancel();
		flow.next();
	}

	onMount(() => void look());
	onDestroy(() => enrollment?.destroy());
</script>

<StepFrame
	title={t('setup-fingerprint-title')}
	description={t('setup-fingerprint-description')}
	onback={phase === 'choosing' ? undefined : choose}
>
	{#if phase === 'choosing'}
		<div class="flex items-center gap-4 text-[14px] leading-relaxed text-[var(--text-soft)]">
			<span class="grid h-14 w-14 flex-none place-items-center rounded-[18px] bg-[var(--accent-soft)] text-[var(--accent)]"><FingerprintIcon size={26} /></span>
			<div class="flex flex-1 items-center justify-between gap-4">
				<span>{t(added ? 'setup-fingerprint-another' : 'setup-fingerprint-which')}</span>
				<Select label={t('setup-fingerprint-finger')} {options} value={finger} onchange={(next) => (finger = next)} />
			</div>
		</div>
	{:else if enrollment}
		<FingerprintDial {enrollment} />
	{/if}
	{#if readerSilent}
		<p class="mt-4 text-[13.5px] text-[var(--danger)]">{t('setup-fingerprint-no-reader')}</p>
	{/if}
	{#snippet actions()}
		{#if phase === 'added'}
			<button type="button" class="button primary large px-6" onclick={() => flow.next()}>{t('setup-continue')}</button>
		{:else}
			<button type="button" class="plain-button large" onclick={skip}>{t(added ? 'setup-continue' : 'setup-not-now')}</button>
			{#if phase === 'choosing'}
				<button type="button" class="button primary large px-6" disabled={!options.length} onclick={start}>{t('setup-fingerprint-add')}</button>
			{:else if phase === 'failed' && enrollment?.needsOtherFinger}
				<button type="button" class="button primary large px-6" onclick={choose}>{t('setup-fingerprint-choose-another')}</button>
			{:else if phase === 'failed' && !enrollment?.readerFull}
				<button type="button" class="button primary large px-6" onclick={start}>{t('setup-try-again')}</button>
			{/if}
		{/if}
	{/snippet}
</StepFrame>
