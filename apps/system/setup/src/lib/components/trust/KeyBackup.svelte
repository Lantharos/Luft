<script lang="ts">
	import PencilLine from '@lucide/svelte/icons/pencil-line';
	import Printer from '@lucide/svelte/icons/printer';
	import Usb from '@lucide/svelte/icons/usb';
	import { t } from '@luft/i18n';
	import { Dialog, errorText, RecoveryWords, WriteDownDialog } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import { WAIT_FOR_PERSON } from '#lib/bridge/system.js';
	import UsbKeyDialog from './UsbKeyDialog.svelte';

	interface Props {
		key: string;
		onkept: () => void;
	}

	let { key, onkept }: Props = $props();

	let open = $state<'usb' | 'write' | null>(null);
	let saved = $state<string | null>(null);
	let printed = $state(false);
	let written = $state(false);
	let failure = $state('');

	function keptOn(drive: string) {
		saved = drive;
		onkept();
	}

	function checked() {
		written = true;
		onkept();
	}

	async function print() {
		try {
			printed = (await commands.trustPrintKey({ key }, WAIT_FOR_PERSON)) || printed;
			if (printed) onkept();
		} catch (reason) {
			failure = errorText(reason);
		}
	}
</script>

<div class="flex flex-col gap-3">
	<RecoveryWords {key} label={t('setup-protect-key-label', { key })} />
	<div class="grid grid-cols-3 gap-2">
		<button type="button" class="button large" onclick={() => (open = 'usb')}>
			<Usb size={17} />{t('setup-protect-save-usb')}
		</button>
		<button type="button" class="button large" onclick={print}>
			<Printer size={17} />{t('setup-protect-print')}
		</button>
		<button type="button" class="button large" onclick={() => (open = 'write')}>
			<PencilLine size={17} />{t('setup-protect-write')}
		</button>
	</div>
	{#if saved}
		<p class="px-1 text-[13px] text-[var(--text-muted)]">{t('setup-protect-usb-saved', { drive: saved })}</p>
	{:else if printed}
		<p class="px-1 text-[13px] text-[var(--text-muted)]">{t('setup-protect-printed')}</p>
	{:else if written}
		<p class="px-1 text-[13px] text-[var(--text-muted)]">{t('setup-protect-written')}</p>
	{/if}
</div>

{#if open === 'usb'}
	<UsbKeyDialog {key} {saved} onsaved={keptOn} onclose={() => (open = null)} />
{:else if open === 'write'}
	<WriteDownDialog words={key.split(' ')} onchecked={checked} onclose={() => (open = null)} />
{/if}

{#if failure}
	<Dialog title={t('setup-protect-print-failed')} description={failure} onclose={() => (failure = '')}>
		{#snippet actions()}
			<button type="button" class="button primary" onclick={() => (failure = '')}>{t('setup-protect-close')}</button>
		{/snippet}
	</Dialog>
{/if}
