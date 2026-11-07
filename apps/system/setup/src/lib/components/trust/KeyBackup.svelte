<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import PencilLine from '@lucide/svelte/icons/pencil-line';
	import Printer from '@lucide/svelte/icons/printer';
	import Usb from '@lucide/svelte/icons/usb';
	import { t } from '@luft/i18n';
	import { bytes, errorText, Spinner } from '@luft/ui';
	import { commands, events, type KeyDrive } from '#lib/bindings.js';
	import { WAIT_FOR_PERSON } from '#lib/bridge/system.js';

	interface Props {
		key: string;
		onkept: () => void;
	}

	let { key, onkept }: Props = $props();

	type Way = 'usb' | 'write';

	let way = $state<Way | null>(null);
	let drives = $state<KeyDrive[]>([]);
	let saving = $state<string | null>(null);
	let saved = $state<string | null>(null);
	let printed = $state(false);
	let error = $state('');

	const groups = $derived(key.toUpperCase().split('-'));

	$effect(() => {
		void commands.trustKeyDrives().then((found) => (drives = found)).catch(() => {});
		return events.trustKeyDrivesChanged((found) => (drives = found));
	});

	async function save(drive: KeyDrive) {
		saving = drive.block;
		error = '';
		try {
			saved = await commands.trustSaveKeyToDrive({ key, block: drive.block }, WAIT_FOR_PERSON);
			onkept();
		} catch (reason) {
			error = errorText(reason);
		} finally {
			saving = null;
		}
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

	function show(next: Way) {
		way = way === next ? null : next;
	}
</script>

<div class="flex flex-col gap-3">
	<div class="key" aria-label={t('setup-protect-key-label', { key })}>
		{#each groups as group, index (index)}
			<span>{group}</span>
		{/each}
	</div>
	<div class="grid grid-cols-3 gap-2">
		<button type="button" class="button large" class:on={way === 'usb'} aria-expanded={way === 'usb'} onclick={() => show('usb')}>
			<Usb size={17} />{t('setup-protect-save-usb')}
		</button>
		<button type="button" class="button large" onclick={print}>
			<Printer size={17} />{t('setup-protect-print')}
		</button>
		<button type="button" class="button large" class:on={way === 'write'} aria-expanded={way === 'write'} onclick={() => show('write')}>
			<PencilLine size={17} />{t('setup-protect-write')}
		</button>
	</div>
	{#if way === 'usb'}
		<div class="flex flex-col gap-1">
			{#each drives as drive (drive.block)}
				<div class="flex items-center gap-3 rounded-[14px] px-3 py-2 text-[14px]">
					<Usb size={18} class="text-[var(--text-soft)]" />
					<span class="min-w-0 flex-1 truncate">{drive.name}<span class="text-[var(--text-muted)]">, {bytes(drive.size)}</span></span>
					{#if saved === drive.name}
						<span class="flex items-center gap-1.5 text-[13px] text-[var(--text-soft)]"><Check size={15} />{t('setup-protect-usb-done')}</span>
					{:else}
						<button type="button" class="button" disabled={saving !== null} onclick={() => save(drive)}>
							{#if saving === drive.block}<Spinner />{/if}{t('setup-protect-usb-save')}
						</button>
					{/if}
				</div>
			{:else}
				{#if !saved}
					<p class="px-1 text-[13.5px] text-[var(--text-soft)]">{t('setup-protect-usb-plug')}</p>
				{/if}
			{/each}
		</div>
	{:else if way === 'write'}
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
