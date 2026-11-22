<script lang="ts">
	import ShieldCheck from '@luft/symbols/icons/shield-check';
	import Usb from '@luft/symbols/icons/usb';
	import { t } from '@luft/i18n';
	import { ConfirmDialog, errorText, Row, Select } from '@luft/ui';
	import type { UsbMode, UsbProtection } from '#lib/bindings.js';
	import { setUsbMode } from '../api';
	import type { SecurityState } from '../state.svelte';
	import UsbDevicesDialog from './UsbDevicesDialog.svelte';

	let { security, usb }: { security: SecurityState; usb: UsbProtection } = $props();

	const MODES: { mode: UsbMode; label: string; description: string }[] = [
		{ mode: 'off', label: 'settings-usb-mode-off', description: 'settings-usb-mode-off-description' },
		{ mode: 'while-locked', label: 'settings-usb-mode-while-locked', description: 'settings-usb-mode-while-locked-description' },
		{ mode: 'no-drives', label: 'settings-usb-mode-no-drives', description: 'settings-usb-mode-no-drives-description' },
		{ mode: 'known-only', label: 'settings-usb-mode-known-only', description: 'settings-usb-mode-known-only-description' }
	];
	const CONFIRMED: Partial<Record<UsbMode, { title: string; warning: string; action: string; danger?: boolean }>> = {
		off: { title: 'settings-usb-turn-off-title', warning: 'settings-usb-turn-off-warning', action: 'settings-usb-turn-off', danger: true },
		'known-only': { title: 'settings-usb-known-only-title', warning: 'settings-usb-known-only-warning', action: 'settings-usb-known-only-confirm' }
	};

	let busy = $state(false);
	let error = $state('');
	let confirming = $state<UsbMode | null>(null);
	let listing = $state(false);

	const options = MODES.map(({ mode, label }) => ({ value: mode, label: t(label) }));
	let description = $derived(MODES.find(({ mode }) => mode === usb.mode)!.description);
	let confirmation = $derived(confirming ? CONFIRMED[confirming] : undefined);

	async function change(mode: UsbMode) {
		busy = true;
		error = '';
		try {
			await setUsbMode(mode);
			security.usb = { ...usb, mode };
		} catch (reason) {
			error = errorText(reason);
		}
		busy = false;
	}

	function choose(mode: UsbMode) {
		if (CONFIRMED[mode]) confirming = mode;
		else void change(mode);
	}
</script>

{#snippet failure()}
	<p class="pl-[34px] text-[12.5px] text-[var(--danger)]">{error}</p>
{/snippet}

<Row title={t('settings-usb-mode')} description={t(description)} icon={Usb} below={error ? failure : undefined}>
	<Select label={t('settings-usb-mode')} {options} value={usb.mode} disabled={busy} onchange={choose} />
</Row>

{#if usb.mode === 'known-only' || usb.trusted.length}
	<Row
		title={t('settings-usb-trusted')}
		description={usb.waiting.length ? t('settings-usb-waiting-count', { count: usb.waiting.length }) : t('settings-usb-trusted-count', { count: usb.trusted.length })}
		icon={ShieldCheck}
		onclick={() => (listing = true)}
	/>
{/if}

{#if confirming && confirmation}
	{@const mode = confirming}
	<ConfirmDialog
		title={t(confirmation.title)}
		description={t(confirmation.warning)}
		action={t(confirmation.action)}
		danger={confirmation.danger}
		run={() => change(mode)}
		onclose={() => (confirming = null)}
	/>
{/if}

{#if listing}
	<UsbDevicesDialog {usb} onclose={() => (listing = false)} />
{/if}
