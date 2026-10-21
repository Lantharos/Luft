<script lang="ts" module>
	export type TpmMode = 'setup' | 'add' | 'change' | 'relink';
</script>

<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, errorText, Switch } from '@luft/ui';
	import { setUpTpmUnlock } from '../../api';
	import PinFields from './PinFields.svelte';
	import { pinReady } from './pin';
	import { withUnlock } from './unlock.svelte';

	interface Props {
		mode: TpmMode;
		onclose: (recoveryKey?: string) => void;
	}

	const COPY: Record<TpmMode, { title: string; description: string; action: string }> = {
		setup: {
			title: 'settings-encryption-chip-unlock',
			description: 'settings-encryption-chip-setup-description',
			action: 'settings-protection-set-up'
		},
		add: {
			title: 'settings-encryption-add-pin-title',
			description: 'settings-encryption-add-pin-description',
			action: 'settings-encryption-add-pin'
		},
		change: {
			title: 'settings-encryption-change-pin-title',
			description: 'settings-encryption-change-pin-description',
			action: 'settings-encryption-change-pin'
		},
		relink: {
			title: 'settings-encryption-relink-title',
			description: 'settings-encryption-relink-pin-description',
			action: 'settings-encryption-relink'
		}
	};

	let { mode, onclose }: Props = $props();

	let usePin = $state(false);
	let pin = $state('');
	let confirmation = $state('');
	let busy = $state(false);
	let error = $state('');

	let copy = $derived(COPY[mode]);
	let asking = $derived(mode !== 'setup' || usePin);
	let ready = $derived(!busy && (!asking || pinReady(pin, confirmation)));

	async function submit() {
		if (!ready) return;
		busy = true;
		error = '';
		try {
			const outcome = await withUnlock(setUpTpmUnlock(asking ? pin : ''));
			if (outcome) return onclose(outcome.done || undefined);
		} catch (reason) {
			error = errorText(reason);
		}
		busy = false;
	}
</script>

<Dialog title={t(copy.title)} description={t(copy.description)} onclose={() => !busy && onclose()}>
	{#if mode === 'setup'}
		<div class="flex items-center gap-4 px-1">
			<div class="flex min-w-0 flex-1 flex-col gap-0.5">
				<span class="text-[14px] font-medium">{t('settings-encryption-ask-pin')}</span>
				<span class="text-[12.5px] leading-snug text-[var(--text-muted)]">{t('settings-encryption-ask-pin-step')}</span>
			</div>
			<Switch label={t('settings-encryption-ask-pin')} checked={usePin} onchange={(on) => (usePin = on)} />
		</div>
	{/if}
	{#if asking}
		<PinFields label={mode === 'change' ? t('settings-encryption-new-pin-field') : t('settings-encryption-pin-field')} bind:pin bind:confirmation onsubmit={submit} />
	{/if}
	{#if error}
		<p class="text-[13px] text-[var(--danger)]">{error}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" disabled={busy} onclick={() => onclose()}>{t('settings-protection-cancel')}</button>
		<button type="button" class="button primary" disabled={!ready} onclick={submit}>{t(copy.action)}</button>
	{/snippet}
</Dialog>
