<script lang="ts">
	import PencilLine from '@lucide/svelte/icons/pencil-line';
	import Printer from '@lucide/svelte/icons/printer';
	import Usb from '@lucide/svelte/icons/usb';
	import { t } from '@luft/i18n';
	import { errorText } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import { WAIT_FOR_PERSON } from '#lib/bridge/system.js';
	import UsbKeyDialog from './UsbKeyDialog.svelte';

	interface Props {
		key: string;
		onkept: () => void;
	}

	let { key, onkept }: Props = $props();

	let saving = $state(false);
	let writing = $state(false);
	let saved = $state<string | null>(null);
	let printed = $state(false);
	let error = $state('');

	const groups = $derived(key.toUpperCase().split('-'));

	function keptOn(drive: string) {
		saved = drive;
		onkept();
	}

	async function print() {
		error = '';
		try {
			printed = await commands.trustPrintKey({ key }, WAIT_FOR_PERSON);
			if (printed) onkept();
		} catch (reason) {
			error = errorText(reason);
		}
	}
</script>

<div class="flex flex-col gap-3">
	<div class="key" aria-label={t('setup-protect-key-label', { key })}>
		{#each groups as group, index (index)}
			<span>{group}</span>
		{/each}
	</div>
	<div class="grid grid-cols-3 gap-2">
		<button type="button" class="button large" onclick={() => (saving = true)}>
			<Usb size={17} />{t('setup-protect-save-usb')}
		</button>
		<button type="button" class="button large" onclick={print}>
			<Printer size={17} />{t('setup-protect-print')}
		</button>
		<button type="button" class="button large" class:on={writing} aria-expanded={writing} onclick={() => (writing = !writing)}>
			<PencilLine size={17} />{t('setup-protect-write')}
		</button>
	</div>
	{#if writing}
		<p class="px-1 text-[13.5px] leading-relaxed text-[var(--text-soft)]">{t('setup-protect-write-hint')}</p>
	{/if}
	{#if saved}
		<p class="px-1 text-[13px] text-[var(--text-muted)]">{t('setup-protect-usb-saved', { drive: saved })}</p>
	{:else if printed}
		<p class="px-1 text-[13px] text-[var(--text-muted)]">{t('setup-protect-printed')}</p>
	{/if}
	{#if error}
		<p class="px-1 text-[13px] text-[var(--danger)]">{error}</p>
	{/if}
</div>

{#if saving}
	<UsbKeyDialog {key} {saved} onsaved={keptOn} onclose={() => (saving = false)} />
{/if}

<style>
	.key {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		justify-items: center;
		gap: 10px 12px;
		padding: 18px 16px;
		border-radius: 16px;
		background: var(--surface);
		font-family: var(--font-mono);
		font-size: 17px;
		letter-spacing: 0.08em;
		color: var(--text);
		user-select: all;
	}

	.on {
		background: var(--control-hover);
	}
</style>
