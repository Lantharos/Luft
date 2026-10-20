<script lang="ts">
	import { t } from '@luft/i18n';
	import { onDestroy, untrack } from 'svelte';
	import { Dialog, FingerprintDial, FingerprintEnrollment, fingerLabel, Select } from '@luft/ui';

	interface Props {
		fingers: string[];
		swipe: boolean;
		stages: number;
		onclose: () => void;
	}

	let { fingers, swipe, stages, onclose }: Props = $props();

	const enrollment = new FingerprintEnrollment(untrack(() => ({ swipe, stages })));
	let finger = $state(untrack(() => fingers[0]));

	let options = $derived(fingers.map((value) => ({ value, label: fingerLabel(value) })));

	let refused = $state<string[]>([]);

	function chooseAnother() {
		refused = [...refused, finger];
		enrollment.choose();
		finger = fingers.find((value) => !refused.includes(value)) ?? finger;
	}

	function close() {
		enrollment.cancel();
		onclose();
	}

	onDestroy(() => enrollment.destroy());
</script>

<Dialog title={t('settings-users-fingerprint-add')} description={enrollment.phase === 'choosing' ? t('settings-users-fingerprint-choose') : undefined} onclose={close}>
	{#if enrollment.phase === 'choosing'}
		<div class="flex items-center justify-between gap-4">
			<span class="text-[13px] text-[var(--text-soft)]">{t('settings-users-finger')}</span>
			<Select label={t('settings-users-finger')} {options} value={finger} onchange={(next) => (finger = next)} />
		</div>
	{:else}
		<FingerprintDial {enrollment} />
	{/if}
	{#snippet actions()}
		{#if enrollment.phase === 'choosing'}
			<button type="button" class="button" onclick={close}>{t('settings-users-cancel')}</button>
			<button type="button" class="button primary" onclick={() => enrollment.start(finger)}>{t('settings-users-fingerprint-start')}</button>
		{:else if enrollment.phase === 'scanning'}
			<button type="button" class="button" onclick={close}>{t('settings-users-cancel')}</button>
		{:else if enrollment.phase === 'failed'}
			<button type="button" class="button" onclick={close}>{t('settings-users-close')}</button>
			{#if enrollment.needsOtherFinger}
				<button type="button" class="button primary" onclick={chooseAnother}>{t('settings-users-fingerprint-another')}</button>
			{:else if !enrollment.readerFull}
				<button type="button" class="button primary" onclick={() => enrollment.start(finger)}>{t('settings-users-try-again')}</button>
			{/if}
		{:else}
			<button type="button" class="button primary" onclick={close}>{t('settings-users-done')}</button>
		{/if}
	{/snippet}
</Dialog>
